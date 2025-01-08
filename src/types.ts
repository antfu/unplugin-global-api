import type { Arrayable, Awaitable } from '@antfu/utils'
import type { FilterPattern } from '@rollup/pluginutils'
import type { AddonVueDirectivesOptions, Import, InlinePreset, PackagePreset, UnimportOptions } from 'unimport'
import { PresetName } from './presets'

export interface ImportLegacy {
  /**
   * @deprecated renamed to `as`
   */
  name?: string
  /**
   * @deprecated renamed to `name`
   */
  importName?: string
  /**
   * @deprecated renamed to `from`
   */
  path: string

  sideEffects?: SideEffectsInfo
}

export interface ImportExtended extends Import {
  sideEffects?: SideEffectsInfo
  __source?: 'dir' | 'resolver'
}

export type ImportNameAlias = [string, string]
export type SideEffectsInfo = Arrayable<ResolverResult | string> | undefined

export interface ResolverResult {
  as?: string
  name?: string
  from: string
}

export type ResolverFunction = (name: string) => Awaitable<string | ResolverResult | ImportExtended | null | undefined | void>

export interface ResolverResultObject {
  type: 'component' | 'directive'
  resolve: ResolverFunction
}

/**
 * Given a identifier name, returns the import path or an import object
 */
export type Resolver = ResolverFunction | ResolverResultObject

/**
 * module, name, alias
 */
export type ImportsMap = Record<string, (string | ImportNameAlias)[]>

export interface ScanDirExportsOptions {
  /**
   * Register type exports
   *
   * @default true
   */
  types?: boolean
}

/**
 * Directory to search for import
 */
export interface ScanDir {
  glob: string
  types?: boolean
}

export type NormalizedScanDir = Required<ScanDir>

export type ESLintGlobalsPropValue = boolean | 'readonly' | 'readable' | 'writable' | 'writeable'

export interface ESLintrc {
  /**
   * @default false
   */
  enabled?: boolean
  /**
   * Filepath to save the generated eslint config
   *
   * @default './.eslintrc-auto-import.json'
   */
  filepath?: string
  /**
   * @default true
   */
  globalsPropValue?: ESLintGlobalsPropValue
}

export interface BiomeLintrc {
  /**
   * @default false
   */
  enabled?: boolean
  /**
   * Filepath to save the generated eslint config
   *
   * @default './.eslintrc-auto-import.json'
   */
  filepath?: string
}

export interface Options {
  /**
   * Preset names or custom imports map
   *
   * @default []
   */
  imports?: Arrayable<ImportsMap | PresetName | InlinePreset>

  /**
   * Local package presets.
   *
   * Register local installed packages as a preset.
   *
   * @default []
   * @see https://github.com/unplugin/unplugin-auto-import#package-presets
   */
  packagePresets?: (PackagePreset | string)[]

  /**
   * Identifiers to be ignored
   */
  ignore?: (string | RegExp)[]

  /**
   * These identifiers won't be put on the DTS file
   */
  ignoreDts?: (string | RegExp)[]

  /**
   * Inject the imports at the end of other imports
   *
   * @default true
   */
  injectAtEnd?: boolean

  /**
   * Options for scanning directories for auto import
   */
  dirsScanOptions?: ScanDirExportsOptions

  /**
   * Path for directories to be auto imported
   */
  dirs?: (string | ScanDir)[]

  /**
   * Pass a custom function to resolve the component importing path from the component name.
   *
   * The component names are always in PascalCase
   */
  resolvers?: Arrayable<Arrayable<Resolver>>

  /**
   * Parser to be used for parsing the source code.
   *
   * @see https://github.com/unjs/unimport#acorn-parser
   * @default 'regex'
   */
  parser?: UnimportOptions['parser']

  /**
   * Specifies the file path for generating the corresponding .d.ts file.
   * This option is enabled by default when `typescript` is installed locally.
   * Set to `false` to disable this feature.
   */
  dts?: string | boolean

  /**
   * Mode for generating the .d.ts file.
   * - `overwrite`: overwrite the whole existing .d.ts file with the new type definitions.
   * - `append`: only append the new type definitions to the existing .d.ts file, means the existing type definitions will be kept.
   * @default 'append'
   */
  dtsMode?: 'overwrite' | 'append'

  /**
   * Auto import inside Vue templates
   *
   * @see https://github.com/unjs/unimport/pull/15
   * @see https://github.com/unjs/unimport/pull/72
   * @default false
   */
  vueTemplate?: boolean

  /**
   * Enable auto import directives for Vue's SFC.
   *
   * Library authors should include `meta.vueDirective: true` in the import metadata.
   *
   * When using a local directives folder, provide the `isDirective`
   * callback to check if the import is a Vue directive.
   *
   * @see https://github.com/unjs/unimport?tab=readme-ov-file#vue-directives-auto-import-and-typescript-declaration-generation
   */
  vueDirectives?: true | AddonVueDirectivesOptions

  /**
   * Set default export alias by file name
   *
   * @default false
   */
  defaultExportByFilename?: boolean

  /**
   * Rules to include transforming target.
   *
   * @default [/\.[jt]sx?$/, /\.astro$/, /\.vue$/, /\.vue\?vue/, /\.svelte$/]
   */
  include?: FilterPattern

  /**
   * Rules to exclude transforming target.
   *
   * @default [/[\\/]node_modules[\\/]/, /[\\/]\.git[\\/]/]
   */
  exclude?: FilterPattern

  /**
   * Generate corresponding .eslintrc-auto-import.json file.
   */
  eslintrc?: ESLintrc

  /**
   * Generate corresponding .biomelintrc.json file.
   */
  biomelintrc?: BiomeLintrc

  /**
   * Save unimport items into a JSON file for other tools to consume.
   * Provide a filepath to save the JSON file.
   *
   * When set to `true`, it will save to `./.unimport-items.json`
   *
   * @default false
   */
  dumpUnimportItems?: boolean | string

  /**
   * Include auto-imported packages in Vite's `optimizeDeps` option
   *
   * @default true
   */
  viteOptimizeDeps?: boolean
}

export { PresetName }
