import 'molcss/style.css'

import { css } from 'molcss'
import { MolcssProvider } from 'molcss/react'
import { type Metadata } from 'next'
import Footer from './Footer'
import Header from './Header'

const bodyStyle = css`
  margin: 0;
  background-color: rgb(13, 17, 23);
  color: white;
  font-family: sans-serif;
`

export const metadata: Metadata = {
  title: 'molcss',
  description: 'A simple, lightweight, and powerful CSS-in-JS library.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={bodyStyle}>
        <MolcssProvider>
          <Header />
          {children}
          <Footer />
        </MolcssProvider>
      </body>
    </html>
  )
}
