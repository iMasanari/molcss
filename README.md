# MolCSS

Atomic CSS-in-JS Library.

## Usage

```jsx
import 'virtual:molcss/style.css'
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
  plugins: [
    molcss({
      content: 'src/**/*.{js,jsx,ts,tsx}',
    })
  ],
})
```
