import type { Metadata } from 'next'

const title = 'Über Petertil Tax | Ihr Steuerexperte aus der Schweiz'
const description = 'Christian Petertil – eidg. Finanzplaner mit über 5 Jahren Erfahrung in der Treuhandbranche. Persönliche Steuerberatung für alle 26 Kantone.'

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    title,
    description,
    url: 'https://petertiltax.ch/about',
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
  },
}

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children
}
