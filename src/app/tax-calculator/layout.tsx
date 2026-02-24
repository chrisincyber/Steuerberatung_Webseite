import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Steuerrechner Schweiz 2025',
  description: 'Berechnen Sie Ihre Steuerbelastung für alle 26 Kantone. Kostenloser Steuerrechner mit Bundessteuer, Kantonssteuer und Gemeindesteuer.',
}

export default function TaxCalculatorLayout({ children }: { children: React.ReactNode }) {
  return children
}
