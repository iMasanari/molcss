// 'use client'
// use clientはビルドで追加される

import React, { ReactNode, createContext, useContext, useInsertionEffect } from 'react'
import { CacheableRuntimeStyleData, insertStyle } from '../utils/runtime-style'

type ExtractStyleCache = Map<string, string>

interface MolcssContext {
  extractStyleCache?: ExtractStyleCache
}

const MolcssContext = createContext<MolcssContext | null | undefined>(null)

const ssrScript = /* js */`
  (function(c){
    c&&(
      c.parentNode.querySelectorAll('style[data-molcss]').forEach(function(v){document.head.appendChild(v)}),
      c.parentNode.removeChild(c)
    )
  })(document.currentScript)
`

export interface MolcssProviderProps {
  extractStyleCache?: ExtractStyleCache | undefined
  children: ReactNode
}

export const MolcssProvider = ({ extractStyleCache, children }: MolcssProviderProps) => {
  const context = { extractStyleCache }

  return (
    <MolcssContext.Provider value={context}>
      {children}
      {typeof document === 'undefined' && !extractStyleCache && (
        <script dangerouslySetInnerHTML={{ __html: ssrScript.replace(/\n\s*/g, '') }} />
      )}
    </MolcssContext.Provider>
  )
}

let ssrWarningDisplayed = false

const ssrWarningMessage = `[molcss]: For SSR, \`MolcssProvider\` is required.

ex.
import { MolcssProvider } from 'molcss/react'
App = () => <MolcssProvider>{/* your component */}</MolcssProvider>`

interface MolcssStyleProps {
  styles: {
    classNames: string[]
    cssText: string
    tag: string
    styleData: CacheableRuntimeStyleData[]
  }
}

export const MolcssStyle = ({ styles }: MolcssStyleProps) => {
  const context = useContext(MolcssContext)

  useInsertionEffect(() => {
    styles.styleData.forEach(insertStyle)
  }, [styles.cssText])

  if (!styles.cssText) {
    return null
  }

  // `<MolcssProvider />` がない場合
  if (!context && (typeof document === 'undefined' || process.env.NODE_ENV !== 'production' && document.body.querySelector('style[data-molcss]'))) {
    // 1度のみ警告
    if (!ssrWarningDisplayed) {
      console.warn(ssrWarningMessage)
      ssrWarningDisplayed = true
    }
  }

  // ブラウザの場合、表示しない
  if (typeof document !== 'undefined') {
    return null
  }

  if (context && context.extractStyleCache) {
    const extractCache = context.extractStyleCache

    styles.styleData.forEach(v => {
      extractCache.set(v.className, `.${v.className}{${v.prop}:${v.value}}`)
    })

    return null
  }

  return <style data-molcss={styles.tag} dangerouslySetInnerHTML={{ __html: styles.cssText }} />
}
