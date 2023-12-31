import React from 'react'
import { RuntimeStyle } from '../client'

type CssPropValue =
  | string
  | RuntimeStyle
  | undefined
  | null
  | false
  | 0

export type CssProp = CssPropValue | CssPropValue[]

interface MolcssProps {
  css?: CssProp
}

type WithConditionalCSSProp<P> =
  'className' extends keyof P
  ? string extends P['className' & keyof P]
  ? MolcssProps
  : {}
  : {}

// based on the code from @types/react@18.2.8
// https://github.com/DefinitelyTyped/DefinitelyTyped/blob/3197efc097d522c4bf02b94e1a0766d007d6cdeb/types/react/index.d.ts#LL3204C13-L3204C13
type ReactJSXElementType = string | React.JSX.ElementConstructor<any>

export namespace MolcssJSX {
  type ElementType = ReactJSXElementType
  interface Element extends React.JSX.Element { }
  interface ElementClass extends React.JSX.ElementClass { }
  interface ElementAttributesProperty extends React.JSX.ElementAttributesProperty { }
  interface ElementChildrenAttribute extends React.JSX.ElementChildrenAttribute { }

  type LibraryManagedAttributes<C, P> = WithConditionalCSSProp<P> & React.JSX.LibraryManagedAttributes<C, P>

  interface IntrinsicAttributes extends React.JSX.IntrinsicAttributes { }
  interface IntrinsicClassAttributes<T> extends React.JSX.IntrinsicClassAttributes<T> { }

  type IntrinsicElements = {
    [K in keyof React.JSX.IntrinsicElements]: React.JSX.IntrinsicElements[K] & MolcssProps
  }
}
