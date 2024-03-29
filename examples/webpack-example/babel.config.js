const molcssContext = require('./molcss.context')

module.exports = {
  presets: [
    '@babel/env',
    '@babel/typescript',
    ['@babel/preset-react', {
      runtime: 'automatic',
      importSource: 'molcss/react',
    }],
  ],
  plugins: [
    ['molcss/babel-plugin', {
      context: molcssContext,
    }],
  ],
}
