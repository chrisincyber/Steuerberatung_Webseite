'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useI18n } from '@/lib/i18n/context'
import { cantons, calculateSwissTax } from '@/lib/swiss-data'
import { Calculator, ArrowRight, Shield, AlertCircle, CheckCircle } from 'lucide-react'

type PermitType = 'B' | 'C' | 'L'

function formatCHF(amount: number): string {
  return 'CHF ' + new Intl.NumberFormat('de-CH', { minimumFractionDigits: 0 }).format(Math.round(amount))
}

export default function QuellensteuerPage() {
  const { t, locale } = useI18n()
  const w = t.withholding

  const [grossIncome, setGrossIncome] = useState(80000)
  const [cantonCode, setCantonCode] = useState('ZH')
  const [permitType, setPermitType] = useState<PermitType>('B')
  const [married, setMarried] = useState(false)
  const [children, setChildren] = useState(0)
  const [churchTax, setChurchTax] = useState(false)

  const results = useMemo(() => {
    const canton = cantons.find(c => c.code === cantonCode)
    if (!canton || grossIncome <= 0) return null

    // Withholding tax calculation (simplified tariff)
    let withholdingRate = canton.taxMultiplier * 0.12
    if (married) withholdingRate -= 0.02
    withholdingRate -= children * 0.01
    if (churchTax) withholdingRate += 0.005
    withholdingRate = Math.max(withholdingRate, 0.01)

    const withholdingTax = Math.round(grossIncome * withholdingRate)

    // Ordinary tax via calculateSwissTax
    const ordinaryResult = calculateSwissTax({
      grossIncome,
      cantonCode,
      maritalStatus: married ? 'married' : 'single',
      children,
      deductions3a: 0,
      commuting: 0,
      otherDeductions: 0,
    })

    const ordinaryTax = ordinaryResult?.totalTax ?? 0
    const difference = withholdingTax - ordinaryTax
    const isMandatory = grossIncome > 120000
    const isCPermit = permitType === 'C'

    return {
      withholdingTax,
      withholdingRate: withholdingRate * 100,
      ordinaryTax,
      difference,
      isMandatory,
      isCPermit,
      worthFiling: difference > 500,
    }
  }, [grossIncome, cantonCode, permitType, married, children, churchTax])

  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="gradient-hero pt-24 pb-16 lg:pt-36 lg:pb-20 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-navy-700/20 blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6">
            <Calculator className="w-4 h-4 text-trust-400" />
            <span className="text-sm font-medium text-white/90">{w.badge}</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 tracking-tight">
            {w.title}
          </h1>
          <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto">
            {w.subtitle}
          </p>
        </div>
      </section>

      {/* Calculator */}
      <section className="py-10 lg:py-14">
        <div className="container-narrow">
          <div className="grid lg:grid-cols-2 gap-8">

            {/* Input Form */}
            <div className="card p-6 lg:p-8">
              <h2 className="text-xl font-bold text-navy-900 mb-6 flex items-center gap-2">
                <Calculator className="w-5 h-5 text-navy-700" />
                {w.title}
              </h2>

              <div className="space-y-5">
                {/* Gross Income */}
                <div>
                  <label className="block text-sm font-medium text-navy-600 mb-1.5">
                    {w.grossIncome}
                  </label>
                  <input
                    type="number"
                    value={grossIncome}
                    onChange={(e) => setGrossIncome(Number(e.target.value) || 0)}
                    min={0}
                    step={1000}
                    className="w-full px-4 py-3 rounded-xl border border-navy-200 bg-white text-navy-900 focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                  />
                </div>

                {/* Canton */}
                <div>
                  <label className="block text-sm font-medium text-navy-600 mb-1.5">
                    {w.canton}
                  </label>
                  <select
                    value={cantonCode}
                    onChange={(e) => setCantonCode(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-navy-200 bg-white text-navy-900 focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                  >
                    {cantons.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.name[locale]} ({c.code})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Permit Type */}
                <div>
                  <label className="block text-sm font-medium text-navy-600 mb-1.5">
                    {w.permitType}
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['B', 'C', 'L'] as const).map((p) => (
                      <button
                        key={p}
                        onClick={() => setPermitType(p)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                          permitType === p
                            ? 'bg-navy-800 text-white border-navy-800'
                            : 'bg-white text-navy-700 border-navy-200 hover:bg-navy-50 hover:border-navy-300'
                        }`}
                      >
                        {w.permits[p.toLowerCase() as 'b' | 'c' | 'l']}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Marital Status */}
                <div>
                  <label className="block text-sm font-medium text-navy-600 mb-1.5">
                    {w.maritalStatus}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setMarried(false)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                        !married
                          ? 'bg-navy-800 text-white border-navy-800'
                          : 'bg-white text-navy-700 border-navy-200 hover:bg-navy-50 hover:border-navy-300'
                      }`}
                    >
                      {w.single}
                    </button>
                    <button
                      onClick={() => setMarried(true)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                        married
                          ? 'bg-navy-800 text-white border-navy-800'
                          : 'bg-white text-navy-700 border-navy-200 hover:bg-navy-50 hover:border-navy-300'
                      }`}
                    >
                      {w.married}
                    </button>
                  </div>
                </div>

                {/* Children */}
                <div>
                  <label className="block text-sm font-medium text-navy-600 mb-1.5">
                    {w.children}
                  </label>
                  <div className="flex gap-2">
                    {[0, 1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        onClick={() => setChildren(n)}
                        className={`w-10 h-10 rounded-lg text-sm font-medium border transition-colors ${
                          children === n
                            ? 'bg-navy-800 text-white border-navy-800'
                            : 'bg-white text-navy-700 border-navy-200 hover:bg-navy-50 hover:border-navy-300'
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Church Tax */}
                <div>
                  <label className="block text-sm font-medium text-navy-600 mb-1.5">
                    {w.churchTax}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setChurchTax(true)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                        churchTax
                          ? 'bg-navy-800 text-white border-navy-800'
                          : 'bg-white text-navy-700 border-navy-200 hover:bg-navy-50 hover:border-navy-300'
                      }`}
                    >
                      {w.yes}
                    </button>
                    <button
                      onClick={() => setChurchTax(false)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                        !churchTax
                          ? 'bg-navy-800 text-white border-navy-800'
                          : 'bg-white text-navy-700 border-navy-200 hover:bg-navy-50 hover:border-navy-300'
                      }`}
                    >
                      {w.no}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Results */}
            <div className="space-y-6">
              {results && (
                <>
                  <div className="card p-6 lg:p-8">
                    <h2 className="text-xl font-bold text-navy-900 mb-6 flex items-center gap-2">
                      <Shield className="w-5 h-5 text-navy-700" />
                      {w.resultsTitle}
                    </h2>

                    <div className="space-y-4">
                      {/* Withholding Tax */}
                      <div className="flex justify-between items-center py-3 border-b border-navy-100">
                        <span className="text-navy-600 text-sm">{w.withholdingTax}</span>
                        <span className="font-semibold text-navy-900 text-lg">
                          {formatCHF(results.withholdingTax)}
                        </span>
                      </div>

                      {/* Withholding Rate */}
                      <div className="flex justify-between items-center py-3 border-b border-navy-100">
                        <span className="text-navy-600 text-sm">{w.withholdingRate}</span>
                        <span className="font-semibold text-navy-900">
                          {results.withholdingRate.toFixed(1)}%
                        </span>
                      </div>

                      {/* Ordinary Tax */}
                      <div className="flex justify-between items-center py-3 border-b border-navy-100">
                        <span className="text-navy-600 text-sm">{w.ordinaryTax}</span>
                        <span className="font-semibold text-navy-900 text-lg">
                          {formatCHF(results.ordinaryTax)}
                        </span>
                      </div>

                      {/* Difference */}
                      <div className="flex justify-between items-center py-3">
                        <span className="text-navy-600 text-sm font-medium">{w.difference}</span>
                        <span className={`font-bold text-lg ${results.difference > 0 ? 'text-trust-600' : 'text-gold-600'}`}>
                          {results.difference > 0 ? '+' : ''}{formatCHF(results.difference)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Recommendation */}
                  <div
                    className={`p-4 rounded-xl border-l-4 ${
                      results.isCPermit
                        ? 'border-l-gold-500 bg-gold-50'
                        : results.isMandatory
                        ? 'border-l-gold-500 bg-gold-50'
                        : results.worthFiling
                        ? 'border-l-trust-500 bg-trust-50'
                        : 'border-l-gold-500 bg-gold-50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {results.isCPermit || !results.worthFiling || results.isMandatory ? (
                        <AlertCircle className="w-5 h-5 text-gold-600 mt-0.5 shrink-0" />
                      ) : (
                        <CheckCircle className="w-5 h-5 text-trust-600 mt-0.5 shrink-0" />
                      )}
                      <div>
                        <h3 className="font-semibold text-navy-900 mb-1">{w.recommendation}</h3>
                        <p className="text-sm text-navy-600">
                          {results.isCPermit
                            ? w.recommendCPermit
                            : results.worthFiling
                            ? w.recommendFile.replace('{amount}', formatCHF(results.difference).replace('CHF ', ''))
                            : w.recommendNoFile}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Mandatory threshold note */}
                  {results.isMandatory && (
                    <div className="border-l-4 border-l-navy-500 bg-navy-50 p-4 rounded-xl">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-navy-600 mt-0.5 shrink-0" />
                        <p className="text-sm text-navy-600">{w.note}</p>
                      </div>
                    </div>
                  )}

                  {/* Disclaimer */}
                  <p className="text-xs text-navy-500 text-center">{w.disclaimer}</p>
                </>
              )}
            </div>
          </div>

          {/* CTA */}
          <section className="px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
            <div className="container-wide">
              <div className="relative overflow-hidden rounded-2xl gradient-navy p-6 sm:p-10 lg:p-12">
                <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="relative text-center max-w-2xl mx-auto">
                  <h2 className="font-heading text-xl sm:text-2xl lg:text-3xl font-bold dark-text-primary mb-5">
                    {t.withholding.ctaTitle}
                  </h2>
                  <p className="dark-text-secondary mb-6">{t.withholding.ctaText}</p>
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
        </div>
      </section>
    </main>
  )
}
