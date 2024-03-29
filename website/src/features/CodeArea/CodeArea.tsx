import { css, mergeStyle } from 'molcss'
import CodeHighlight from './CodeHighlight'

const codeAreaStyle = css`
  display: flex;
  flex-direction: column;
`

const titleStyle = css`
  padding: 0 16px;
  margin: 8px 0;
`

const preStyle = css`
  overflow-x: auto;
  flex: 1;
  padding: 0 16px 16px;
  margin: 0;
`

interface Props {
  className?: string
  title: string
  code: string
  lang: string
}

export default function CodeArea({ className, title, code, lang }: Props) {
  return (
    <div className={mergeStyle(codeAreaStyle, className)}>
      <div className={titleStyle}>{title}</div>
      <pre className={preStyle}>
        <CodeHighlight code={code} lang={lang} />
      </pre>
    </div>
  )
}
