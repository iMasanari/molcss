import { expect, it } from 'vitest'
import { extract } from '../src/lib/extractor'

it('extract', () => {
  const styles = extract('const a = css`color: red; padding: 1px;`')

  expect(styles).toStrictEqual([
    'color: red; padding: 1px;',
  ])
})

it('extract2', () => {
  const styles = extract('const a = css`color: red;`; const b = css`color: green;`')

  expect(styles).toStrictEqual([
    'color: red;',
    'color: green;',
  ])
})

it('extract empty', () => {
  const styles = extract('const a = ` css`')

  expect(styles).toStrictEqual([])
})

it('extract empty cssText', () => {
  const styles = extract('const a = css``')

  expect(styles).toStrictEqual([
    '',
  ])
})

it('extract match text', () => {
  const styles = extract('const a = ` css`; const b = "`"')

  expect(styles).toStrictEqual([
    '; const b = "',
  ])
})

it('extract match text', () => {
  const styles = extract('const a = ` css`; css = css` font-family: css`; ``')

  expect(styles).toStrictEqual([
    '; css = css',
    ' font-family: css',
    '; ',
  ])
})

it('extract escaped', () => {
  const styles = extract('const a = css`&:after { content: "\\`"; }`')

  expect(styles).toStrictEqual([
    '&:after { content: "\\`"; }',
  ])
})

it('extract fake escape', () => {
  const styles = extract('const a = css`&:after { content: "\\n"; }`')

  expect(styles).toStrictEqual([
    '&:after { content: "\\n"; }',
  ])
})
