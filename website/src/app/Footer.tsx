import { css } from 'molcss'

const footerStyle = css`
  padding: 48px 16px;
  text-align: center;
`

const linkStyle = css`
  color: white;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`

export default function Footer() {
  return (
    <footer className={footerStyle}>
      {'MIT 2024 © '}
      <a className={linkStyle} href="https://github.com/iMasanari/molcss#readme" target="_blank" rel="noopener">
        iMasanari
      </a>
    </footer>
  )
}
