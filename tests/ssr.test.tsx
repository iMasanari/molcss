/** @jsxImportSource molcss/react */

import { css } from 'molcss'
import { renderToString } from 'react-dom/server'
import { expect, test } from 'vitest'
import { SSRProvider } from '../src/nextjs.use-client'
import { createCache } from '../src/react'
import { extractCritical } from '../src/server'

const fomat = (html: string) =>
  html.replace(/><(?!\/)/g, '>\n<')

const Component = (props: any) => <div {...props} />

const TestComponent = () =>
  <>
    <div css={css`--ssr-test-color: red;`} />
    <div css={css`--ssr-test-color: ${'green'};`} />
    <Component css={css`--ssr-test-color: ${'blue'};`} />
  </>

test('SSR without SSRProvider', () => {
  const actual = renderToString(<TestComponent />)

  expect(fomat(actual)).toMatchInlineSnapshot(`
    "<div class="DEV-ssrTest-css bL0"></div>
    <div class="DEV-ssrTest-css bL1 bM00" style="--molcss-bM:green"></div>
    <style data-molcss="bM2401959520">.bM2401959520{--molcss-bM:blue}</style>
    <div class="DEV-ssrTest-css bL1 bM2401959520"></div>"
  `)
})

test('SSR with SSRProvider', () => {
  const actual = renderToString(
    <SSRProvider>
      <TestComponent />
    </SSRProvider>
  )

  expect(fomat(actual)).toMatchInlineSnapshot(`
    "<div class="DEV-ssrTest-css bL0"></div>
    <div class="DEV-ssrTest-css bL1 bM00" style="--molcss-bM:green"></div>
    <style data-molcss="bM2401959520">.bM2401959520{--molcss-bM:blue}</style>
    <div class="DEV-ssrTest-css bL1 bM2401959520"></div>
    <script>(function(c){c&&(c.parentNode.querySelectorAll('style[data-molcss]').forEach(function(v){document.head.appendChild(v)}),c.parentNode.removeChild(c))})(document.currentScript)</script>"
  `)
})

test('SSR with SSRProvider extract', () => {
  const cache = createCache()

  const element = (
    <SSRProvider extractCache={cache}>
      <TestComponent />
    </SSRProvider>
  )

  const actual = extractCritical(renderToString(element), cache)

  expect(fomat(actual.html)).toMatchInlineSnapshot(`
    "<div class="DEV-ssrTest-css bL0"></div>
    <div class="DEV-ssrTest-css bL1 bM00" style="--molcss-bM:green"></div>
    <div class="DEV-ssrTest-css bL1 bM2401959520"></div>"
  `)
  expect(actual.ids).toMatchInlineSnapshot(`
    [
      "bM2401959520",
    ]
  `)
  expect(actual.css).toMatchInlineSnapshot(`".bM2401959520{--molcss-bM:blue}"`)
})
