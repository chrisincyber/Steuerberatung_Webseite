'use client'

import { useI18n } from '@/lib/i18n/context'

export default function AGBPage() {
  const { t, locale } = useI18n()

  return (
    <>
      <section className="gradient-hero pt-32 pb-20 lg:pt-40 lg:pb-24 relative overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-heading text-4xl sm:text-5xl font-bold text-white">
            {t.agb.title}
          </h1>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-narrow">
          <div className="prose prose-navy max-w-none">
            <p className="text-sm text-navy-500">
              {locale === 'de' ? 'Stand: März 2026' : 'Last updated: March 2026'}
            </p>

            <h2>{locale === 'de' ? '1. Geltungsbereich' : '1. Scope'}</h2>
            <p>
              {locale === 'de'
                ? 'Diese Allgemeinen Geschäftsbedingungen (AGB) gelten für sämtliche Dienstleistungen, die über die Website petertiltax.ch angeboten und erbracht werden. Mit der Nutzung der Website und/oder der Beauftragung unserer Dienstleistungen akzeptieren Sie diese AGB.'
                : 'These Terms of Service apply to all services offered and provided through the website petertiltax.ch. By using the website and/or engaging our services, you accept these Terms of Service.'}
            </p>

            <h2>{locale === 'de' ? '2. Dienstleistungen' : '2. Services'}</h2>
            <p>
              {locale === 'de'
                ? 'Petertil Tax bietet die Erstellung und Einreichung von Steuererklärungen für natürliche Personen in der Schweiz an. Die Dienstleistung umfasst die Bearbeitung der vom Kunden bereitgestellten Unterlagen und die fristgerechte Einreichung bei der zuständigen Steuerbehörde.'
                : 'Petertil Tax offers the preparation and submission of tax declarations for individuals in Switzerland. The service includes processing the documents provided by the client and timely submission to the relevant tax authority.'}
            </p>

            <h2>{locale === 'de' ? '3. Vertragsabschluss' : '3. Contract Formation'}</h2>
            <p>
              {locale === 'de'
                ? 'Der Vertrag kommt durch die Bezahlung auf der Website zustande. Mit der Zahlung bestätigen Sie, dass Sie diese AGB gelesen und akzeptiert haben. Sie erhalten eine Auftragsbestätigung per E-Mail.'
                : 'The contract is formed upon payment on the website. By making the payment, you confirm that you have read and accepted these Terms of Service. You will receive an order confirmation by email.'}
            </p>

            <h2>{locale === 'de' ? '4. Preise & Zahlung' : '4. Prices & Payment'}</h2>
            <p>
              {locale === 'de'
                ? 'Alle Preise verstehen sich als Fixpreise in Schweizer Franken (CHF) inklusive Mehrwertsteuer, sofern anwendbar. Die Zahlung erfolgt über den Zahlungsanbieter Stripe. Es werden die gängigen Zahlungsmethoden akzeptiert. Der Preis richtet sich nach der gewählten Dienstleistung und wird vor Abschluss der Zahlung transparent angezeigt.'
                : 'All prices are fixed prices in Swiss Francs (CHF) including VAT where applicable. Payment is processed through the payment provider Stripe. Common payment methods are accepted. The price depends on the selected service and is transparently displayed before completing payment.'}
            </p>

            <h2>{locale === 'de' ? '5. Jahresabo' : '5. Annual Subscription'}</h2>
            <p>
              {locale === 'de'
                ? 'Das Jahresabo hat eine Mindestlaufzeit von 2 Jahren. Das Abonnement verlängert sich automatisch jeweils am 15. Februar um ein weiteres Jahr, sofern es nicht bis zum 10. Februar des jeweiligen Jahres schriftlich (per E-Mail an info@petertiltax.ch) gekündigt wird.'
                : 'The annual subscription has a minimum term of 2 years. The subscription automatically renews on February 15 of each year for an additional year, unless cancelled in writing (by email to info@petertiltax.ch) by February 10 of the respective year.'}
            </p>

            <h2>{locale === 'de' ? '6. Mitwirkungspflicht des Kunden' : '6. Client Obligations'}</h2>
            <p>
              {locale === 'de'
                ? 'Der Kunde ist verpflichtet, alle für die Steuererklärung erforderlichen Unterlagen vollständig, korrekt und fristgerecht zur Verfügung zu stellen. Petertil Tax haftet nicht für Nachteile, die aus unvollständigen oder fehlerhaften Angaben des Kunden resultieren.'
                : 'The client is obligated to provide all documents required for the tax declaration completely, correctly, and in a timely manner. Petertil Tax is not liable for disadvantages resulting from incomplete or incorrect information provided by the client.'}
            </p>

            <h2>{locale === 'de' ? '7. Haftung' : '7. Liability'}</h2>
            <p>
              {locale === 'de'
                ? 'Die Haftung von Petertil Tax ist auf die Höhe des bezahlten Dienstleistungshonorars beschränkt. Petertil Tax übernimmt keine Haftung für Entscheidungen der Steuerbehörden, nachträgliche Veranlagungsänderungen oder steuerliche Konsequenzen, die sich aus den vom Kunden bereitgestellten Informationen ergeben. Bei Vorsatz oder grober Fahrlässigkeit gelten die gesetzlichen Bestimmungen.'
                : 'The liability of Petertil Tax is limited to the amount of the service fee paid. Petertil Tax assumes no liability for decisions made by tax authorities, subsequent assessment changes, or tax consequences arising from information provided by the client. In cases of intent or gross negligence, statutory provisions apply.'}
            </p>

            <h2>{locale === 'de' ? '8. Kündigung' : '8. Termination'}</h2>
            <p>
              {locale === 'de'
                ? 'Der Kunde kann den Vertrag jederzeit per E-Mail an info@petertiltax.ch kündigen. Bereits bezahlte Dienstleistungen werden fertiggestellt. Eine Rückerstattung bereits bezahlter Beträge ist ausgeschlossen, sofern die Dienstleistung bereits begonnen wurde. Für das Jahresabo gelten die unter Punkt 5 genannten Kündigungsfristen.'
                : 'The client may terminate the contract at any time by email to info@petertiltax.ch. Services already paid for will be completed. Refunds of amounts already paid are excluded if the service has already commenced. For annual subscriptions, the cancellation deadlines specified in section 5 apply.'}
            </p>

            <h2>{locale === 'de' ? '9. Datenschutz' : '9. Data Protection'}</h2>
            <p>
              {locale === 'de'
                ? 'Die Bearbeitung personenbezogener Daten erfolgt gemäss unserer Datenschutzerklärung, die unter /privacy einsehbar ist. Mit der Nutzung unserer Dienstleistungen stimmen Sie der dort beschriebenen Datenbearbeitung zu.'
                : 'The processing of personal data is governed by our Privacy Policy, available at /privacy. By using our services, you consent to the data processing described therein.'}
            </p>

            <h2>{locale === 'de' ? '10. Anwendbares Recht & Gerichtsstand' : '10. Governing Law & Jurisdiction'}</h2>
            <p>
              {locale === 'de'
                ? 'Es gilt ausschliesslich schweizerisches Recht. Gerichtsstand ist Zürich, Schweiz.'
                : 'Swiss law applies exclusively. The place of jurisdiction is Zurich, Switzerland.'}
            </p>

            <h2>{locale === 'de' ? '11. Kontakt' : '11. Contact'}</h2>
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
