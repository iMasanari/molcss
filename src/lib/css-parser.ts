import { COMMENT, compile, DECLARATION, Element, MEDIA, RULESET } from 'stylis'

export interface StyleData {
  media: string
  selector: string
  prop: string
  values: string[]
}

export const parse = (style: string): StyleData[] => {
  const ast = compile(style)
  const analyzed = ast.flatMap(element => analyzeStylisElement(element, '', ''))

  return [...new Set(analyzed.map(v => v.group))].map(group => {
    const list = analyzed.filter(v => v.group === group)
    const { media, selector, prop } = list[0]!

    return {
      media,
      selector,
      prop,
      values: list.map(v => v.value),
    }
  })
}

interface Analyzed {
  media: string
  selector: string
  prop: string
  value: string
  group: string
}

const analyzeStylisElement = (element: Element, media: string, selector: string): Analyzed[] => {
  switch (element.type) {
    case DECLARATION: {
      // prop: value;
      const prop = element.props as string
      const value = element.children as string
      const group = `${media}{${selector || '&\f'}{${prop}`

      return [{ group, media, selector: selector || '&\f', prop, value }]
    }
    case COMMENT: {
      return []
    }
    case RULESET: {
      // selector { ... }
      const nextSelector = selector ? `${selector} ${element.value}` : element.value
      const children = element.children as Element[]

      return children.flatMap(child => analyzeStylisElement(child, media, nextSelector))
    }
    case MEDIA: {
      const nextMedia = element.value
      const children = element.children as Element[]

      return children.flatMap(child => analyzeStylisElement(child, nextMedia, selector))
    }
    default: {
      return []
    }
  }
}
