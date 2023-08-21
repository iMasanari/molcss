import { createRequire } from 'node:module'
import type { Compiler } from 'webpack'
import VirtualModulesPlugin from 'webpack-virtual-modules'
import { transformer } from './webpack-loader'

const resolvePath = (path: string) =>
  typeof require !== 'undefined'
    ? require.resolve(path)
    : createRequire(import.meta.url).resolve(path)

const PACKAGE_NAME = 'molcss'

const packagePath = resolvePath('molcss/package.json')
const stylePath = resolvePath('molcss/style.css')

const virtualModules = new VirtualModulesPlugin()

export interface MolcssWebpackOptions {
  content: string | string[]
  nextjsAppDir?: boolean
}

export const loader = 'molcss/webpack-loader'

export default class MolcssPlugin {
  private options: MolcssWebpackOptions

  static loader = loader

  constructor(options: MolcssWebpackOptions) {
    this.options = options
  }

  apply(compiler: Compiler) {
    virtualModules.apply(compiler)

    if (this.options.nextjsAppDir) {
      this._setupVirtualModuleLoader(compiler)
    }

    compiler.hooks.beforeRun.tapPromise(PACKAGE_NAME, async () => {
      await transformer.analyze(this.options.content)

      virtualModules.writeModule(stylePath, transformer.getCss())

      // XXX: 無理やり更新させるためのハック
      virtualModules.writeModule(packagePath, JSON.stringify({}))
    })

    transformer.subscribeShouldUpdate(async () => {
      await transformer.analyze(this.options.content)

      virtualModules.writeModule(stylePath, transformer.getCss())

      // XXX: 無理やり更新させるためのハック
      virtualModules.writeModule(packagePath, JSON.stringify({}))
    })
  }

  private _setupVirtualModuleLoader(compiler: Compiler) {
    compiler.options.module.rules.push({
      test: /\/molcss\/style\.css$/,
      use: [
        {
          loader: 'molcss/webpack-virtual-module-loader',
          options: { content: () => transformer.getCss() },
        },
      ],
    })
  }
}
