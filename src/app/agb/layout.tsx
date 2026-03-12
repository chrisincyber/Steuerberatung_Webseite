import type { Metadata } from 'next'

const title = 'Allgemeine Geschäftsbedingungen (AGB)'
const description = 'AGB von Petertil Tax. Allgemeine Geschäftsbedingungen für unseren Online-Steuerservice in der Schweiz.'

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    title,
    description,
    url: 'https://petertiltax.ch/agb',
  },
  twitter: {
    card: 'summary',
    title,
    description,
  },
}

export default function AGBLayout({ children }: { children: React.ReactNode }) {
  return children
}
