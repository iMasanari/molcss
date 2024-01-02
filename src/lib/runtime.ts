import { hash } from '../utils/hash'

const hashSeed = 0x0000

const ssrStyleCache = new Set<string>()
const runtimStyleDataCache = new Map<string, string>()

export const correctSSRStyle = () => {
  if (typeof document === 'undefined') {
    return
  }

  document.body.querySelectorAll<HTMLElement>('[data-molcss]').forEach(v => {
    const tags = v.dataset.molcss

    if (tags) {
      tags.split(' ').forEach(v => ssrStyleCache.add(v))
    }

    document.head.appendChild(v)
  })
}

let _style: HTMLStyleElement | undefined

const getStyle = () => {
  if (_style) {
    return _style.sheet
  }

  if (typeof document === 'undefined') {
    return null
  }

  _style = document.createElement('style')
  _style.dataset.molcss = ''

  document.head.appendChild(_style)

  return _style.sheet
}

export interface CacheableRuntimeStyleData {
  cacheKey: string
  className: string
  prop: string
  value: string
}

export const insertStyle = (style: CacheableRuntimeStyleData) => {
  if (runtimStyleDataCache.has(style.cacheKey) || ssrStyleCache.has(style.className)) {
    return
  }

  const styleSheet = getStyle()

  if (styleSheet) {
    styleSheet.insertRule(`.${style.className}{${style.prop}:${style.value}}`)

    runtimStyleDataCache.set(style.cacheKey, style.className)
  }
}

export const generateRuntimeStyle = (
  prop: string,
  value: string | number | bigint,
  insertStyle: (style: CacheableRuntimeStyleData) => void,
) => {
  const cacheKey = `${prop}:${value}`
  const cacheValue = runtimStyleDataCache.get(cacheKey)

  if (cacheValue) {
    return cacheValue
  }

  value = '' + value
  const className = prop + hash(value, hashSeed)

  insertStyle({ cacheKey, className, prop: `--molcss-${prop}`, value })

  return className
}
