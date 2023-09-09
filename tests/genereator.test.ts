import { expect, it } from 'vitest'
import { generate } from '../src/lib/genereator'

it('extract', () => {
  const styles = generate('const a = css`color: red; padding: 1px;`')

  expect(styles).toStrictEqual([
    {
      'group': '{&\f{color',
      'media': '',
      'prop': 'color',
      'selector': '&\f',
      'value': [
        'red',
      ],
    },
    {
      'group': '{&\f{padding',
      'media': '',
      'prop': 'padding',
      'selector': '&\f',
      'value': [
        '1px',
      ],
    },
  ])
})

it('extract not css', () => {
  const styles = generate('const a = ` css`; const b = "`"')

  expect(styles).toStrictEqual([])
})
