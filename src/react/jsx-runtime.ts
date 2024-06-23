import * as ReactJsxRuntime from 'react/jsx-runtime'
import { Molcss, createInlineStyleProps } from './lib/react-jsx'

export type { MolcssJSX as JSX } from './lib/jsx-namespace'

const { jsx: reactJsx, jsxs: reactJsxs, Fragment } = ReactJsxRuntime as any

const hasOwn = Object.prototype.hasOwnProperty

export { Fragment }

export const jsx = (type: any, props: any, key: any) => {
  if (!hasOwn.call(props, 'css')) {
    return reactJsx(type, props, key)
  }

  if (typeof type === 'string') {
    return reactJsx(type, createInlineStyleProps(props), key)
  }

  return reactJsx(Molcss, { ...props, css: [type, props.css] }, key)
}

export const jsxs = (type: any, props: any, key: any) => {
  if (!hasOwn.call(props, 'css')) {
    return reactJsxs(type, props, key)
  }

  if (typeof type === 'string') {
    return reactJsxs(type, createInlineStyleProps(props), key)
  }

  return reactJsxs(Molcss, { ...props, css: [type, props.css] }, key)
}
