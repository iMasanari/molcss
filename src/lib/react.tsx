import React, { forwardRef } from 'react'
import { mergeStyle } from '../client'
import { CssProp, CssPropValue } from './jsx-namespace'
import { CacheableRuntimeStyleData, generateRuntimeStyle, insertStyle } from './runtime'

const useInsertionEffect = typeof window !== 'undefined'
  ? React['useInsertionEffect'] || React['useLayoutEffect']
  : () => { }

const useRuntimeStyle = (css: CssProp) => {
  const list: CacheableRuntimeStyleData[] = []
  const addList = (v: CacheableRuntimeStyleData) => list.push(v)

  const styles = Array.isArray(css) ? css : [css]

  const classNames = styles.flatMap(style =>
    style && typeof style === 'object'
      ? style.runtime.reduce((acc, v) => `${acc} ${generateRuntimeStyle(v[0], v[1], addList)}`, style.className)
      : style || []
  )

  useInsertionEffect(() => {
    list.forEach(v => insertStyle(v))
  }, [list])

  const cssText = list.map(v => `.${v.className}{${v.prop}:${v.value}}`).join('')
  const tag = list.map(v => v.className).join(' ')

  return { classNames, cssText, tag }
}

export const Molcss = forwardRef((props: any, ref: any) => {
  const isSSR = typeof document === 'undefined'

  const WrappedComponent = props.css[0]
  const styles = useRuntimeStyle(props.css[1])

  const newProps = {
    ...props,
    ref,
    css: undefined,
    className: mergeStyle(props.className, ...styles.classNames),
  }

  if (isSSR && styles.cssText) {
    return (
      <>
        <style data-molcss={styles.tag} dangerouslySetInnerHTML={{ __html: styles.cssText }} />
        <WrappedComponent {...newProps} />
      </>
    )
  }

  return <WrappedComponent {...newProps} />
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
