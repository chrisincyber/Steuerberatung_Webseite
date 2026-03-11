'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useI18n } from '@/lib/i18n/context'
import { cantons, calculateSwissTax } from '@/lib/swiss-data'
import { BarChart3, ArrowRight, Shield, TrendingDown, TrendingUp, MapPin } from 'lucide-react'

type MaritalStatus = 'single' | 'married'

function formatCHF(amount: number): string {
  return 'CHF ' + new Intl.NumberFormat('de-CH', { minimumFractionDigits: 0 }).format(amount)
}

export default function SteuervergleichPage() {
  const { t, locale } = useI18n()

  const [grossIncome, setGrossIncome] = useState(100000)
  const [maritalStatus, setMaritalStatus] = useState<MaritalStatus>('single')
  const [children, setChildren] = useState(0)

  const results = useMemo(() => {
    const calculated = cantons
      .map((canton) => {
        const result = calculateSwissTax({
          grossIncome,
          cantonCode: canton.code,
          maritalStatus,
          children,
          deductions3a: 0,
          commuting: 0,
          otherDeductions: 0,
        })
        if (!result) return null
        return {
          code: canton.code,
          name: canton.name[locale],
          totalTax: result.totalTax,
          effectiveRate: result.effectiveRate,
        }
      })
      .filter(Boolean) as { code: string; name: string; totalTax: number; effectiveRate: number }[]

    calculated.sort((a, b) => a.totalTax - b.totalTax)
    return calculated
  }, [grossIncome, maritalStatus, children, locale])

  const cheapest = results[0] ?? null
  const mostExpensive = results[results.length - 1] ?? null
  const maxTax = mostExpensive?.totalTax ?? 1
  const savings = cheapest && mostExpensive ? mostExpensive.totalTax - cheapest.totalTax : 0

  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="gradient-hero pt-24 pb-16 lg:pt-36 lg:pb-20 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-navy-700/20 blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-sm text-white/90 mb-6">
            <BarChart3 className="w-4 h-4" />
            {t.taxCompare.badge}
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
            {t.taxCompare.title}
          </h1>
          <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto">
            {t.taxCompare.subtitle}
          </p>
        </div>
      </section>

      {/* Input Form */}
      <section className="container-narrow py-10 lg:py-14">
        <div className="card p-6 -mt-12 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
            {/* Gross Income */}
            <div>
              <label className="block text-sm font-medium dark-text-secondary mb-1.5">
                {t.taxCompare.grossIncome}
              </label>
              <input
                type="number"
                min={0}
                step={10000}
                value={grossIncome}
                onChange={(e) => setGrossIncome(Math.max(0, Number(e.target.value)))}
                className="w-full px-4 py-3 rounded-xl border border-navy-200 bg-white text-navy-900 focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-transparent"
              />
            </div>

            {/* Marital Status Toggle */}
            <div>
              <label className="block text-sm font-medium dark-text-secondary mb-1.5">
                {t.taxCompare.maritalStatus}
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setMaritalStatus('single')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                    maritalStatus === 'single'
                      ? 'bg-navy-800 text-white border-navy-800'
                      : 'bg-white text-navy-700 border-navy-200 hover:bg-navy-50 hover:border-navy-300'
                  }`}
                >
                  {t.taxCompare.single}
                </button>
                <button
                  type="button"
                  onClick={() => setMaritalStatus('married')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                    maritalStatus === 'married'
                      ? 'bg-navy-800 text-white border-navy-800'
                      : 'bg-white text-navy-700 border-navy-200 hover:bg-navy-50 hover:border-navy-300'
                  }`}
                >
                  {t.taxCompare.married}
                </button>
              </div>
            </div>

            {/* Children */}
            <div>
              <label className="block text-sm font-medium dark-text-secondary mb-1.5">
                {t.taxCompare.children}
              </label>
              <input
                type="number"
                min={0}
                max={5}
                value={children}
                onChange={(e) => setChildren(Math.min(5, Math.max(0, Number(e.target.value))))}
                className="w-full px-4 py-3 rounded-xl border border-navy-200 bg-white text-navy-900 focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Summary Cards */}
      <section className="container-narrow py-10 lg:py-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Cheapest */}
          <div className="card p-5 border-l-4 border-l-trust-500">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="w-5 h-5 text-trust-500" />
              <span className="text-sm font-medium dark-text-secondary">{t.taxCompare.cheapest}</span>
            </div>
            {cheapest && (
              <>
                <p className="text-xl font-bold">{cheapest.name}</p>
                <p className="text-lg font-semibold text-trust-600">{formatCHF(cheapest.totalTax)}</p>
              </>
            )}
          </div>

          {/* Most Expensive */}
          <div className="card p-5 border-l-4 border-l-gold-600">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-gold-600" />
              <span className="text-sm font-medium dark-text-secondary">{t.taxCompare.mostExpensive}</span>
            </div>
            {mostExpensive && (
              <>
                <p className="text-xl font-bold">{mostExpensive.name}</p>
                <p className="text-lg font-semibold text-gold-700">{formatCHF(mostExpensive.totalTax)}</p>
              </>
            )}
          </div>

          {/* Savings Potential */}
          <div className="card p-5 border-l-4 border-l-navy-500">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-5 h-5 text-navy-500" />
              <span className="text-sm font-medium dark-text-secondary">{t.taxCompare.savingsPotential}</span>
            </div>
            <p className="text-xl font-bold">{formatCHF(savings)}</p>
            <p className="text-navy-700">
              {grossIncome > 0 ? ((savings / grossIncome) * 100).toFixed(1) + '%' : '0%'}
            </p>
          </div>
        </div>
      </section>

      {/* Full Ranking */}
      <section className="container-wide py-10 lg:py-14">
        <h2 className="text-2xl font-bold mb-6">{t.taxCompare.resultsTitle}</h2>

        <div className="card overflow-hidden">
          {/* Header */}
          <div className="hidden md:grid grid-cols-[3rem_1fr_10rem_6rem_1fr] gap-4 px-5 py-3 bg-navy-50 border-b border-navy-200 text-sm font-medium dark-text-secondary">
            <span>{t.taxCompare.rank}</span>
            <span>{t.taxCompare.canton}</span>
            <span className="text-right">{t.taxCompare.totalTax}</span>
            <span className="text-right">{t.taxCompare.effectiveRate}</span>
            <span />
          </div>

          {/* Rows */}
          {results.map((row, index) => {
            const rank = index + 1
            const barWidth = maxTax > 0 ? (row.totalTax / maxTax) * 100 : 0

            let barColor = 'bg-navy-300'
            let textColor = 'text-navy-500'
            if (rank <= 5) {
              barColor = 'bg-trust-500'
              textColor = 'text-trust-700'
            } else if (rank > results.length - 5) {
              barColor = 'bg-gold-500'
              textColor = 'text-gold-700'
            }

            return (
              <div
                key={row.code}
                className="grid grid-cols-1 md:grid-cols-[3rem_1fr_10rem_6rem_1fr] gap-2 md:gap-4 px-5 py-3 border-b border-navy-100 last:border-b-0 items-center hover:bg-navy-50 transition"
              >
                {/* Rank */}
                <span className="text-sm font-bold dark-text-secondary md:text-center">
                  <span className="md:hidden">{t.taxCompare.rank} </span>
                  {rank}
                </span>

                {/* Canton Name */}
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 dark-text-secondary shrink-0 hidden md:block" />
                  <span className={`font-medium ${textColor}`}>
                    {row.name}
                  </span>
                  <span className="text-xs dark-text-secondary">({row.code})</span>
                </div>

                {/* Total Tax */}
                <span className="text-right font-semibold">
                  <span className="md:hidden text-sm dark-text-secondary">{t.taxCompare.totalTax}: </span>
                  {formatCHF(row.totalTax)}
                </span>

                {/* Effective Rate */}
                <span className="text-right text-sm dark-text-secondary">
                  <span className="md:hidden">{t.taxCompare.effectiveRate}: </span>
                  {row.effectiveRate.toFixed(1)}%
                </span>

                {/* Visual Bar */}
                <div className="hidden md:flex items-center">
                  <div className="w-full bg-navy-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Disclaimer */}
      <section className="container-narrow py-10 lg:py-14">
        <p className="text-sm dark-text-secondary text-center italic">
          {t.taxCompare.disclaimer}
        </p>
      </section>

      {/* CTA */}
      <section className="px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
        <div className="container-wide">
          <div className="relative overflow-hidden rounded-2xl gradient-navy p-6 sm:p-10 lg:p-12">
            <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="relative text-center max-w-2xl mx-auto">
              <h2 className="font-heading text-xl sm:text-2xl lg:text-3xl font-bold dark-text-primary mb-5">
                {t.taxCompare.ctaTitle}
              </h2>
              <p className="dark-text-secondary mb-6">{t.taxCompare.ctaText}</p>
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
    </main>
  )
}
