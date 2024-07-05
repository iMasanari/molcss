// @ts-check

import { defineConfig } from 'rollup'
import dts from 'rollup-plugin-dts'
import esbuild from 'rollup-plugin-esbuild'
import packages from './package.json' assert { type: 'json' }

const clientInputs =  {
  'molcss/molcss': './src/molcss/client.ts',
  'react/react': './src/react/react.tsx',
  'react/react.use-client': './src/react/react.use-client.tsx',
  'react/jsx-runtime': './src/react/jsx-runtime.ts',
  'react/jsx-dev-runtime': './src/react/jsx-dev-runtime.ts',
  'react-19/jsx-runtime': './src/react-19/jsx-runtime.ts',
  'react-19/jsx-dev-runtime': './src/react-19/jsx-dev-runtime.ts',
}

const serverInputs = {
  'molcss/server': './src/molcss/server.ts',
  'compiler/context': './src/compiler/context.ts',
  'compiler/babel-plugin': './src/compiler/babel-plugin.ts',
  'compiler/postcss-plugin': './src/compiler/postcss-plugin.ts',
  'bundler/webpack-plugin': './src/bundler/webpack-plugin.ts',
  'bundler/webpack-script-loader': './src/bundler/webpack-script-loader.ts',
  'bundler/webpack-style-loader': './src/bundler/webpack-style-loader.ts',
  'bundler/nextjs-plugin': './src/bundler/nextjs-plugin.ts',
  'bundler/vite-plugin': './src/bundler/vite-plugin.ts',
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
