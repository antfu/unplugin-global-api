# unplugin-auto-import

[![NPM version](https://img.shields.io/npm/v/unplugin-auto-import?color=a1b858&label=)](https://www.npmjs.com/package/unplugin-auto-import)

Auto import APIs on-demand for Vite, Webpack, Rspack, Rollup and esbuild. With TypeScript support. Powered by [unplugin](https://github.com/unjs/unplugin).

---

without

```ts
import { computed, ref } from 'vue'

const count = ref(0)
const doubled = computed(() => count.value * 2)
```

with

```ts
const count = ref(0)
const doubled = computed(() => count.value * 2)
```

---

without

```tsx
import { useState } from 'react'

export function Counter() {
  const [count, setCount] = useState(0)
  return <div>{ count }</div>
}
```

with

```tsx
export function Counter() {
  const [count, setCount] = useState(0)
  return <div>{ count }</div>
}
```

## Install

```bash
npm i -D unplugin-auto-import
```

<details>
<summary>Vite</summary><br>

```ts
// vite.config.ts
import AutoImport from 'unplugin-auto-import/vite'

export default defineConfig({
  plugins: [
    AutoImport({ /* options */ }),
  ],
})
```

Example: [`playground/`](./playground/)

<br></details>

<details>
<summary>Rollup</summary><br>

```ts
// rollup.config.js
import AutoImport from 'unplugin-auto-import/rollup'

export default {
  plugins: [
    AutoImport({ /* options */ }),
    // other plugins
  ],
}
```

<br></details>

<details>
<summary>Webpack</summary><br>

```ts
// webpack.config.js
module.exports = {
  /* ... */
  plugins: [
    require('unplugin-auto-import/webpack').default({ /* options */ }),
  ],
}
```

<br></details>

<details>
<summary>Rspack</summary><br>

```ts
// rspack.config.js
module.exports = {
  /* ... */
  plugins: [
    require('unplugin-auto-import/rspack').default({ /* options */ }),
  ],
}
```

<br></details>

<details>
<summary>Nuxt</summary><br>

> You **don't need** this plugin for Nuxt, it's already built-in.

<br></details>

<details>
<summary>Vue CLI</summary><br>

```ts
// vue.config.js
module.exports = {
  /* ... */
  plugins: [
    require('unplugin-auto-import/webpack').default({ /* options */ }),
  ],
}
```

You can also rename the Vue configuration file to `vue.config.mjs` and use static import syntax (you should use latest `@vue/cli-service ^5.0.8`):
```ts
// vue.config.mjs
import AutoImport from 'unplugin-auto-import/webpack'

export default {
  configureWebpack: {
    plugins: [
      AutoImport({ /* options */ }),
    ],
  },
}
```

<br></details>

<details>
<summary>Quasar</summary><br>

```ts
// vite.config.js [Vite]
import AutoImport from 'unplugin-auto-import/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    AutoImport({ /* options */ })
  ]
})
```

```ts
// quasar.conf.js [Webpack]
const AutoImportPlugin = require('unplugin-auto-import/webpack').default

module.exports = {
  build: {
    chainWebpack(chain) {
      chain.plugin('unplugin-auto-import').use(
        AutoImportPlugin({ /* options */ }),
      )
    },
  },
}
```

<br></details>

<details>
<summary>esbuild</summary><br>

```ts
// esbuild.config.js
import { build } from 'esbuild'
import AutoImport from 'unplugin-auto-import/esbuild'

build({
  /* ... */
  plugins: [
    AutoImport({
      /* options */
    }),
  ],
})
```

<br></details>

<details>
<summary>Astro</summary><br>

```ts
// astro.config.mjs
import AutoImport from 'unplugin-auto-import/astro'

export default defineConfig({
  integrations: [
    AutoImport({
      /* options */
    })
  ],
})
```

<br></details>

## Configuration

```ts
AutoImport({
  // targets to transform
  include: [
    /\.[tj]sx?$/, // .ts, .tsx, .js, .jsx
    /\.vue$/,
    /\.vue\?vue/, // .vue
    /\.md$/, // .md
  ],

  // global imports to register
  imports: [
    // presets
    'vue',
    'vue-router',
    // custom
    {
      '@vueuse/core': [
        // named imports
        'useMouse', // import { useMouse } from '@vueuse/core',
        // alias
        ['useFetch', 'useMyFetch'], // import { useFetch as useMyFetch } from '@vueuse/core',
      ],
      'axios': [
        // default imports
        ['default', 'axios'], // import { default as axios } from 'axios',
      ],
      '[package-name]': [
        '[import-names]',
        // alias
        ['[from]', '[alias]'],
      ],
    },
    // example type import
    {
      from: 'vue-router',
      imports: ['RouteLocationRaw'],
      type: true,
    },
  ],

  // Array of strings of regexes that contains imports meant to be filtered out.
  ignore: [
    'useMouse',
    'useFetch'
  ],

  // Enable auto import by filename for default module exports under directories
  defaultExportByFilename: false,

  // Options for scanning directories for auto import
  dirsScanOptions: {
    types: true // Enable auto import the types under the directories
  },

  // Auto import for module exports under directories
  // by default it only scan one level of modules under the directory
  dirs: [
    './hooks',
    './composables', // only root modules
    './composables/**', // all nested modules
    // ...

    {
      glob: './hooks',
      types: true // enable import the types
    },
    {
      glob: './composables',
      types: false // If top level dirsScanOptions.types importing enabled, just only disable this directory
    }
    // ...
  ],

  // Filepath to generate corresponding .d.ts file.
  // Defaults to './auto-imports.d.ts' when `typescript` is installed locally.
  // Set `false` to disable.
  dts: './auto-imports.d.ts',

  // The mode for generating the .d.ts file.
  // 'overwrite': overwrite the whole existing .d.ts file with the new type definitions.
  // 'append': only append the new type definitions to the existing .d.ts file, means the existing type definitions will be kept.
  // Default to 'append'
  dtsMode: 'append',

  // Array of strings of regexes that contains imports meant to be ignored during
  // the declaration file generation. You may find this useful when you need to provide
  // a custom signature for a function.
  ignoreDts: [
    'ignoredFunction',
    /^ignore_/
  ],

  // Auto import inside Vue template
  // see https://github.com/unjs/unimport/pull/15 and https://github.com/unjs/unimport/pull/72
  vueTemplate: false,

  // Auto import directives inside Vue template
  // see https://github.com/unjs/unimport/pull/374
  vueDirectives: undefined,

  // Custom resolvers, compatible with `unplugin-vue-components`
  // see https://github.com/antfu/unplugin-auto-import/pull/23/
  resolvers: [
    /* ... */
  ],

  // Include auto-imported packages in Vite's `optimizeDeps` options
  // Recommend to enable
  viteOptimizeDeps: true,

  // Inject the imports at the end of other imports
  injectAtEnd: true,

  // Generate corresponding .eslintrc-auto-import.json file.
  // eslint globals Docs - https://eslint.org/docs/user-guide/configuring/language-options#specifying-globals
  eslintrc: {
    enabled: false, // Default `false`
    // provide path ending with `.mjs` or `.cjs` to generate the file with the respective format
    filepath: './.eslintrc-auto-import.json', // Default `./.eslintrc-auto-import.json`
    globalsPropValue: true, // Default `true`, (true | false | 'readonly' | 'readable' | 'writable' | 'writeable')
  },

  // Generate corresponding .biomelintrc-auto-import.json file.
  // biomejs extends Docs - https://biomejs.dev/guides/how-biome-works/#the-extends-option
  biomelintrc: {
    enabled: false, // Default `false`
    filepath: './.biomelintrc-auto-import.json', // Default `./.biomelintrc-auto-import.json`
  },

  // Save unimport items into a JSON file for other tools to consume
  dumpUnimportItems: './auto-imports.json', // Default `false`
})
```

Refer to the [type definitions](./src/types.ts) for more options.

## Presets

See [src/presets](./src/presets).

## Package Presets

We only provide presets for the most popular packages, to use any package not included here you can install it as dev dependency and add it to the `packagePresets` array option:
```ts
AutoImport({
  /* other options */
  packagePresets: ['detect-browser-es'/* other local package names */]
})
```

You can check the [Svelte example](./examples/vite-svelte) for a working example registering `detect-browser-es` package preset and auto importing `detect` function in [App.svelte](./examples/vite-svelte/src/App.svelte).

Please refer to the [unimport PackagePresets jsdocs](https://github.com/unjs/unimport/blob/main/src/types.ts) for more information about options like `ignore` or `cache`.

**Note**: ensure local packages used have package exports configured properly, otherwise the corresponding modules exports will not be detected.

## TypeScript

In order to properly hint types for auto-imported APIs

<table>
<tr>
<td width="400px" valign="top">

1. Enable `options.dts` so that `auto-imports.d.ts` file is automatically generated
2. Make sure `auto-imports.d.ts` is not excluded in `tsconfig.json`

</td>
<td width="600px"><br>

```ts
AutoImport({
  dts: true // or a custom path
})
```

</td>
</tr>
</table>

## ESLint

> 💡 When using TypeScript, we recommend to **disable** `no-undef` rule directly as TypeScript already check for them and you don't need to worry about this.

If you have encountered ESLint error of `no-undef`:

<table>
<tr>
<td width="400px">

1. Enable `eslintrc.enabled`

</td>
<td width="600px"><br>

```ts
AutoImport({
  eslintrc: {
    enabled: true, // <-- this
  },
})
```

</td></tr></table>
<table><tr><td width="400px">

2. Update your `eslintrc`:
[Extending Configuration Files](https://eslint.org/docs/user-guide/configuring/configuration-files#extending-configuration-files)

</td>
<td width="600px"><br>

```ts
// .eslintrc.js
module.exports = {
  extends: [
    './.eslintrc-auto-import.json',
  ],
}
```

</td>
</tr>
</table>

## FAQ

### Compare to [`unimport`](https://github.com/unjs/unimport)

From v0.8.0, `unplugin-auto-import` **uses** `unimport` underneath. `unimport` is designed to be a lower-level tool (it also powered Nuxt's auto import). You can think `unplugin-auto-import` is a wrapper of it that provides more user-friendly config APIs and capabilities like resolvers. Development of new features will mostly happen in `unimport` from now.

### Compare to [`vue-global-api`](https://github.com/antfu/vue-global-api)

You can think of this plugin as a successor to `vue-global-api`, but offering much more flexibility and bindings with libraries other than Vue (e.g. React).

###### Pros

- Flexible and customizable
- Tree-shakable (on-demand transforming)
- No global population

###### Cons

- Relying on build tools integrations (while `vue-global-api` is pure runtime) - but hey, we have supported quite a few of them already!

## Sponsors

<p align="center">
  <a href="https://cdn.jsdelivr.net/gh/antfu/static/sponsors.svg">
    <img src='https://cdn.jsdelivr.net/gh/antfu/static/sponsors.svg'/>
  </a>
</p>

## License

[MIT](./LICENSE) License © 2021-PRESENT [Anthony Fu](https://github.com/antfu)
