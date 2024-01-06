import { css } from 'molcss'
import CodeHighlight from './CodeHighlight'

const titleStyle = css`
  padding: 0 16px;
  margin: 8px 0;
`

const preStyle = css`
  overflow-x: auto;
  padding: 0 16px 16px;
  margin: 0;
`

interface Props {
  title: string
  code: string
  lang: string
}

export default function CodeArea({ title, code, lang }: Props) {
  return (
    <div>
      <div className={titleStyle}>{title}</div>
      <pre className={preStyle}>
        <CodeHighlight code={code} lang={lang} />
      </pre>
    </div>
  )
}
