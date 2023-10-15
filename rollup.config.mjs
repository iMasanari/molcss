// @ts-check

import { defineConfig } from 'rollup'
import dts from 'rollup-plugin-dts'
import esbuild from 'rollup-plugin-esbuild'
import packages from './package.json' assert { type: 'json' }

const config = defineConfig({
  plugins: [
    esbuild({ jsx: 'transform' }),
  ],
  external: [
    'node:fs/promises',
    'node:path',
    ...Object.keys(packages.dependencies),
    ...Object.keys(packages.peerDependencies),
    'react/jsx-runtime',
    'react/jsx-dev-runtime',
  ],
})

export default defineConfig([
  {
    ...config,
    input: {
      'molcss': './src/client.ts',
      'react/jsx-runtime': './src/jsx-runtime.ts',
      'react/jsx-dev-runtime': './src/jsx-dev-runtime.ts',
    },
    output: [
      { format: 'esm', dir: 'dist', entryFileNames: '[name].mjs', chunkFileNames: 'chunk/[name].mjs' },
      { format: 'cjs', dir: 'dist', entryFileNames: '[name].js', chunkFileNames: 'chunk/[name].js', exports: 'named', interop: 'auto' },
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
      { format: 'esm', dir: 'dist', entryFileNames: '[name].mjs', chunkFileNames: 'chunk/[name].mjs' },
      { format: 'cjs', dir: 'dist', entryFileNames: '[name].js', chunkFileNames: 'chunk/[name].js', exports: 'named', interop: 'auto' },
    ],
  }, {
    input: {
      'molcss': './src/client.ts',
      'react/jsx-runtime': './src/jsx-runtime.ts',
      'react/jsx-dev-runtime': './src/jsx-dev-runtime.ts',
      'vite/vite-plugin': './src/vite-plugin.ts',
      'webpack/webpack-loader': './src/webpack-loader.ts',
      'webpack/webpack-plugin': './src/webpack-plugin.ts',
      'webpack/webpack-virtual-module-loader': './src/webpack-virtual-module-loader.ts',
    },
    plugins: [dts()],
    output: [
      { format: 'esm', dir: 'dist', chunkFileNames: 'chunk/[name].d.ts' },
    ],
  },
])
