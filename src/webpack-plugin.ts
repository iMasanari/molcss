import { resolve } from 'node:path'
import type { Compiler } from 'webpack'
import VirtualModulesPlugin from 'webpack-virtual-modules'
import { TransformOptions } from './Transformer'
import { transformer } from './webpack-loader'

const PACKAGE_NAME = 'molcss'
const IMPORT_STYLE_PATH = 'molcss/style.css'

export interface MolcssWebpackOptions extends TransformOptions {
  content: string | string[]
}

export const loader = 'molcss/webpack-loader'

export default class MolcssPlugin {
  private options: MolcssWebpackOptions

  static loader = loader

  constructor(options: MolcssWebpackOptions) {
    this.options = options
  }

  apply(compiler: Compiler) {
    const virtualStylePath = resolve(compiler.context, 'virtual:molcss/style.css')

    const virtualModules = new VirtualModulesPlugin({
      [virtualStylePath]: '',
    })

    virtualModules.apply(compiler)

    compiler.options.module.rules.push({
      include: (resource) => resource.endsWith('virtual:molcss/style.css'),
      use: [
        {
          loader: 'molcss/webpack-virtual-module-loader',
          options: { content: () => transformer.getCss() },
        },
      ],
    })

    if (!compiler.options.resolve) {
      compiler.options.resolve = {}
    }

    // setup alias
    compiler.options.resolve.alias = {
      ...compiler.options.resolve.alias,
      [IMPORT_STYLE_PATH]: virtualStylePath,
    }

    compiler.hooks.beforeRun.tapPromise(PACKAGE_NAME, async () => {
      await transformer.analyze(this.options.content, this.options)

      virtualModules.writeModule(virtualStylePath, transformer.getCss())
    })

    transformer.subscribeShouldUpdate(async () => {
      await transformer.analyze(this.options.content, this.options)

      virtualModules.writeModule(virtualStylePath, transformer.getCss())
    })
  }
}
