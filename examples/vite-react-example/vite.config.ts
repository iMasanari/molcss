import { createRequire } from 'node:module'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const require = createRequire(import.meta.url)
const molcssContext = require('./molcss.context.cjs')

// https://vitejs.dev/config/
export default defineConfig({
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
  ],
})
