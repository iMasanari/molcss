const separator = ':::MOLCSS_SEPARATOR:::'

const contextTokens = [
  // tag
  '${', '}',
  // escape
  '\\',
  // literal
  `'`,
  `"`,
  '`',
  // comment
  '/*', '*/',
  '//', '\n',
] as const

type DefineToken = typeof contextTokens[number]

const escapeRegExp = (string: string) =>
  string.replace(/[.*+\-?^${}()|[\]\\]/g, '\\$&')

const createTokenRegExp = (tag: string) =>
  new RegExp(`(${[tag, ...contextTokens].map(v => escapeRegExp(v)).join('|')})`)

interface RootMode {
  type: 'Root'
}

interface ContentMode {
  type: 'Content'
  parent: RootMode
}
interface CodeMode {
  type: 'Code'
  parent: ContentMode | TemplateLiteralMode
}
interface StringLiteralMode {
  type: 'StringLiteral'
  parent: CodeMode | RootMode
  endToken: DefineToken
}
interface TemplateLiteralMode {
  type: 'TemplateLiteral'
  parent: CodeMode
}
interface CommentMode {
  type: 'Comment'
  parent: CodeMode | RootMode
  endToken: DefineToken
}
interface EscapeMode {
  type: 'Escape'
  parent: Mode
  display: boolean
}

type Mode =
  | ContentMode
  | CodeMode
  | StringLiteralMode
  | TemplateLiteralMode
  | CommentMode
  | RootMode
  | EscapeMode

const createContentMode = (parent: RootMode): ContentMode =>
  ({ type: 'Content', parent })

const createCodeMode = (parent: ContentMode | TemplateLiteralMode): CodeMode =>
  ({ type: 'Code', parent })

const createEscapeMode = (parent: Mode, display: boolean): EscapeMode =>
  ({ type: 'Escape', parent, display })

const createStringLiteralMode = (parent: CodeMode | RootMode, endToken: DefineToken): StringLiteralMode =>
  ({ type: 'StringLiteral', parent, endToken })

const createCommentMode = (parent: CodeMode | RootMode, endToken: DefineToken): CommentMode =>
  ({ type: 'Comment', parent, endToken })

const createTemplateLiteralMode = (parent: CodeMode): TemplateLiteralMode =>
  ({ type: 'TemplateLiteral', parent })

const contentReducer = (state: ContentMode, currentToken: string, restTokens: string[]): string | null => {
  switch (currentToken as DefineToken) {
    case '`': {
      return ''
    }
    case '\\': {
      return reducer(createEscapeMode(state, true), restTokens)
    }
    case '${': {
      const result = reducer(createCodeMode(state), restTokens)

      return result != null ? `\${${separator}}` + result : result
    }
    default: {
      const result = reducer(state, restTokens)

      return result != null ? currentToken + result : result
    }
  }
}

const templateLiteralReducer = (state: TemplateLiteralMode, currentToken: string, restTokens: string[]): string | null => {
  switch (currentToken as DefineToken) {
    case '`': {
      return reducer(state.parent, restTokens)
    }
    case '\\': {
      return reducer(createEscapeMode(state, false), restTokens)
    }
    case '${': {
      return reducer(createCodeMode(state), restTokens)
    }
    default: {
      return reducer(state, restTokens)
    }
  }
}

const codeReducer = (state: CodeMode, currentToken: string, restTokens: string[]): string | null => {
  switch (currentToken as DefineToken) {
    case '}': {
      return reducer(state.parent, restTokens)
    }
    case '\\': {
      return reducer(createEscapeMode(state, false), restTokens)
    }
    case '//': {
      return reducer(createCommentMode(state, '\n'), restTokens)
    }
    case '/*': {
      return reducer(createCommentMode(state, '*/'), restTokens)
    }
    case `'`: {
      return reducer(createStringLiteralMode(state, `'`), restTokens)
    }
    case `"`: {
      return reducer(createStringLiteralMode(state, `"`), restTokens)
    }
    case '`': {
      return reducer(createTemplateLiteralMode(state), restTokens)
    }
    default: {
      return reducer(state, restTokens)
    }
  }
}

const stringLiteralReducer = (state: StringLiteralMode, currentToken: string, restTokens: string[]): string | null => {
  switch (currentToken as DefineToken) {
    case state.endToken: {
      return reducer(state.parent, restTokens)
    }
    case '\\': {
      return reducer(createEscapeMode(state, false), restTokens)
    }
    default: {
      return reducer(state, restTokens)
    }
  }
}

const commentReducer = (state: CommentMode, currentToken: string, restTokens: string[]): string | null => {
  switch (currentToken as DefineToken) {
    case state.endToken: {
      return reducer(state.parent, restTokens)
    }
    default: {
      return reducer(state, restTokens)
    }
  }
}

const rootReducer = (state: RootMode, currentToken: string, restTokens: string[]): string | null => {
  switch (currentToken as DefineToken) {
    case '//': {
      return reducer(createStringLiteralMode(state, '\n'), restTokens)
    }
    case '/*': {
      return reducer(createStringLiteralMode(state, '*/'), restTokens)
    }
    case '`': {
      return reducer(createContentMode(state), restTokens)
    }
    default: {
      if (/^\s+$/.test(currentToken)) {
        return reducer(state, restTokens)
      }

      return null
    }
  }
}

const escapeReducer = (state: EscapeMode, currentToken: string, restTokens: string[]): string | null => {
  const result = reducer(state.parent, restTokens)

  return state.display ? currentToken + result : result
}

const reducer = (state: Mode, tokens: string[]): string | null => {
  const [currentToken, ...restTokens] = tokens

  if (currentToken == null) {
    return null
  }

  switch (state.type) {
    case 'Root': {
      return rootReducer(state, currentToken, restTokens)
    }
    case 'Content': {
      return contentReducer(state, currentToken, restTokens)
    }
    case 'Code': {
      return codeReducer(state, currentToken, restTokens)
    }
    case 'TemplateLiteral': {
      return templateLiteralReducer(state, currentToken, restTokens)
    }
    case 'StringLiteral': {
      return stringLiteralReducer(state, currentToken, restTokens)
    }
    case 'Comment': {
      return commentReducer(state, currentToken, restTokens)
    }
    case 'Escape': {
      return escapeReducer(state, currentToken, restTokens)
    }
  }
}

export const extract = (source: string, tag: string) => {
  const tokens = source.split(createTokenRegExp(tag)).filter(Boolean)

  const contetns = tokens.flatMap((v, i) => {
    if (v !== tag) {
      return []
    }

    const text = reducer({ type: 'Root' }, tokens.slice(i + 1))

    if (!text) {
      return []
    }

    return { quasis: text.split(`\${${separator}}`) }
  })

  return contetns
}
