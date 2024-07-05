/** @jsxImportSource molcss/react-19 */

import 'molcss/style.css'

import { render, screen } from '@testing-library/react'
import { toInlineProps, css } from 'molcss'
import { ComponentProps } from 'react'
import { expect, test } from 'vitest'

test('use in react 19', () => {
  const molcssStyle = css`
    width: 100px;
  `

  render(<div className={molcssStyle} data-testid="target" />)

  const target = screen.getByTestId('target')

  expect(target).toHaveStyle({
    width: '100px',
  })
})

test('css prop', () => {
  const molcssStyle = (value: number) => css`
    padding: ${value}px;
  `

  render(<div css={molcssStyle(10)} data-testid="target" />)

  const target = screen.getByTestId('target')

  expect(target).toHaveStyle({
    padding: '10px',
  })
})

test('css prop with component', () => {
  const molcssStyle = (value: number) => css`
    margin: ${value}px;
  `

  const Component = ({ className }: any) =>
    <div className={className} data-testid="target" />

  render(<Component css={molcssStyle(8)} />)

  const target = screen.getByTestId('target')

  expect(target).toHaveStyle({
    margin: '8px',
  })
})

test('css prop with nest component', () => {
  const molcssStyle = (value: number) => css`
    margin: ${value}px;
  `

  const Component = ({ className }: any) =>
    <div className={className} data-testid="target" />

  render(
    <div css={molcssStyle(10)}>
      <Component css={molcssStyle(8)} />
    </div>
  )

  const target = screen.getByTestId('target')

  expect(target).toHaveStyle({
    margin: '8px',
  })
})

test('css prop with nest className', () => {
  const molcssStyle = (value: number) => css`
    margin: ${value}px;
  `

  render(<div css={[molcssStyle(10), molcssStyle(8)]} data-testid="target" />)

  const target = screen.getByTestId('target')

  expect(target).toHaveStyle({
    margin: '8px',
  })
})

test('use in react with toInlineProps', () => {
  const Test = (props: ComponentProps<'div'>) => <div {...props} />

  const molcssStyle = (value: number) => css`
    margin: ${value}px;
  `

  render(<Test {...toInlineProps({ css: molcssStyle(10) })} data-testid="target" />)

  const target = screen.getByTestId('target')

  expect(target).toHaveStyle({
    margin: '10px',
  })
})
