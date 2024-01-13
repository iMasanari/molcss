import { COMMENT, DECLARATION, Element, MEDIA, RULESET, SUPPORTS, compile } from 'stylis'

export interface StyleData {
  selector: string
  prop: string
  values: { value: string, atRule: string[] }[]
}

export const parse = (style: string): StyleData[] => {
  const ast = compile(style)
  const analyzed = ast.flatMap(element => analyzeStylisElement(element, [], ''))

  return [...new Set(analyzed.map(v => v.group))].map(group => {
    const list = analyzed.filter(v => v.group === group)
    const { selector, prop } = list[0]!

    return {
      selector,
      prop,
      values: list.map(({ value, atRule }) => ({ value, atRule })),
    }
  })
}

interface Analyzed {
  atRule: string[]
  selector: string
  prop: string
  value: string
  group: string
}

const analyzeStylisElement = (element: Element, meta: string[], selector: string): Analyzed[] => {
  switch (element.type) {
    case DECLARATION: {
      // prop: value;
      const prop = element.props as string
      const value = element.children as string
      const group = `${selector || '&\f'}{${prop}`

      return [{ group, atRule: meta, selector: selector || '&\f', prop, value }]
    }
    case RULESET: {
      // selector { ... }
      const nextSelector = selector ? `${selector} ${element.value}` : element.value
      const children = element.children as Element[]

      return children.flatMap(child => analyzeStylisElement(child, meta, nextSelector))
    }
    case MEDIA:
    case SUPPORTS: {
      // @... { ... }
      const nextMeta = [...meta, element.value]
      const children = element.children as Element[]

      return children.flatMap(child => analyzeStylisElement(child, nextMeta, selector))
    }
    case COMMENT:
    default: {
      return []
    }
  }
}
