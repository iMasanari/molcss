module.exports = {
  presets: [
    ['@babel/preset-env', {
      exclude: ['@babel/plugin-transform-template-literals'],
    }],
    '@babel/typescript',
    ['@babel/preset-react', {
      runtime: 'automatic',
      importSource: 'molcss/react',
    }],
  ],
}
