import { css } from 'molcss'
import Button from '@/components/Button'

const heroStyle = css`
  margin: 32px 0;
  text-align: center;
`

const titleWrapperStyle = css`
  margin: 32px 0;
`

const titleStyle = css`
  margin: 16px 0;
  font-size: 3em;
`

const descriptionStyle = css`
  margin: 16px 0;
  font-size: 1.5em;
`

const getStartedButtonStyle = css`
  padding: 12px 16px;
`

export default function Hero() {
  return (
    <div className={heroStyle}>
      <div className={titleWrapperStyle}>
        <h1 className={titleStyle}>molcss</h1>
        <p className={descriptionStyle}>A simple, lightweight, and powerful CSS-in-JS library.</p>
      </div>
      <Button as="a" className={getStartedButtonStyle} href="https://github.com/iMasanari/molcss#readme" target="_blank" rel="noopener">
        Get Started
      </Button>
    </div>
  )
}
