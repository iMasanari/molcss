import { escapeRegExp } from '../utils/regExp'

export const extractCritical = (html: string, cache: Map<string, string>) => {
  if (!cache.size) {
    return { html, ids: [], css: '' }
  }

  const regExp = new RegExp(`\\b(${Array.from(cache.keys(), escapeRegExp).join('|')})\\b`, 'g')

  const ids = Array.from(html.matchAll(regExp), v => v[0])
  const css = Array.from(new Set(ids), v => cache.get(v)!).join('')

  return { html, ids, css }
}
