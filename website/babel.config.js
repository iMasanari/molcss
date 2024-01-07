const molcssContext = require('./molcss.context')

// https://nextjs.org/docs/pages/building-your-application/configuring/babel#customizing-presets-and-plugins
module.exports = {
  presets: [
    'next/babel',
  ],
  plugins: [
    ['molcss/babel-plugin', {
      context: molcssContext,
    }],
  ],
}
