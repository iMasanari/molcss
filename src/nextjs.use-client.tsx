// 'use client'
// use clientはビルドで追加される

import React, { ReactNode, createContext, useContext, useEffect, useInsertionEffect, useState } from 'react'
import { CacheableRuntimeStyleData, insertStyle } from './lib/runtime'

type SsrContext = Map<string, string>

const CacheContext = createContext<SsrContext | null | undefined>(null)

const ssrScript = /* js */`
  (function(c){
    c&&(
      c.parentNode.querySelectorAll('style[data-molcss]').forEach(function(v){document.head.appendChild(v)}),
      c.parentNode.removeChild(c)
    )
  })(document.currentScript)
`.replace(/\n\s*/g, '')

export interface SSRProviderProps {
  extractCache?: Map<string, string>
  children: ReactNode
}

export const SSRProvider = ({ extractCache, children }: SSRProviderProps) => {
  if (extractCache) {
    return (
      <CacheContext.Provider value={extractCache}>
        {children}
      </CacheContext.Provider>
    )
  } else {
    return (
      <>
        {children}
        {typeof document === 'undefined' && (
          <script dangerouslySetInnerHTML={{ __html: ssrScript }} />
        )}
      </>
    )
  }
}

interface MolcssStyleProps {
  styles: {
    classNames: string[]
    cssText: string
    tag: string
    styleData: CacheableRuntimeStyleData[]
  }
}

let shouldRenderSSRStyle: boolean | undefined

export const MolcssStyle = ({ styles }: MolcssStyleProps) => {
  // SSRの場合、またはSSR時のスタイルがbody内に残っている場合にtrue
  if (shouldRenderSSRStyle == null) {
    shouldRenderSSRStyle = typeof document === 'undefined' || document.body.querySelector('style[data-molcss]') != null
  }

  const extractCache = useContext(CacheContext)

  const [isRenderStyle, setIsRenderStyle] = useState(shouldRenderSSRStyle)

  useEffect(() => {
    shouldRenderSSRStyle = false
    setIsRenderStyle(false)
  }, [])

  useInsertionEffect(() => {
    styles.styleData.forEach(insertStyle)
  }, [styles.cssText])

  if (typeof document === 'undefined' && extractCache) {
    styles.styleData.forEach(v => {
      extractCache.set(v.className, `.${v.className}{${v.prop}:${v.value}}`)
    })

    return null
  }

  if (!isRenderStyle || !styles.cssText) {
    return null
  }

  return <style data-molcss={styles.tag} dangerouslySetInnerHTML={{ __html: styles.cssText }} />
}
