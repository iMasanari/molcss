// for tests

const { postcssPlugin, molcssContext } = require('./tests/postcss-helper.cjs')

module.exports = {
  plugins: [
    postcssPlugin({
      content: 'tests/**/*.{js,jsx,ts,tsx}',
      context: molcssContext,
    }),
  ],
}
