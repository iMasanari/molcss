import { StyleData, parse } from './css-parser'
import { extract } from './extractor'

const cache = new Map<string, StyleData[]>()

export const generate = (source: string) => {
  const cssTexts = extract(source)

  const result = cssTexts.flatMap((css) => {
    const key = css.trim()
    const ref = cache.get(key)
    if (ref) return ref

    const styles = parse(css)
    cache.set(key, styles)

    return styles
  })

  return result
}
