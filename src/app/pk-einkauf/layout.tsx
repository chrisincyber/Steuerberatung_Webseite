import type { Metadata } from 'next'

const title = 'PK-Einkaufsrechner Schweiz 2026 | Pensionskassen-Einkauf Steuerersparnis'
const description = 'Berechnen Sie die Steuerersparnis bei einem freiwilligen Pensionskassen-Einkauf. Kostenloser PK-Einkaufsrechner mit Staffelung, Kapitalbezugssteuer und Nettovorteils-Berechnung für alle 26 Kantone.'

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    title,
    description,
    url: 'https://petertiltax.ch/pk-einkauf',
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
  },
}

export default function PkEinkaufLayout({ children }: { children: React.ReactNode }) {
  return children
}
