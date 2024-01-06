/** @jsxImportSource molcss/react */
import { css } from 'molcss'
import { renderToString as render } from 'react-dom/server'

const staticStyle = css`
  color: blue;
`

const dynamicStyle = (value) => css`
  color: ${value};
`

const Component = ({ className }) =>
  <div className={className}>For components, insert style tags.</div>

const html = render(
  <div className={staticStyle}>
    <div css={dynamicStyle('red')}>Will be red.</div>
    <Component css={dynamicStyle('green')} />
  </div>
)

console.log(html)
