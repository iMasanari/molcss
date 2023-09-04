// @ts-check

import { defineConfig } from 'rollup'
import dts from 'rollup-plugin-dts'
import esbuild from 'rollup-plugin-esbuild'
import packages from './package.json' assert { type: 'json' }

const config = defineConfig({
  plugins: [
    esbuild(),
  ],
  external: [
    'node:fs/promises',
    'node:path',
    ...Object.keys(packages.dependencies),
  ],
})

export default defineConfig([
  {
    ...config,
    input: './src/client.ts',
    output: [
      { format: 'esm', file: packages.exports['.'].import },
      { format: 'cjs', file: packages.exports['.'].require, interop: 'auto' },
    ],
  }, {
    ...config,
    input: {
      'vite/vite-plugin': './src/vite-plugin.ts',
      'webpack/webpack-loader': './src/webpack-loader.ts',
      'webpack/webpack-plugin': './src/webpack-plugin.ts',
      'webpack/webpack-virtual-module-loader': './src/webpack-virtual-module-loader.ts',
    },
    output: [
      { format: 'esm', dir: 'dist', entryFileNames: '[name].mjs', chunkFileNames: 'chunk/[name]-[hash].mjs' },
      { format: 'cjs', dir: 'dist', entryFileNames: '[name].js', chunkFileNames: 'chunk/[name]-[hash].js', exports: 'named', interop: 'auto' },
    ],
  }, {
    input: {
      'molcss': './src/client.ts',
      'vite/vite-plugin': './src/vite-plugin.ts',
      'webpack/webpack-loader': './src/webpack-loader.ts',
      'webpack/webpack-plugin': './src/webpack-plugin.ts',
      'webpack/webpack-virtual-module-loader': './src/webpack-virtual-module-loader.ts',
    },
    plugins: [dts()],
    output: [
      { format: 'esm', dir: 'dist' },
    ],
  },
])
