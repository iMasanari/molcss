import { css } from 'molcss'
import Features from './Features'
import Hero from './Hero'
import Container from '@/components/Container'

const h2Style = css`
  border-bottom: 1px solid #fff;
`

export default async function TopPageTemplate() {
  return (
    <Container>
      <section>
        <Hero />
      </section>
      <section>
        <h2 className={h2Style}>Features</h2>
        <Features />
      </section>
    </Container>
  )
}
