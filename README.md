# Molcss

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
  <div class="${staticStyle}"></div>
  <div class="${generateRuntime(dynamicStyle('red'))}"></div>
`

const ForReact = () =>
  <>
    <div className={staticStyle} />
    <div css={dynamicStyle('red')} />
  </>
```

#### Zero-Runtime Runtime Style (experimental)

```jsx
import { css, toInlineProps } from 'molcss'

const dynamicStyle = (color) => css`
  color: ${color};
`

const props = toInlineProps({ css: dynamicStyle('red') })

const ZeroRuntimeForVanillaJS = () =>
  `<div
    class="${props.className}"
    style="${Object.entries(props.style).map(([key, value]) => `${key}:${value};`).join('')}"
  ></div>`

const ZeroRuntimeForReact = () =>
  <>
    <div className={props.className} style={props.style} />
    {/* or */}
    <div {...toInlineProps({ css: dynamicStyle('green') })} />
  </>
```

## Setup

Plugins are available for Vite, Next.js, and Webpack.  
See [examples](https://github.com/iMasanari/molcss/tree/main/examples).

### Vite + React

```js
// vite.config.mjs
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import molcss from 'molcss/vite-plugin'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      jsxImportSource: 'molcss/react',
    }),
    molcss({
      content: 'src/**/*.{js,jsx,ts,tsx}',
    })
  ],
})
```

```js
// tsconfig.json (When using TypeScript)
{
  "compilerOptions": {
    "jsxImportSource": "molcss/react",
  }
}
```

```js
// entry point
import 'molcss/style.css'
```

### Next.js

```js
// next.config.mjs
import molcss from 'molcss/nextjs-plugin'

const withMolcss = molcss({
  content: [
    'src/**/*.{js,jsx,ts,tsx}',
    'app/**/*.{js,jsx,ts,tsx}',
    'pages/**/*.{js,jsx,ts,tsx}',
  ],
})

export default withMolcss({
  // ...
})
```

```js
// package.json
{
  // Change the browserslist settings so that only Molcss converts Tagged templates.
  // - safari 12 -> 13
  // https://nextjs.org/docs/architecture/supported-browsers
  "browserslist": [
    "chrome 64",
    "edge 79",
    "firefox 67",
    "opera 51",
    "safari 13"
  ]
}
```

```js
// tsconfig.json (or jsconfig.json)
{
  "compilerOptions": {
    "jsxImportSource": "molcss/react",
  }
}
```

```js
// entry point
import 'molcss/style.css'
```

### Babel & PostCSS Plugin (with Vite + React)

```js
// molcss.context.cjs
const { createContext } = require('molcss/context')

module.exports = createContext()
```

```js
// vite.config.mjs
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

```js
// entry point
import 'molcss/style.css'
```

### Use React 19 `style` (experimental)

Change `jsxImportSource` from `molcss/react` to `molcss/react-19`.
