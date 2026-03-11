'use client'

import { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { useI18n } from '@/lib/i18n/context'
import { cantons, calculateSwissTax } from '@/lib/swiss-data'
import { useMunicipalitySearch } from '@/hooks/useMunicipalitySearch'
import type { TaxCity } from '@/lib/estv-tax'
import { BarChart3, ArrowRight, Shield, TrendingDown, TrendingUp, MapPin, Loader2, X, Search, Plus, AlertCircle, Map, ChevronDown, Download } from 'lucide-react'
import { useToolPdfDownload } from '@/hooks/useToolPdfDownload'
import GuestPdfModal from '@/components/GuestPdfModal'
import { InlineToolCta } from '@/components/InlineToolCta'

const TaxMap = dynamic(() => import('@/components/maps/TaxMap'), {
  ssr: false,
  loading: () => (
    <div className="card p-4 animate-pulse">
      <div className="bg-navy-100 rounded-xl w-full" style={{ height: 400 }} />
    </div>
  ),
})

type MaritalStatus = 'single' | 'married'
type MainTab = 'canton' | 'gemeinde'
type GemeindeMode = 'withinCanton' | 'compare'

interface GemeindeResult {
  taxLocationId: number
  bfsId: number
  name: string
  zipCode: string
  cantonCode: string
  totalTax: number
  effectiveRate: number
  error?: undefined
}

interface GemeindeError {
  taxLocationId: number
  bfsId: number
  name: string
  zipCode: string
  cantonCode: string
  error: string
}

type GemeindeRow = GemeindeResult | GemeindeError

function formatCHF(amount: number): string {
  return 'CHF ' + new Intl.NumberFormat('de-CH', { minimumFractionDigits: 0 }).format(amount)
}

// Ranking table component shared between canton and gemeinde views
type SortField = 'rank' | 'name' | 'totalTax' | 'effectiveRate'
type SortDir = 'asc' | 'desc'

function RankingTable({
  results,
  nameLabel,
  rankLabel,
  totalTaxLabel,
  effectiveRateLabel,
  searchPlaceholder,
}: {
  results: { key: string; name: string; code: string; totalTax: number; effectiveRate: number; bfsId?: number }[]
  nameLabel: string
  rankLabel: string
  totalTaxLabel: string
  effectiveRateLabel: string
  searchPlaceholder: string
}) {
  const [search, setSearch] = useState('')
  const [sortField, setSortField] = useState<SortField>('rank')
  const [sortDir, setSortDir] = useState<SortDir>('asc')

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDir(field === 'name' ? 'asc' : 'asc')
    }
  }

  const sortIndicator = (field: SortField) => {
    if (sortField !== field) return <ChevronDown className="w-3 h-3 text-navy-300" />
    return sortDir === 'asc'
      ? <ChevronDown className="w-3 h-3 text-navy-700" />
      : <ChevronDown className="w-3 h-3 text-navy-700 rotate-180" />
  }

  // Filter by search
  const filtered = search.trim()
    ? results.filter((r) =>
        r.name.toLowerCase().includes(search.toLowerCase()) ||
        r.code.toLowerCase().includes(search.toLowerCase())
      )
    : results

  // Sort (results are already sorted by totalTax asc = rank order)
  const sorted = [...filtered].sort((a, b) => {
    const dir = sortDir === 'asc' ? 1 : -1
    switch (sortField) {
      case 'name':
        return dir * a.name.localeCompare(b.name, 'de')
      case 'totalTax':
        return dir * (a.totalTax - b.totalTax)
      case 'effectiveRate':
        return dir * (a.effectiveRate - b.effectiveRate)
      case 'rank':
      default:
        return dir * (a.totalTax - b.totalTax)
    }
  })

  const maxTax = results.length > 0 ? Math.max(...results.map((r) => r.totalTax)) : 1

  return (
    <div className="card overflow-hidden">
      {/* Search bar */}
      <div className="px-4 py-3 border-b border-navy-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-navy-200 bg-white text-navy-900 text-sm focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Table header — sortable */}
      <div className="hidden md:grid grid-cols-[3rem_1fr_10rem_6rem_1fr] gap-4 px-5 py-3 bg-navy-100 border-b border-navy-200">
        <button onClick={() => handleSort('rank')} className="flex items-center gap-1 text-sm font-semibold text-navy-700 hover:text-navy-900 transition-colors">
          {rankLabel} {sortIndicator('rank')}
        </button>
        <button onClick={() => handleSort('name')} className="flex items-center gap-1 text-sm font-semibold text-navy-700 hover:text-navy-900 transition-colors text-left">
          {nameLabel} {sortIndicator('name')}
        </button>
        <button onClick={() => handleSort('totalTax')} className="flex items-center gap-1 justify-end text-sm font-semibold text-navy-700 hover:text-navy-900 transition-colors">
          {totalTaxLabel} {sortIndicator('totalTax')}
        </button>
        <button onClick={() => handleSort('effectiveRate')} className="flex items-center gap-1 justify-end text-sm font-semibold text-navy-700 hover:text-navy-900 transition-colors">
          {effectiveRateLabel} {sortIndicator('effectiveRate')}
        </button>
        <span />
      </div>

      {/* Results */}
      {sorted.length === 0 && search.trim() && (
        <div className="px-5 py-8 text-center text-sm text-navy-500">
          {searchPlaceholder}
        </div>
      )}

      {sorted.map((row) => {
        // Original rank based on totalTax ordering
        const originalRank = results.findIndex((r) => r.key === row.key) + 1
        const barWidth = maxTax > 0 ? (row.totalTax / maxTax) * 100 : 0

        let barColor = 'bg-navy-300'
        let textColor = 'text-navy-700'
        if (originalRank <= 5) {
          barColor = 'bg-trust-500'
          textColor = 'text-trust-700'
        } else if (originalRank > results.length - 5) {
          barColor = 'bg-gold-500'
          textColor = 'text-gold-700'
        }

        return (
          <div
            key={row.key}
            data-bfs={row.bfsId}
            className="grid grid-cols-1 md:grid-cols-[3rem_1fr_10rem_6rem_1fr] gap-2 md:gap-4 px-5 py-3 border-b border-navy-100 last:border-b-0 items-center hover:bg-navy-50 transition"
          >
            <span className="text-sm font-bold text-navy-500 md:text-center">
              <span className="md:hidden">{rankLabel} </span>
              {originalRank}
            </span>

            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-navy-400 shrink-0 hidden md:block" />
              <span className={`font-medium ${textColor}`}>{row.name}</span>
              <span className="text-xs text-navy-500">({row.code})</span>
            </div>

            <span className="text-right font-semibold text-navy-900">
              <span className="md:hidden text-sm text-navy-500">{totalTaxLabel}: </span>
              {formatCHF(row.totalTax)}
            </span>

            <span className="text-right text-sm text-navy-600">
              <span className="md:hidden">{effectiveRateLabel}: </span>
              {row.effectiveRate.toFixed(1)}%
            </span>

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
  )
}

// Summary cards component
function SummaryCards({
  cheapestLabel,
  mostExpensiveLabel,
  savingsLabel,
  cheapest,
  mostExpensive,
  savings,
  grossIncome,
}: {
  cheapestLabel: string
  mostExpensiveLabel: string
  savingsLabel: string
  cheapest: { name: string; totalTax: number } | null
  mostExpensive: { name: string; totalTax: number } | null
  savings: number
  grossIncome: number
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
      <div className="card p-3 border-l-4 border-l-trust-500">
        <div className="flex items-center gap-1.5 mb-1">
          <TrendingDown className="w-4 h-4 text-trust-500" />
          <span className="text-xs font-medium dark-text-secondary">{cheapestLabel}</span>
        </div>
        {cheapest && (
          <>
            <p className="text-base font-bold">{cheapest.name}</p>
            <p className="text-sm font-semibold text-trust-600">{formatCHF(cheapest.totalTax)}</p>
          </>
        )}
      </div>

      <div className="card p-3 border-l-4 border-l-gold-600">
        <div className="flex items-center gap-1.5 mb-1">
          <TrendingUp className="w-4 h-4 text-gold-600" />
          <span className="text-xs font-medium dark-text-secondary">{mostExpensiveLabel}</span>
        </div>
        {mostExpensive && (
          <>
            <p className="text-base font-bold">{mostExpensive.name}</p>
            <p className="text-sm font-semibold text-gold-700">{formatCHF(mostExpensive.totalTax)}</p>
          </>
        )}
      </div>

      <div className="card p-3 border-l-4 border-l-navy-500">
        <div className="flex items-center gap-1.5 mb-1">
          <Shield className="w-4 h-4 text-navy-500" />
          <span className="text-xs font-medium dark-text-secondary">{savingsLabel}</span>
        </div>
        <p className="text-base font-bold">{formatCHF(savings)}</p>
        <p className="text-sm text-navy-700">
          {grossIncome > 0 ? ((savings / grossIncome) * 100).toFixed(1) + '%' : '0%'}
        </p>
      </div>
    </div>
  )
}

export default function SteuervergleichPage() {
  const { t, locale } = useI18n()
  const { handleDownload, handleGuestSend, pdfLoading, pdfToast, setPdfToast, showGuestModal, setShowGuestModal, guestSending, guestSent, guestError, redirectPath } = useToolPdfDownload({ toolType: 'steuervergleich', redirectPath: '/steuervergleich' })

  // Shared inputs
  const [incomeMode, setIncomeMode] = useState<'brutto' | 'netto'>('brutto')
  const [incomeInput, setIncomeInput] = useState(100000)
  const grossIncome = incomeMode === 'netto' ? Math.round(incomeInput * 1.15) : incomeInput
  const [maritalStatus, setMaritalStatus] = useState<MaritalStatus>('single')
  const [children, setChildren] = useState(0)

  // Tab state
  const [mainTab, setMainTab] = useState<MainTab>('canton')
  const [gemeindeMode, setGemeindeMode] = useState<GemeindeMode>('withinCanton')

  // Mode A: Within Canton
  const [selectedCanton, setSelectedCanton] = useState('')
  const [cantonCities, setCantonCities] = useState<TaxCity[]>([])
  const [cantonLoading, setCantonLoading] = useState(false)
  const [gemeindeResults, setGemeindeResults] = useState<GemeindeRow[]>([])
  const [calcProgress, setCalcProgress] = useState({ current: 0, total: 0 })
  const [calculatingGemeinden, setCalculatingGemeinden] = useState(false)

  // Mode B: Compare specific municipalities
  const [selectedMunis, setSelectedMunis] = useState<TaxCity[]>([])
  const [compareResults, setCompareResults] = useState<GemeindeRow[]>([])
  const [compareLoading, setCompareLoading] = useState(false)
  const [muniSearch, setMuniSearch] = useState('')
  const muni = useMunicipalitySearch()
  const [showMap, setShowMap] = useState(true)

  const scrollToBfs = useCallback((bfsId: number) => {
    const el = document.querySelector(`[data-bfs="${bfsId}"]`)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      el.classList.add('!bg-navy-100')
      setTimeout(() => el.classList.remove('!bg-navy-100'), 2000)
    }
  }, [])

  // Canton comparison (existing logic)
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

  // Fetch municipalities for a canton and calculate taxes
  const handleCantonSelect = useCallback(async (cantonCode: string) => {
    setSelectedCanton(cantonCode)
    setGemeindeResults([])
    setCantonCities([])

    if (!cantonCode) return

    setCantonLoading(true)
    try {
      const res = await fetch(`/api/tax-cities/by-canton?canton=${cantonCode}&year=2025`)
      if (!res.ok) throw new Error('Failed to fetch')
      const cities: TaxCity[] = await res.json()
      setCantonCities(cities)
      setCantonLoading(false)

      if (cities.length === 0) return

      // Now batch-calculate taxes
      setCalculatingGemeinden(true)
      setCalcProgress({ current: 0, total: cities.length })

      // Split into batches of 50
      const batchSize = 50
      const allResults: GemeindeRow[] = []

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
            if (!city) continue
            if (item.error) {
              allResults.push({
                taxLocationId: item.taxLocationId,
                bfsId: city.bfsId,
                name: city.name,
                zipCode: city.zipCode,
                cantonCode: city.cantonCode,
                error: item.error,
              })
            } else {
              allResults.push({
                taxLocationId: item.taxLocationId,
                bfsId: city.bfsId,
                name: city.name,
                zipCode: city.zipCode,
                cantonCode: city.cantonCode,
                totalTax: item.totalTax,
                effectiveRate: item.effectiveRate,
              })
            }
          }
        }

        setCalcProgress({ current: Math.min(i + batchSize, cities.length), total: cities.length })
      }

      // Sort by totalTax (errors at end)
      allResults.sort((a, b) => {
        if (a.error && !b.error) return 1
        if (!a.error && b.error) return -1
        if (a.error || b.error) return 0
        return (a as GemeindeResult).totalTax - (b as GemeindeResult).totalTax
      })

      setGemeindeResults(allResults)
    } catch {
      setCantonCities([])
    } finally {
      setCantonLoading(false)
      setCalculatingGemeinden(false)
    }
  }, [grossIncome, maritalStatus, children])

  // Mode B: Add municipality
  const addMunicipality = useCallback((city: TaxCity) => {
    if (selectedMunis.length >= 10) return
    if (selectedMunis.some((m) => m.id === city.id)) return
    setSelectedMunis((prev) => [...prev, city])
    setMuniSearch('')
    muni.setShowDropdown(false)
  }, [selectedMunis, muni])

  const removeMunicipality = useCallback((id: number) => {
    setSelectedMunis((prev) => prev.filter((m) => m.id !== id))
  }, [])

  // Mode B: Compare selected municipalities
  const handleCompare = useCallback(async () => {
    if (selectedMunis.length === 0) return

    setCompareLoading(true)
    setCompareResults([])

    try {
      const res = await fetch('/api/tax-calculate/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taxLocationIds: selectedMunis.map((m) => m.id),
          grossIncome,
          maritalStatus,
          children,
          taxYear: 2025,
        }),
      })

      if (!res.ok) throw new Error('Batch failed')
      const data = await res.json()

      const results: GemeindeRow[] = data.map((item: { taxLocationId: number; totalTax?: number; effectiveRate?: number; error?: string }) => {
        const city = selectedMunis.find((m) => m.id === item.taxLocationId)!
        if (item.error) {
          return {
            taxLocationId: item.taxLocationId,
            bfsId: city.bfsId,
            name: city.name,
            zipCode: city.zipCode,
            cantonCode: city.cantonCode,
            error: item.error,
          }
        }
        return {
          taxLocationId: item.taxLocationId,
          bfsId: city.bfsId,
          name: city.name,
          zipCode: city.zipCode,
          cantonCode: city.cantonCode,
          totalTax: item.totalTax!,
          effectiveRate: item.effectiveRate!,
        }
      })

      results.sort((a, b) => {
        if (a.error && !b.error) return 1
        if (!a.error && b.error) return -1
        if (a.error || b.error) return 0
        return (a as GemeindeResult).totalTax - (b as GemeindeResult).totalTax
      })

      setCompareResults(results)
    } catch {
      // ignore
    } finally {
      setCompareLoading(false)
    }
  }, [selectedMunis, grossIncome, maritalStatus, children])

  // Auto-recalculate municipality taxes when inputs change (if canton is selected and cities loaded)
  const prevInputsRef = useRef({ grossIncome, maritalStatus, children })
  useEffect(() => {
    const prev = prevInputsRef.current
    const changed = prev.grossIncome !== grossIncome || prev.maritalStatus !== maritalStatus || prev.children !== children
    prevInputsRef.current = { grossIncome, maritalStatus, children }

    if (!changed) return

    // Re-calculate within-canton municipalities
    if (selectedCanton && cantonCities.length > 0 && !calculatingGemeinden) {
      const recalculate = async () => {
        setCalculatingGemeinden(true)
        setCalcProgress({ current: 0, total: cantonCities.length })

        const batchSize = 50
        const allResults: GemeindeRow[] = []

        for (let i = 0; i < cantonCities.length; i += batchSize) {
          const batch = cantonCities.slice(i, i + batchSize)
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
              const city = cantonCities.find((c) => c.id === item.taxLocationId)
              if (!city) continue
              if (item.error) {
                allResults.push({ taxLocationId: item.taxLocationId, bfsId: city.bfsId, name: city.name, zipCode: city.zipCode, cantonCode: city.cantonCode, error: item.error })
              } else {
                allResults.push({ taxLocationId: item.taxLocationId, bfsId: city.bfsId, name: city.name, zipCode: city.zipCode, cantonCode: city.cantonCode, totalTax: item.totalTax, effectiveRate: item.effectiveRate })
              }
            }
          }
          setCalcProgress({ current: Math.min(i + batchSize, cantonCities.length), total: cantonCities.length })
        }

        allResults.sort((a, b) => {
          if (a.error && !b.error) return 1
          if (!a.error && b.error) return -1
          if (a.error || b.error) return 0
          return (a as GemeindeResult).totalTax - (b as GemeindeResult).totalTax
        })

        setGemeindeResults(allResults)
        setCalculatingGemeinden(false)
      }
      recalculate()
    }

    // Re-calculate compared municipalities
    if (selectedMunis.length > 0 && compareResults.length > 0 && !compareLoading) {
      handleCompare()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [grossIncome, maritalStatus, children])

  // Derived data for canton view
  const cantonCheapest = cantonResults[0] ?? null
  const cantonMostExpensive = cantonResults[cantonResults.length - 1] ?? null
  const cantonSavings = cantonCheapest && cantonMostExpensive ? cantonMostExpensive.totalTax - cantonCheapest.totalTax : 0

  // Derived data for gemeinde views
  const successfulGemeindeResults = gemeindeResults.filter((r): r is GemeindeResult => !r.error)
  const hasGemeindeErrors = gemeindeResults.some((r) => r.error)
  const gemeindeCheapest = successfulGemeindeResults[0] ?? null
  const gemeindeMostExpensive = successfulGemeindeResults[successfulGemeindeResults.length - 1] ?? null
  const gemeindeSavings = gemeindeCheapest && gemeindeMostExpensive ? gemeindeMostExpensive.totalTax - gemeindeCheapest.totalTax : 0

  const successfulCompareResults = compareResults.filter((r): r is GemeindeResult => !r.error)
  const hasCompareErrors = compareResults.some((r) => r.error)
  const compareCheapest = successfulCompareResults[0] ?? null
  const compareMostExpensive = successfulCompareResults[successfulCompareResults.length - 1] ?? null
  const compareSavings = compareCheapest && compareMostExpensive ? compareMostExpensive.totalTax - compareCheapest.totalTax : 0

  const onDownloadPdf = async () => {
    if (cantonResults.length === 0) return
    const cheapest = cantonResults[0]
    const mostExpensive = cantonResults[cantonResults.length - 1]
    const pdfData = {
      locale,
      calculatedAt: new Date().toLocaleDateString(locale === 'de' ? 'de-CH' : 'en-CH'),
      inputs: {
        grossIncome,
        maritalStatus: maritalStatus === 'single' ? (locale === 'de' ? 'Ledig' : 'Single') : (locale === 'de' ? 'Verheiratet' : 'Married'),
        children,
      },
      summary: {
        cheapest: { name: cheapest.name, totalTax: cheapest.totalTax },
        mostExpensive: { name: mostExpensive.name, totalTax: mostExpensive.totalTax },
        savings: mostExpensive.totalTax - cheapest.totalTax,
      },
      cantonResults: cantonResults.map((r, i) => ({
        rank: i + 1,
        name: r.name,
        code: r.code,
        totalTax: r.totalTax,
        effectiveRate: r.effectiveRate,
      })),
    }
    const success = await handleDownload(
      pdfData,
      { grossIncome, maritalStatus, children },
      { cantonResults },
      'steuervergleich.pdf',
    )
    if (success) setPdfToast(t.toolPdf.savedToAccount)
  }

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
      <section className="container-narrow py-8 lg:py-10">
        <div className="card p-4 lg:p-5 -mt-12 relative z-10">
          <p className="text-sm text-navy-500 mb-4 text-center">
            {t.taxCompare.formIntro}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            {/* Income with brutto/netto toggle */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-sm font-medium text-navy-700">
                  {incomeMode === 'brutto' ? t.taxCompare.grossIncome : t.taxCompare.netIncome}
                </label>
                <div className="flex rounded-md border border-navy-200 overflow-hidden text-xs">
                  <button
                    type="button"
                    onClick={() => setIncomeMode('brutto')}
                    className={`px-2 py-0.5 font-medium transition-colors ${incomeMode === 'brutto' ? 'bg-navy-800 text-white' : 'bg-white text-navy-600 hover:bg-navy-50'}`}
                  >
                    {t.taxCompare.incomeMode}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIncomeMode('netto')}
                    className={`px-2 py-0.5 font-medium transition-colors ${incomeMode === 'netto' ? 'bg-navy-800 text-white' : 'bg-white text-navy-600 hover:bg-navy-50'}`}
                  >
                    {t.taxCompare.incomeModeNet}
                  </button>
                </div>
              </div>
              <input
                type="number"
                min={0}
                step={10000}
                value={incomeInput}
                onChange={(e) => setIncomeInput(Math.max(0, Number(e.target.value)))}
                placeholder={t.taxCompare.grossIncomePlaceholder}
                className="w-full px-3 py-2.5 rounded-xl border border-navy-200 bg-white text-navy-900 focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-transparent"
              />
              {incomeMode === 'netto' && (
                <p className="text-xs text-navy-400 mt-1">{t.taxCompare.netHint} — Brutto: CHF {grossIncome.toLocaleString('de-CH')}</p>
              )}
            </div>

            {/* Marital Status Toggle */}
            <div>
              <label className="block text-sm font-medium text-navy-700 mb-1">
                {t.taxCompare.maritalStatus}
              </label>
              <div className="flex gap-1.5">
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

            {/* Children */}
            <div>
              <label className="block text-sm font-medium text-navy-700 mb-1">
                {t.taxCompare.children}
              </label>
              <input
                type="number"
                min={0}
                max={5}
                value={children}
                onChange={(e) => setChildren(Math.min(5, Math.max(0, Number(e.target.value))))}
                placeholder={t.taxCompare.childrenPlaceholder}
                className="w-full px-3 py-2.5 rounded-xl border border-navy-200 bg-white text-navy-900 focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Tab Switcher */}
          <div className="flex gap-2 mt-6 pt-6 border-t border-navy-100">
            <button
              type="button"
              onClick={() => setMainTab('canton')}
              className={`flex-1 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                mainTab === 'canton'
                  ? 'bg-navy-800 text-white'
                  : 'bg-navy-50 text-navy-600 hover:bg-navy-100'
              }`}
            >
              {t.taxCompare.tabs.canton}
            </button>
            <button
              type="button"
              onClick={() => setMainTab('gemeinde')}
              className={`flex-1 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                mainTab === 'gemeinde'
                  ? 'bg-navy-800 text-white'
                  : 'bg-navy-50 text-navy-600 hover:bg-navy-100'
              }`}
            >
              {t.taxCompare.tabs.gemeinde}
            </button>
          </div>
        </div>
      </section>

      {/* Canton Comparison Tab */}
      {mainTab === 'canton' && (
        <>
          <section className="container-narrow py-4">
            <SummaryCards
              cheapestLabel={t.taxCompare.cheapest}
              mostExpensiveLabel={t.taxCompare.mostExpensive}
              savingsLabel={t.taxCompare.savingsPotential}
              cheapest={cantonCheapest}
              mostExpensive={cantonMostExpensive}
              savings={cantonSavings}
              grossIncome={grossIncome}
            />
          </section>

          <section className="container-narrow py-4">
            <button
              onClick={onDownloadPdf}
              disabled={pdfLoading}
              className="mb-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-navy-800 text-white text-sm font-medium hover:bg-navy-900 transition-colors disabled:opacity-60"
            >
              {pdfLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              {pdfLoading ? t.toolPdf.downloading : t.toolPdf.download}
            </button>
          </section>

          <section className="container-wide py-4">
            <button
              type="button"
              onClick={() => setShowMap((v) => !v)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-navy-200 bg-white text-navy-600 hover:bg-navy-50 transition mb-4"
            >
              <Map className="w-4 h-4" />
              {showMap ? t.taxCompare.map.hide : t.taxCompare.map.show}
            </button>
            {showMap && (
              <TaxMap
                mode="canton"
                cantonResults={cantonResults}
                onCantonClick={(code) => {
                  setMainTab('gemeinde')
                  setGemeindeMode('withinCanton')
                  handleCantonSelect(code)
                  // Scroll down so user sees the loading state
                  setTimeout(() => {
                    window.scrollTo({ top: 400, behavior: 'smooth' })
                  }, 100)
                }}
                labels={t.taxCompare.map}
              />
            )}
          </section>

          <section className="container-wide py-4 lg:py-8">
            <h2 className="text-2xl font-bold mb-6">{t.taxCompare.resultsTitle}</h2>
            <RankingTable
              results={cantonResults.map((r) => ({ key: r.code, name: r.name, code: r.code, totalTax: r.totalTax, effectiveRate: r.effectiveRate }))}
              nameLabel={t.taxCompare.canton}
              rankLabel={t.taxCompare.rank}
              totalTaxLabel={t.taxCompare.totalTax}
              effectiveRateLabel={t.taxCompare.effectiveRate}
              searchPlaceholder={t.taxCompare.searchCanton}
            />
          </section>

          <section className="container-narrow py-4">
            <div className="mt-6">
              <InlineToolCta toolKey="steuervergleich" />
            </div>
          </section>

          <section className="container-narrow py-4">
            <p className="text-sm dark-text-secondary text-center italic">
              {t.taxCompare.disclaimer}
            </p>
          </section>
        </>
      )}

      {/* Gemeinde Comparison Tab */}
      {mainTab === 'gemeinde' && (
        <>
          {/* Sub-mode toggle */}
          <section className="container-narrow py-4">
            <div className="flex gap-2 mb-6">
              <button
                type="button"
                onClick={() => setGemeindeMode('withinCanton')}
                className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium border transition-colors ${
                  gemeindeMode === 'withinCanton'
                    ? 'bg-navy-100 text-navy-800 border-navy-300'
                    : 'bg-white text-navy-500 border-navy-200 hover:bg-navy-50'
                }`}
              >
                {t.taxCompare.gemeinde.withinCanton}
              </button>
              <button
                type="button"
                onClick={() => setGemeindeMode('compare')}
                className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium border transition-colors ${
                  gemeindeMode === 'compare'
                    ? 'bg-navy-100 text-navy-800 border-navy-300'
                    : 'bg-white text-navy-500 border-navy-200 hover:bg-navy-50'
                }`}
              >
                {t.taxCompare.gemeinde.compare}
              </button>
            </div>

            {/* Mode A: Within Canton */}
            {gemeindeMode === 'withinCanton' && (
              <div className="card p-5 mb-6">
                <label className="block text-sm font-medium text-navy-700 mb-2">
                  {t.taxCompare.gemeinde.selectCanton}
                </label>
                <select
                  value={selectedCanton}
                  onChange={(e) => handleCantonSelect(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-navy-200 bg-white text-navy-900 focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                >
                  <option value="">{t.taxCompare.gemeinde.selectCanton}...</option>
                  {cantons.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.name[locale]} ({c.code})
                    </option>
                  ))}
                </select>

                {(cantonLoading || calculatingGemeinden) && (
                  <div className="flex items-center gap-3 mt-4 text-navy-600">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span className="text-sm">
                      {calculatingGemeinden && calcProgress.total > 0
                        ? t.taxCompare.gemeinde.loadingProgress
                            .replace('{current}', String(calcProgress.current))
                            .replace('{total}', String(calcProgress.total))
                        : t.taxCompare.gemeinde.loading}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Mode B: Compare specific municipalities */}
            {gemeindeMode === 'compare' && (
              <div className="card p-5 mb-6">
                {/* Search input */}
                <div className="relative" ref={muni.dropdownRef}>
                  <label className="block text-sm font-medium text-navy-700 mb-2">
                    {t.taxCompare.gemeinde.searchGemeinde}
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400" />
                      <input
                        type="text"
                        value={muniSearch}
                        onChange={(e) => {
                          setMuniSearch(e.target.value)
                          muni.handleSearch(e.target.value, 2025)
                        }}
                        placeholder={t.taxCompare.gemeinde.searchGemeinde}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-navy-200 bg-white text-navy-900 focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                        disabled={selectedMunis.length >= 10}
                      />
                      {muni.searchLoading && (
                        <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-navy-400" />
                      )}
                    </div>
                  </div>

                  {/* Dropdown */}
                  {muni.showDropdown && muni.municipalities.length > 0 && (
                    <div className="absolute z-20 w-full mt-1 bg-white border border-navy-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                      {muni.municipalities.map((city) => {
                        const alreadyAdded = selectedMunis.some((m) => m.id === city.id)
                        return (
                          <button
                            key={city.id}
                            type="button"
                            disabled={alreadyAdded}
                            onClick={() => addMunicipality(city)}
                            className={`w-full text-left px-4 py-2.5 hover:bg-navy-50 transition flex items-center justify-between ${
                              alreadyAdded ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                          >
                            <span>
                              <span className="font-medium">{city.name}</span>
                              <span className="text-sm text-navy-500 ml-2">
                                {city.zipCode} ({city.cantonCode})
                              </span>
                            </span>
                            {!alreadyAdded && <Plus className="w-4 h-4 text-navy-400" />}
                          </button>
                        )
                      })}
                    </div>
                  )}

                  {selectedMunis.length >= 10 && (
                    <p className="text-xs text-gold-600 mt-1">{t.taxCompare.gemeinde.maxReached}</p>
                  )}
                </div>

                {/* Selected chips */}
                {selectedMunis.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {selectedMunis.map((city) => (
                      <span
                        key={city.id}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-navy-100 text-navy-700 rounded-full text-sm"
                      >
                        {city.name} ({city.cantonCode})
                        <button
                          type="button"
                          onClick={() => removeMunicipality(city.id)}
                          className="hover:text-red-600 transition"
                          title={t.taxCompare.gemeinde.remove}
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {/* Compare button */}
                {selectedMunis.length >= 2 && (
                  <button
                    type="button"
                    onClick={handleCompare}
                    disabled={compareLoading}
                    className="mt-4 w-full px-4 py-3 rounded-xl bg-navy-800 text-white font-medium hover:bg-navy-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {compareLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : null}
                    {t.taxCompare.gemeinde.compareButton}
                  </button>
                )}
              </div>
            )}
          </section>

          {/* Mode A Results */}
          {gemeindeMode === 'withinCanton' && successfulGemeindeResults.length > 0 && (
            <>
              <section className="container-narrow py-4">
                <SummaryCards
                  cheapestLabel={t.taxCompare.gemeinde.cheapest}
                  mostExpensiveLabel={t.taxCompare.gemeinde.mostExpensive}
                  savingsLabel={t.taxCompare.savingsPotential}
                  cheapest={gemeindeCheapest}
                  mostExpensive={gemeindeMostExpensive}
                  savings={gemeindeSavings}
                  grossIncome={grossIncome}
                />
              </section>

              <section className="container-wide py-4">
                <button
                  type="button"
                  onClick={() => setShowMap((v) => !v)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-navy-200 bg-white text-navy-600 hover:bg-navy-50 transition mb-4"
                >
                  <Map className="w-4 h-4" />
                  {showMap ? t.taxCompare.map.hide : t.taxCompare.map.show}
                </button>
                {showMap && (
                  <TaxMap
                    mode="municipality"
                    gemeindeResults={successfulGemeindeResults.map((r) => ({
                      taxLocationId: r.taxLocationId,
                      bfsId: r.bfsId,
                      name: r.name,
                      totalTax: r.totalTax,
                      effectiveRate: r.effectiveRate,
                    }))}
                    selectedCanton={selectedCanton}
                    onMunicipalityClick={scrollToBfs}
                    labels={t.taxCompare.map}
                  />
                )}
              </section>

              <section className="container-wide py-4 lg:py-8">
                <h2 className="text-2xl font-bold mb-6">{t.taxCompare.gemeinde.resultsTitle}</h2>

                {hasGemeindeErrors && (
                  <div className="flex items-center gap-2 mb-4 px-4 py-3 bg-gold-50 border border-gold-200 rounded-xl text-sm text-gold-700">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {t.taxCompare.gemeinde.partialError}
                  </div>
                )}

                <RankingTable
                  results={successfulGemeindeResults.map((r) => ({
                    key: String(r.taxLocationId),
                    name: `${r.name} (${r.zipCode})`,
                    code: r.cantonCode,
                    totalTax: r.totalTax,
                    effectiveRate: r.effectiveRate,
                    bfsId: r.bfsId,
                  }))}
                  nameLabel={t.taxCompare.gemeinde.municipality}
                  rankLabel={t.taxCompare.rank}
                  totalTaxLabel={t.taxCompare.totalTax}
                  effectiveRateLabel={t.taxCompare.effectiveRate}
                  searchPlaceholder={t.taxCompare.gemeinde.searchGemeinde}
                />
              </section>

              <section className="container-narrow py-4">
                <p className="text-sm dark-text-secondary text-center italic">
                  {t.taxCompare.gemeinde.disclaimer}
                </p>
                <p className="text-sm dark-text-secondary text-center mt-2">
                  {t.taxCompare.gemeinde.notFound}
                </p>
              </section>
            </>
          )}

          {/* Mode A: No results after loading */}
          {gemeindeMode === 'withinCanton' && selectedCanton && !cantonLoading && !calculatingGemeinden && cantonCities.length === 0 && (
            <section className="container-narrow py-4">
              <p className="text-sm dark-text-secondary text-center">{t.taxCompare.gemeinde.noResults}</p>
            </section>
          )}

          {/* Mode B Results */}
          {gemeindeMode === 'compare' && successfulCompareResults.length > 0 && (
            <>
              <section className="container-narrow py-4">
                <SummaryCards
                  cheapestLabel={t.taxCompare.gemeinde.cheapest}
                  mostExpensiveLabel={t.taxCompare.gemeinde.mostExpensive}
                  savingsLabel={t.taxCompare.savingsPotential}
                  cheapest={compareCheapest}
                  mostExpensive={compareMostExpensive}
                  savings={compareSavings}
                  grossIncome={grossIncome}
                />
              </section>

              <section className="container-wide py-4">
                <button
                  type="button"
                  onClick={() => setShowMap((v) => !v)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-navy-200 bg-white text-navy-600 hover:bg-navy-50 transition mb-4"
                >
                  <Map className="w-4 h-4" />
                  {showMap ? t.taxCompare.map.hide : t.taxCompare.map.show}
                </button>
                {showMap && (
                  <TaxMap
                    mode="municipality"
                    gemeindeResults={successfulCompareResults.map((r) => ({
                      taxLocationId: r.taxLocationId,
                      bfsId: r.bfsId,
                      name: r.name,
                      totalTax: r.totalTax,
                      effectiveRate: r.effectiveRate,
                    }))}
                    onMunicipalityClick={scrollToBfs}
                    labels={t.taxCompare.map}
                  />
                )}
              </section>

              <section className="container-wide py-4 lg:py-8">
                <h2 className="text-2xl font-bold mb-6">{t.taxCompare.gemeinde.resultsTitle}</h2>

                {hasCompareErrors && (
                  <div className="flex items-center gap-2 mb-4 px-4 py-3 bg-gold-50 border border-gold-200 rounded-xl text-sm text-gold-700">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {t.taxCompare.gemeinde.partialError}
                  </div>
                )}

                <RankingTable
                  results={successfulCompareResults.map((r) => ({
                    key: String(r.taxLocationId),
                    name: `${r.name} (${r.zipCode})`,
                    code: r.cantonCode,
                    totalTax: r.totalTax,
                    effectiveRate: r.effectiveRate,
                    bfsId: r.bfsId,
                  }))}
                  nameLabel={t.taxCompare.gemeinde.municipality}
                  rankLabel={t.taxCompare.rank}
                  totalTaxLabel={t.taxCompare.totalTax}
                  effectiveRateLabel={t.taxCompare.effectiveRate}
                  searchPlaceholder={t.taxCompare.gemeinde.searchGemeinde}
                />
              </section>
            </>
          )}
        </>
      )}

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

      {pdfToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-trust-50 border border-trust-200 text-trust-700 px-5 py-3 rounded-xl shadow-lg text-sm font-medium">
          {pdfToast}
        </div>
      )}

      <GuestPdfModal
        isOpen={showGuestModal}
        onClose={() => setShowGuestModal(false)}
        onSend={(data) => {
          const cheapest = cantonResults[0]
          const mostExpensive = cantonResults[cantonResults.length - 1]
          const pdfData = {
            locale,
            calculatedAt: new Date().toLocaleDateString(locale === 'de' ? 'de-CH' : 'en-CH'),
            inputs: {
              grossIncome,
              maritalStatus: maritalStatus === 'single' ? (locale === 'de' ? 'Ledig' : 'Single') : (locale === 'de' ? 'Verheiratet' : 'Married'),
              children,
            },
            summary: cheapest && mostExpensive ? {
              cheapest: { name: cheapest.name, totalTax: cheapest.totalTax },
              mostExpensive: { name: mostExpensive.name, totalTax: mostExpensive.totalTax },
              savings: mostExpensive.totalTax - cheapest.totalTax,
            } : undefined,
            cantonResults: cantonResults.map((r, i) => ({
              rank: i + 1,
              name: r.name,
              code: r.code,
              totalTax: r.totalTax,
              effectiveRate: r.effectiveRate,
            })),
          }
          handleGuestSend(data, pdfData)
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
