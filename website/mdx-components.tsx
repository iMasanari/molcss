import type { MDXComponents } from 'mdx/types'
import { h1, pre, span, code } from '@/components/markdown'

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...components,
    code,
    h1,
    pre,
    span,
  }
}
