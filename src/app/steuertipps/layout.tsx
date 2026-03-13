import type { Metadata } from 'next'

const title = 'Steuertipps Schweiz | 20+ Tipps zum Steuern sparen'
const description = 'Die besten Steuertipps für die Schweiz 2025: Säule 3a, Homeoffice, Wertschriften, Krankheitskosten, Spenden und mehr. Von Steuerexperten geprüft — jetzt Steuern sparen.'

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    title,
    description,
    url: 'https://petertiltax.ch/steuertipps',
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
  },
}

export default function TaxTipsLayout({ children }: { children: React.ReactNode }) {
  return children
}
