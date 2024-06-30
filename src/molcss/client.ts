import { shorthands } from '../generated/defineCssProperties'
import { insertStyle, generateRuntimeStyle } from '../utils/runtime-style'

const hasOwn = Object.prototype.hasOwnProperty

export interface RuntimeStyle {
  className: string
  runtime: [string, string | number | bigint][]
}

interface CssTagFunction {
  (template: TemplateStringsArray): string
  (template: TemplateStringsArray, ...substitutions: (string | number | bigint)[]): RuntimeStyle
}

const cssErrorMessage = `[molcss]: Using the "css" tag in runtime is not supported.

- Make sure you have set up the Babel plugin correctly.
- Check if other plugins convert Tagged templates before Molcss.`

export const css: CssTagFunction = () => {
  throw new Error(cssErrorMessage)
}

const getPropertyData = (str: string) => {
  const match = str.match(/^([A-Za-z]+)\d+([A-Za-z]*)$/)

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

type CssPropValue =
  | string
  | RuntimeStyle
  | undefined
  | null
  | false
  | 0

export type CssProp = CssPropValue | CssPropValue[]

interface InlinePropsWithCss {
  css: CssProp
  className?: string
  style?: object
}

type InlineProps<P extends InlinePropsWithCss> = Omit<P, keyof InlinePropsWithCss> & {
  className: string
  style: P['style'] & { [K in `--molcss-${string}`]?: string }
}

export const toInlineProps = <P extends InlinePropsWithCss>({ css, ...props }: P): InlineProps<P> => {
  const cssPropList = Array.isArray(css) ? css : [css]

  const className = mergeStyle(
    props.className,
    ...cssPropList.flatMap(style =>
      style && typeof style === 'object'
        ? [style.className, ...style.runtime.map(v => `${v[0]}00`)]
        : style
    )
  )

  const classList = new Set(className.split(' '))

  const style = { ...props.style } as P['style'] & { [K in `--molcss-${string}`]?: string }

  cssPropList.forEach(cssProp => {
    if (cssProp && typeof cssProp === 'object') {
      cssProp.runtime.forEach(item => {
        const propKey = item[0]
        const key = `--molcss-${propKey}` as const

        if (classList.has(`${propKey}00`)) {
          style[key] = item[1] + ''
        } else {
          delete style[key]
        }
      })
    }
  })

  return {
    ...props as Omit<P, keyof InlinePropsWithCss>,
    className,
    style,
  }
}

export const generateRuntime = (style: RuntimeStyle) =>
  style.runtime.reduce((acc, v) => acc + ' ' + generateRuntimeStyle(v[0], v[1], insertStyle), style.className)
