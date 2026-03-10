'use client'

import { useI18n } from '@/lib/i18n/context'
import Link from 'next/link'

export default function ImpressumPage() {
  const { t, locale } = useI18n()

  return (
    <>
      <section className="gradient-hero pt-32 pb-20 lg:pt-40 lg:pb-24 relative overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-heading text-4xl sm:text-5xl font-bold text-white">
            {t.impressum.title}
          </h1>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-narrow">
          <div className="prose prose-navy max-w-none">
            <h2>{locale === 'de' ? 'Angaben gemäss Art. 3 UWG' : 'Information according to Art. 3 UWG'}</h2>

            <h3>{locale === 'de' ? 'Kontaktadresse' : 'Contact Address'}</h3>
            <p>
              Petertil Tax<br />
              [Strasse und Hausnummer]<br />
              [PLZ Ort]<br />
              {locale === 'de' ? 'Schweiz' : 'Switzerland'}
            </p>

            <h3>{locale === 'de' ? 'Kontakt' : 'Contact'}</h3>
            <p>
              {locale === 'de' ? 'Telefon' : 'Phone'}: +41 00 000 00 00<br />
              E-Mail: info@petertiltax.ch
            </p>

            <h3>{locale === 'de' ? 'Vertretungsberechtigte Person' : 'Authorized Representative'}</h3>
            <p>[Name des Inhabers]</p>

            <h3>{locale === 'de' ? 'Handelsregistereintrag' : 'Commercial Register Entry'}</h3>
            <p>
              {locale === 'de' ? 'Eingetragener Firmenname' : 'Registered Company Name'}: Petertil Tax<br />
              {locale === 'de' ? 'Handelsregister-Nummer' : 'Register Number'}: [CHE-xxx.xxx.xxx]<br />
              {locale === 'de' ? 'Handelsregisteramt' : 'Register Office'}: [Kanton]
            </p>

            <h3>{locale === 'de' ? 'Mehrwertsteuernummer' : 'VAT Number'}</h3>
            <p>[CHE-xxx.xxx.xxx MWST]</p>

            <h3>{locale === 'de' ? 'Haftungsausschluss' : 'Disclaimer'}</h3>
            <p>
              {locale === 'de'
                ? 'Der Autor übernimmt keinerlei Gewähr hinsichtlich der inhaltlichen Richtigkeit, Genauigkeit, Aktualität, Zuverlässigkeit und Vollständigkeit der Informationen. Haftungsansprüche gegen den Autor wegen Schäden materieller oder immaterieller Art, welche aus dem Zugriff oder der Nutzung bzw. Nichtnutzung der veröffentlichten Informationen, durch Missbrauch der Verbindung oder durch technische Störungen entstanden sind, werden ausgeschlossen.'
                : 'The author assumes no liability for the correctness, accuracy, timeliness, reliability, or completeness of the information. Liability claims against the author for material or immaterial damages resulting from access to, use or non-use of the published information, misuse of the connection, or technical malfunctions are excluded.'}
            </p>

            <h3>{locale === 'de' ? 'Urheberrechte' : 'Copyright'}</h3>
            <p>
              {locale === 'de'
                ? 'Die Urheber- und alle anderen Rechte an Inhalten, Bildern, Fotos oder anderen Dateien auf der Website gehören ausschliesslich der Firma Petertil Tax oder den speziell genannten Rechtsinhabern. Für die Reproduktion jeglicher Elemente ist die schriftliche Zustimmung der Urheberrechtsträger im Voraus einzuholen.'
                : 'The copyright and all other rights to content, images, photos, or other files on the website belong exclusively to Petertil Tax or the specifically named rights holders. Written consent of the copyright holders must be obtained in advance for the reproduction of any elements.'}
            </p>

            <hr className="my-12" />

            {/* AGB / Terms of Service */}
            <h2 id="agb">{locale === 'de' ? 'Allgemeine Geschäftsbedingungen (AGB)' : 'Terms and Conditions'}</h2>
            <p className="text-sm text-navy-500">
              {locale === 'de' ? 'Stand: März 2026' : 'Last updated: March 2026'}
            </p>

            <h3>{locale === 'de' ? '1. Geltungsbereich' : '1. Scope'}</h3>
            <p>
              {locale === 'de'
                ? 'Diese Allgemeinen Geschäftsbedingungen gelten für sämtliche Dienstleistungen, die über die Website petertiltax.ch erbracht werden, einschliesslich der Steuerberatung, der Erstellung von Steuererklärungen und der Nutzung des Steuerrechners.'
                : 'These terms and conditions apply to all services provided through the website petertiltax.ch, including tax consulting, preparation of tax declarations, and use of the tax calculator.'}
            </p>

            <h3>{locale === 'de' ? '2. Vertragsabschluss' : '2. Contract Formation'}</h3>
            <p>
              {locale === 'de'
                ? 'Der Vertrag kommt mit der Registrierung auf unserer Plattform und der Beauftragung einer Dienstleistung (z.B. Preisberechnung und Auftragserteilung) zustande. Die Nutzung des kostenlosen Steuerrechners begründet kein Vertragsverhältnis.'
                : 'The contract is formed upon registration on our platform and commissioning of a service (e.g., price calculation and order placement). Use of the free tax calculator does not constitute a contractual relationship.'}
            </p>

            <h3>{locale === 'de' ? '3. Leistungen' : '3. Services'}</h3>
            <p>
              {locale === 'de'
                ? 'Wir erbringen Dienstleistungen im Bereich der Steuerberatung und Steuererklärungserstellung für natürliche Personen in der Schweiz. Der Steuerrechner dient als unverbindliches Schätzungstool und stellt keine Steuerberatung dar.'
                : 'We provide services in the area of tax consulting and tax declaration preparation for individuals in Switzerland. The tax calculator serves as a non-binding estimation tool and does not constitute tax advice.'}
            </p>

            <h3>{locale === 'de' ? '4. Preise und Zahlung' : '4. Prices and Payment'}</h3>
            <p>
              {locale === 'de'
                ? 'Die Preise richten sich nach dem gewählten Leistungspaket und werden vor Auftragserteilung transparent kommuniziert. Die Zahlung erfolgt per Kreditkarte (Visa, Mastercard) über Stripe oder per Banküberweisung. Die Rechnung wird im Schweizer QR-Rechnungsformat ausgestellt.'
                : 'Prices are based on the selected service package and are communicated transparently before order placement. Payment is made by credit card (Visa, Mastercard) via Stripe or by bank transfer. Invoices are issued in Swiss QR bill format.'}
            </p>

            <h3>{locale === 'de' ? '5. Steuerrechner' : '5. Tax Calculator'}</h3>
            <p>
              {locale === 'de'
                ? 'Der Steuerrechner liefert unverbindliche Schätzungen auf Basis öffentlich verfügbarer Daten des ESTV-Steuerrechners. Die Ergebnisse sind ohne Gewähr und ersetzen keine professionelle Steuerberatung. Es besteht keine Verbindung zur ESTV oder zur Schweizerischen Eidgenossenschaft. Steuersätze und Abzüge können sich jährlich ändern.'
                : 'The tax calculator provides non-binding estimates based on publicly available data from the ESTV tax calculator. Results are provided without warranty and do not replace professional tax advice. There is no affiliation with ESTV or the Swiss Confederation. Tax rates and deductions may change annually.'}
            </p>

            <h3>{locale === 'de' ? '6. Mitwirkungspflicht' : '6. Client Obligations'}</h3>
            <p>
              {locale === 'de'
                ? 'Der Kunde ist verpflichtet, alle für die Steuererklärung relevanten Unterlagen vollständig und wahrheitsgemäss zur Verfügung zu stellen. Für Schäden, die durch unvollständige oder fehlerhafte Angaben entstehen, übernehmen wir keine Haftung.'
                : 'The client is obligated to provide all documents relevant to the tax declaration completely and truthfully. We assume no liability for damages resulting from incomplete or incorrect information.'}
            </p>

            <h3>{locale === 'de' ? '7. Haftung' : '7. Liability'}</h3>
            <p>
              {locale === 'de'
                ? 'Unsere Haftung beschränkt sich auf Vorsatz und grobe Fahrlässigkeit. Die Haftung für leichte Fahrlässigkeit ist im gesetzlich zulässigen Rahmen ausgeschlossen. Für die Ergebnisse des Steuerrechners wird keinerlei Haftung übernommen.'
                : 'Our liability is limited to intent and gross negligence. Liability for slight negligence is excluded to the extent permitted by law. No liability is assumed for the results of the tax calculator.'}
            </p>

            <h3>{locale === 'de' ? '8. Datenschutz' : '8. Data Protection'}</h3>
            <p>
              {locale === 'de'
                ? <>Es gilt unsere <Link href="/privacy" className="text-navy-600 underline">Datenschutzerklärung</Link>. Sämtliche Daten werden auf Servern in Westeuropa verarbeitet und gemäss dem schweizerischen Datenschutzgesetz (DSG) behandelt.</>
                : <>Our <Link href="/privacy" className="text-navy-600 underline">Privacy Policy</Link> applies. All data is processed on servers in Western Europe and handled in accordance with the Swiss Federal Act on Data Protection (FADP).</>}
            </p>

            <h3>{locale === 'de' ? '9. Geistiges Eigentum' : '9. Intellectual Property'}</h3>
            <p>
              {locale === 'de'
                ? 'Alle Inhalte der Website (Texte, Grafiken, Software) sind urheberrechtlich geschützt. Eine Vervielfältigung oder Verwendung ohne schriftliche Zustimmung ist untersagt.'
                : 'All content on the website (texts, graphics, software) is protected by copyright. Reproduction or use without written consent is prohibited.'}
            </p>

            <h3>{locale === 'de' ? '10. Anwendbares Recht und Gerichtsstand' : '10. Applicable Law and Jurisdiction'}</h3>
            <p>
              {locale === 'de'
                ? 'Es gilt ausschliesslich schweizerisches Recht. Gerichtsstand ist der Sitz von Petertil Tax in der Schweiz.'
                : 'Swiss law applies exclusively. The place of jurisdiction is the registered office of Petertil Tax in Switzerland.'}
            </p>
          </div>
        </div>
      </section>
    </>
  )
}
