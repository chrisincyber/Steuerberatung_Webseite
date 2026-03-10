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
              {locale === 'de' ? 'Stand: März 2026' : 'Last updated: March 2026'}
            </p>

            <h2>{locale === 'de' ? '1. Allgemein' : '1. General'}</h2>
            <p>
              {locale === 'de'
                ? 'Gestützt auf Artikel 13 der schweizerischen Bundesverfassung und das Bundesgesetz über den Datenschutz (DSG, revidiert per 1. September 2023) hat jede Person Anspruch auf Schutz ihrer Privatsphäre sowie auf Schutz vor Missbrauch ihrer persönlichen Daten. Wir halten diese Bestimmungen ein. Persönliche Daten werden streng vertraulich behandelt und weder an Dritte verkauft noch weitergegeben.'
                : 'Based on Article 13 of the Swiss Federal Constitution and the Federal Act on Data Protection (FADP/DSG, revised as of 1 September 2023), every person is entitled to protection of their privacy and protection against misuse of their personal data. We comply with these provisions. Personal data is treated strictly confidentially and is neither sold nor passed on to third parties.'}
            </p>

            <h2>{locale === 'de' ? '2. Verantwortliche Stelle' : '2. Data Controller'}</h2>
            <p>
              {locale === 'de'
                ? 'Verantwortlich für die Datenbearbeitung auf dieser Website ist:'
                : 'The responsible party for data processing on this website is:'}
            </p>
            <p>
              Petertil Tax<br />
              E-Mail: info@petertiltax.ch
            </p>

            <h2>{locale === 'de' ? '3. Erhebung personenbezogener Daten' : '3. Collection of Personal Data'}</h2>
            <p>
              {locale === 'de'
                ? 'Wir erheben folgende personenbezogene Daten: Name, E-Mail-Adresse, Telefonnummer, Adresse, sowie steuerrelevante Dokumente und Finanzinformationen, die Sie uns zur Bearbeitung Ihrer Steuererklärung zur Verfügung stellen. Im Rahmen des Steuerrechners können nicht angemeldete Nutzer optional Name, E-Mail und Telefonnummer angeben, um eine Steuerberechnung per E-Mail zu erhalten.'
                : 'We collect the following personal data: name, email address, phone number, address, and tax-relevant documents and financial information that you provide to us for the preparation of your tax declaration. In connection with the tax calculator, non-registered users may optionally provide their name, email, and phone number to receive a tax calculation by email.'}
            </p>

            <h2>{locale === 'de' ? '4. Rechtsgrundlage' : '4. Legal Basis'}</h2>
            <p>
              {locale === 'de'
                ? 'Die Bearbeitung Ihrer Personendaten erfolgt gestützt auf Art. 31 DSG (Vertragserfüllung), Art. 31 Abs. 1 DSG (berechtigtes Interesse) sowie gegebenenfalls auf Ihre Einwilligung (Art. 6 Abs. 6 DSG). Die Bereitstellung von Personendaten ist für die Vertragserfüllung erforderlich.'
                : 'The processing of your personal data is based on Art. 31 FADP (contract performance), Art. 31 para. 1 FADP (legitimate interest), and where applicable your consent (Art. 6 para. 6 FADP). Providing personal data is necessary for contract performance.'}
            </p>

            <h2>{locale === 'de' ? '5. Datensicherheit' : '5. Data Security'}</h2>
            <p>
              {locale === 'de'
                ? 'Alle hochgeladenen Dokumente werden mit AES-256 Verschlüsselung gespeichert. Die Datenübertragung erfolgt ausschliesslich über verschlüsselte SSL/TLS-Verbindungen. Sämtliche Server und Infrastruktur befinden sich in Westeuropa (EU/EWR) und unterliegen dem europäischen Datenschutzniveau gemäss Angemessenheitsbeschluss.'
                : 'All uploaded documents are stored with AES-256 encryption. Data transmission takes place exclusively via encrypted SSL/TLS connections. All servers and infrastructure are located in Western Europe (EU/EEA) and are subject to European data protection standards as per adequacy decision.'}
            </p>

            <h2>{locale === 'de' ? '6. Verwendung der Daten' : '6. Use of Data'}</h2>
            <p>
              {locale === 'de'
                ? 'Ihre Daten werden ausschliesslich zur Erbringung unserer Dienstleistungen verwendet, insbesondere zur Erstellung und Einreichung Ihrer Steuererklärung, zur Kommunikation mit Ihnen und zur Rechnungsstellung.'
                : 'Your data is used exclusively to provide our services, in particular for the preparation and submission of your tax declaration, communication with you, and invoicing.'}
            </p>

            <h2>{locale === 'de' ? '7. Aufbewahrung und Löschung' : '7. Retention and Deletion'}</h2>
            <p>
              {locale === 'de'
                ? 'Dokumente und persönliche Daten werden nach Abschluss des Mandats für die gesetzlich vorgeschriebene Dauer (in der Regel 10 Jahre gemäss Art. 958f OR) aufbewahrt und anschliessend sicher gelöscht. Sie können jederzeit die vorzeitige Löschung Ihrer Daten beantragen, soweit keine gesetzliche Aufbewahrungspflicht besteht.'
                : 'Documents and personal data are retained for the legally required period after completion of the engagement (generally 10 years per Art. 958f CO) and then securely deleted. You can request early deletion of your data at any time, provided no statutory retention obligation applies.'}
            </p>

            <h2>{locale === 'de' ? '8. Cookies' : '8. Cookies'}</h2>
            <p>
              {locale === 'de'
                ? 'Diese Website verwendet ausschliesslich technisch notwendige Cookies für die Funktionalität der Website (z.B. Login-Session, Spracheinstellung). Es werden keine Tracking- oder Werbe-Cookies eingesetzt.'
                : 'This website uses only technically necessary cookies for the functionality of the website (e.g., login session, language setting). No tracking or advertising cookies are used.'}
            </p>

            <h2>{locale === 'de' ? '9. Drittanbieter-Dienste' : '9. Third-Party Services'}</h2>
            <p>
              {locale === 'de'
                ? 'Wir verwenden folgende Drittanbieter-Dienste zur Erbringung unserer Leistungen. Sämtliche Daten werden ausschliesslich auf Servern in Westeuropa verarbeitet:'
                : 'We use the following third-party services to provide our offerings. All data is processed exclusively on servers located in Western Europe:'}
            </p>
            <ul>
              <li>
                {locale === 'de'
                  ? 'Supabase — Authentifizierung und Datenspeicherung (Server in Westeuropa)'
                  : 'Supabase — Authentication and data storage (servers in Western Europe)'}
              </li>
              <li>
                {locale === 'de'
                  ? 'Stripe — Zahlungsabwicklung (PCI DSS-zertifiziert, Server in Westeuropa)'
                  : 'Stripe — Payment processing (PCI DSS certified, servers in Western Europe)'}
              </li>
              <li>
                {locale === 'de'
                  ? 'Resend — E-Mail-Versand (Server in Westeuropa)'
                  : 'Resend — Email delivery (servers in Western Europe)'}
              </li>
              <li>
                {locale === 'de'
                  ? 'Twilio — SMS-Versand (Datenverarbeitung gemäss deren Datenschutzrichtlinie)'
                  : 'Twilio — SMS delivery (data processing per their privacy policy)'}
              </li>
              <li>
                {locale === 'de'
                  ? 'Railway — Webhosting (Server in Westeuropa)'
                  : 'Railway — Web hosting (servers in Western Europe)'}
              </li>
            </ul>
            <p>
              {locale === 'de'
                ? 'Es findet keine Datenübermittlung in Drittstaaten ausserhalb der EU/des EWR statt. Diese Dienste verarbeiten Daten gemäss ihren eigenen Datenschutzrichtlinien und auf Grundlage von Auftragsverarbeitungsverträgen.'
                : 'No data is transferred to third countries outside the EU/EEA. These services process data according to their own privacy policies and on the basis of data processing agreements.'}
            </p>

            <h2>{locale === 'de' ? '10. Steuerrechner' : '10. Tax Calculator'}</h2>
            <p>
              {locale === 'de'
                ? 'Der Steuerrechner nutzt öffentlich zugängliche Daten des ESTV-Steuerrechners zur Berechnung. Die eingegebenen Daten (Einkommen, Wohnort, Zivilstand etc.) werden nicht dauerhaft gespeichert, sofern Sie nicht angemeldet sind. Bei angemeldeten Nutzern können Berechnungen optional im Konto gespeichert und jederzeit gelöscht werden.'
                : 'The tax calculator uses publicly available data from the ESTV tax calculator. Input data (income, residence, marital status, etc.) is not permanently stored unless you are logged in. For logged-in users, calculations can optionally be saved to their account and deleted at any time.'}
            </p>

            <h2>{locale === 'de' ? '11. Jahresabo (Abonnement)' : '11. Annual Subscription'}</h2>
            <p>
              {locale === 'de'
                ? 'Bei Abschluss eines Jahresabos speichern wir zusätzlich den Abo-Status, die Mindestlaufzeit sowie das Datum der nächsten Verlängerung. Diese Daten werden zur Vertragserfüllung und Rechnungsstellung benötigt. Im Falle einer Kündigung werden die Abo-Daten nach Ablauf der letzten bezahlten Periode gelöscht, sofern keine gesetzliche Aufbewahrungspflicht besteht.'
                : 'When subscribing to an annual subscription, we additionally store the subscription status, minimum term, and the date of the next renewal. This data is required for contract performance and invoicing. In the event of cancellation, subscription data is deleted after the end of the last paid period, unless a statutory retention obligation applies.'}
            </p>

            <h2>{locale === 'de' ? '12. Ihre Rechte' : '12. Your Rights'}</h2>
            <p>
              {locale === 'de'
                ? 'Gemäss dem revidierten DSG haben Sie folgende Rechte:'
                : 'Under the revised FADP, you have the following rights:'}
            </p>
            <ul>
              <li>{locale === 'de' ? 'Recht auf Auskunft über Ihre gespeicherten Daten (Art. 25 DSG)' : 'Right of access to your stored data (Art. 25 FADP)'}</li>
              <li>{locale === 'de' ? 'Recht auf Berichtigung unrichtiger Daten (Art. 32 DSG)' : 'Right to rectification of inaccurate data (Art. 32 FADP)'}</li>
              <li>{locale === 'de' ? 'Recht auf Löschung Ihrer Daten (Art. 32 DSG)' : 'Right to deletion of your data (Art. 32 FADP)'}</li>
              <li>{locale === 'de' ? 'Recht auf Datenherausgabe und -übertragung (Art. 28 DSG)' : 'Right to data portability (Art. 28 FADP)'}</li>
              <li>{locale === 'de' ? 'Recht auf Einschränkung der Bearbeitung' : 'Right to restriction of processing'}</li>
              <li>{locale === 'de' ? 'Recht auf Widerruf einer erteilten Einwilligung' : 'Right to withdraw consent'}</li>
            </ul>
            <p>
              {locale === 'de'
                ? 'Zur Ausübung Ihrer Rechte kontaktieren Sie uns unter info@petertiltax.ch. Wir antworten innerhalb von 30 Tagen. Zudem haben Sie das Recht, eine Beschwerde beim Eidgenössischen Datenschutz- und Öffentlichkeitsbeauftragten (EDÖB) einzureichen.'
                : 'To exercise your rights, contact us at info@petertiltax.ch. We will respond within 30 days. You also have the right to lodge a complaint with the Federal Data Protection and Information Commissioner (FDPIC).'}
            </p>

            <h2>{locale === 'de' ? '13. Kontakt' : '13. Contact'}</h2>
            <p>
              Petertil Tax<br />
              E-Mail: info@petertiltax.ch
            </p>
          </div>
        </div>
      </section>
    </>
  )
}
