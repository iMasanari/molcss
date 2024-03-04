// @ts-check

const { register } = require('esbuild-register/dist/node')
const { unregister } = register()

const { createContext } = require('../src/context')
const { default: postcssPlugin } = require('../src/postcss-plugin')

unregister()

exports.molcssContext = createContext()
exports.postcssPlugin = postcssPlugin
