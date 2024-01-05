import React, { forwardRef } from 'react'
import { mergeStyle } from '../client'
import { CacheableRuntimeStyleData, generateRuntimeStyle } from '../lib/runtime'
import { MolcssStyle } from '../nextjs.use-client'
import { CssProp, CssPropValue } from './jsx-namespace'

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

export const createInlineStyleProps = (props: any) => {
  const styles: CssPropValue[] = Array.isArray(props.css) ? props.css : [props.css]

  const className = mergeStyle(
    props.className,
    ...styles.flatMap(style =>
      style && typeof style === 'object'
        ? [style.className, ...style.runtime.map(v => `${v[0]}00`)]
        : style || []
    )
  )

  const classList = new Set(className.split(' '))

  const styleList = styles.flatMap(style =>
    style && typeof style === 'object'
      ? style.runtime.map(v => {
        const propKey = v[0]
        const value = classList.has(`${propKey}00`) ? v[1] + '' : undefined

        return [`--molcss-${propKey}`, value] as const
      })
      : []
  )

  return {
    ...props,
    css: undefined,
    className,
    style: { ...props.style, ...Object.fromEntries(styleList) },
  }
}
