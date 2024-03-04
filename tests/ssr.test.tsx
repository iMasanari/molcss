/** @jsxImportSource molcss/react */

import { css } from 'molcss'
import { renderToString } from 'react-dom/server'
import { afterEach, expect, test, vi } from 'vitest'
import { MolcssProvider } from '../src/nextjs.use-client'
import { createExtractStyleCache } from '../src/react'
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

const consoleWarnMock = vi.spyOn(console, 'warn')

afterEach(() => {
  vi.restoreAllMocks()
})

test('SSR without MolcssProvider', () => {
  consoleWarnMock.mockImplementation(() => undefined)

  const actual = renderToString(<TestComponent />)

  expect(consoleWarnMock).toHaveBeenCalledTimes(1)

  expect(fomat(actual)).toMatchInlineSnapshot(`
    "<div class="DEV-ssrTest-css bL0"></div>
    <div class="DEV-ssrTest-css bL1 bM00" style="--molcss-bM:green"></div>
    <style data-molcss="bM2087430971">.bM2087430971{--molcss-bM:blue}</style>
    <div class="DEV-ssrTest-css bL1 bM2087430971"></div>"
  `)
})

test('SSR with MolcssProvider', () => {
  const actual = renderToString(
    <MolcssProvider>
      <TestComponent />
    </MolcssProvider>
  )

  expect(consoleWarnMock).toHaveBeenCalledTimes(0)

  expect(fomat(actual)).toMatchInlineSnapshot(`
    "<div class="DEV-ssrTest-css bL0"></div>
    <div class="DEV-ssrTest-css bL1 bM00" style="--molcss-bM:green"></div>
    <style data-molcss="bM2087430971">.bM2087430971{--molcss-bM:blue}</style>
    <div class="DEV-ssrTest-css bL1 bM2087430971"></div>
    <script>(function(c){c&&(c.parentNode.querySelectorAll('style[data-molcss]').forEach(function(v){document.head.appendChild(v)}),c.parentNode.removeChild(c))})(document.currentScript)</script>"
  `)
})

test('SSR with MolcssProvider extract', () => {
  const cache = createExtractStyleCache()

  const element = (
    <MolcssProvider extractStyleCache={cache}>
      <TestComponent />
    </MolcssProvider>
  )

  const actual = extractCritical(renderToString(element), cache)

  expect(consoleWarnMock).toHaveBeenCalledTimes(0)

  expect(fomat(actual.html)).toMatchInlineSnapshot(`
    "<div class="DEV-ssrTest-css bL0"></div>
    <div class="DEV-ssrTest-css bL1 bM00" style="--molcss-bM:green"></div>
    <div class="DEV-ssrTest-css bL1 bM2087430971"></div>"
  `)
  expect(actual.ids).toMatchInlineSnapshot(`
    [
      "bM2087430971",
    ]
  `)
  expect(actual.css).toMatchInlineSnapshot(`".bM2087430971{--molcss-bM:blue}"`)
})
