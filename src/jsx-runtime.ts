import * as ReactJsxRuntime from 'react/jsx-runtime'
import { Molcss } from './lib/react'
import { correctSSRStyle } from './lib/runtime'

export type { MolcssJSX as JSX } from './lib/jsx-namespace'

const { jsx: reactJsx, jsxs: reactJsxs, Fragment } = ReactJsxRuntime as any

const hasOwn = Object.prototype.hasOwnProperty

let moved = false

export { Fragment }

export const jsx = (type: any, props: any, key: any) => {
  if (!moved) {
    correctSSRStyle()

    moved = true
  }

  if (!hasOwn.call(props, 'css')) {
    return reactJsx(type, props, key)
  }

  return reactJsx(Molcss, { type, props, children: props.children }, key)
}

export const jsxs = (type: any, props: any, key: any) => {
  if (!moved) {
    typeof document !== 'undefined' && document.querySelectorAll('body [data-molcss]').forEach(v => {
      document.head.appendChild(v)
    })

    moved = true
  }

  if (!hasOwn.call(props, 'css')) {
    return reactJsxs(type, props, key)
  }

  return reactJsxs(Molcss, { type, props, children: props.children }, key)
}
