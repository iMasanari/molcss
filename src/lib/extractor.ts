export const extract = (source: string) => {
  const tokens = source.trim().split(/(css|`|\\)/).filter(Boolean)

  return tokens.flatMap((v, i) => {
    if (v !== '`' || tokens[i - 1] !== 'css') {
      return []
    }

    const cssText = getCssText(tokens.slice(i + 1))

    return cssText != null ? [cssText] : []
  })
}

const getCssText = (tokens: string[]) => {
  let result = ''
  let isEscape = false

  for (const token of tokens) {
    // escaped token
    if (isEscape) {
      result += token
      isEscape = false

      continue
    }

    if (token !== '`') {
      result += token
      isEscape = token === '\\'

      continue
    }

    return result
  }

  return null
}
