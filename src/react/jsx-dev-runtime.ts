import * as ReactJsxDevRuntime from 'react/jsx-dev-runtime'
import { Molcss, createInlineStyleProps } from './lib/react-jsx'

export type { MolcssJSX as JSX } from './lib/jsx-namespace'

const { jsxDEV: reactJsxDEV, Fragment } = ReactJsxDevRuntime as any

const hasOwn = Object.prototype.hasOwnProperty

export { Fragment }

export const jsxDEV = (
  type: any,
  props: any,
  key: any,
  isStaticChildren: any,
  source: any,
  self: any
) => {
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

  if (typeof type === 'string') {
    return reactJsxDEV(
      type,
      createInlineStyleProps(props),
      key,
      isStaticChildren,
      source,
      self,
    )
  }

  return reactJsxDEV(
    Molcss,
    { ...props, css: [type, props.css] },
    key,
    isStaticChildren,
    source,
    self,
  )
}
