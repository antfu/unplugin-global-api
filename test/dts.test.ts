import { join } from 'node:path'
import process from 'node:process'
import { expect, it } from 'vitest'
import { createContext } from '../src/core/ctx'

describe('dts', () => {
  it('normal', async () => {
    const cwd = process.cwd()
    const ctx = createContext({
      packagePresets: ['magic-string'],
      imports: [
        'vue-demi',
        'react',
        'svelte',
        'svelte/animate',
        'svelte/easing',
        'svelte/motion',
        'svelte/store',
        'svelte/transition',
        {
          custom: [
            'customNamed',
            ['default', 'customDefault'],
          ],
          custom2: [
            ['*', 'custom2'],
          ],
          [join(cwd, 'foo.ts')]: ['foo'],
        },
        'vue/macros',
      ],
    })

    expect(await ctx.generateDTS(join(cwd, 'index.d.ts'))).toMatchSnapshot()
  })

  it('dts ignore', async () => {
    const cwd = process.cwd()
    const ctx = createContext({
      imports: [{
        custom: [
          'shouldBePresent',
          'shouldAlsoBePresent',
          'shouldBeIgnored',
          'ignoreme_shoudAlsoBeIgnored',
        ],
      }],
      ignoreDts: [
        'shouldBeIgnored',
        /^ignoreme_/,
      ],
    })

    const dtsContent = await ctx.generateDTS(join(cwd, './test/tmp/dts.ignore.d.ts'))

    expect(dtsContent).toContain('shouldBePresent')
    expect(dtsContent).toContain('shouldAlsoBePresent')
    expect(dtsContent).not.toContain('shouldBeIgnored')
    expect(dtsContent).not.toContain('ignoreme_shoudAlsoBeIgnored')
  })

  it('dts in append mode', async () => {
    const cwd = process.cwd()
    const dts = join(cwd, './test/tmp/dts.increase.d.ts')
    const ctx = createContext({
      imports: ['vue'],
      dts,
    })

    const dtsContent = await ctx.generateDTS(dts)
    expect(dtsContent).toContain('AAA')
    expect(dtsContent).toContain('BBB')
    expect(dtsContent).toContain('$$')
    expect(dtsContent).toContain('customFile')
    expect(dtsContent).toContain('customFile1')
  })

  it('dts in overwrite mode', async () => {
    const cwd = process.cwd()
    const dts = join(cwd, './test/tmp/dts.increase.d.ts')
    const ctx = createContext({
      imports: ['vue'],
      dts,
      dtsMode: 'overwrite',
    })

    const dtsContent = await ctx.generateDTS(dts)
    expect(dtsContent).not.toContain('AAA')
    expect(dtsContent).not.toContain('BBB')
    expect(dtsContent).not.toContain('$$')
    expect(dtsContent).not.toContain('customFile')
    expect(dtsContent).not.toContain('customFile1')

    expect(dtsContent).toContain('ref')
    expect(dtsContent).toContain('reactive')
    expect(dtsContent).toContain('watch')
    expect(dtsContent).toContain('computed')
  })
})
