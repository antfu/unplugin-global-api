import { dirname, isAbsolute, relative, resolve } from 'path'
import { promises as fs } from 'fs'
import { slash, throttle, toArray } from '@antfu/utils'
import { createFilter } from '@rollup/pluginutils'
import { isPackageExists } from 'local-pkg'
import type { Import } from 'unimport'
// @ts-expect-error types
import { vueTemplateAddon } from 'unimport/addons'
import { createUnimport, scanDirExports } from 'unimport'
import MagicString from 'magic-string'
import { presets } from '../presets'
import type { ESLintrc, ImportExtended, Options } from '../types'
import { generateESLintConfigs } from './eslintrc'
import { resolversAddon } from './resolvers'

export function createContext(options: Options = {}, root = process.cwd()) {
  const imports = flattenImports(options.imports, options.presetOverriding)

  options.ignore?.forEach((name) => {
    const i = imports.find(i => i.as === name)
    if (i)
      i.disabled = true
  })

  const {
    dts: preferDTS = isPackageExists('typescript'),
  } = options

  const dirs = options.dirs?.map(dir => resolve(root, dir))

  const eslintrc: ESLintrc = options.eslintrc || {}
  eslintrc.enabled = eslintrc.enabled === undefined ? false : eslintrc.enabled
  eslintrc.filepath = eslintrc.filepath || './.eslintrc-auto-import.json'
  eslintrc.globalsPropValue = eslintrc.globalsPropValue === undefined ? true : eslintrc.globalsPropValue

  const resolvers = options.resolvers ? [options.resolvers].flat(2) : []

  const unimport = createUnimport({
    imports: imports as Import[],
    presets: [],
    addons: [
      ...(options.vueTemplate ? [vueTemplateAddon()] : []),
      resolversAddon(resolvers),
      {
        declaration(dts) {
          if (!dts.endsWith('\n'))
            dts += '\n'
          return `// Generated by 'unplugin-auto-import'\n${dts}`
        },
      },
    ],
  })

  const filter = createFilter(
    options.include || [/\.[jt]sx?$/, /\.vue$/, /\.vue\?vue/, /\.svelte$/],
    options.exclude || [/[\\/]node_modules[\\/]/, /[\\/]\.git[\\/]/],
  )
  const dts = preferDTS === false
    ? false
    : preferDTS === true
      ? resolve(root, 'auto-imports.d.ts')
      : resolve(root, preferDTS)

  function generateDTS(file: string) {
    const dir = dirname(file)
    return unimport.generateTypeDeclarations({
      resolvePath: (i) => {
        if (i.from.startsWith('.') || isAbsolute(i.from)) {
          const related = slash(relative(dir, i.from).replace(/\.ts(x)?$/, ''))
          return !related.startsWith('.')
            ? `./${related}`
            : related
        }
        return i.from
      },
    })
  }

  async function generateESLint() {
    return generateESLintConfigs(await unimport.getImports(), eslintrc)
  }

  const writeConfigFilesThrottled = throttle(500, false, writeConfigFiles)

  let lastDTS: string | undefined
  let lastESLint: string | undefined
  async function writeConfigFiles() {
    const promises: any[] = []
    if (dts) {
      promises.push(
        generateDTS(dts).then((content) => {
          if (content !== lastDTS) {
            lastDTS = content
            return fs.writeFile(dts, content, 'utf-8')
          }
        }),
      )
    }
    if (eslintrc.enabled && eslintrc.filepath) {
      promises.push(
        generateESLint().then((content) => {
          if (content !== lastESLint) {
            lastESLint = content
            return fs.writeFile(eslintrc.filepath!, content, 'utf-8')
          }
        }),
      )
    }
    return Promise.all(promises)
  }

  async function scanDirs() {
    if (dirs?.length) {
      await unimport.modifyDynamicImports(async (imports) => {
        const exports = await scanDirExports(dirs, {
          filePatterns: ['*.{tsx,jsx,ts,js,mjs,cjs,mts,cts}'],
        }) as ImportExtended[]
        exports.forEach(i => i.__source = 'dir')
        return modifyDefaultExportsAlias([
          ...imports.filter((i: ImportExtended) => i.__source !== 'dir'),
          ...exports,
        ], options)
      })
    }
    writeConfigFilesThrottled()
  }

  async function transform(code: string, id: string) {
    const s = new MagicString(code)

    await unimport.injectImports(s, id)

    if (!s.hasChanged())
      return

    writeConfigFilesThrottled()

    return {
      code: s.toString(),
      map: s.generateMap({ source: id, includeContent: true }),
    }
  }

  if (!imports.length && !resolvers.length)
    console.warn('[auto-import] plugin installed but no imports has defined, see https://github.com/antfu/unplugin-auto-import#configurations for configurations')

  return {
    root,
    dirs,
    filter,
    scanDirs,
    writeConfigFiles,
    writeConfigFilesThrottled,
    transform,
    generateDTS,
    generateESLint,
  }
}

export function flattenImports(map: Options['imports'], overriding = false): Import[] {
  const flat: Record<string, Import> = {}
  toArray(map).forEach((definition) => {
    if (typeof definition === 'string') {
      if (!presets[definition])
        throw new Error(`[auto-import] preset ${definition} not found`)
      const preset = presets[definition]
      definition = typeof preset === 'function' ? preset() : preset
    }

    for (const mod of Object.keys(definition)) {
      for (const id of definition[mod]) {
        const meta = {
          from: mod,
        } as Import
        let name: string
        if (Array.isArray(id)) {
          name = id[1]
          meta.name = id[0]
          meta.as = id[1]
        }
        else {
          name = id
          meta.name = id
          meta.as = id
        }

        if (flat[name] && !overriding)
          throw new Error(`[auto-import] identifier ${name} already defined with ${flat[name].from}`)

        flat[name] = meta
      }
    }
  })

  return Object.values(flat)
}

function modifyDefaultExportsAlias(imports: ImportExtended[], options: Options): Import[] {
  if (options.defaultExportByFilename) {
    imports.forEach((i) => {
      if (i.name === 'default')
        i.as = i.from.split('/').pop()?.split('.')?.shift() ?? i.as
    })
  }

  return imports as Import[]
}
