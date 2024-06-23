// @ts-check

import { defineConfig } from 'rollup'
import dts from 'rollup-plugin-dts'
import esbuild from 'rollup-plugin-esbuild'
import packages from './package.json' assert { type: 'json' }

const clientInputs =  {
  'molcss': './src/client.ts',
  'react/react': './src/react.tsx',
  'react/jsx-runtime': './src/jsx-runtime.ts',
  'react/jsx-dev-runtime': './src/jsx-dev-runtime.ts',
  'react/nextjs.use-client': './src/nextjs.use-client.tsx',
}

const serverInputs = {
  'server': './src/server.ts',
  'context': './src/context.ts',
  'babel-plugin': './src/babel-plugin.ts',
  'postcss-plugin': './src/postcss-plugin.ts',
  'webpack/webpack-plugin': './src/webpack-plugin.ts',
  'webpack/webpack-script-loader': './src/webpack-script-loader.ts',
  'webpack/webpack-style-loader': './src/webpack-style-loader.ts',
  'nextjs/nextjs-plugin': './src/nextjs-plugin.ts',
  'vite/vite-plugin': './src/vite-plugin.ts',
}

const config = defineConfig({
  plugins: [
    esbuild({ jsx: 'transform' }),
  ],
  external: [
    /^node:/,
    ...Object.keys(packages.dependencies),
    ...Object.keys(packages.peerDependencies),
    'react/jsx-runtime',
    'react/jsx-dev-runtime',
  ],
})

const banner = (/** @type {import('rollup').RenderedChunk} */ v) =>
  v.fileName.includes('.use-client.') ? `'use client';` : ''

export default defineConfig([{
  ...config,
  input: clientInputs,
  output: [
    { format: 'esm', dir: 'dist', entryFileNames: '[name].mjs', chunkFileNames: 'chunk/client/[name].mjs', banner },
    { format: 'cjs', dir: 'dist', entryFileNames: '[name].js', chunkFileNames: 'chunk/client/[name].js', banner, exports: 'named', interop: 'auto' },
  ],
}, {
  ...config,
  input: serverInputs,
  output: [
    { format: 'esm', dir: 'dist', entryFileNames: '[name].mjs', chunkFileNames: 'chunk/server/[name].mjs' },
    { format: 'cjs', dir: 'dist', entryFileNames: '[name].js', chunkFileNames: 'chunk/server/[name].js', exports: 'named', interop: 'auto' },
  ],
}, {
  input: {
    ...clientInputs,
    ...serverInputs,
  },
  plugins: [dts()],
  output: [
    { format: 'esm', dir: 'dist', chunkFileNames: 'chunk/types/[name].d.ts' },
  ],
}])
