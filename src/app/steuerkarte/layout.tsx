import type { Metadata } from 'next'

const title = 'Steuerkarte Schweiz 2025 | Steuerbelastung nach Kanton'
const description = 'Interaktive Steuerkarte der Schweiz. Sehen Sie die Steuerbelastung aller 26 Kantone auf einen Blick — visuell und übersichtlich.'

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    title,
    description,
    url: 'https://petertiltax.ch/steuerkarte',
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
  },
}

export default function TaxMapLayout({ children }: { children: React.ReactNode }) {
  return children
}
