import type { Metadata } from 'next'

const title = 'Datenschutzerklärung'
const description = 'Datenschutzerklärung von Petertil Tax. Erfahren Sie, wie wir Ihre Daten gemäss dem Schweizer Datenschutzgesetz (DSG) schützen.'

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    title,
    description,
    url: 'https://petertiltax.ch/privacy',
  },
  twitter: {
    card: 'summary',
    title,
    description,
  },
}

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return children
}
