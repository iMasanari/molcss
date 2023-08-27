# MolCSS

Atomic CSS-in-JS Library.

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

The described style definitions are atomically decomposed and reused at build time.

### Before build

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

### After build

```js
/*
generated css
.c0 { color: black; }
.a0 { padding: 1px; }
.a1 { padding: 2px; }
.d0 { margin: 3px; }
.l0 { margin-top: 4px; }
*/

import { mergeStyle } from 'molcss'

const a = 'c0 a0 l0'
const b = 'c0 a1 d0'
const c1 = mergeStyle(a, b) // 'c0 a1 d0'
const c2 = mergeStyle(b, a) // 'c0 a0 d0 l0'
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

### Next.js appDir (bata)

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
  nextjsAppDir: true,
})

module.exports = {
  // ...
  experimental: {
    appDir: true,
  },
  webpack(config) {
    config.module.rules.unshift({
      test: /\.(js|jsx|ts|tsx)$/,
      use: [
        { loader: MolcssPlugin.loader },
      ],
    })

    config.plugins.unshift(plugin)

    return config
  },
  // ...
}

```

### Webpack (bata)

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
          { loader: MolcssPlugin.loader },
        ],
      },
      {
        test: /\.css$/,
        use: [
          { loader: 'style-loader' },
          { loader: 'css-loader' },
        ],
      },
    ],
  },
  plugins: [
    new MolcssPlugin({
      content: 'app/**.{js,jsx,ts,tsx}',
    }),
  ],
  // ...
}
```
