const molcssContext = require('./molcss.context.js')

module.exports = {
  plugins: [
    require('molcss/postcss-plugin')({
      content: 'src/**/*.{js,jsx,ts,tsx}',
      context: molcssContext,
    }),
  ],
}
