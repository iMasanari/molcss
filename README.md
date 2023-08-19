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

## Setup

### Vite

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

### Webpack

```js
const MolcssPlugin = require('molcss/webpack-plugin').default

module.exports = {
  // ...
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
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
      content: 'src/**.{js,jsx}',
    }),
  ],
  // ...
}
```