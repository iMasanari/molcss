import 'molcss/style.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Docments | Molcss',
  description: 'Docments of Molcss.',
}

export default function DocsLayout({ children }: {
  children: React.ReactNode
}) {
  return children
}
