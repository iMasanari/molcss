import React, { ComponentProps, ComponentType, ReactNode } from 'react'
import { CssProp, mergeStyle } from '../../molcss/client'
import { getRuntimeStyle } from '../../utils/runtime-style'

// add React 19 types
const Style = 'style' as 'style' & ComponentType<ComponentProps<'style'> & {
  precedence?: string
  href?: string
}>

export const Molcss = ({ css, ...props }: any) => {
  const Component = css[0] as ComponentType<any>
  const cssProp = css[1] as CssProp

  const classNames = [props.className] as string[]
  const styles = [] as ReactNode[]

  const cssPropList = Array.isArray(cssProp) ? cssProp : [cssProp]

  cssPropList.forEach(style => {
    if (!style) return

    if (typeof style !== 'object') {
      classNames.push(style)

      return
    }

    classNames.push(style.className)

    style.runtime.forEach(item => {
      const propKey = item[0]
      const value = item[1]

      const className = getRuntimeStyle(propKey, value)

      classNames.push(className)

      styles.push(
        <Style key={propKey} precedence="molcss" href={className}>
          {`.${className}{--molcss-${propKey}:${value}}`}
        </Style>
      )
    })
  })

  return (
    <>
      {styles}
      <Component {...props} className={mergeStyle(...classNames)} />
    </>
  )
}
