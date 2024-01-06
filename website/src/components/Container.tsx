import { css, mergeStyle } from 'molcss'

const containerStyle = css`
  max-width: 1024px;
  padding: 8px 24px;
  margin: auto;
`

export default function Container(props: React.HTMLProps<HTMLElement>) {
  return (
    <main {...props} className={mergeStyle(containerStyle, props.className)} />
  )
}
