import postcss from 'postcss'
import type { LoaderContext } from 'webpack'
import { StyleContext } from '../compiler/context'
import postcssPlugin from '../compiler/postcss-plugin'

interface Options {
  context: StyleContext
  content: string | string[]
  dir: string
}

export default async function molcssStyleLoader(this: LoaderContext<Options>, input: string) {
  const callback = this.async()
  const { context, content, dir } = this.getOptions()

  try {
    const result = await postcss([postcssPlugin({ content, context })]).process(input, { from: undefined })

    this.addContextDependency(dir)

    return callback(null, result.css, result.map?.toString() || undefined)
  } catch (e) {
    return callback(e as Error)
  }
}
