import type { LoaderContext } from 'webpack'
import Transformer, { TransformOptions } from './Transformer'

export const transformer = new Transformer()

export default async function molcssLoader(this: LoaderContext<TransformOptions>, input: string) {
  const callback = this.async()
  const options = this.getOptions()

  try {
    const result = await transformer.transform(input, { ...options, filename: this.resourcePath })

    if (!result || !result.code) {
      return input
    }

    return callback(null, result.code, result.map || undefined)
  } catch (e) {
    return callback(e as Error)
  }
}
