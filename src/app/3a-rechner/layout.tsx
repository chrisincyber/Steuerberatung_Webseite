import type { Metadata } from 'next'

const title = 'Säule 3a Rechner Schweiz 2025 | Steuerabzug berechnen'
const description = 'Berechnen Sie Ihren maximalen Säule 3a Abzug und die Steuerersparnis. Kostenloser 3a-Rechner für alle 26 Kantone der Schweiz.'

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    title,
    description,
    url: 'https://petertiltax.ch/3a-rechner',
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
  },
}

export default function Pillar3aLayout({ children }: { children: React.ReactNode }) {
  return children
}
