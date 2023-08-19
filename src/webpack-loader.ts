import type { LoaderContext } from 'webpack'
import Transformer from './Transformer'

export const transformer = new Transformer()

export default async function molcssLoader(this: LoaderContext<unknown>, input: string) {
  const callback = this.async()

  try {
    const result = await transformer.transform(input)

    if (!result || !result.code) {
      return input
    }

    return callback(null, result.code, result.map || undefined)
  } catch (e) {
    return callback(e as Error)
  }
}
