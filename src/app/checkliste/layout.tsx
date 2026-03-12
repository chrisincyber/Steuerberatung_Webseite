import type { Metadata } from 'next'

const title = 'Steuer-Checkliste Schweiz 2025 | Alle Dokumente'
const description = 'Welche Dokumente brauchen Sie für die Steuererklärung? Unsere Checkliste zeigt Ihnen genau, was Sie vorbereiten müssen — für alle Kantone.'

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    title,
    description,
    url: 'https://petertiltax.ch/checkliste',
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
  },
}

export default function ChecklistLayout({ children }: { children: React.ReactNode }) {
  return children
}
