import type { Metadata } from 'next'

const title = 'Quellensteuer Rechner Schweiz 2025'
const description = 'Berechnen Sie Ihre Quellensteuer in der Schweiz. Tarife, Korrekturen und Rückforderungen — einfach erklärt für alle Kantone.'

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    title,
    description,
    url: 'https://petertiltax.ch/quellensteuer',
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
  },
}

export default function WithholdingLayout({ children }: { children: React.ReactNode }) {
  return children
}
