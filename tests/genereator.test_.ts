import { expect, it } from 'vitest'
import { generate } from '../src/lib/genereator'

it('extract', () => {
  const styles = generate('const a = css`color: red; padding: 1px;`')

  // TODO
  expect(styles).toStrictEqual([
  ])
})

it('extract not css', () => {
  const styles = generate('const a = ` css`; const b = "`"')

  expect(styles).toStrictEqual([
  ])
})
