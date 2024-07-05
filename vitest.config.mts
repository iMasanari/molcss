import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import molcss from './src/bundler/vite-plugin'

export default defineConfig({
  resolve: {
    alias: [
      { find: 'molcss/style.css', replacement: `${__dirname}/style.css` },
      { find: 'molcss/react/jsx-runtime', replacement: `${__dirname}/src/react/jsx-runtime.ts` },
      { find: 'molcss/react/jsx-dev-runtime', replacement: `${__dirname}/src/react/jsx-dev-runtime.ts` },
      { find: 'molcss/react-19/jsx-runtime', replacement: `${__dirname}/src/react-19/jsx-runtime.ts` },
      { find: 'molcss/react-19/jsx-dev-runtime', replacement: `${__dirname}/src/react-19/jsx-dev-runtime.ts` },
      { find: 'molcss', replacement: `${__dirname}/src/molcss/client.ts` },
    ],
  },
  plugins: [
    react({
      jsxImportSource: 'molcss/react',
    }),
    molcss({
      content: 'tests/**/*.{js,jsx,ts,tsx}',
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
