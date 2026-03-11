'use client'

import Link from 'next/link'
import { useI18n } from '@/lib/i18n/context'
import { cantons, cantonSlugs } from '@/lib/swiss-data'
import { ArrowRight } from 'lucide-react'

export default function KantonsPage() {
  const { locale } = useI18n()

  return (
    <>
      <section className="gradient-hero pt-24 pb-12 lg:pt-32 lg:pb-14 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-navy-700/20 blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-heading text-3xl sm:text-4xl font-bold dark-text-primary">
            {locale === 'de' ? 'Alle Kantone' : 'All Cantons'}
          </h1>
          <p className="mt-2 text-base dark-text-secondary max-w-2xl mx-auto">
            {locale === 'de'
              ? 'Wählen Sie Ihren Kanton für Details zu Fristen, Steuerfuss und unserer Dienstleistung.'
              : 'Select your canton for details on deadlines, tax rates, and our services.'}
          </p>
        </div>
      </section>

      <section className="px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {cantons.map((c) => {
              const slug = cantonSlugs[c.code]
              return (
                <Link
                  key={c.code}
                  href={`/kanton/${slug}`}
                  className="group flex items-center justify-between px-4 py-3 rounded-lg border border-navy-100 hover:border-navy-300 hover:bg-navy-50 transition-all"
                >
                  <div>
                    <span className="text-sm font-semibold text-navy-900">
                      {c.name[locale]}
                    </span>
                    <span className="ml-1.5 text-xs text-navy-400">{c.code}</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-navy-300 group-hover:text-navy-600 group-hover:translate-x-0.5 transition-all" />
                </Link>
              )
            })}
          </div>
        </div>
      </section>
    </>
  )
}
