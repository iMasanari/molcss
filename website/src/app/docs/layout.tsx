import 'molcss/style.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Docments | molcss',
  description: 'Docments of molcss.',
}

export default function DocsLayout({ children }: {
  children: React.ReactNode
}) {
  return children
}
