import { css } from 'molcss'
import logo from './logo.svg'
import './App.css'

const appStyle = css`
  text-align: center;
`

const headerStyle = css`
  background-color: #282c34;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: calc(10px + 2vmin);
  color: white;
`

const logoStyle = css`
  height: 40vmin;
  pointer-events: none;

  @media (prefers-reduced-motion: no-preference) {
    animation: App-logo-spin infinite 20s linear;
  }
`

const linkStyle = css`
  color: #61dafb;
`

function App() {
  return (
    <div className={appStyle}>
      <header className={headerStyle}>
        <img src={logo} className={logoStyle} alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className={linkStyle}
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  )
}

export default App
