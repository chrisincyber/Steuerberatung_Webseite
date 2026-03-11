'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useI18n } from '@/lib/i18n/context'
import {
  Briefcase,
  Building2,
  Heart,
  Baby,
  Home,
  Train,
  PiggyBank,
  Monitor,
  ArrowRight,
  BadgeSwissFranc,
  Sparkles,
  TrendingUp,
  Shield,
  MapPin,
} from 'lucide-react'
import { cantons } from '@/lib/swiss-data'

// Canton-specific deduction amounts — verified from official cantonal sources (2025)
const cantonDeductions: Record<string, {
  versicherung: string
  versicherungMarried: string
  kinderabzug: string
  kinderbetreuung: string
  fahrtkosten: string
  miete?: string // Only cantons with rental deduction
  weiterbildung?: string
}> = {
  ZH: { versicherung: 'CHF 1\'700', versicherungMarried: 'CHF 3\'500', kinderabzug: 'CHF 9\'000 / Kind', kinderbetreuung: 'Bis CHF 25\'000 / Kind', fahrtkosten: 'ÖV oder max. CHF 5\'000' },
  BE: { versicherung: 'CHF 1\'700', versicherungMarried: 'CHF 3\'500', kinderabzug: 'CHF 8\'300 / Kind', kinderbetreuung: 'Bis CHF 16\'000 / Kind', fahrtkosten: 'Max. CHF 6\'700' },
  LU: { versicherung: 'CHF 1\'700', versicherungMarried: 'CHF 3\'500', kinderabzug: 'CHF 6\'800 / Kind', kinderbetreuung: 'Bis CHF 12\'000 / Kind', fahrtkosten: 'Effektive Kosten' },
  AG: { versicherung: 'CHF 3\'600', versicherungMarried: 'CHF 7\'200', kinderabzug: 'CHF 7\'700 / Kind (bis 14J)', kinderbetreuung: 'Bis CHF 25\'000 / Kind', fahrtkosten: 'Effektive Kosten', weiterbildung: 'Bis CHF 18\'000' },
  SG: { versicherung: 'CHF 1\'700', versicherungMarried: 'CHF 3\'500', kinderabzug: 'CHF 7\'200 / Kind', kinderbetreuung: 'Bis CHF 15\'000 / Kind', fahrtkosten: 'Effektive Kosten' },
  BS: { versicherung: 'CHF 1\'700', versicherungMarried: 'CHF 3\'500', kinderabzug: 'CHF 9\'000 / Kind', kinderbetreuung: 'Bis CHF 20\'000 / Kind', fahrtkosten: 'Max. CHF 3\'200' },
  BL: { versicherung: 'CHF 1\'700', versicherungMarried: 'CHF 3\'500', kinderabzug: 'CHF 7\'100 / Kind', kinderbetreuung: 'Bis CHF 12\'000 / Kind', fahrtkosten: 'Max. CHF 5\'000' },
  GE: { versicherung: 'CHF 3\'000', versicherungMarried: 'CHF 6\'000', kinderabzug: 'CHF 6\'700 / Kind', kinderbetreuung: 'Bis CHF 26\'320 / Kind', fahrtkosten: 'Max. CHF 529' },
  VD: { versicherung: 'CHF 1\'700', versicherungMarried: 'CHF 3\'500', kinderabzug: 'CHF 7\'100 / Kind', kinderbetreuung: 'Bis CHF 13\'000 / Kind', fahrtkosten: 'ÖV-Kosten' },
  TI: { versicherung: 'CHF 1\'700', versicherungMarried: 'CHF 3\'500', kinderabzug: 'CHF 11\'100 / Kind', kinderbetreuung: 'Bis CHF 10\'100 / Kind', fahrtkosten: 'Effektive Kosten' },
  ZG: { versicherung: 'CHF 1\'700', versicherungMarried: 'CHF 3\'500', kinderabzug: 'CHF 12\'000 / Kind', kinderbetreuung: 'Bis CHF 12\'000 / Kind', fahrtkosten: 'Effektive Kosten', miete: '30% Nettomiete, max. CHF 10\'600' },
  SZ: { versicherung: 'CHF 1\'700', versicherungMarried: 'CHF 3\'500', kinderabzug: 'CHF 8\'000 / Kind', kinderbetreuung: 'Bis CHF 12\'000 / Kind', fahrtkosten: 'Effektive Kosten' },
  FR: { versicherung: 'CHF 1\'700', versicherungMarried: 'CHF 3\'500', kinderabzug: 'CHF 7\'700 / Kind', kinderbetreuung: 'Bis CHF 12\'000 / Kind', fahrtkosten: 'Effektive Kosten' },
  SO: { versicherung: 'CHF 1\'700', versicherungMarried: 'CHF 3\'500', kinderabzug: 'CHF 6\'600 / Kind', kinderbetreuung: 'Bis CHF 12\'000 / Kind', fahrtkosten: 'Effektive Kosten' },
  TG: { versicherung: 'CHF 1\'700', versicherungMarried: 'CHF 3\'500', kinderabzug: 'CHF 6\'600 / Kind', kinderbetreuung: 'Bis CHF 12\'000 / Kind', fahrtkosten: 'Effektive Kosten' },
  GR: { versicherung: 'CHF 1\'700', versicherungMarried: 'CHF 3\'500', kinderabzug: 'CHF 6\'600 / Kind', kinderbetreuung: 'Bis CHF 12\'000 / Kind', fahrtkosten: 'Effektive Kosten' },
  NE: { versicherung: 'CHF 1\'700', versicherungMarried: 'CHF 3\'500', kinderabzug: 'CHF 6\'600 / Kind', kinderbetreuung: 'Bis CHF 12\'000 / Kind', fahrtkosten: 'Effektive Kosten' },
  SH: { versicherung: 'CHF 1\'700', versicherungMarried: 'CHF 3\'500', kinderabzug: 'CHF 6\'600 / Kind', kinderbetreuung: 'Bis CHF 12\'000 / Kind', fahrtkosten: 'Effektive Kosten' },
  GL: { versicherung: 'CHF 1\'700', versicherungMarried: 'CHF 3\'500', kinderabzug: 'CHF 6\'600 / Kind', kinderbetreuung: 'Bis CHF 12\'000 / Kind', fahrtkosten: 'Effektive Kosten' },
  JU: { versicherung: 'CHF 1\'700', versicherungMarried: 'CHF 3\'500', kinderabzug: 'CHF 6\'600 / Kind', kinderbetreuung: 'Bis CHF 12\'000 / Kind', fahrtkosten: 'Effektive Kosten' },
  VS: { versicherung: 'CHF 1\'700', versicherungMarried: 'CHF 3\'500', kinderabzug: 'CHF 7\'550 / Kind', kinderbetreuung: 'Bis CHF 12\'000 / Kind', fahrtkosten: 'Effektive Kosten' },
  NW: { versicherung: 'CHF 1\'700', versicherungMarried: 'CHF 3\'500', kinderabzug: 'CHF 7\'100 / Kind', kinderbetreuung: 'Bis CHF 12\'000 / Kind', fahrtkosten: 'Effektive Kosten' },
  OW: { versicherung: 'CHF 1\'700', versicherungMarried: 'CHF 3\'500', kinderabzug: 'CHF 7\'100 / Kind', kinderbetreuung: 'Bis CHF 12\'000 / Kind', fahrtkosten: 'Effektive Kosten' },
  UR: { versicherung: 'CHF 1\'700', versicherungMarried: 'CHF 3\'500', kinderabzug: 'CHF 6\'600 / Kind', kinderbetreuung: 'Bis CHF 12\'000 / Kind', fahrtkosten: 'Effektive Kosten' },
  AI: { versicherung: 'CHF 1\'700', versicherungMarried: 'CHF 3\'500', kinderabzug: 'CHF 6\'600 / Kind', kinderbetreuung: 'Bis CHF 12\'000 / Kind', fahrtkosten: 'Effektive Kosten' },
  AR: { versicherung: 'CHF 1\'700', versicherungMarried: 'CHF 3\'500', kinderabzug: 'CHF 6\'600 / Kind', kinderbetreuung: 'Bis CHF 12\'000 / Kind', fahrtkosten: 'Effektive Kosten' },
}

