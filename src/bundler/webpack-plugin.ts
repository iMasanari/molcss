import { createFilter } from '@rollup/pluginutils'
import type { Compiler } from 'webpack'
import { createContext } from '../compiler/context'
import { WebpackScriptOptions } from './webpack-script-loader'

export interface MolcssWebpackOptions {
  content: string | string[]
  devLabel?: boolean
}

export const scriptLoader = 'molcss/webpack-script-loader'
export const styleLoader = 'molcss/webpack-style-loader'

export default class MolcssPlugin {
  static scriptLoader = scriptLoader
  static styleLoader = styleLoader

  private context = createContext()

  constructor(private options: MolcssWebpackOptions) {
  }

  apply(compiler: Compiler) {
    const filter = createFilter(this.options.content)
    const styleFilter = createFilter('**/molcss/style.css')

    compiler.options.module.rules.unshift({
      test: value => filter(value),
      loader: scriptLoader,
      options: {
        context: this.context,
        devLabel: this.options.devLabel,
        dir: compiler.context,
      } satisfies WebpackScriptOptions,
    })

    compiler.options.module.rules.push({
      test: value => styleFilter(value),
      loader: styleLoader,
      options: {
        content: this.options.content,
        context: this.context,
        dir: compiler.context,
      },
    })
  }
}
