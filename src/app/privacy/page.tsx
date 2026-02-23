'use client'

import { useI18n } from '@/lib/i18n/context'

export default function PrivacyPage() {
  const { t, locale } = useI18n()

  return (
    <>
      <section className="gradient-hero pt-32 pb-20 lg:pt-40 lg:pb-24 relative overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-heading text-4xl sm:text-5xl font-bold text-white">
            {t.privacy.title}
          </h1>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-narrow">
          <div className="prose prose-navy max-w-none">
            <p className="text-sm text-navy-500">
              {locale === 'de' ? 'Stand: Februar 2026' : 'Last updated: February 2026'}
            </p>

            <h2>{locale === 'de' ? '1. Allgemein' : '1. General'}</h2>
            <p>
              {locale === 'de'
                ? 'Gestützt auf Artikel 13 der schweizerischen Bundesverfassung und die datenschutzrechtlichen Bestimmungen des Bundes (Datenschutzgesetz, DSG) hat jede Person Anspruch auf Schutz ihrer Privatsphäre sowie auf Schutz vor Missbrauch ihrer persönlichen Daten. Wir halten diese Bestimmungen ein. Persönliche Daten werden streng vertraulich behandelt und weder an Dritte verkauft noch weitergegeben.'
                : 'Based on Article 13 of the Swiss Federal Constitution and the data protection provisions of the Confederation (Data Protection Act, DSG), every person is entitled to protection of their privacy and protection against misuse of their personal data. We comply with these provisions. Personal data is treated strictly confidentially and is neither sold nor passed on to third parties.'}
            </p>

            <h2>{locale === 'de' ? '2. Erhebung personenbezogener Daten' : '2. Collection of Personal Data'}</h2>
            <p>
              {locale === 'de'
                ? 'Wir erheben folgende personenbezogene Daten: Name, E-Mail-Adresse, Telefonnummer, Adresse, sowie steuerrelevante Dokumente und Finanzinformationen, die Sie uns zur Bearbeitung Ihrer Steuererklärung zur Verfügung stellen.'
                : 'We collect the following personal data: name, email address, phone number, address, and tax-relevant documents and financial information that you provide to us for the preparation of your tax declaration.'}
            </p>

            <h2>{locale === 'de' ? '3. Datensicherheit' : '3. Data Security'}</h2>
            <p>
              {locale === 'de'
                ? 'Alle hochgeladenen Dokumente werden mit AES-256 Verschlüsselung gespeichert. Die Datenübertragung erfolgt ausschliesslich über verschlüsselte SSL/TLS-Verbindungen. Unsere Server befinden sich in der Schweiz oder im EWR.'
                : 'All uploaded documents are stored with AES-256 encryption. Data transmission takes place exclusively via encrypted SSL/TLS connections. Our servers are located in Switzerland or the EEA.'}
            </p>

            <h2>{locale === 'de' ? '4. Verwendung der Daten' : '4. Use of Data'}</h2>
            <p>
              {locale === 'de'
                ? 'Ihre Daten werden ausschliesslich zur Erbringung unserer Dienstleistungen verwendet, insbesondere zur Erstellung und Einreichung Ihrer Steuererklärung, zur Kommunikation mit Ihnen und zur Rechnungsstellung.'
                : 'Your data is used exclusively to provide our services, in particular for the preparation and submission of your tax declaration, communication with you, and invoicing.'}
            </p>

            <h2>{locale === 'de' ? '5. Aufbewahrung und Löschung' : '5. Retention and Deletion'}</h2>
            <p>
              {locale === 'de'
                ? 'Dokumente und persönliche Daten werden nach Abschluss des Mandats für die gesetzlich vorgeschriebene Dauer aufbewahrt und anschliessend sicher gelöscht. Sie können jederzeit die Löschung Ihrer Daten beantragen.'
                : 'Documents and personal data are retained for the legally required period after completion of the engagement and then securely deleted. You can request the deletion of your data at any time.'}
            </p>

            <h2>{locale === 'de' ? '6. Cookies' : '6. Cookies'}</h2>
            <p>
              {locale === 'de'
                ? 'Diese Website verwendet technisch notwendige Cookies für die Funktionalität der Website (z.B. Login-Session, Spracheinstellung). Analytische Cookies werden nur mit Ihrer ausdrücklichen Zustimmung gesetzt.'
                : 'This website uses technically necessary cookies for the functionality of the website (e.g., login session, language setting). Analytical cookies are only set with your explicit consent.'}
            </p>

            <h2>{locale === 'de' ? '7. Drittanbieter' : '7. Third-Party Services'}</h2>
            <p>
              {locale === 'de'
                ? 'Wir verwenden folgende Drittanbieter-Dienste: Supabase (Authentifizierung und Datenspeicherung), Stripe (Zahlungsabwicklung), Resend (E-Mail-Versand), Twilio (SMS-Versand). Diese Dienste verarbeiten Daten gemäss ihren eigenen Datenschutzrichtlinien.'
                : 'We use the following third-party services: Supabase (authentication and data storage), Stripe (payment processing), Resend (email delivery), Twilio (SMS delivery). These services process data according to their own privacy policies.'}
            </p>

            <h2>{locale === 'de' ? '8. Ihre Rechte' : '8. Your Rights'}</h2>
            <p>
              {locale === 'de'
                ? 'Sie haben das Recht auf Auskunft, Berichtigung, Löschung und Einschränkung der Verarbeitung Ihrer personenbezogenen Daten. Kontaktieren Sie uns unter info@steuerberatung-petertil.ch.'
                : 'You have the right to access, rectification, deletion, and restriction of processing of your personal data. Contact us at info@steuerberatung-petertil.ch.'}
            </p>

            <h2>{locale === 'de' ? '9. Kontakt' : '9. Contact'}</h2>
            <p>
              Steuerberatung Petertil<br />
              E-Mail: info@steuerberatung-petertil.ch<br />
              {locale === 'de' ? 'Telefon' : 'Phone'}: +41 00 000 00 00
            </p>
          </div>
        </div>
      </section>
    </>
  )
}
