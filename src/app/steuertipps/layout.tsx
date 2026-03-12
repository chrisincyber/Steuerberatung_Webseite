import type { Metadata } from 'next'

const title = 'Steuertipps Schweiz 2025 | Steuern sparen'
const description = 'Praktische Steuertipps für die Schweiz: Abzüge maximieren, Fristen einhalten und häufige Fehler vermeiden. Von Steuerexperten zusammengestellt.'

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
