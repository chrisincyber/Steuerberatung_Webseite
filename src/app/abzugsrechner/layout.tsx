import type { Metadata } from 'next'

const title = 'Abzugsrechner Schweiz 2025 | Steuerabzüge finden'
const description = 'Finden Sie alle Steuerabzüge, die Ihnen zustehen. Berufsauslagen, Versicherungen, Weiterbildung und mehr — kostenloser Abzugsrechner für die Schweiz.'

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    title,
    description,
    url: 'https://petertiltax.ch/abzugsrechner',
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
  },
}

export default function DeductionLayout({ children }: { children: React.ReactNode }) {
  return children
}
