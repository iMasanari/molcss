import { css } from 'molcss'
import shiki, { Highlighter } from 'shiki'

const tokenColorMap = new Map([
  ['color: #C586C0', css`color: #C586C0;`],
  ['color: #D4D4D4', css`color: #D4D4D4;`],
  ['color: #CE9178', css`color: #CE9178;`],
  ['color: #6A9955', css`color: #6A9955;`],
  ['color: #9CDCFE', css`color: #9CDCFE;`],
  ['color: #569CD6', css`color: #569CD6;`],
  ['color: #4FC1FF', css`color: #4FC1FF;`],
  ['color: #DCDCAA', css`color: #DCDCAA;`],
  ['color: #B5CEA8', css`color: #B5CEA8;`],
  ['color: #808080', css`color: #808080;`],
  ['color: #D7BA7D', css`color: #D7BA7D;`],
  ['color: #4EC9B0', css`color: #4EC9B0;`],
])

const warned = new Set<string>()

const toClassName = (style: string) => {
  const classNames = style.split(';').map(v => {
    const className = tokenColorMap.get(v)

    if (!className && !warned.has(v)) {
      console.warn(`not match className: ${v}`)
      warned.add(v)
    }

    return className
  })

  return classNames.join(' ')
}

let _highlighterPromise: Promise<Highlighter> | undefined

const getHighlighter = () =>
  _highlighterPromise ??= shiki.getHighlighter({ theme: 'dark-plus' })

const getHighlightTokens = async (code: string, lang: string) => {
  const highlighter = await getHighlighter()

  return highlighter.codeToThemedTokens(code, lang)
}

const getCssInJsHighlightTokens = async (code: string) => {
  const jsTokens = await getHighlightTokens(code, 'javascript')

  const cssTokensList = await Promise.all(
    Array.from(code.matchAll(/css`\n([^`]+)\s*\n`/g), async v => {
      const wrappedCss = `:root{\n${v[1]}\n}`
      const wrappedTokens = await getHighlightTokens(wrappedCss, 'css')

      return {
        tokens: wrappedTokens.slice(1, -1),
        startLine: code.slice(0, v.index).split('\n').length,
      }
    })
  )

  const cssTokensMap = new Map(
    cssTokensList.flatMap(v =>
      v.tokens.map((tokens, i) => [i + v.startLine, tokens] as const)
    )
  )

  return jsTokens.map((v, i) => cssTokensMap.get(i) ?? v)
}

const highlight = async (code: string, lang: string) => {
  const tokens = lang === 'molcss'
    ? await getCssInJsHighlightTokens(code)
    : await getHighlightTokens(code, lang)

  return shiki.renderToHtml(tokens, {
    elements: {
      pre: (props) => props.children,
      code: (props) => props.children,
      line: (props) => `<span>${props.children}</span>`,
      token: (props) => `<span class="${toClassName(props.style)}">${props.children}</span>`,
    },
  })
}

const codeStyle = css`
  font-family: ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace;
`

interface Props {
  code: string
  lang: string
}

export default async function Code({ code: value, lang }: Props) {
  const html = await highlight(value, lang)

  return (
    <code
      className={`${codeStyle} notranslate`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
