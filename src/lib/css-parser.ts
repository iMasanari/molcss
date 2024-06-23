import { AstEntity, AstRule, createParser } from 'css-selector-parser'
import { COMMENT, DECLARATION, Element, MEDIA, RULESET, SUPPORTS, compile } from 'stylis'

const NESTING_SELECTOR = '__MOLCSS_NESTING_SELECTOR__'

const selectorParser = createParser()

const hasNestedSelector = (v: AstEntity) => v.type === 'TagName' && v.name === NESTING_SELECTOR
const hasPseudoElement = (v: AstEntity) => v.type === 'PseudoElement'

const isSelfSelector = (selector: string) => {
  const ast = selectorParser(selector.replace(/&\f/g, NESTING_SELECTOR))

  // 複数セレクタの場合、暫定的にfalse（実装めんどい）
  if (ast.rules.length !== 1) {
    return false
  }

  const rules: AstRule[] = []
  let target = ast.rules[0]

  while (target) {
    rules.push(target)
    target = target.nestedRule
  }

  const lastRule = rules[rules.length - 1]!

  // 最後に & が含まれている場合、疑似要素がなければ自分自身
  if (lastRule.items.some(hasNestedSelector)) {
    return !lastRule.items.some(hasPseudoElement)
  }

  // 全てに & がない場合、自分自身
  return !rules.some(v => v.items.some(hasNestedSelector))
}

export interface StyleData {
  group: string
  prop: string
  values: { selector: string, value: string, atRule: string[] }[]
}

export const parse = (style: string): StyleData[] => {
  const ast = compile(style)
  const analyzed = ast.flatMap(element => analyzeStylisElement(element, [], ''))

  return [...new Set(analyzed.map(v => v.group))].map(group => {
    const list = analyzed.filter(v => v.group === group)
    const { prop } = list[0]!

    return {
      group,
      prop,
      values: list.map(({ selector, value, atRule }) => ({ selector, value, atRule })),
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
      selector = selector || '&\f'

      const group = `${isSelfSelector(selector) ? '' : selector}{${prop}`

      return [{ group, atRule: meta, selector, prop, value }]
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
