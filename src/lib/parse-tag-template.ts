import { parse } from './css-parser'
import { StyleContext, createRuntimeKey } from './style'

interface RuntimeStyleData<T> {
  prop: string
  expressions: (string | T)[]
}

export const parseTagTemplate = <T>(quasis: string[], expressions: T[], styleContext: StyleContext) => {
  let styleText = ''
  const expressionMap = new Map<string, T>()
  const lastIndex = quasis.length - 1

  for (const [i, v] of quasis.entries()) {
    styleText += v

    if (i !== lastIndex) {
      const key = `__MOLCSS_VALUE_${i}__`
      styleText += key
      expressionMap.set(key, expressions[i]!)
    }
  }

  const styles = parse(styleText)

  const runtimeStyles: RuntimeStyleData<T>[] = []

  for (const styleData of styles) {
    for (const [index, { value }] of styleData.values.entries()) {
      const list = value.split(/(__MOLCSS_VALUE_\d+__)/)

      if (list.length < 2) {
        continue
      }

      const classPropKey = createRuntimeKey(styleData, index, styleContext)

      styleData.values[index]!.value = `var(--molcss-${classPropKey})`

      runtimeStyles.push({
        prop: classPropKey,
        expressions: list.filter(Boolean).map(v =>
          expressionMap.has(v) ? expressionMap.get(v)! : v
        ),
      })
    }
  }

  return { styles, runtimeStyles }
}
