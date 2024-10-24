import { css, mergeStyle } from 'molcss'
import { ComponentProps } from 'react'

const codeStyle = css`
  font-family: ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace;
  :not(pre) > & {
    padding: 0.125rem 0.5rem /* 2px 8px */;
    border-radius: 0.25rem /* 4px */;
    font-size: 0.875rem /* 14px */;
    line-height: 1.25rem /* 20px */;
    background-color: rgb(203 213 225);
  }
`

export const code = (props: ComponentProps<'code'>) =>
  <code {...props} className={mergeStyle(codeStyle, props.className, 'notranslate')} />

const h1Style = css`
  color: red;
`

export const h1 = (props: ComponentProps<'h1'>) =>
  <h1 {...props} className={mergeStyle(h1Style, props.className)} />

const preStyle = css`
  overflow: auto;
  padding: 0.5rem 1rem;
  border-bottom-right-radius: 0.25rem;
  border-bottom-left-radius: 0.25rem;
`

export const pre = ({ style: _, ...props }: ComponentProps<'pre'>) =>
  <pre {...props} className={mergeStyle(preStyle, props.className)} />

const styleClassNameRecord = new Map(
  Object.entries({
    'color:#C586C0': css`color: #C586C0;`,
    'color:#D4D4D4': css`color: #D4D4D4;`,
    'color:#9CDCFE': css`color: #9CDCFE;`,
    'color:#CE9178': css`color: #CE9178;`,
    'color:#DCDCAA': css`color: #DCDCAA;`,
    'color:#569CD6': css`color: #569CD6;`,
    'color:#4FC1FF': css`color: #4FC1FF;`,
    'color:#4EC9B0': css`color: #4EC9B0;`,
    'color:#6A9955': css`color: #6A9955;`,
    'color:#D7BA7D': css`color: #D7BA7D;`,
    'color:#B5CEA8': css`color: #B5CEA8;`,
    'color:#808080': css`color: #808080;`,
  })
)

const createSpanProps = (props: ComponentProps<'span'>) => {
  if (!props.style || typeof props.style !== 'object') {
    return props
  }

  const styleList = Object.entries(props.style).map(([prop, value]) => ({
    prop,
    value,
    className: styleClassNameRecord.get(`${prop}:${value}`),
  }))

  const warn = styleList.find(v => !v.className)

  if (warn) {
    console.warn(`/* [components/markdown] Not match */ '${warn.prop}:${warn.value}': css\`${warn.prop}: ${warn.value};\`,`)

    return props
  }

  const { style, ...rest } = props

  return {
    ...rest,
    className: mergeStyle(...styleList.map(v => v.className), props.className),
  }
}

export const span = (props: ComponentProps<'span'>) =>
  <span {...createSpanProps(props)} />
