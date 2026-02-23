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
    default: 'Steuerberatung Petertil – Ihre digitale Steuererklärung',
    template: '%s | Steuerberatung Petertil',
  },
  description: 'Qualifizierte Steuerberatung aus der Schweiz – schnell, digital und bezahlbar. Steuererklärung online einreichen ab CHF 99.',
  keywords: ['Steuererklärung', 'Schweiz', 'Steuerberatung', 'digital', 'online', 'Steuerberater', 'Tax declaration', 'Switzerland'],
  authors: [{ name: 'Steuerberatung Petertil' }],
  openGraph: {
    type: 'website',
    locale: 'de_CH',
    alternateLocale: 'en_US',
    siteName: 'Steuerberatung Petertil',
    title: 'Steuerberatung Petertil – Ihre digitale Steuererklärung',
    description: 'Qualifizierte Steuerberatung aus der Schweiz – schnell, digital und bezahlbar.',
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
