import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Preise Steuererklärung | Ab CHF 149',
  description: 'Steuererklärung online einreichen ab CHF 149. Fixpreis für alle 26 Kantone. Beantworten Sie 4 Fragen und sehen Sie sofort Ihren Preis.',
}

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children
}
