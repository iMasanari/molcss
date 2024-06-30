import React from 'react'
import { RuntimeStyle } from '../../molcss/client'

interface MolcssProps {
  css?: CssProp
}

type WithConditionalCSSProp<P> =
  'className' extends keyof P
  ? string extends P['className' & keyof P]
  ? MolcssProps
  : {}
  : {}

export namespace MolcssJSX {
  type ElementType = React.JSX.ElementType
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
