import { css, mergeStyle } from 'molcss'
import { ReactNode } from 'react'

const codeAreaStyle = css`
  display: flex;
  flex-direction: column;
`

const titleStyle = css`
  padding: 0 16px;
  margin: 8px 0;
`

interface Props {
  className?: string
  title: string
  children: ReactNode
}

export default function CodeArea({ className, title, children }: Props) {
  return (
    <div className={mergeStyle(codeAreaStyle, className)}>
      <div className={titleStyle}>{title}</div>
      {children}
    </div>
  )
}
