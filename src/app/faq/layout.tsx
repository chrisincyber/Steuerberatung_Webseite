import type { Metadata } from 'next'
import { FAQPageJsonLd } from '@/components/JsonLd'

const title = 'Häufige Fragen zur Online-Steuererklärung'
const description = 'Antworten auf die wichtigsten Fragen: Welche Dokumente brauche ich? Wie lange dauert es? Sind meine Daten sicher? Direkt und ehrlich.'

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    title,
    description,
    url: 'https://petertiltax.ch/faq',
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
  },
}

const faqItems = [
  {
    question: 'Welche Dokumente brauche ich?',
    answer: 'Die meisten Kunden brauchen 3–5 Dokumente: Lohnausweis, Kontoauszüge (per 31.12.), Säule 3a Bescheinigung, Krankenkassen-Prämienabrechnung und ggf. Belege für Berufsauslagen oder Hypothekarauszug.',
  },
  {
    question: 'Wie lange dauert es?',
    answer: 'In der Regel erhalten Sie Ihre fertige Steuererklärung innerhalb von 5–10 Arbeitstagen nach Erhalt aller Unterlagen. Eilaufträge auf Anfrage möglich.',
  },
  {
    question: 'Sind meine Daten sicher?',
    answer: 'Absolut. Alle Dokumente werden verschlüsselt gespeichert. Wir halten uns strikt an das Schweizer Datenschutzgesetz (DSG). Ihre Daten werden nach Abschluss des Auftrags gemäss unserer Datenschutzrichtlinie aufbewahrt und nach einer definierten Frist gelöscht.',
  },
  {
    question: 'Kann ich eine Fristverlängerung beantragen?',
    answer: 'Ja, wir können für Sie eine Fristverlängerung beim zuständigen Steueramt beantragen. Kontaktieren Sie uns rechtzeitig vor Ablauf der Frist, idealerweise mindestens 2 Wochen vorher.',
  },
  {
    question: 'Wie funktioniert die Bezahlung?',
    answer: 'Sie können bequem per Kreditkarte (Visa, Mastercard) über Stripe bezahlen oder per Banküberweisung. Die Rechnung erhalten Sie nach Fertigstellung Ihrer Steuererklärung im Schweizer QR-Rechnungsformat.',
  },
  {
    question: 'Für welche Kantone bieten Sie den Service an?',
    answer: 'Wir bieten unseren Service für alle 26 Schweizer Kantone an. Die kantonalen Besonderheiten kennen wir genau und berücksichtigen diese bei der Erstellung Ihrer Steuererklärung.',
  },
  {
    question: 'Was passiert, wenn ich Dokumente vergessen habe?',
    answer: 'Kein Problem. Über unser Portal können Sie jederzeit weitere Dokumente nachreichen. Wir benachrichtigen Sie auch aktiv, falls uns Unterlagen fehlen.',
  },
]

export default function FAQLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <FAQPageJsonLd items={faqItems} />
      {children}
    </>
  )
}
