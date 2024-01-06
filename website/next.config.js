const MolcssPlugin = require('molcss/webpack-plugin').default

const plugin = new MolcssPlugin({
  content: 'src/**/*.{js,jsx,ts,tsx,md}',
})

/** @type {import('next').NextConfig} */
module.exports = {
  output: 'export',
  webpack(config) {
    config.plugins.unshift(plugin)

    config.module.rules.unshift({
      test: /\.(js|jsx|ts|tsx)$/,
      use: MolcssPlugin.loader,
    })

    return config
  },
}
