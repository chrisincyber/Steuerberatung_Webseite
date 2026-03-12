import type { Metadata } from 'next'

const title = 'Steuerrechner Schweiz 2025'
const description = 'Berechnen Sie Ihre Steuerbelastung für alle 26 Kantone. Kostenloser Steuerrechner mit Bundessteuer, Kantonssteuer und Gemeindesteuer.'

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    title,
    description,
    url: 'https://petertiltax.ch/tax-calculator',
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
  },
}

export default function TaxCalculatorLayout({ children }: { children: React.ReactNode }) {
  return children
}
