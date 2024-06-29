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
