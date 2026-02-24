'use client'

import { useI18n } from '@/lib/i18n/context'

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
          </div>
        </div>
      </section>
    </>
  )
}
