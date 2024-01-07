/** @jsxImportSource molcss/react */

import 'molcss/style.css'

import { render, screen } from '@testing-library/react'
import { css } from 'molcss'
import { expect, test } from 'vitest'

// NOTE: postcss化の際にテスト不可に
test.todo('use in react', () => {
  const molcssStyle = css`
    width: 100px;
  `

  render(<div className={molcssStyle} data-testid="target" />)

  const target = screen.getByTestId('target')

  expect(target).toHaveStyle({
    width: '100px',
  })
})

// NOTE: postcss化の際にテスト不可に
test.todo('css prop', () => {
  const molcssStyle = (value: number) => css`
    padding: ${value}px;
  `

  render(<div css={molcssStyle(10)} data-testid="target" />)

  const target = screen.getByTestId('target')

  expect(target).toHaveStyle({
    padding: '10px',
  })
})

// NOTE: postcss化の際にテスト不可に
test.todo('css prop with component', () => {
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

// NOTE: postcss化の際にテスト不可に
test.todo('css prop with nest component', () => {
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

// NOTE: postcss化の際にテスト不可に
test.todo('css prop with nest className', () => {
  const molcssStyle = (value: number) => css`
    margin: ${value}px;
  `

  render(<div css={[molcssStyle(10), molcssStyle(8)]} data-testid="target" />)

  const target = screen.getByTestId('target')

  expect(target).toHaveStyle({
    margin: '8px',
  })
})
