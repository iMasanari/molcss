import { css } from 'molcss'
import Link from 'next/link'

const headerStyle = css`
  position: sticky;
  top: 0;
  z-index: 1;
  padding: 0 24px;
  background-color: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(4px);
`

const headerInnerStyle = css`
  display: flex;
  max-width: 1024px;
  padding: 8px 0;
  margin: auto;
`

const titleStyle = css`
  margin-right: auto;
  font-size: 1.6em;
  color: white;
  text-decoration: none;
`

const navStyle = css`
  display: flex;
`

const navListStyle = css`
  display: flex;
  gap: 16px;
  align-items: center;
  list-style: none;
  padding: 0;
  margin: 0;
`

const navItemStyle = css`
  padding: 0;
  margin: 0;
`

const navLinkStyle = css`
  color: white;
  text-decoration: none;
  opacity: 0.7;
  transition: opacity 0.2s ease-in-out;

  &:hover {
    opacity: 1;
  }
`

export default function Header() {
  return (
    <header className={headerStyle}>
      <div className={headerInnerStyle}>
        <Link href="/" className={titleStyle}>
          molcss
        </Link>
        <nav className={navStyle}>
          <ul className={navListStyle}>
            {/* <li className={navItemStyle}>
              <Link className={navLinkStyle} href="/docs">
                Docs
              </Link>
            </li> */}
            <li className={navItemStyle}>
              <a className={navLinkStyle} href="https://github.com/iMasanari/molcss" target="_blank" rel="noopener">
                GitHub
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  )
}
