import { transformAsync } from '@babel/core'
import type { LoaderContext } from 'webpack'
import molcssBabelPlugin from './babel-plugin'
import { StyleContext } from './lib/style'

interface Options {
  context: StyleContext
}

export default async function molcssScriptLoader(this: LoaderContext<Options>, input: string) {
  const callback = this.async()
  const { context } = this.getOptions()

  try {
    const result = await transformAsync(input, {
      filename: this.resourcePath,
      plugins: [
        [molcssBabelPlugin, { context }],
      ],
      sourceMaps: true,
    })

    if (!result || !result.code) {
      return input
    }

    return callback(null, result.code, result.map || undefined)
  } catch (e) {
    return callback(e as Error)
  }
}
