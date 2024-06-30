// @vitest-environment jsdom

import 'molcss/style.css'
import { css } from 'molcss'
import { describe, expect, test } from 'vitest'
import { mergeStyle, toInlineProps, RuntimeStyle } from '../src/molcss/client'

const getStyle = (className: string) => {
  const target = document.createElement('div')
  target.className = className

  const style = getComputedStyle(target)

  return Object.fromEntries(Array.from(style, key => [key, style.getPropertyValue(key)]))
}

const defaultStyle = getStyle('')

describe('css', () => {
  test('css', () => {
    const style = getStyle(css`
      width: 100px;
      height: 200px;
    `)

    expect(style).toStrictEqual({
      ...defaultStyle,
      width: '100px',
      height: '200px',
    })
  })

  test('css shorthands', () => {
    const style = getStyle(css`
      padding-top: 5px;
      padding: 10px 20px;
      padding-right: 5px;
    `)

    expect(style).toStrictEqual({
      ...defaultStyle,
      padding: '10px 5px 10px 20px',
    })
  })
})

describe('mergeStyle', () => {
  test('mergeStyle', () => {
    const result = mergeStyle('a0 b0', 'b1 c1')

    expect(result).toBe('a0 b1 c1')
  })


  test('mergeStyle with unknown class', () => {
    const result = mergeStyle('other a0 b0', 'b1 c1')

    expect(result).toBe('other a0 b1 c1')
  })
})

describe('mergeStyle + css', () => {
  test('mergeStyle + css', () => {
    const fullWidthStyle = css`
      width: 100%;
      padding-top: 1px;
    `

    const halfStyle = css`
      width: 50%;
      padding-bottom: 1px;
    `

    const target1 = mergeStyle(fullWidthStyle, halfStyle)
    const target2 = mergeStyle(halfStyle, fullWidthStyle)

    expect(getStyle(target1)).toStrictEqual({
      ...defaultStyle,
      width: '50%',
      'padding-top': '1px',
      'padding-bottom': '1px',
    })

    expect(getStyle(target2)).toStrictEqual({
      ...defaultStyle,
      width: '100%',
      'padding-top': '1px',
      'padding-bottom': '1px',
    })
  })
})

describe('toInlineProps', () => {
  test('toInlineProps', () => {
    const runtimeStyle: RuntimeStyle = {
      className: 'a0',
      runtime: [['A', 1]],
    }

    const result = toInlineProps({ css: runtimeStyle })

    expect(result).toStrictEqual({
      className: 'a0 A00',
      style: {
        '--molcss-A': '1',
      },
    })
  })

  test('toInlineProps', () => {
    const runtimeStyle: RuntimeStyle = {
      className: 'a0 b0 c0',
      runtime: [['A', 1], ['B', '1px'], ['C', 'xxx']],
    }

    const result = toInlineProps({
      css: [runtimeStyle, 'b0 B123456'],
      className: 'a1 z0',
      style: { color: 'red' },
    })

    expect(result).toStrictEqual({
      className: 'a0 z0 b0 c0 A00 B123456 C00',
      style: {
        '--molcss-A': '1',
        '--molcss-C': 'xxx',
        color: 'red',
      },
    })
  })

  test('toInlineProps with empty', () => {
    const runtimeStyle: RuntimeStyle = {
      className: '',
      runtime: [],
    }

    const result = toInlineProps({ css: runtimeStyle })

    expect(result).toStrictEqual({
      className: '',
      style: {},
    })
  })
})
