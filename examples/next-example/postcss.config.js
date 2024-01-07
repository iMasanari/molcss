const molcssContext = require('./molcss.context')

// https://nextjs.org/docs/pages/building-your-application/configuring/post-css#customizing-plugins
module.exports = {
  plugins: [
    'postcss-flexbugs-fixes',
    ['postcss-preset-env', {
      autoprefixer: {
        flexbox: 'no-2009',
      },
      stage: 3,
      features: {
        'custom-properties': false,
      },
    }],
    ['molcss/postcss-plugin', {
      content: [
        'app/**/*.{js,jsx,ts,tsx}',
        'src/**/*.{js,jsx,ts,tsx}',
      ],
      context: molcssContext,
    }],
  ],
}
