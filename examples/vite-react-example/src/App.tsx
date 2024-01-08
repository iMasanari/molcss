import { css } from 'molcss'
import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className={logoStyle} alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className={`${logoStyle} react`} alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className={cardStyle}>
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className={readTheDocsStyle}>
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

const logoStyle = css`
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;

  &:hover {
    filter: drop-shadow(0 0 2em #646cffaa);
  }

  &.react:hover {
    filter: drop-shadow(0 0 2em #61dafbaa);
  }

  @media (prefers-reduced-motion: no-preference) {
    a:nth-of-type(2) & {
      animation: logo-spin infinite 20s linear;
    }
  }
`

const cardStyle = css`
  padding: 2em;
`

const readTheDocsStyle = css`
  color: #888;
`

export default App
