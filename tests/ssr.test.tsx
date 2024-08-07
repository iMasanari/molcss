/** @jsxImportSource molcss/react */

import { css } from 'molcss'
import { ComponentProps } from 'react'
import { renderToString } from 'react-dom/server'
import { afterEach, expect, test, vi } from 'vitest'
import { toInlineProps } from '../src/molcss/client'
import { extractCritical } from '../src/molcss/server'
import { createExtractStyleCache } from '../src/react/react'
import { MolcssProvider } from '../src/react/react.use-client'

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

const consoleWarnMock = vi.spyOn(console, 'warn')

afterEach(() => {
  vi.restoreAllMocks()
})

test('SSR without MolcssProvider', () => {
  consoleWarnMock.mockImplementation(() => undefined)

  const actual = renderToString(<TestComponent />)

  expect(consoleWarnMock).toHaveBeenCalledTimes(1)

  expect(fomat(actual)).toMatchInlineSnapshot(`
    "<div class="__DEV-ssrTest-css__ bL0"></div>
    <div class="__DEV-ssrTest-css__ bL1 bM00" style="--molcss-bM:green"></div>
    <style data-molcss="bM2087430971">.bM2087430971{--molcss-bM:blue}</style>
    <div class="__DEV-ssrTest-css__ bL1 bM2087430971"></div>
    <div class="__DEV-ssrTest-css__ bL1 bM00" style="--molcss-bM:yellow"></div>"
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
    "<div class="__DEV-ssrTest-css__ bL0"></div>
    <div class="__DEV-ssrTest-css__ bL1 bM00" style="--molcss-bM:green"></div>
    <style data-molcss="bM2087430971">.bM2087430971{--molcss-bM:blue}</style>
    <div class="__DEV-ssrTest-css__ bL1 bM2087430971"></div>
    <div class="__DEV-ssrTest-css__ bL1 bM00" style="--molcss-bM:yellow"></div>
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
    "<div class="__DEV-ssrTest-css__ bL0"></div>
    <div class="__DEV-ssrTest-css__ bL1 bM00" style="--molcss-bM:green"></div>
    <div class="__DEV-ssrTest-css__ bL1 bM2087430971"></div>
    <div class="__DEV-ssrTest-css__ bL1 bM00" style="--molcss-bM:yellow"></div>"
  `)
  expect(actual.ids).toMatchInlineSnapshot(`
    [
      "bM2087430971",
    ]
  `)
  expect(actual.css).toMatchInlineSnapshot(`".bM2087430971{--molcss-bM:blue}"`)
})
