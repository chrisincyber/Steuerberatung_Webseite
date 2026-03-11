'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useI18n } from '@/lib/i18n/context'
import { cantons, calculateSwissTax } from '@/lib/swiss-data'
import { TrendingUp, ArrowRight, Shield, PiggyBank, Download, Loader2 } from 'lucide-react'
import { useToolPdfDownload } from '@/hooks/useToolPdfDownload'
import GuestPdfModal from '@/components/GuestPdfModal'
import { InlineToolCta } from '@/components/InlineToolCta'

const MAX_WITH_PK = 7258
const MAX_WITHOUT_PK = 36288

function formatCHF(amount: number): string {
  return 'CHF ' + new Intl.NumberFormat('de-CH', { minimumFractionDigits: 0 }).format(amount)
}

export default function Pillar3aCalculator() {
  const { t, locale } = useI18n()
  const p = t.pillar3aCalc

  const [incomeMode, setIncomeMode] = useState<'brutto' | 'netto'>('brutto')
  const [incomeInput, setIncomeInput] = useState(85000)
  const grossIncome = incomeMode === 'netto' ? Math.round(incomeInput * 1.15) : incomeInput
  const [cantonCode, setCantonCode] = useState('ZH')
  const [maritalStatus, setMaritalStatus] = useState<'single' | 'married'>('single')
  const [hasPK, setHasPK] = useState(true)
  const maxContribution = hasPK ? MAX_WITH_PK : MAX_WITHOUT_PK
  const [contribution, setContribution] = useState(MAX_WITH_PK)

  const { handleDownload, handleGuestSend, pdfLoading, pdfToast, setPdfToast, showGuestModal, setShowGuestModal, guestSending, guestSent, guestError, redirectPath } = useToolPdfDownload({ toolType: '3a-rechner', redirectPath: '/3a-rechner' })

  // Reset contribution when PK toggle changes
  const handlePKChange = (withPK: boolean) => {
    setHasPK(withPK)
    const newMax = withPK ? MAX_WITH_PK : MAX_WITHOUT_PK
    setContribution(newMax)
  }

  const results = useMemo(() => {
    const taxWithout = calculateSwissTax({
      grossIncome,
      cantonCode,
      maritalStatus,
      children: 0,
      deductions3a: 0,
      commuting: 0,
      otherDeductions: 0,
    })

    const taxWith = calculateSwissTax({
      grossIncome,
      cantonCode,
      maritalStatus,
      children: 0,
      deductions3a: contribution,
      commuting: 0,
      otherDeductions: 0,
    })

    if (!taxWithout || !taxWith) return null

    const annualSavings = taxWithout.totalTax - taxWith.totalTax
    const returnPercent = contribution > 0 ? (annualSavings / contribution) * 100 : 0

    return {
      taxWithout: taxWithout.totalTax,
      taxWith: taxWith.totalTax,
      annualSavings,
      returnPercent: Math.round(returnPercent * 10) / 10,
      over10Years: annualSavings * 10,
      over20Years: annualSavings * 20,
    }
  }, [grossIncome, cantonCode, maritalStatus, contribution])

  const onDownloadPdf = async () => {
    if (!results) return
    const cantonName = cantons.find(c => c.code === cantonCode)?.name[locale] || cantonCode
    const pdfData = {
      locale,
      calculatedAt: new Date().toLocaleDateString(locale === 'de' ? 'de-CH' : 'en-CH'),
      inputs: {
        grossIncome,
        canton: cantonName,
        maritalStatus: maritalStatus === 'single' ? (locale === 'de' ? 'Ledig' : 'Single') : (locale === 'de' ? 'Verheiratet' : 'Married'),
        hasPK,
        contribution,
      },
      results,
    }
    const success = await handleDownload(
      pdfData,
      { grossIncome, cantonCode, maritalStatus, hasPK, contribution },
      results,
      `3a-rechner-${cantonCode}.pdf`,
    )
    if (success) setPdfToast(t.toolPdf.savedToAccount)
  }

  return (
    <main>
      {/* Hero */}
      <section className="gradient-hero pt-24 pb-16 lg:pt-36 lg:pb-20 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-navy-700/20 blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-trust-500/10 border border-trust-500/20 text-trust-400 text-sm font-medium mb-6">
            <PiggyBank className="w-4 h-4" />
            {p.badge}
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
            {p.title}
          </h1>
          <p className="text-lg md:text-xl text-navy-300 max-w-2xl mx-auto">
            {p.subtitle}
          </p>
        </div>
      </section>

      {/* Calculator */}
      <section className="container-narrow py-8 lg:py-10">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Input Form */}
          <div className="card p-4 lg:p-5 space-y-4">
            <h2 className="text-lg font-semibold text-navy-900 flex items-center gap-2">
              <Shield className="w-4 h-4 text-trust-500" />
              {p.title}
            </h2>

            {/* Income with brutto/netto toggle */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium text-navy-700">
                  {incomeMode === 'brutto' ? p.grossIncome : p.netIncome}
                </label>
                <div className="flex rounded-md border border-navy-200 overflow-hidden text-xs">
                  <button
                    onClick={() => setIncomeMode('brutto')}
                    className={`px-2 py-0.5 font-medium transition-colors ${incomeMode === 'brutto' ? 'bg-navy-800 text-white' : 'bg-white text-navy-600 hover:bg-navy-50'}`}
                  >
                    {p.incomeMode}
                  </button>
                  <button
                    onClick={() => setIncomeMode('netto')}
                    className={`px-2 py-0.5 font-medium transition-colors ${incomeMode === 'netto' ? 'bg-navy-800 text-white' : 'bg-white text-navy-600 hover:bg-navy-50'}`}
                  >
                    {p.incomeModeNet}
                  </button>
                </div>
              </div>
              <input
                type="number"
                value={incomeInput}
                onChange={(e) => setIncomeInput(Number(e.target.value) || 0)}
                className="w-full px-3 py-2.5 rounded-xl border border-navy-200 bg-white text-navy-900 focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                min={0}
                step={1000}
              />
              {incomeMode === 'netto' && (
                <p className="text-xs text-navy-400 mt-1">{p.netHint} — Brutto: CHF {grossIncome.toLocaleString('de-CH')}</p>
              )}
            </div>

            {/* Canton */}
            <div>
              <label className="block text-sm font-medium text-navy-700 mb-1">
                {p.canton}
              </label>
              <select
                value={cantonCode}
                onChange={(e) => setCantonCode(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-navy-200 bg-white text-navy-900 focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-transparent"
              >
                {cantons.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.name[locale]}
                  </option>
                ))}
              </select>
            </div>

            {/* Marital Status + PK row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1">
                  {p.maritalStatus}
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    onClick={() => setMaritalStatus('single')}
                    className={`px-2 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                      maritalStatus === 'single'
                        ? 'bg-navy-800 text-white border-navy-800'
                        : 'bg-white text-navy-700 border-navy-200 hover:bg-navy-50'
                    }`}
                  >
                    {p.single}
                  </button>
                  <button
                    onClick={() => setMaritalStatus('married')}
                    className={`px-2 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                      maritalStatus === 'married'
                        ? 'bg-navy-800 text-white border-navy-800'
                        : 'bg-white text-navy-700 border-navy-200 hover:bg-navy-50'
                    }`}
                  >
                    {p.married}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1">
                  {p.hasPK}
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    onClick={() => handlePKChange(true)}
                    className={`px-2 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                      hasPK
                        ? 'bg-navy-800 text-white border-navy-800'
                        : 'bg-white text-navy-700 border-navy-200 hover:bg-navy-50'
                    }`}
                  >
                    {p.withPK}
                  </button>
                  <button
                    onClick={() => handlePKChange(false)}
                    className={`px-2 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                      !hasPK
                        ? 'bg-navy-800 text-white border-navy-800'
                        : 'bg-white text-navy-700 border-navy-200 hover:bg-navy-50'
                    }`}
                  >
                    {p.withoutPK}
                  </button>
                </div>
              </div>
            </div>

            {/* 3a Contribution Slider + Input */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-sm font-medium text-navy-700">
                  {p.contribution}
                </label>
                <span className="text-xs text-navy-500">
                  {p.maxContribution}: {formatCHF(maxContribution)}
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={maxContribution}
                step={100}
                value={Math.min(contribution, maxContribution)}
                onChange={(e) => setContribution(Number(e.target.value))}
                className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-navy-200 accent-navy-700 mb-1.5"
              />
              <input
                type="number"
                value={Math.min(contribution, maxContribution)}
                onChange={(e) => {
                  const val = Number(e.target.value) || 0
                  setContribution(Math.min(Math.max(val, 0), maxContribution))
                }}
                className="w-full px-3 py-2.5 rounded-xl border border-navy-200 bg-white text-navy-900 focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                min={0}
                max={maxContribution}
              />
            </div>
          </div>

          {/* Results */}
          <div className="card p-4 lg:p-5 space-y-4">
            <h2 className="text-lg font-semibold text-navy-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-trust-500" />
              {p.resultsTitle}
            </h2>

            {results ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between py-2 border-b border-navy-200">
                  <span className="text-navy-600 text-sm">{p.taxWithout}</span>
                  <span className="text-navy-900 font-medium">{formatCHF(results.taxWithout)}</span>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-navy-200">
                  <span className="text-navy-600 text-sm">{p.taxWith}</span>
                  <span className="text-navy-900 font-medium">{formatCHF(results.taxWith)}</span>
                </div>

                {/* Annual Savings - highlighted */}
                <div className="flex items-center justify-between py-3 px-3 rounded-xl bg-trust-50 border border-trust-200">
                  <span className="text-trust-600 font-medium text-sm">{p.savings}</span>
                  <span className="text-trust-600 text-lg font-bold">
                    {formatCHF(results.annualSavings)}
                  </span>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-navy-200">
                  <span className="text-navy-600 text-sm">{p.savingsPercent}</span>
                  <span className="text-navy-900 font-semibold">{results.returnPercent}%</span>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-navy-200">
                  <span className="text-navy-600 text-sm">{p.over10Years}</span>
                  <span className="text-navy-900 font-medium">{formatCHF(results.over10Years)}</span>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-navy-200">
                  <span className="text-navy-600 text-sm">{p.over20Years}</span>
                  <span className="text-navy-900 font-medium">{formatCHF(results.over20Years)}</span>
                </div>

                <p className="text-xs text-navy-500 pt-1">
                  {p.disclaimer}
                </p>

                <button
                  onClick={onDownloadPdf}
                  disabled={pdfLoading}
                  className="w-full mt-3 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-navy-800 text-white text-sm font-medium hover:bg-navy-900 transition-colors disabled:opacity-60"
                >
                  {pdfLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                  {pdfLoading ? t.toolPdf.downloading : t.toolPdf.download}
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <PiggyBank className="w-10 h-10 text-navy-300 mb-2" />
                <p className="text-navy-600 text-sm">
                  {p.grossIncome}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6">
          <InlineToolCta toolKey="pillar3a" />
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
        <div className="container-wide">
          <div className="relative overflow-hidden rounded-2xl gradient-navy p-6 sm:p-10 lg:p-12">
            <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="relative text-center max-w-2xl mx-auto">
              <h2 className="font-heading text-xl sm:text-2xl lg:text-3xl font-bold dark-text-primary mb-5">
                {t.pillar3aCalc.ctaTitle}
              </h2>
              <p className="dark-text-secondary mb-6">{t.pillar3aCalc.ctaText}</p>
              <span className="inline-block px-3 py-1 rounded-full bg-white/10 text-white/90 text-sm font-medium border border-white/10 mb-4">
                {t.discount.hint}
              </span>
              <br />
              <Link href="/pricing" className="btn-white !px-8 !py-3 !text-sm group">
                {t.hero.cta}
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
              <p className="text-white/60 text-sm mt-4">{t.bottomCta.socialProof}</p>
            </div>
          </div>
        </div>
      </section>

      {pdfToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-trust-50 border border-trust-200 text-trust-700 px-5 py-3 rounded-xl shadow-lg text-sm font-medium">
          {pdfToast}
        </div>
      )}

      <GuestPdfModal
        isOpen={showGuestModal}
        onClose={() => setShowGuestModal(false)}
        onSend={(data) => {
          if (!results) return
          const cantonName = cantons.find(c => c.code === cantonCode)?.name[locale] || cantonCode
          handleGuestSend(data, {
            locale,
            calculatedAt: new Date().toLocaleDateString(locale === 'de' ? 'de-CH' : 'en-CH'),
            inputs: { grossIncome, canton: cantonName, maritalStatus, hasPK, contribution },
            results,
          })
        }}
        sending={guestSending}
        sent={guestSent}
        error={guestError}
        redirectPath={redirectPath}
      />

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
