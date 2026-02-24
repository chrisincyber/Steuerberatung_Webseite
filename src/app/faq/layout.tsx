import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Häufige Fragen zur Online-Steuererklärung',
  description: 'Antworten auf die wichtigsten Fragen: Welche Dokumente brauche ich? Wie lange dauert es? Sind meine Daten sicher? Direkt und ehrlich.',
}

export default function FAQLayout({ children }: { children: React.ReactNode }) {
  return children
}
