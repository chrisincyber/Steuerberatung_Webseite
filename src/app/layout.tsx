import type { Metadata } from 'next'
import localFont from 'next/font/local'
import './globals.css'
import { Providers } from './providers'

const geistSans = localFont({
  src: './fonts/GeistVF.woff2',
  variable: '--font-geist-sans',
  weight: '100 900',
  fallback: ['ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
})

const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff2',
  variable: '--font-geist-mono',
  weight: '100 900',
  fallback: ['ui-monospace', 'monospace'],
})

export const metadata: Metadata = {
  title: {
    default: 'Steuererklärung online einreichen | Petertil Tax',
    template: '%s | Petertil Tax',
  },
  description: 'Steuererklärung online abgeben ab CHF 149. Persönlicher Steuerexperte für alle 26 Kantone. Fixpreis, keine versteckten Kosten.',
  keywords: ['Steuererklärung', 'Schweiz', 'Steuerberatung', 'digital', 'online', 'Steuerberater', 'Tax declaration', 'Switzerland'],
  authors: [{ name: 'Petertil Tax' }],
  openGraph: {
    type: 'website',
    locale: 'de_CH',
    alternateLocale: 'en_US',
    siteName: 'Petertil Tax',
    title: 'Steuererklärung online einreichen | Petertil Tax',
    description: 'Steuererklärung online abgeben ab CHF 149. Persönlicher Steuerexperte für alle 26 Kantone. Fixpreis, keine versteckten Kosten.',
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: '/favicon.png',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="de" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="antialiased">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
