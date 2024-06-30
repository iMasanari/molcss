import React, { forwardRef } from 'react'
import { CssProp, mergeStyle } from '../../molcss/client'
import { CacheableRuntimeStyleData, generateRuntimeStyle } from '../../utils/runtime-style'
import { MolcssStyle } from '../react.use-client'

const useRuntimeStyle = (css: CssProp) => {
  const styleData: CacheableRuntimeStyleData[] = []
  const addStyleData = (v: CacheableRuntimeStyleData) => styleData.push(v)

  const styles = Array.isArray(css) ? css : [css]

  const classNames = styles.flatMap(style =>
    style && typeof style === 'object'
      ? style.runtime.reduce((acc, v) => `${acc} ${generateRuntimeStyle(v[0], v[1], addStyleData)}`, style.className)
      : style || []
  )

  const cssText = styleData.map(v => `.${v.className}{${v.prop}:${v.value}}`).join('')
  const tag = styleData.map(v => v.className).join(' ')

  return { classNames, cssText, tag, styleData }
}

export const Molcss = forwardRef((props: any, ref: any) => {
  const WrappedComponent = props.css[0]
  const styles = useRuntimeStyle(props.css[1])

  const newProps = {
    ...props,
    ref,
    // css: undefined,
    className: mergeStyle(props.className, ...styles.classNames),
  }

  // remove css props
  delete newProps.css

  return (
    <>
      <MolcssStyle styles={styles} />
      <WrappedComponent {...newProps} />
    </>
  )
})
