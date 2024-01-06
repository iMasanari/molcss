import { css } from 'molcss'
import Button from '@/components/Button'
import Container from '@/components/Container'

const docsStyle = css`
  text-align: center;
`

export default function DocsPageTemplate() {
  return (
    <Container className={docsStyle}>
      <h1>Documents</h1>
      <Button as="a" href="https://github.com/iMasanari/molcss#readme" target="_blank" rel="noopener">
        See GitHub
      </Button>
    </Container >
  )
}
