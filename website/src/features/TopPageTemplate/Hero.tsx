import { css } from 'molcss'
import Link from 'next/link'
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
        <h1 className={titleStyle}>Molcss</h1>
        <p className={descriptionStyle}>A simple, lightweight, and powerful CSS-in-JS library.</p>
      </div>
      <Button as={Link} className={getStartedButtonStyle} href="/docs">
        Get Started
      </Button>
    </div>
  )
}
