const molcssContext = require('./molcss.context')

/** @type {import('next').NextConfig} */
module.exports = {
  webpack(/** @type {import('webpack').Configuration} */ config) {
    config.module.rules.unshift({
      test: /\.(jsx?|tsx?)$/i,
      exclude: /node_modules/,
      loader: 'babel-loader',
      options: {
        plugins: [
          ['molcss/babel-plugin', {
            context: molcssContext,
          }],
        ],
      },
    })

    return config
  },
}
