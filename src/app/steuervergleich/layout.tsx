import type { Metadata } from 'next'

const title = 'Steuervergleich Schweiz 2025 | Kantone vergleichen'
const description = 'Vergleichen Sie die Steuerbelastung zwischen Schweizer Kantonen und Gemeinden. Finden Sie heraus, wo Sie am wenigsten Steuern zahlen.'

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    title,
    description,
    url: 'https://petertiltax.ch/steuervergleich',
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
  },
}

export default function TaxCompareLayout({ children }: { children: React.ReactNode }) {
  return children
}
