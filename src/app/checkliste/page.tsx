'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useI18n } from '@/lib/i18n/context'
import { CheckSquare, FileText, Lightbulb, ArrowRight, Shield } from 'lucide-react'

const SITUATION_KEYS = ['angestellt', 'selbstaendig', 'verheiratet', 'immobilien', 'rentner', 'neuzuzueger'] as const

export default function ChecklistePage() {
  const { t } = useI18n()
  const [selectedSituations, setSelectedSituations] = useState<Set<string>>(new Set())

  const toggleSituation = (key: string) => {
    setSelectedSituations(prev => {
      const next = new Set(prev)
      if (next.has(key)) {
        next.delete(key)
      } else {
        next.add(key)
      }
      return next
    })
  }

  const additionalDocs = SITUATION_KEYS
    .filter(key => selectedSituations.has(key))
    .flatMap(key => (t.taxChecklist.additionalByType as unknown as Record<string, string[]>)[key] ?? [])

  const firstSelected = SITUATION_KEYS.find(key => selectedSituations.has(key))
  const currentTip = firstSelected
    ? (t.taxChecklist.tips as unknown as Record<string, string>)[firstSelected]
    : null

  return (
    <main>
      {/* Hero */}
      <section className="gradient-hero pt-24 pb-16 lg:pt-36 lg:pb-20 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-navy-700/20 blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-block px-4 py-1.5 rounded-full text-sm font-medium bg-white/10 text-white/90 backdrop-blur-sm border border-white/10 mb-6">
            {t.taxChecklist.badge}
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            {t.taxChecklist.title}
          </h1>
          <p className="text-lg text-white/70 max-w-2xl mx-auto">
            {t.taxChecklist.subtitle}
          </p>
        </div>
      </section>

      <div className="container-narrow py-10 lg:py-14 space-y-12">
        {/* Situation Toggle */}
        <section>
          <h2 className="text-xl font-semibold text-navy-900 mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-navy-600" />
            {t.taxChecklist.situationTitle}
          </h2>
          <div className="flex flex-wrap gap-3">
            {SITUATION_KEYS.map(key => {
              const isActive = selectedSituations.has(key)
              return (
                <button
                  key={key}
                  onClick={() => toggleSituation(key)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                    isActive
                      ? 'bg-navy-800 text-white border-navy-800'
                      : 'bg-white text-navy-700 border-navy-200 hover:bg-navy-50 hover:border-navy-300'
                  }`}
                >
                  {(t.taxChecklist.situations as Record<string, string>)[key]}
                </button>
              )
            })}
          </div>
        </section>

        {/* Essential Documents */}
        <section>
          <h2 className="text-xl font-semibold text-navy-900 mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-navy-600" />
            {t.taxChecklist.essentialTitle}
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {(t.taxChecklist.essential as unknown as string[]).map((doc, i) => (
              <div
                key={i}
                className="card p-4 flex items-start gap-3"
              >
                <CheckSquare className="w-5 h-5 text-trust-500 mt-0.5 flex-shrink-0" />
                <span className="text-navy-700 text-sm">{doc}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Additional Documents */}
        {additionalDocs.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold text-navy-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-gold-500" />
              {t.taxChecklist.additionalTitle}
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {additionalDocs.map((doc, i) => (
                <div
                  key={i}
                  className="card p-4 flex items-start gap-3"
                >
                  <CheckSquare className="w-5 h-5 text-gold-500 mt-0.5 flex-shrink-0" />
                  <span className="text-navy-700 text-sm">{doc}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Tip Box */}
        {currentTip && (
          <section className="rounded-xl border border-trust-200 bg-trust-50 p-4 flex items-start gap-3">
            <Lightbulb className="w-5 h-5 text-trust-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-trust-800 mb-1">{t.taxChecklist.tipTitle}</h3>
              <p className="text-trust-800 text-sm">{currentTip}</p>
            </div>
          </section>
        )}

        {/* CTA */}
      </div>

      <section className="px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
        <div className="container-wide">
          <div className="relative overflow-hidden rounded-2xl gradient-navy p-6 sm:p-10 lg:p-12">
            <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="relative text-center max-w-2xl mx-auto">
              <h2 className="font-heading text-xl sm:text-2xl lg:text-3xl font-bold dark-text-primary mb-5">
                {t.taxChecklist.ctaTitle}
              </h2>
              <p className="dark-text-secondary mb-6">{t.taxChecklist.ctaText}</p>
              <span className="inline-block px-3 py-1 rounded-full bg-white/10 text-white/90 text-sm font-medium border border-white/10 mb-4">
                {t.discount.hint}
              </span>
              <br />
              <Link href="/pricing" className="btn-white !px-8 !py-3 !text-sm group">
                {t.hero.cta}
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Legal disclaimer */}
      <section className="bg-navy-50 border-t border-navy-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-navy-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-navy-700 mb-1">{t.toolDisclaimer.title}</h3>
              <p className="text-xs text-navy-500 leading-relaxed">{t.toolDisclaimer.text}</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
