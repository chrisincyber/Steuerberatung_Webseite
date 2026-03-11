'use client'

import { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useI18n } from '@/lib/i18n/context'
import { cantons, calculateSwissTax } from '@/lib/swiss-data'
import type { TaxCity } from '@/lib/estv-tax'
import { ArrowLeft, ArrowRight, Map, Loader2, Shield } from 'lucide-react'

const TaxMap = dynamic(() => import('@/components/maps/TaxMap'), { ssr: false })

type MaritalStatus = 'single' | 'married'

interface GemeindeResult {
  taxLocationId: number
  bfsId: number
  name: string
  totalTax: number
  effectiveRate: number
}

function formatCHF(amount: number): string {
  return 'CHF ' + new Intl.NumberFormat('de-CH', { minimumFractionDigits: 0 }).format(amount)
}

export default function SteuerkartePage() {
  const { t, locale } = useI18n()

  // Inputs
  const [grossIncome, setGrossIncome] = useState(100000)
  const [maritalStatus, setMaritalStatus] = useState<MaritalStatus>('single')
  const [children, setChildren] = useState(0)

  // Map state
  const [selectedCanton, setSelectedCanton] = useState('')
  const [viewMode, setViewMode] = useState<'cantons' | 'municipalities'>('cantons')
  const [cantonCities, setCantonCities] = useState<TaxCity[]>([])
  const [gemeindeResults, setGemeindeResults] = useState<GemeindeResult[]>([])
  const [loading, setLoading] = useState(false)

  // Canton-level results
  const cantonResults = useMemo(() => {
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

  // Canton name lookup
  const cantonName = useMemo(() => {
    if (!selectedCanton) return ''
    const c = cantons.find((c) => c.code === selectedCanton)
    return c ? c.name[locale] : selectedCanton
  }, [selectedCanton, locale])

  // Info panel data
  const selectedCantonResult = useMemo(() => {
    return cantonResults.find((r) => r.code === selectedCanton)
  }, [cantonResults, selectedCanton])

  const cheapestMunicipality = useMemo(() => {
    if (gemeindeResults.length === 0) return null
    return gemeindeResults.reduce((min, r) => (r.totalTax < min.totalTax ? r : min))
  }, [gemeindeResults])

  const mostExpensiveMunicipality = useMemo(() => {
    if (gemeindeResults.length === 0) return null
    return gemeindeResults.reduce((max, r) => (r.totalTax > max.totalTax ? r : max))
  }, [gemeindeResults])

  // Calculate taxes for a list of cities
  const calculateMunicipalityTaxes = useCallback(async (cities: TaxCity[]) => {
    const batchSize = 50
    const allResults: GemeindeResult[] = []

    for (let i = 0; i < cities.length; i += batchSize) {
      const batch = cities.slice(i, i + batchSize)
      const batchRes = await fetch('/api/tax-calculate/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taxLocationIds: batch.map((c) => c.id),
          grossIncome,
          maritalStatus,
          children,
          taxYear: 2025,
        }),
      })

      if (batchRes.ok) {
        const batchData = await batchRes.json()
        for (const item of batchData) {
          const city = cities.find((c) => c.id === item.taxLocationId)
          if (!city || item.error) continue
          allResults.push({
            taxLocationId: item.taxLocationId,
            bfsId: city.bfsId,
            name: city.name,
            totalTax: item.totalTax,
            effectiveRate: item.effectiveRate,
          })
        }
      }
    }

    allResults.sort((a, b) => a.totalTax - b.totalTax)
    return allResults
  }, [grossIncome, maritalStatus, children])

  // Handle canton click → load municipalities
  const handleCantonClick = useCallback(async (cantonCode: string) => {
    setSelectedCanton(cantonCode)
    setViewMode('municipalities')
    setGemeindeResults([])
    setCantonCities([])
    setLoading(true)

    try {
      const res = await fetch(`/api/tax-cities/by-canton?canton=${cantonCode}&year=2025`)
      if (!res.ok) throw new Error('Failed to fetch')
      const cities: TaxCity[] = await res.json()
      setCantonCities(cities)

      if (cities.length === 0) {
        setLoading(false)
        return
      }

      const results = await calculateMunicipalityTaxes(cities)
      setGemeindeResults(results)
    } catch {
      // Silently handle fetch errors
    } finally {
      setLoading(false)
    }
  }, [calculateMunicipalityTaxes])

  // Auto-recalculate when inputs change while viewing municipalities
  const prevInputsRef = useRef({ grossIncome, maritalStatus, children })
  useEffect(() => {
    const prev = prevInputsRef.current
    const changed = prev.grossIncome !== grossIncome || prev.maritalStatus !== maritalStatus || prev.children !== children
    prevInputsRef.current = { grossIncome, maritalStatus, children }

    if (!changed || viewMode !== 'municipalities' || cantonCities.length === 0 || loading) return

    const recalc = async () => {
      setLoading(true)
      const results = await calculateMunicipalityTaxes(cantonCities)
      setGemeindeResults(results)
      setLoading(false)
    }
    recalc()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [grossIncome, maritalStatus, children])

  // Back to cantons view
  const handleBackToCantons = () => {
    setViewMode('cantons')
    setSelectedCanton('')
    setGemeindeResults([])
  }

  return (
    <>
      {/* Compact Hero */}
      <section className="relative bg-gradient-to-r from-navy-900 to-navy-800 pt-24 pb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/20 rounded-full">
              <Map className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                {t.taxMap.badge}
              </span>
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            {t.taxMap.title}
          </h1>
          <p className="text-white/70 mt-1 text-sm sm:text-base">
            {t.taxMap.subtitle}
          </p>
        </div>
      </section>

      {/* Input Bar */}
      <section className="bg-white border-b border-navy-100 sticky top-16 lg:top-20 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex flex-col sm:flex-row gap-3 items-end">
            <div className="flex-1 min-w-0">
              <label className="block text-xs font-medium text-navy-500 mb-1">
                {t.taxCompare.grossIncome}
              </label>
              <input
                type="number"
                min={0}
                step={10000}
                value={grossIncome}
                onChange={(e) => setGrossIncome(Math.max(0, Number(e.target.value)))}
                className="w-full px-3 py-2 rounded-lg border border-navy-200 bg-white text-navy-900 text-sm focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-transparent"
              />
            </div>
            <div className="flex-shrink-0">
              <label className="block text-xs font-medium text-navy-500 mb-1">
                {t.taxCompare.maritalStatus}
              </label>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => setMaritalStatus('single')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
                    maritalStatus === 'single'
                      ? 'bg-navy-800 text-white border-navy-800'
                      : 'bg-white text-navy-700 border-navy-200 hover:bg-navy-50'
                  }`}
                >
                  {t.taxCompare.single}
                </button>
                <button
                  type="button"
                  onClick={() => setMaritalStatus('married')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
                    maritalStatus === 'married'
                      ? 'bg-navy-800 text-white border-navy-800'
                      : 'bg-white text-navy-700 border-navy-200 hover:bg-navy-50'
                  }`}
                >
                  {t.taxCompare.married}
                </button>
              </div>
            </div>
            <div className="w-24 flex-shrink-0">
              <label className="block text-xs font-medium text-navy-500 mb-1">
                {t.taxCompare.children}
              </label>
              <input
                type="number"
                min={0}
                max={5}
                value={children}
                onChange={(e) => setChildren(Math.min(5, Math.max(0, Number(e.target.value))))}
                className="w-full px-3 py-2 rounded-lg border border-navy-200 bg-white text-navy-900 text-sm focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="bg-navy-50 min-h-[60vh]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Back button + canton label */}
          {viewMode === 'municipalities' && (
            <div className="flex items-center gap-3 mb-4">
              <button
                onClick={handleBackToCantons}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-navy-700 bg-white border border-navy-200 hover:bg-navy-50 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                {t.taxMap.backToCantons}
              </button>
              <span className="text-sm text-navy-500">
                {t.taxMap.municipalitiesIn.replace('{canton}', cantonName)}
              </span>
            </div>
          )}

          {/* Hint for canton mode */}
          {viewMode === 'cantons' && (
            <p className="text-sm text-navy-500 mb-3">
              {t.taxMap.selectCanton}
            </p>
          )}

          {/* Loading indicator */}
          {loading && (
            <div className="flex items-center gap-2 mb-3 text-sm text-navy-600">
              <Loader2 className="w-4 h-4 animate-spin" />
              {t.taxMap.loading}
            </div>
          )}

          {/* The Map */}
          {viewMode === 'cantons' ? (
            <TaxMap
              mode="canton"
              cantonResults={cantonResults}
              onCantonClick={handleCantonClick}
              labels={t.taxCompare.map}
            />
          ) : (
            <TaxMap
              mode="municipality"
              gemeindeResults={gemeindeResults}
              selectedCanton={selectedCanton}
              labels={t.taxCompare.map}
            />
          )}
        </div>
      </section>

      {/* Info Panel */}
      <section className="bg-white border-t border-navy-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {viewMode === 'cantons' && cantonResults.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="card p-4">
                <div className="text-xs font-medium text-navy-500 uppercase tracking-wider mb-1">
                  {t.taxCompare.cheapest}
                </div>
                <div className="text-lg font-bold text-navy-900">
                  {cantonResults[0].name}
                </div>
                <div className="text-sm text-emerald-600 font-medium">
                  {formatCHF(cantonResults[0].totalTax)} ({(cantonResults[0].effectiveRate * 100).toFixed(1)}%)
                </div>
              </div>
              <div className="card p-4">
                <div className="text-xs font-medium text-navy-500 uppercase tracking-wider mb-1">
                  {t.taxCompare.mostExpensive}
                </div>
                <div className="text-lg font-bold text-navy-900">
                  {cantonResults[cantonResults.length - 1].name}
                </div>
                <div className="text-sm text-red-600 font-medium">
                  {formatCHF(cantonResults[cantonResults.length - 1].totalTax)} ({(cantonResults[cantonResults.length - 1].effectiveRate * 100).toFixed(1)}%)
                </div>
              </div>
              <div className="card p-4">
                <div className="text-xs font-medium text-navy-500 uppercase tracking-wider mb-1">
                  {t.taxCompare.savingsPotential}
                </div>
                <div className="text-lg font-bold text-navy-900">
                  {formatCHF(cantonResults[cantonResults.length - 1].totalTax - cantonResults[0].totalTax)}
                </div>
                <div className="text-sm text-navy-500">
                  {cantonResults[0].name} vs. {cantonResults[cantonResults.length - 1].name}
                </div>
              </div>
            </div>
          )}

          {viewMode === 'municipalities' && gemeindeResults.length > 0 && cheapestMunicipality && mostExpensiveMunicipality && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="card p-4">
                <div className="text-xs font-medium text-navy-500 uppercase tracking-wider mb-1">
                  {t.taxCompare.gemeinde.cheapest}
                </div>
                <div className="text-lg font-bold text-navy-900">
                  {cheapestMunicipality.name}
                </div>
                <div className="text-sm text-emerald-600 font-medium">
                  {formatCHF(cheapestMunicipality.totalTax)} ({(cheapestMunicipality.effectiveRate * 100).toFixed(1)}%)
                </div>
              </div>
              <div className="card p-4">
                <div className="text-xs font-medium text-navy-500 uppercase tracking-wider mb-1">
                  {t.taxCompare.gemeinde.mostExpensive}
                </div>
                <div className="text-lg font-bold text-navy-900">
                  {mostExpensiveMunicipality.name}
                </div>
                <div className="text-sm text-red-600 font-medium">
                  {formatCHF(mostExpensiveMunicipality.totalTax)} ({(mostExpensiveMunicipality.effectiveRate * 100).toFixed(1)}%)
                </div>
              </div>
              <div className="card p-4">
                <div className="text-xs font-medium text-navy-500 uppercase tracking-wider mb-1">
                  {t.taxCompare.savingsPotential}
                </div>
                <div className="text-lg font-bold text-navy-900">
                  {formatCHF(mostExpensiveMunicipality.totalTax - cheapestMunicipality.totalTax)}
                </div>
                <div className="text-sm text-navy-500">
                  {cheapestMunicipality.name} vs. {mostExpensiveMunicipality.name}
                </div>
              </div>
            </div>
          )}

          {viewMode === 'municipalities' && selectedCanton && !loading && gemeindeResults.length === 0 && (
            <p className="text-sm text-navy-500 text-center py-4">
              {t.taxCompare.gemeinde.noResults}
            </p>
          )}
        </div>
      </section>

      {/* CTA Link to Steuervergleich */}
      <section className="bg-navy-50 border-t border-navy-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
          <Link
            href="/steuervergleich"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-navy-800 text-white font-medium hover:bg-navy-700 transition-colors"
          >
            {t.taxMap.detailedComparison}
            <ArrowRight className="w-4 h-4" />
          </Link>
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
    </>
  )
}