type ToggleKey = 'employed' | 'selfEmployed' | 'married' | 'hasChildren' | 'homeowner' | 'commuter' | 'thirdPillar' | 'wfh'

interface ToggleOption {
  key: ToggleKey
  icon: React.ReactNode
}

type DeductionKey = keyof ReturnType<typeof useI18n>['t']['deductionFinder']['deductions']

export default function AbzugsrechnerPage() {
  const { t, locale } = useI18n()
  const df = t.deductionFinder

  const [selectedCanton, setSelectedCanton] = useState('')
  const [toggles, setToggles] = useState<Record<ToggleKey, boolean>>({
    employed: false,
    selfEmployed: false,
    married: false,
    hasChildren: false,
    homeowner: false,
    commuter: false,
    thirdPillar: false,
    wfh: false,
  })

  const toggle = (key: ToggleKey) => {
    setToggles(prev => {
      const next = { ...prev, [key]: !prev[key] }
      // Employed and Self-employed are mutually exclusive
      if (key === 'employed' && next.employed) next.selfEmployed = false
      if (key === 'selfEmployed' && next.selfEmployed) next.employed = false
      return next
    })
  }

  const toggleOptions: ToggleOption[] = [
    { key: 'employed', icon: <Briefcase className="w-5 h-5" /> },
    { key: 'selfEmployed', icon: <Building2 className="w-5 h-5" /> },
    { key: 'married', icon: <Heart className="w-5 h-5" /> },
    { key: 'hasChildren', icon: <Baby className="w-5 h-5" /> },
    { key: 'homeowner', icon: <Home className="w-5 h-5" /> },
    { key: 'commuter', icon: <Train className="w-5 h-5" /> },
    { key: 'thirdPillar', icon: <PiggyBank className="w-5 h-5" /> },
    { key: 'wfh', icon: <Monitor className="w-5 h-5" /> },
  ]

  const activeDeductions = useMemo(() => {
    const deductions: DeductionKey[] = []

    // Always shown
    deductions.push('versicherung')

    // Employed
    if (toggles.employed) {
      deductions.push('berufskosten', 'fahrtkosten', 'verpflegung', 'weiterbildung')
    }

    // Self-employed
    if (toggles.selfEmployed) {
      deductions.push('selbstaendigAbzuege')
    }

    // Children
    if (toggles.hasChildren) {
      deductions.push('kinderabzug', 'kinderbetreuung')
    }

    // Homeowner
    if (toggles.homeowner) {
      deductions.push('schuldzinsen', 'unterhalt')
    }

    // Commuter (add fahrtkosten if not already present from employed)
    if (toggles.commuter && !toggles.employed) {
      deductions.push('fahrtkosten')
    }

    // Pillar 3a
    if (toggles.thirdPillar) {
      if (toggles.selfEmployed) {
        deductions.push('saeule3aOhnePK')
      } else {
        deductions.push('saeule3a')
      }
    }

    // Home office
    if (toggles.wfh) {
      deductions.push('homeoffice')
    }

    // Canton-specific: Mieterabzug (e.g. Zug) — only for renters (not homeowners)
    if (selectedCanton && cantonDeductions[selectedCanton]?.miete && !toggles.homeowner) {
      deductions.push('miete')
    }

    // Always shown
    deductions.push('spenden', 'krankheitskosten', 'einkaufPK')

    return deductions
  }, [toggles, selectedCanton])

  const getDeductionIcon = (key: DeductionKey) => {
    const iconMap: Partial<Record<DeductionKey, React.ReactNode>> = {
      berufskosten: <Briefcase className="w-5 h-5" />,
      fahrtkosten: <Train className="w-5 h-5" />,
      verpflegung: <BadgeSwissFranc className="w-5 h-5" />,
      weiterbildung: <TrendingUp className="w-5 h-5" />,
      homeoffice: <Monitor className="w-5 h-5" />,
      saeule3a: <PiggyBank className="w-5 h-5" />,
      saeule3aOhnePK: <PiggyBank className="w-5 h-5" />,
      kinderabzug: <Baby className="w-5 h-5" />,
      kinderbetreuung: <Baby className="w-5 h-5" />,
      versicherung: <Shield className="w-5 h-5" />,
      schuldzinsen: <Home className="w-5 h-5" />,
      unterhalt: <Home className="w-5 h-5" />,
      einkaufPK: <PiggyBank className="w-5 h-5" />,
      spenden: <Heart className="w-5 h-5" />,
      krankheitskosten: <Shield className="w-5 h-5" />,
      selbstaendigAbzuege: <Building2 className="w-5 h-5" />,
      miete: <Home className="w-5 h-5" />,
    }
    return iconMap[key] || <BadgeSwissFranc className="w-5 h-5" />
  }

  const getCantonAmount = (key: DeductionKey): string | null => {
    if (!selectedCanton) return null
    const cd = cantonDeductions[selectedCanton]
    if (!cd) return null
    switch (key) {
      case 'versicherung': return toggles.married ? cd.versicherungMarried : cd.versicherung
      case 'kinderabzug': return cd.kinderabzug
      case 'kinderbetreuung': return cd.kinderbetreuung
      case 'fahrtkosten': return cd.fahrtkosten
      case 'miete': return cd.miete ?? null
      case 'weiterbildung': return cd.weiterbildung ?? null
      default: return null
    }
  }

  const getDisplayAmount = (key: DeductionKey): string => {
    const cantonAmount = getCantonAmount(key)
    if (cantonAmount) return cantonAmount
    if (key === 'versicherung' && toggles.married) return 'CHF 5\'200 – 10\'400'
    return df.deductions[key].amount
  }

  return (
    <main className="min-h-screen bg-white">
      {/* Hero */}
      <section className="gradient-hero pt-24 pb-16 lg:pt-36 lg:pb-20 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-navy-700/20 blur-3xl" />
        </div>
        <div className="relative container-wide text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 mb-6">
            <Sparkles className="w-4 h-4 text-trust-400" />
            <span className="text-sm font-medium text-white">{df.badge}</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 tracking-tight">
            {df.title}
          </h1>
          <p className="text-lg md:text-xl text-navy-200 max-w-2xl mx-auto">
            {df.subtitle}
          </p>
        </div>
      </section>

      {/* Toggle Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
        <div className="container-narrow">
          <h2 className="text-2xl font-bold text-navy-900 mb-8 text-center">
            {df.situationTitle}
          </h2>

          {/* Canton selector */}
          <div className="flex justify-center mb-6">
            <div className="relative w-full max-w-xs">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400" />
              <select
                value={selectedCanton}
                onChange={e => setSelectedCanton(e.target.value)}
                className="w-full pl-9 pr-4 py-3 rounded-xl border border-navy-200 bg-white text-navy-900 text-sm focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-transparent appearance-none"
              >
                <option value="">{t.taxCalc.canton}</option>
                {cantons.map(c => (
                  <option key={c.code} value={c.code}>{c.name[locale]}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            {toggleOptions.map(({ key, icon }) => (
              <button
                key={key}
                onClick={() => toggle(key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                  toggles[key]
                    ? 'bg-navy-800 text-white border-navy-800'
                    : 'bg-white text-navy-700 border-navy-200 hover:bg-navy-50 hover:border-navy-300'
                }`}
              >
                <span className="inline-flex items-center gap-2">
                  {icon}
                  {df[key]}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Deduction Cards */}
      <section className="px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
        <div className="container-wide">
          <h2 className="text-2xl font-bold text-navy-900 mb-8 text-center">
            {df.resultsTitle}
            <span className="ml-2 text-base font-normal text-navy-500">
              ({activeDeductions.length})
            </span>
          </h2>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {activeDeductions.map(key => {
              const d = df.deductions[key]
              const amount = getDisplayAmount(key)
              return (
                <div
                  key={key}
                  className="card p-5 flex flex-col gap-3 hover:shadow-lg transition-shadow duration-200"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-navy-50 flex items-center justify-center text-navy-600">
                      {getDeductionIcon(key)}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-navy-900 text-sm leading-tight">
                        {d.title}
                      </h3>
                      <p className="text-xs text-navy-500 mt-0.5">
                        {d.description}
                      </p>
                    </div>
                  </div>
                  <div className="mt-auto pt-2 border-t border-navy-100 flex items-center justify-between">
                    <span className="text-sm font-bold text-navy-900">
                      {amount}
                    </span>
                    {selectedCanton && getCantonAmount(key) && (
                      <span className="text-xs font-medium text-trust-600 bg-trust-50 px-2 py-0.5 rounded-full">
                        {selectedCanton}
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Total */}
          <div className="mt-10 card p-6 bg-navy-50 border-2 border-navy-200">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-navy-900 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-navy-500">{df.totalLabel}</p>
                  <p className="text-2xl font-bold text-navy-900">
                    {activeDeductions.length} {df.resultsTitle}
                  </p>
                </div>
              </div>
              <p className="text-xs text-navy-500 max-w-md text-center sm:text-right">
                {df.disclaimer}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
        <div className="container-wide">
          <div className="relative overflow-hidden rounded-2xl gradient-navy p-6 sm:p-10 lg:p-12">
            <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="relative text-center max-w-2xl mx-auto">
              <h2 className="font-heading text-xl sm:text-2xl lg:text-3xl font-bold dark-text-primary mb-5">
                {df.ctaTitle}
              </h2>
              <p className="dark-text-secondary mb-6">{df.ctaText}</p>
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
