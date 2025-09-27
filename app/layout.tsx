import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Medical Web App',
  description: 'Aplicación web para análisis médico',
  icons: [
    { rel: 'icon', url: '/pepemedico.ico' },
    { rel: 'shortcut icon', url: '/pepemedico.ico' },
    { rel: 'apple-touch-icon', url: '/pepemedico.ico' }
  ]
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
