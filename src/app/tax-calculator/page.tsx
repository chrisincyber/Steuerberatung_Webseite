'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useI18n } from '@/lib/i18n/context'
import { cantons, calculateSwissTax } from '@/lib/swiss-data'
import { Calculator, ArrowRight, ChevronDown, TrendingUp } from 'lucide-react'

export default function TaxCalculatorPage() {
  const { t, locale } = useI18n()

  const [grossIncome, setGrossIncome] = useState<string>('')
  const [canton, setCanton] = useState<string>('ZH')
  const [maritalStatus, setMaritalStatus] = useState<'single' | 'married' | 'divorced' | 'widowed'>('single')
  const [children, setChildren] = useState<number>(0)
  const [deductions3a, setDeductions3a] = useState<string>('')
  const [commuting, setCommuting] = useState<string>('')
  const [otherDeductions, setOtherDeductions] = useState<string>('')
  const [result, setResult] = useState<ReturnType<typeof calculateSwissTax>>(null)

  const handleCalculate = () => {
    const income = parseFloat(grossIncome) || 0
    if (income <= 0) return

    const calcResult = calculateSwissTax({
      grossIncome: income,
      cantonCode: canton,
      maritalStatus,
      children,
      deductions3a: parseFloat(deductions3a) || 0,
      commuting: parseFloat(commuting) || 0,
      otherDeductions: parseFloat(otherDeductions) || 0,
    })

    setResult(calcResult)
  }

  const formatCHF = (amount: number) => {
    return new Intl.NumberFormat('de-CH', {
      style: 'currency',
      currency: 'CHF',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <>
      {/* Hero */}
      <section className="gradient-hero pt-24 pb-20 lg:pt-40 lg:pb-28 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-navy-700/20 blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-heading text-4xl sm:text-5xl font-bold dark-text-primary">
            {t.taxCalc.title}
          </h1>
          <p className="mt-4 text-xl dark-text-secondary max-w-2xl mx-auto">
            {t.taxCalc.subtitle}
          </p>
        </div>
      </section>

      {/* Calculator */}
      <section className="section-padding -mt-10">
        <div className="container-narrow">
          <div className="card p-8 sm:p-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Gross Income */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-navy-900 mb-2">
                  {t.taxCalc.grossIncome}
                </label>
                <input
                  type="number"
                  value={grossIncome}
                  onChange={(e) => setGrossIncome(e.target.value)}
                  placeholder="80000"
                  className="w-full px-4 py-3 rounded-xl border-2 border-navy-200 text-navy-900 focus:border-navy-500 focus:ring-0 outline-none"
                />
              </div>

              {/* Canton */}
              <div>
                <label className="block text-sm font-semibold text-navy-900 mb-2">
                  {t.taxCalc.canton}
                </label>
                <div className="relative">
                  <select
                    value={canton}
                    onChange={(e) => setCanton(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border-2 border-navy-200 text-navy-700 bg-white focus:border-navy-500 focus:ring-0 outline-none appearance-none"
                  >
                    {cantons.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.name[locale]}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-navy-400 pointer-events-none" />
                </div>
              </div>

              {/* Marital Status */}
              <div>
                <label className="block text-sm font-semibold text-navy-900 mb-2">
                  {t.taxCalc.maritalStatus}
                </label>
                <div className="relative">
                  <select
                    value={maritalStatus}
                    onChange={(e) => setMaritalStatus(e.target.value as typeof maritalStatus)}
                    className="w-full px-4 py-3 rounded-xl border-2 border-navy-200 text-navy-700 bg-white focus:border-navy-500 focus:ring-0 outline-none appearance-none"
                  >
                    {Object.entries(t.taxCalc.maritalOptions).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-navy-400 pointer-events-none" />
                </div>
              </div>

              {/* Children */}
              <div>
                <label className="block text-sm font-semibold text-navy-900 mb-2">
                  {t.taxCalc.children}
                </label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={children}
                  onChange={(e) => setChildren(parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-navy-200 text-navy-900 focus:border-navy-500 focus:ring-0 outline-none"
                />
              </div>

              {/* 3a */}
              <div>
                <label className="block text-sm font-semibold text-navy-900 mb-2">
                  {t.taxCalc.deductions3a}
                </label>
                <input
                  type="number"
                  value={deductions3a}
                  onChange={(e) => setDeductions3a(e.target.value)}
                  placeholder="7056"
                  className="w-full px-4 py-3 rounded-xl border-2 border-navy-200 text-navy-900 focus:border-navy-500 focus:ring-0 outline-none"
                />
              </div>

              {/* Commuting */}
              <div>
                <label className="block text-sm font-semibold text-navy-900 mb-2">
                  {t.taxCalc.commuting}
                </label>
                <input
                  type="number"
                  value={commuting}
                  onChange={(e) => setCommuting(e.target.value)}
                  placeholder="3000"
                  className="w-full px-4 py-3 rounded-xl border-2 border-navy-200 text-navy-900 focus:border-navy-500 focus:ring-0 outline-none"
                />
              </div>

              {/* Other deductions */}
              <div>
                <label className="block text-sm font-semibold text-navy-900 mb-2">
                  {t.taxCalc.otherDeductions}
                </label>
                <input
                  type="number"
                  value={otherDeductions}
                  onChange={(e) => setOtherDeductions(e.target.value)}
                  placeholder="0"
                  className="w-full px-4 py-3 rounded-xl border-2 border-navy-200 text-navy-900 focus:border-navy-500 focus:ring-0 outline-none"
                />
              </div>
            </div>

            <button
              onClick={handleCalculate}
              className="btn-primary !px-8 !py-4 w-full mt-8 group"
            >
              <Calculator className="w-5 h-5 mr-2" />
              {t.taxCalc.calculate}
            </button>
          </div>

          {/* Results */}
          {result && (
            <div className="card p-8 sm:p-10 mt-8">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 rounded-xl bg-trust-100 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-trust-600" />
                </div>
                <h2 className="font-heading text-2xl font-bold text-navy-900">
                  {t.taxCalc.results.title}
                </h2>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-navy-100">
                  <span className="text-navy-600">{t.taxCalc.results.federal}</span>
                  <span className="font-semibold text-navy-900">{formatCHF(result.federalTax)}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-navy-100">
                  <span className="text-navy-600">{t.taxCalc.results.cantonal}</span>
                  <span className="font-semibold text-navy-900">{formatCHF(result.cantonalTax)}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-navy-100">
                  <span className="text-navy-600">{t.taxCalc.results.municipal}</span>
                  <span className="font-semibold text-navy-900">{formatCHF(result.municipalTax)}</span>
                </div>
                <div className="flex justify-between items-center py-4 bg-navy-50 rounded-xl px-4 -mx-4">
                  <span className="font-bold text-navy-900">{t.taxCalc.results.total}</span>
                  <span className="text-2xl font-bold text-navy-900">{formatCHF(result.totalTax)}</span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="text-navy-600">{t.taxCalc.results.effective}</span>
                  <span className="font-semibold text-navy-700">{result.effectiveRate}%</span>
                </div>
              </div>

              <p className="text-xs text-navy-400 mt-6 italic">
                {t.taxCalc.results.disclaimer}
              </p>
            </div>
          )}

          {/* CTA after results */}
          {result && (
            <div className="card p-8 sm:p-10 mt-8 bg-navy-900 border-none">
              <div className="text-center">
                <h3 className="font-heading text-2xl font-bold dark-text-primary mb-3">
                  {t.taxCalc.ctaTitle}
                </h3>
                <p className="dark-text-secondary mb-6 max-w-lg mx-auto">
                  {t.taxCalc.ctaDescription}
                </p>
                <Link
                  href="/auth/register"
                  className="btn-white !px-8 !py-4 group inline-flex"
                >
                  {t.taxCalc.ctaButton}
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  )
}
