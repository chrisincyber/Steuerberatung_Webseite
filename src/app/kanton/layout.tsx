import type { Metadata } from 'next'

const title = 'Steuererklärung nach Kanton | Alle 26 Kantone'
const description = 'Steuererklärung für jeden Schweizer Kanton. Kantonale Steuersätze, Fristen und Besonderheiten — von Aargau bis Zürich.'

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    title,
    description,
    url: 'https://petertiltax.ch/kanton',
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
  },
}

export default function CantonLayout({ children }: { children: React.ReactNode }) {
  return children
}
