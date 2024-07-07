import * as ReactJsxRuntime from 'react/jsx-runtime'
import { toInlineProps } from '../molcss/client'
import { Molcss } from './lib/react-19-jsx'

export type { MolcssJSX as JSX } from '../react/lib/jsx-namespace'

const { jsx: reactJsx, jsxs: reactJsxs, Fragment } = ReactJsxRuntime as any

const hasOwn = Object.prototype.hasOwnProperty

export { Fragment }

export const jsx = (type: any, props: any, key: any) => {
  if (!hasOwn.call(props, 'css')) {
    return reactJsx(type, props, key)
  }

  if (typeof type === 'string') {
    return reactJsx(type, toInlineProps(props), key)
  }

  return reactJsx(Molcss, { ...props, css: [type, props.css] }, key)
}

export const jsxs = (type: any, props: any, key: any) => {
  if (!hasOwn.call(props, 'css')) {
    return reactJsxs(type, props, key)
  }

  if (typeof type === 'string') {
    return reactJsxs(type, toInlineProps(props), key)
  }

  return reactJsxs(Molcss, { ...props, css: [type, props.css] }, key)
}
