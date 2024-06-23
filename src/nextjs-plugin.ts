import { NextConfig } from 'next'
import { Configuration as WebpackConfig } from 'webpack'
import MolcssPlugin, { MolcssWebpackOptions } from './webpack-plugin'

const molcss = (options: MolcssWebpackOptions) => (nextConfig: NextConfig): NextConfig => {
  const webpack = nextConfig.webpack
  const molcssPlugin = new MolcssPlugin(options)

  return {
    ...nextConfig,
    webpack(config: WebpackConfig, context) {
      const target = {
        ...config,
        plugins: [
          ...config.plugins ?? [],
          molcssPlugin,
        ],
      }

      return webpack ? webpack(target, context) : target
    },
  }
}

export default molcss
