'use client'

import { css, mergeStyle } from 'molcss'
import { ComponentPropsWithoutRef, ElementType, ReactNode, useState } from 'react'

import './Button.css'

const buttonStyle = css`
  position: relative;
  overflow: hidden;
  appearance: none;
  display: inline-block;
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  background-color: white;
  font-size: 1em;
  color: black;
  text-decoration: none;
  transition: opacity 0.2s ease-in-out;

  &:hover {
    opacity: 0.8;
  }

`

const rippleStyle = (state: RippleState) => css`
  position: absolute;
  top: ${state.y - state.size / 2}px;
  left: ${state.x - state.size / 2}px;
  width: ${state.size}px;
  height: ${state.size}px;
  border-radius: 100%;
  background-color: rgb(0, 0, 0, 0.2);
  opacity: 0;
  pointer-events: none;

  /* Button.css */
  animation: Button__ripple--opacity 1s ease-out;
`

interface RippleState {
  key: number
  size: number
  x: number
  y: number
}

type Props<T extends ElementType> = Omit<ComponentPropsWithoutRef<T>, 'as'> & {
  as?: T
}

export default function Button<T extends ElementType = 'button'>({ as, children, ...props }: Props<T>) {
  const Component = as || 'button' as ElementType
  const [rippleState, setRippleState] = useState<RippleState | null>(null)

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    props.onClick?.(e)

    const clickX = e.pageX
    const clickY = e.pageY
    const clientRect = e.currentTarget.getBoundingClientRect()
    const positionX = clientRect.left + window.scrollX
    const positionY = clientRect.top + window.scrollY
    const x = clickX - positionX
    const y = clickY - positionY

    const topLeftPow = y ** 2 + x ** 2
    const topRightPow = y ** 2 + (clientRect.width - x) ** 2
    const bottomLeftPow = (clientRect.height - y) ** 2 + x ** 2
    const bottomRightPow = (clientRect.height - y) ** 2 + (clientRect.width - x) ** 2

    const size = Math.sqrt(Math.max(topLeftPow, topRightPow, bottomLeftPow, bottomRightPow)) * 2

    setRippleState({ key: Math.random(), x, y, size })
  }

  return (
    <Component {...props} className={mergeStyle(buttonStyle, props.className)} onClick={handleClick}>
      {children}
      {rippleState && (
        <span
          key={rippleState.key}
          css={rippleStyle(rippleState)}
          onAnimationEnd={() => setRippleState(null)}
        />
      )}
    </Component>
  )
}
