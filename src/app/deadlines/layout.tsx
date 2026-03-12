import type { Metadata } from 'next'

const title = 'Steuerfristen 2025 nach Kanton'
const description = 'Alle Steuerfristen 2025 für die 26 Schweizer Kantone auf einen Blick. Einreichefristen und Verlängerungsmöglichkeiten.'

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    title,
    description,
    url: 'https://petertiltax.ch/deadlines',
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
  },
}

export default function DeadlinesLayout({ children }: { children: React.ReactNode }) {
  return children
}
