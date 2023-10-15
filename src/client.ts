import { shorthands } from './generated/defineCssProperties'
import { insertStyle, generateRuntimeStyle } from './lib/runtime'

const hasOwn = Object.prototype.hasOwnProperty

export interface RuntimeStyle {
  className: string
  runtime: [string, string][]
}

interface CssTagFunction {
  (template: TemplateStringsArray): string
  (template: TemplateStringsArray, ...substitutions: string[]): RuntimeStyle
}

export const css: CssTagFunction = () => {
  throw new Error('Using the "css" tag in runtime is not supported. Make sure you have set up the Babel plugin correctly.')
}

const getPropertyData = (str: string) => {
  const match = str.match(/^(.+)\d+(.*)$/)

  if (!match) {
    return null
  }

  return {
    key: `${match[1]}/${match[2]}`,
    shorthands: hasOwn.call(shorthands, match[1]!)
      ? shorthands[match[1]!]!.map(v => `${v}/${match[2]}`)
      : null,
  }
}

export const mergeStyle = (...classNames: (string | false | null | undefined)[]) => {
  const styles = {} as Record<string | symbol, string>

  classNames.flatMap(className => className ? className.split(/[\t\r\f\n ]+/) : []).forEach((className, i) => {
    const propertyData = getPropertyData(className)

    styles[propertyData ? propertyData.key : `$$${i}`] = className

    if (propertyData && propertyData.shorthands) {
      propertyData.shorthands.forEach(v => {
        delete styles[v]
      })
    }
  })

  return Object.values(styles).join(' ')
}

export const generateRuntime = (style: RuntimeStyle) =>
  style.runtime.reduce((acc, v) => acc + ' ' + generateRuntimeStyle(v[0], v[1], insertStyle), style.className)
