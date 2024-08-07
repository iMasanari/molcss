import { hash } from './hash'

const ssrStyleCache = /* @__PURE__ */ new Set<string>(
  typeof document !== 'undefined'
    ? Array.from(document.head.querySelectorAll<HTMLElement>('style[data-molcss]')).flatMap(v => {
      const tags = v.dataset.molcss

      return tags ? tags.split(' ') : []
    })
    : []
)

const runtimStyleDataCache = new Map<string, string>()

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
  const className = prop + hash(value)

  insertStyle({ cacheKey, className, prop: `--molcss-${prop}`, value })

  return className
}

export const getRuntimeStyle = (prop: string, value: string | number | bigint) => {
  // MEMO: ハッシュ処理をキャッシュ化するか検討すること
  return prop + hash('' + value)
}
