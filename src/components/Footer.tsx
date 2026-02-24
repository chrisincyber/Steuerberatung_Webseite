'use client'

import Link from 'next/link'
import { useI18n } from '@/lib/i18n/context'
import { Mail, Phone, MapPin } from 'lucide-react'

export default function Footer() {
  const { t } = useI18n()
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-navy-950 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gold-500 flex items-center justify-center text-white font-bold text-lg">
                PT
              </div>
              <div>
                <span className="font-heading font-bold text-lg text-white">Petertil</span>
                <span className="font-heading font-bold text-lg text-gold-400 ml-1">Tax</span>
              </div>
            </div>
            <p className="dark-text-tertiary text-sm leading-relaxed">
              {t.footer.tagline}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-heading font-semibold text-sm uppercase tracking-wider dark-text-muted mb-4">
              {t.footer.quickLinks}
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="/about" className="dark-text-tertiary hover:text-white transition-colors text-sm">
                  {t.nav.about}
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="dark-text-tertiary hover:text-white transition-colors text-sm">
                  {t.nav.pricing}
                </Link>
              </li>
              <li>
                <Link href="/tax-calculator" className="dark-text-tertiary hover:text-white transition-colors text-sm">
                  {t.nav.taxCalculator}
                </Link>
              </li>
              <li>
                <Link href="/faq" className="dark-text-tertiary hover:text-white transition-colors text-sm">
                  {t.nav.faq}
                </Link>
              </li>
              <li>
                <Link href="/deadlines" className="dark-text-tertiary hover:text-white transition-colors text-sm">
                  {t.nav.deadlines}
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-heading font-semibold text-sm uppercase tracking-wider dark-text-muted mb-4">
              {t.footer.legal}
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="/impressum" className="dark-text-tertiary hover:text-white transition-colors text-sm">
                  {t.footer.impressum}
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="dark-text-tertiary hover:text-white transition-colors text-sm">
                  {t.footer.privacy}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-heading font-semibold text-sm uppercase tracking-wider dark-text-muted mb-4">
              {t.footer.contact}
            </h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 dark-text-tertiary text-sm">
                <Mail className="w-4 h-4 dark-text-muted" />
                <a href="mailto:info@petertiltax.ch" className="hover:text-white transition-colors">
                  info@petertiltax.ch
                </a>
              </li>
              <li className="flex items-center gap-2 dark-text-tertiary text-sm">
                <Phone className="w-4 h-4 dark-text-muted" />
                <a href="tel:+41000000000" className="hover:text-white transition-colors">
                  +41 00 000 00 00
                </a>
              </li>
              <li className="flex items-start gap-2 dark-text-tertiary text-sm">
                <MapPin className="w-4 h-4 dark-text-muted mt-0.5" />
                <span>Schweiz</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-navy-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="dark-text-muted text-sm">
            &copy; {currentYear} {t.footer.company}. {t.footer.rights}
          </p>
          <div className="flex items-center gap-4 dark-text-muted text-xs">
            <Link href="/impressum" className="hover:text-white transition-colors">
              {t.footer.impressum}
            </Link>
            <span>|</span>
            <Link href="/privacy" className="hover:text-white transition-colors">
              {t.footer.privacy}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
