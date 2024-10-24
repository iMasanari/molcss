import { defineProperties, shorthands } from '../../generated/defineCssProperties'
import { convertToAlphabet } from '../../utils/convertor'
import { DUMMY_NESTING_SELECTOR_CLASS_NAME_REG, StyleData } from './css-parser'

const hasOwn = Object.prototype.hasOwnProperty

interface StyleKeyData {
  group: string
  values: Map<string, string>
}

export type StyleContext = Map<string, StyleKeyData>

export const createStyleContext = (): StyleContext => {
  return new Map([...defineProperties.entries()].map(([prop, group]) =>
    [prop, { group, values: new Map() }]
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
  const styleGroupData = getOrCreate(context, result.group, () => ({
    group: convertToAlphabet(context.size),
    values: new Map<string, string>(),
  }))

  const styleValueName = result.values.length
    ? getOrCreate(styleGroupData.values, result.values.map(v => [...v.atRule, , v.selector, v.value].join('{')).join('\n'), (v) => v.size.toString())
    : '00' // ランタイムスタイルのキー取得用

  return styleGroupData.group + styleValueName
}

export const createRuntimeKey = (styleData: StyleData, index: number, styleContext: StyleContext) => {
  const group = `__MOLCSS_RUNTIME_KEY__${styleData.group}__${index}`
  const className = createClassName({ prop: group, values: [], group }, styleContext)

  return className.replace(/\d+$/, '')
}

export const createStyle = (styleMap: Map<string, StyleData>) => {
  return [...styleMap.entries()].sort(sortFn).map(([selector, data]) => getStyle(data, selector)).join('\n') + '\n'
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

const getStyle = (result: StyleData, selector: string) => {
  const styles = result.values.map(v => {
    const style = `${v.selector.replace(DUMMY_NESTING_SELECTOR_CLASS_NAME_REG, selector)}{${result.prop}:${v.value}}`

    return v.atRule.reduceRight((acc, v) => `${v}{${acc}}`, style)
  })

  return styles.join(' ')
}
