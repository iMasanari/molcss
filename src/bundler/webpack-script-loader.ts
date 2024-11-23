import { transformAsync } from '@babel/core'
import type { LoaderContext } from 'webpack'
import molcssBabelPlugin, { MolcssBabelOptions } from '../compiler/babel-plugin'
import { StyleContext } from '../compiler/context'

export interface WebpackScriptOptions {
  context: StyleContext
  devLabel: boolean | undefined
  dir: string
}

export default async function molcssScriptLoader(this: LoaderContext<WebpackScriptOptions>, input: string) {
  const callback = this.async()
  const { context, devLabel, dir } = this.getOptions()

  try {
    const result = await transformAsync(input, {
      filename: this.resourcePath,
      plugins: [
        [molcssBabelPlugin, { context, devLabel } satisfies MolcssBabelOptions],
      ],
      sourceMaps: true,
    })

    if (!result || !result.code) {
      return input
    }

    this.addContextDependency(dir)

    return callback(null, result.code, result.map || undefined)
  } catch (e) {
    return callback(e as Error)
  }
}
