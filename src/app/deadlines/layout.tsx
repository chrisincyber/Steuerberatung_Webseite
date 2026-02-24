import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Steuerfristen 2025 nach Kanton',
  description: 'Alle Steuerfristen 2025 für die 26 Schweizer Kantone auf einen Blick. Einreichefristen und Verlängerungsmöglichkeiten.',
}

export default function DeadlinesLayout({ children }: { children: React.ReactNode }) {
  return children
}
