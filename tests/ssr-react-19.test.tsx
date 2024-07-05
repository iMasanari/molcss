/** @jsxImportSource molcss/react-19 */

import { css } from 'molcss'
import { ComponentProps } from 'react'
import { renderToString } from 'react-dom/server'
import { afterEach, expect, test, vi } from 'vitest'
import { toInlineProps } from '../src/molcss/client'

const fomat = (html: string) =>
  html.replace(/><(?!\/)/g, '>\n<')

const Component = (props: ComponentProps<'div'>) => <div {...props} />

const TestComponent = () =>
  <>
    <div css={css`--ssr-test-color: red;`} />
    <div css={css`--ssr-test-color: ${'green'};`} />
    <Component css={css`--ssr-test-color: ${'blue'};`} />
    <Component {...toInlineProps({ css: css`--ssr-test-color: ${'yellow'};` })} />
  </>

afterEach(() => {
  vi.restoreAllMocks()
})

test('SSR in React 19', () => {
  const actual = renderToString(<TestComponent />)

  expect(fomat(actual)).toMatchInlineSnapshot(`
    "<style data-precedence="molcss" data-href="bM2087430971">.bM2087430971{--molcss-bM:blue}</style>
    <div class="__DEV-ssrReact19Test-css__ bL0"></div>
    <div class="__DEV-ssrReact19Test-css__ bL1 bM00" style="--molcss-bM:green"></div>
    <div class="__DEV-ssrReact19Test-css__ bL1 bM2087430971"></div>
    <div class="__DEV-ssrReact19Test-css__ bL1 bM00" style="--molcss-bM:yellow"></div>"
  `)
})
