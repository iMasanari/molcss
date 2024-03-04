import { createRequire } from 'node:module'
import { babel } from '@rollup/plugin-babel'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import molcssBabelPlugin from './src/babel-plugin'

const require = createRequire(import.meta.url)
const { molcssContext } = require('./tests/postcss-helper.cjs')

export default defineConfig({
  resolve: {
    alias: [
      { find: 'molcss/style.css', replacement: `${__dirname}/style.css` },
      { find: 'molcss/react/jsx-runtime', replacement: `${__dirname}/src/jsx-runtime.ts` },
      { find: 'molcss/react/jsx-dev-runtime', replacement: `${__dirname}/src/jsx-dev-runtime.ts` },
      { find: 'molcss', replacement: `${__dirname}/src/client.ts` },
    ],
  },
  plugins: [
    react({
      jsxImportSource: 'molcss/react',
    }),
    babel({
      extensions: ['.js', '.jsx', '.ts', 'tsx'],
      babelHelpers: 'bundled',
      plugins: [
        [molcssBabelPlugin, {
          context: molcssContext,
        }],
      ],
    }),
  ],
  test: {
    css: true,
    browser: {
      name: 'chrome',
      headless: true,
    },
    setupFiles: 'tests/setup.ts',
  },
})
