import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Über Petertil Tax | Ihr Steuerexperte aus der Schweiz',
  description: 'Christian Petertil – eidg. Finanzplaner mit über 5 Jahren Erfahrung in der Treuhandbranche. Persönliche Steuerberatung für alle 26 Kantone.',
}

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children
}
