import { shorthands } from './generated/defineCssProperties'

const hasOwn = Object.prototype.hasOwnProperty

export const css: (template: TemplateStringsArray) => string = () => {
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
