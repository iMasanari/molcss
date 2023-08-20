import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'
import type { Compiler } from 'webpack'
import VirtualModulesPlugin from 'webpack-virtual-modules'
import { transformer } from './webpack-loader'

const resolvePath = (path: string) =>
  typeof require !== 'undefined'
    ? require.resolve(path)
    : createRequire(import.meta.url).resolve(path)

const PACKAGE_NAME = 'molcss'

const injectScriptPath = resolvePath('molcss/style.css')
const stylePath = join(dirname(injectScriptPath), '_virtual.css')

const virtualModules = new VirtualModulesPlugin({
  [injectScriptPath]: `import './_virtual.css';`,
})

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
    })

    transformer.subscribeShouldUpdate(async () => {
      await transformer.analyze(this.options.content)

      virtualModules.writeModule(stylePath, transformer.getCss())
    })
  }

  private _setupVirtualModuleLoader(compiler: Compiler) {
    compiler.options.module.rules.push({
      test: /\/molcss\/style\.css\/index\.mjs?$/,
      use: [
        {
          loader: 'molcss/webpack-virtual-module-loader',
          options: { content: `import './_virtual.css';` },
        },
      ],
    }, {
      test: /\/molcss\/style\.css\/_virtual\.css?$/,
      use: [
        {
          loader: 'molcss/webpack-virtual-module-loader',
          options: { content: () => transformer.getCss() },
        },
      ],
    })
  }
}
