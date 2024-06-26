import { defineProperties, shorthands } from '../../generated/defineCssProperties'
import { convertToAlphabet } from '../../utils/convertor'
import { DUMMY_NESTING_SELECTOR_CLASS_NAME_REG, StyleData } from './css-parser'

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
    ? getOrCreate(stylePropData.values, result.values.map(v => [...v.atRule, , v.selector, v.value].join('{')).join('\n'), (v) => v.size.toString())
    : '00' // ランタイムスタイルのキー取得用

  const styleSelectorName = result.group.startsWith('{')
    ? ''
    : getOrCreate(stylePropData.meta, result.group, (v) => convertToAlphabet(v.size))

  return stylePropData.name + styleValueName + styleSelectorName
}

export const createRuntimeKey = (styleData: StyleData, index: number, styleContext: StyleContext) => {
  const token = createClassName({ ...styleData, values: [] }, styleContext)
  const className = createClassName({ prop: `--molcss-runtime-key-${token}-${index}`, values: [], group: '{' }, styleContext)

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

const sortFn = ([, a]: [unknown, StyleData], [, b]: [unknown, StyleData]) => {
  const aIsShorthand = isShorthand(a.prop)

  if (aIsShorthand !== isShorthand(b.prop)) {
    return aIsShorthand ? -1 : 1
  }

  if (a.prop !== b.prop) {
    // Sort by vendor prefix first.
    return a.prop < b.prop ? -1 : 1
  }

  return a.group > b.group ? -1 : 1
}

const getStyle = (result: StyleData, className: string) => {
  const styles = result.values.map(v => {
    const style = `${v.selector.replace(DUMMY_NESTING_SELECTOR_CLASS_NAME_REG, className)}{${result.prop}:${v.value}}`

    return v.atRule.reduceRight((acc, v) => `${v}{${acc}}`, style)
  })

  return styles.join(' ')
}
