import * as ReactJsxDevRuntime from 'react/jsx-dev-runtime'
import { Molcss } from './lib/react'
import { correctSSRStyle } from './lib/runtime'

export type { MolcssJSX as JSX } from './lib/jsx-namespace'

const { jsxDEV: reactJsxDEV, Fragment } = ReactJsxDevRuntime as any

const hasOwn = Object.prototype.hasOwnProperty

export { Fragment }

let moved = false

export const jsxDEV = (
  type: any,
  props: any,
  key: any,
  isStaticChildren: any,
  source: any,
  self: any
) => {
  if (!moved) {
    correctSSRStyle()

    moved = true
  }

  if (!hasOwn.call(props, 'css')) {
    return reactJsxDEV(
      type,
      props,
      key,
      isStaticChildren,
      source,
      self,
    )
  }

  return reactJsxDEV(
    Molcss,
    { type, props, children: props.children },
    key,
    isStaticChildren,
    source,
    self,
  )
}
