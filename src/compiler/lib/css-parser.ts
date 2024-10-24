import { AstEntity, AstRule, createParser } from 'css-selector-parser'
import { COMMENT, DECLARATION, Element, MEDIA, RULESET, SUPPORTS, compile } from 'stylis'

export const DUMMY_NESTING_SELECTOR_CLASS_NAME = '__MOLCSS_DUMMY_NESTING_SELECTOR_CLASS_NAME__'
export const DUMMY_NESTING_SELECTOR_CLASS_NAME_REG = new RegExp(DUMMY_NESTING_SELECTOR_CLASS_NAME, 'g')

const selectorParser = createParser()

const hasNestedSelector = (v: AstEntity) => v.type === 'ClassName' && v.name === DUMMY_NESTING_SELECTOR_CLASS_NAME
const hasPseudoElement = (v: AstEntity) => v.type === 'PseudoElement'

const isSelfSelector = (selector: string) => {
  const ast = selectorParser(selector)

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
  const ast = compile(`.${DUMMY_NESTING_SELECTOR_CLASS_NAME}{${style}}`)
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
      selector = selector || DUMMY_NESTING_SELECTOR_CLASS_NAME

      const group = isSelfSelector(selector) ? prop : `${selector}{${prop}`

      return [{ group, atRule: meta, selector, prop, value }]
    }
    case RULESET: {
      // selector { ... }
      const children = element.children as Element[]

      return (element.props as string[]).flatMap(value => {
        const nextSelector = selector ? `${selector} ${value}` : value

        return children.flatMap(child => analyzeStylisElement(child, meta, nextSelector))
      })
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
