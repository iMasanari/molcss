# MolCSS

A simple, lightweight, and powerful CSS-in-JS library.

## Usage

```jsx
import 'virtual:molcss/style.css' // for Vite
// import 'molcss/style.css'      // for webpack (experimental)
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

### Vite

```js
// code
import 'virtual:molcss/style.css'
```

```js
// vite.config.js
import molcss from 'molcss/vite-plugin'

export default defineConfig({
  // ...
  plugins: [
    molcss({
      content: 'src/**/*.{js,jsx,ts,tsx}',
    })
  ],
  // ...
})
```

### Next.js appDir (experimental)

```js
// code
import 'molcss/style.css'
```

```js
// next.config.js
const MolcssPlugin = require('molcss/webpack-plugin').default

const plugin = new MolcssPlugin({
  content: [
    'src/**/*.{js,jsx,ts,tsx}',
    'app/**/*.{js,jsx,ts,tsx}',
  ],
})

module.exports = {
  // ...
  experimental: {
    appDir: true,
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.(js|jsx|ts|tsx)$/,
      use: MolcssPlugin.loader,
    })

    config.plugins.push(plugin)

    return config
  },
  // ...
}

```

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
