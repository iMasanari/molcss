import React, { forwardRef } from 'react'
import { mergeStyle } from '../client'
import { CssProp } from './jsx-namespace'
import { CacheableRuntimeStyleData, insertStyle, generateRuntimeStyle } from './runtime'

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

interface Props {
  type: any
  props: any
  children: any
}

export const Molcss = forwardRef(({ type, props, children }: Props, ref: any) => {
  const isSSR = typeof document === 'undefined'

  let WrappedComponent = type
  const style = useRuntimeStyle(props.css)

  const newProps = {
    ...props,
    children,
    ref,
    css: undefined,
    className: mergeStyle(props.className, ...style.classNames),
  }

  if (isSSR && style.cssText) {
    return (
      <>
        <style data-molcss={style.tag} dangerouslySetInnerHTML={{ __html: style.cssText }} />
        <WrappedComponent {...newProps} />
      </>
    )
  }

  return <WrappedComponent {...newProps} />
})
