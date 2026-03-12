import type { Metadata } from 'next'

const title = 'Preise Steuererklärung | Ab CHF 89'
const description = 'Steuererklärung online einreichen ab CHF 89. Fixpreis für alle 26 Kantone. Beantworten Sie 4 Fragen und sehen Sie sofort Ihren Preis.'

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    title,
    description,
    url: 'https://petertiltax.ch/pricing',
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
  },
}

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children
}
