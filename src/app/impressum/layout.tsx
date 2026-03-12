import type { Metadata } from 'next'

const title = 'Impressum'
const description = 'Impressum und rechtliche Angaben von Petertil Tax — Ihr Online-Steuerservice für die Schweiz.'

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    title,
    description,
    url: 'https://petertiltax.ch/impressum',
  },
  twitter: {
    card: 'summary',
    title,
    description,
  },
}

export default function ImpressumLayout({ children }: { children: React.ReactNode }) {
  return children
}
