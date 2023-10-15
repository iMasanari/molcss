import { defineConfig } from 'vite'
import molcss from './src/vite-plugin'

export default defineConfig({
  resolve: {
    alias: {
      'molcss': `${__dirname}/src/client.ts`,
    },
  },
  plugins: [
    molcss({
      content: ['tests/**/*.ts'],
    }),
  ],
  test: {
    css: true,
  },
})
