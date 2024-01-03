import { defineProperties, shorthands } from '../generated/defineCssProperties'
import { convertToAlphabet } from '../utils/convertor'
import { StyleData } from './css-parser'

const hasOwn = Object.prototype.hasOwnProperty

interface StyleKeyData {
  name: string
  values: Map<string, string>
  meta: Map<string, string>
}

export type StyleContext = Map<string, StyleKeyData>

export const createStyleContext = (): StyleContext => {
  return new Map([...defineProperties.entries()].map(([prop, name]) =>
    [prop, { name, values: new Map(), meta: new Map() }]
  ))
}

const getOrCreate = <T, U>(collection: Map<T, U>, key: T, create: (collection: Map<T, U>) => U) => {
  if (collection.has(key)) {
    return collection.get(key)!
  }

  const value = create(collection)
  collection.set(key, value)

  return value
}

export const createClassName = (result: StyleData, context: StyleContext) => {
  const stylePropData = getOrCreate(context, result.prop, () => ({
    name: convertToAlphabet(context.size),
    values: new Map<string, string>(),
    meta: new Map<string, string>(),
  }))

  const styleValueName = result.values.length
    ? getOrCreate(stylePropData.values, result.values.join('\n'), (v) => v.size.toString())
    : '00' // ランタイムスタイルのキー取得用

  const styleMetaName = result.media || result.selector !== '&\f'
    ? getOrCreate(stylePropData.meta, `${result.media}{${result.selector}`, (v) => convertToAlphabet(v.size))
    : ''

  return stylePropData.name + styleValueName + styleMetaName
}

export const createRuntimeKey = (styleData: StyleData, styleContext: StyleContext) => {
  const token = createClassName({ ...styleData, values: [] }, styleContext)
  const className = createClassName({ prop: `--molcss-runtime-key-${token}`, values: [], selector: '&\f', media: '' }, styleContext)

  return className.replace(/\d+$/, '')
}

export const createStyle = (styleMap: Map<string, StyleData>) => {
  return [...styleMap.entries()].sort(sortFn).map(([className, data]) => getStyle(data, className)).join('\n') + '\n'
}

const isShorthand = (prop: string) => {
  const key = defineProperties.get(prop)

  if (!key) {
    return false
  }

  return hasOwn.call(shorthands, key)
}

const sortFn = ([, a]: [string, StyleData], [, b]: [string, StyleData]) => {
  if (a.media !== b.media) {
    if (!a.media) return -1
    if (!b.media) return 1

    return a.media > b.media ? -1 : 1
  }

  const aIsShorthand = isShorthand(a.prop)

  if (aIsShorthand !== isShorthand(b.prop)) {
    return aIsShorthand ? -1 : 1
  }

  if (a.prop !== b.prop) {
    // Sort by vendor prefix first.
    return a.prop < b.prop ? -1 : 1
  }

  return a.selector > b.selector ? -1 : 1
}

const getStyle = (result: StyleData, className: string) => {
  const selector = result.selector.replace(/&\f?/g, `.${className}`)

  const styles = result.values.map(v => {
    const style = `${selector}{${result.prop}:${v}}`

    return result.media ? `${result.media}{${style}}` : style
  })

  return styles.join('')
}
