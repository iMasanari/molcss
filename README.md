# MolCSS

A simple, lightweight, and powerful CSS-in-JS library.

## Usage

```jsx
import 'molcss/style.css'
import { css } from 'molcss'

const className = css`
  color: red;
  width: 500px;
  border: 1px solid black;
  &:hover {
    color: blue;
  }
`

export default () => <div className={className} />
```

## Features

### Atomic CSS-in-JS

The described style definitions are atomically decomposed and reused at build time.

#### Before build

```js
import { css, mergeStyle } from 'molcss'

const a = css`
  color: black;
  padding: 1px;
  margin-top: 4px;
`

const b = css`
  color: black;
  padding: 2px;
  margin: 3px;
`

const c1 = mergeStyle(a, b)
const c2 = mergeStyle(b, a)
```

#### After build

```js
import { mergeStyle } from 'molcss'

const a = 'c0 a0 l0'
const b = 'c0 a1 d0'
const c1 = mergeStyle(a, b) // 'c0 a1 d0'
const c2 = mergeStyle(b, a) // 'c0 a0 d0 l0'
```

```css
/* generated css */
.c0 { color: black; }
.a0 { padding: 1px; }
.a1 { padding: 2px; }
.d0 { margin: 3px; }
.l0 { margin-top: 4px; }
```

### Runtime Style

Supports runtime styles. However, unlike static styles, the css return value is a dedicated object.
For vanilla JS, use generateRuntime. For React, you can use CSS props to support SSR.

```jsx
/** @jsxImportSource molcss/react */
import { css, generateRuntime } from 'molcss'

const staticStyle = css`
  color: blue;
`

const dynamicStyle = (color) => css`
  color: ${color};
`

console.log(typeof staticStyle)         // string
console.log(typeof dynamicStyle('red')) // object

const ForVanillaJS = () => `
  <div class=${staticStyle}></div>
  <div class=${generateRuntime(dynamicStyle('red'))}></div>
`

const ForReact = () =>
  <>
    <div className={staticStyle} />
    <div css={dynamicStyle('red')} />
  </>
```

## Setup

### Vite + React

```sh
npm install molcss
npm install -D @vitejs/plugin-react
```

```js
// code
import 'molcss/style.css'
```

```js
// molcss.context.cjs
const { createContext } = require('molcss/context')

module.exports = createContext()
```

```js
// vite.config.js
import { createRequire } from 'node:module'
import react from '@vitejs/plugin-react'

const require = createRequire(import.meta.url)
const molcssContext = require('./molcss.context.cjs')

export default defineConfig({
  // ...
  plugins: [
    react({
      jsxImportSource: 'molcss/react',
      babel: {
        plugins: [
          ['molcss/babel-plugin', {
            context: molcssContext,
          }]
        ]
      }
    })
  ]
})
```


```js
// postcss.config.cjs
const molcssContext = require('./molcss.context.cjs')

module.exports = {
  plugins: [
    require('molcss/postcss-plugin')({
      content: 'src/**/*.{js,jsx,ts,tsx}',
      context: molcssContext,
    }),
  ],
}
```

```js
// tsconfig.json (When using TypeScript)
{
  "compilerOptions": {
    "jsxImportSource": "molcss/react",
  }
}
```

### Next.js appDir

```sh
npm install molcss
npm install postcss-flexbugs-fixes postcss-preset-env
```

```js
// code
import 'molcss/style.css'
```

```js
// molcss.context.js
const { createContext } = require('molcss/context')

module.exports = createContext()
```

```js
// babel.config.js
const molcssContext = require('./molcss.context')

module.exports = {
  presets: [
    ['next/babel', {
      'preset-react': {
        runtime: 'automatic',
        importSource: 'molcss/react',
      },
    }],
  ],
  plugins: [
    ['molcss/babel-plugin', {
      context: molcssContext,
    }],
  ],
}
```

```js
// postcss.config.js
const molcssContext = require('./molcss.context')

module.exports = {
  plugins: [
    // nextjs default settings
    // https://nextjs.org/docs/pages/building-your-application/configuring/post-css#customizing-plugins
    'postcss-flexbugs-fixes',
    ['postcss-preset-env', {
      autoprefixer: {
        flexbox: 'no-2009',
      },
      stage: 3,
      features: {
        'custom-properties': false,
      },
    }],
    // molcss settings
    ['molcss/postcss-plugin', {
      content: [
        'app/**/*.{js,jsx,ts,tsx}',
        'src/**/*.{js,jsx,ts,tsx}',
      ],
      context: molcssContext,
    }],
  ],
}
```

```js
// tsconfig.json
{
  "compilerOptions": {
    "jsxImportSource": "molcss/react",
  }
}
```

<!--
### webpack (experimental)

```js
// code
import 'molcss/style.css'
```

```js
// webpack.config.js
const MolcssPlugin = require('molcss/webpack-plugin').default

module.exports = {
  // ...
  module: {
    rules: [
      {
        test: /\.(js|jsx|ts|tsx)$/,
        use: [
          MolcssPlugin.loader,
        ],
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader',
        ],
      },
    ],
  },
  plugins: [
    new MolcssPlugin({
      content: 'src/**.{js,jsx,ts,tsx}',
    }),
  ],
  // ...
}
```
-->
