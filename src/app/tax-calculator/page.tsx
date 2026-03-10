'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { useI18n } from '@/lib/i18n/context'
import { cantons, cantonCapitals, calculateSwissTax } from '@/lib/swiss-data'
import { searchCities, calculateTaxESTV, type TaxCity, type EstvTaxResult } from '@/lib/estv-tax'
import { Calculator, ArrowRight, ChevronDown, TrendingUp, Search, Loader2, GitCompareArrows, X } from 'lucide-react'

type FallbackResult = ReturnType<typeof calculateSwissTax>
type TaxResult = (EstvTaxResult | NonNullable<FallbackResult>) & { source: 'estv' | 'fallback' }

type MaritalStatus = 'single' | 'married' | 'divorced' | 'widowed'

interface FormState {
  grossIncome: string
  canton: string
  maritalStatus: MaritalStatus
  children: number
  deductions3a: string
  commuting: string
  otherDeductions: string
  confession: string
  municipalitySearch: string
  selectedCity: TaxCity | null
}

const CONFESSION_MAP: Record<string, number> = {
  none: 5,
  protestant: 1,
  catholic: 2,
  christCatholic: 3,
}

function createDefaultForm(cantonCode = 'ZH'): FormState {
  const capital = cantonCapitals[cantonCode]
  return {
    grossIncome: '',
    canton: cantonCode,
    maritalStatus: 'single',
    children: 0,
    deductions3a: '',
    commuting: '',
    otherDeductions: '',
    confession: 'none',
    municipalitySearch: capital ? `${capital.zipCode} ${capital.name}` : '',
    selectedCity: capital
      ? { id: capital.taxLocationId, zipCode: capital.zipCode, name: capital.name, cantonCode, bfsId: 0 }
      : null,
  }
}

// Municipality search hook
function useMunicipalitySearch() {
  const [municipalities, setMunicipalities] = useState<TaxCity[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [searchLoading, setSearchLoading] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleSearch = useCallback((term: string) => {
    setShowDropdown(true)
    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (term.length < 2) {
      setMunicipalities([])
      setSearchLoading(false)
      return
    }

    setSearchLoading(true)
    debounceRef.current = setTimeout(async () => {
      const results = await searchCities(term)
      setMunicipalities(results)
      setSearchLoading(false)
    }, 300)
  }, [])

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return { municipalities, showDropdown, setShowDropdown, searchLoading, dropdownRef, handleSearch }
}

async function computeTax(form: FormState): Promise<TaxResult | null> {
  const income = parseFloat(form.grossIncome) || 0
  if (income <= 0) return null

  if (form.selectedCity) {
    const estvResult = await calculateTaxESTV({
      taxLocationId: form.selectedCity.id,
      grossIncome: income,
      maritalStatus: form.maritalStatus,
      children: form.children,
      confession: CONFESSION_MAP[form.confession] ?? 5,
    })
    if (estvResult) return estvResult
  }

  const fallbackResult = calculateSwissTax({
    grossIncome: income,
    cantonCode: form.canton,
    maritalStatus: form.maritalStatus,
    children: form.children,
    deductions3a: parseFloat(form.deductions3a) || 0,
    commuting: parseFloat(form.commuting) || 0,
    otherDeductions: parseFloat(form.otherDeductions) || 0,
  })

  return fallbackResult ? { ...fallbackResult, source: 'fallback' as const } : null
}

// Tax form component used for both scenarios
function TaxForm({
  form,
  setForm,
  label,
  locale,
  t,
}: {
  form: FormState
  setForm: (f: FormState | ((prev: FormState) => FormState)) => void
  label?: string
  locale: 'de' | 'en'
  t: ReturnType<typeof useI18n>['t']
}) {
  const muni = useMunicipalitySearch()

  const updateField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleCantonChange = (code: string) => {
    const capital = cantonCapitals[code]
    setForm((prev) => ({
      ...prev,
      canton: code,
      selectedCity: capital
        ? { id: capital.taxLocationId, zipCode: capital.zipCode, name: capital.name, cantonCode: code, bfsId: 0 }
        : prev.selectedCity,
      municipalitySearch: capital ? `${capital.zipCode} ${capital.name}` : prev.municipalitySearch,
    }))
  }

  const handleMunicipalityInput = (term: string) => {
    updateField('municipalitySearch', term)
    muni.handleSearch(term)
  }

  const selectCity = (city: TaxCity) => {
    setForm((prev) => ({
      ...prev,
      selectedCity: city,
      municipalitySearch: `${city.zipCode} ${city.name}`,
      canton: city.cantonCode || prev.canton,
    }))
    muni.setShowDropdown(false)
  }

  return (
    <div>
      {label && (
        <h3 className="font-heading text-lg font-bold text-navy-900 mb-5 flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg bg-navy-100 flex items-center justify-center text-sm font-bold text-navy-600">
            {label}
          </span>
          {label === 'A' ? t.taxCalc.scenarioA : t.taxCalc.scenarioB}
        </h3>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Gross Income */}
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-navy-900 mb-2">
            {t.taxCalc.grossIncome}
          </label>
          <input
            type="number"
            value={form.grossIncome}
            onChange={(e) => updateField('grossIncome', e.target.value)}
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
              value={form.canton}
              onChange={(e) => handleCantonChange(e.target.value)}
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

        {/* Municipality */}
        <div ref={muni.dropdownRef} className="relative">
          <label className="block text-sm font-semibold text-navy-900 mb-2">
            {t.taxCalc.municipality}
          </label>
          <div className="relative">
            <input
              type="text"
              value={form.municipalitySearch}
              onChange={(e) => handleMunicipalityInput(e.target.value)}
              onFocus={() => form.municipalitySearch.length >= 2 && muni.setShowDropdown(true)}
              placeholder={t.taxCalc.municipalityPlaceholder}
              className="w-full px-4 py-3 pl-10 rounded-xl border-2 border-navy-200 text-navy-900 focus:border-navy-500 focus:ring-0 outline-none"
            />
            {muni.searchLoading ? (
              <Loader2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400 animate-spin" />
            ) : (
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400" />
            )}
          </div>
          {muni.showDropdown && muni.municipalities.length > 0 && (
            <div className="absolute z-50 mt-1 w-full bg-white border-2 border-navy-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
              {muni.municipalities.map((city) => (
                <button
                  key={city.id}
                  type="button"
                  onClick={() => selectCity(city)}
                  className="w-full text-left px-4 py-2.5 hover:bg-navy-50 text-navy-700 text-sm first:rounded-t-xl last:rounded-b-xl"
                >
                  <span className="font-medium">{city.zipCode}</span>{' '}
                  {city.name}
                  <span className="text-navy-400 ml-1">({city.cantonCode})</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Marital Status */}
        <div>
          <label className="block text-sm font-semibold text-navy-900 mb-2">
            {t.taxCalc.maritalStatus}
          </label>
          <div className="relative">
            <select
              value={form.maritalStatus}
              onChange={(e) => updateField('maritalStatus', e.target.value as MaritalStatus)}
              className="w-full px-4 py-3 rounded-xl border-2 border-navy-200 text-navy-700 bg-white focus:border-navy-500 focus:ring-0 outline-none appearance-none"
            >
              {Object.entries(t.taxCalc.maritalOptions).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-navy-400 pointer-events-none" />
          </div>
        </div>

        {/* Confession */}
        <div>
          <label className="block text-sm font-semibold text-navy-900 mb-2">
            {t.taxCalc.confession}
          </label>
          <div className="relative">
            <select
              value={form.confession}
              onChange={(e) => updateField('confession', e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-2 border-navy-200 text-navy-700 bg-white focus:border-navy-500 focus:ring-0 outline-none appearance-none"
            >
              {Object.entries(t.taxCalc.confessionOptions).map(([key, label]) => (
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
            value={form.children}
            onChange={(e) => updateField('children', parseInt(e.target.value) || 0)}
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
            value={form.deductions3a}
            onChange={(e) => updateField('deductions3a', e.target.value)}
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
            value={form.commuting}
            onChange={(e) => updateField('commuting', e.target.value)}
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
            value={form.otherDeductions}
            onChange={(e) => updateField('otherDeductions', e.target.value)}
            placeholder="0"
            className="w-full px-4 py-3 rounded-xl border-2 border-navy-200 text-navy-900 focus:border-navy-500 focus:ring-0 outline-none"
          />
        </div>
      </div>
    </div>
  )
}

// Result display for a single scenario
function ResultColumn({
  result,
  t,
  formatCHF,
}: {
  result: TaxResult
  t: ReturnType<typeof useI18n>['t']
  formatCHF: (n: number) => string
}) {
  return (
    <div className="space-y-4">
      {result.source === 'estv' && (
        <div className="flex justify-between items-center py-3 border-b border-navy-100">
          <span className="text-navy-600">{t.taxCalc.results.taxableIncome}</span>
          <span className="font-semibold text-navy-900">{formatCHF(result.taxableIncome)}</span>
        </div>
      )}
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
      {result.source === 'estv' && 'churchTax' in result && result.churchTax > 0 && (
        <div className="flex justify-between items-center py-3 border-b border-navy-100">
          <span className="text-navy-600">{t.taxCalc.results.churchTax}</span>
          <span className="font-semibold text-navy-900">{formatCHF(result.churchTax)}</span>
        </div>
      )}
      <div className="flex justify-between items-center py-4 bg-navy-50 rounded-xl px-4 -mx-4">
        <span className="font-bold text-navy-900">{t.taxCalc.results.total}</span>
        <span className="text-2xl font-bold text-navy-900">{formatCHF(result.totalTax)}</span>
      </div>
      <div className="flex justify-between items-center py-3">
        <span className="text-navy-600">{t.taxCalc.results.effective}</span>
        <span className="font-semibold text-navy-700">{result.effectiveRate}%</span>
      </div>
      <p className="text-xs text-navy-400 mt-2 italic">
        {result.source === 'estv'
          ? t.taxCalc.results.disclaimerEstv
          : t.taxCalc.results.disclaimerFallback}
      </p>
    </div>
  )
}

export default function TaxCalculatorPage() {
  const { t, locale } = useI18n()

  const [formA, setFormA] = useState<FormState>(() => createDefaultForm('ZH'))
  const [formB, setFormB] = useState<FormState>(() => createDefaultForm('ZH'))
  const [comparing, setComparing] = useState(false)

  const [resultA, setResultA] = useState<TaxResult | null>(null)
  const [resultB, setResultB] = useState<TaxResult | null>(null)
  const [calculating, setCalculating] = useState(false)

  const handleCalculate = async () => {
    setCalculating(true)

    if (comparing) {
      const [resA, resB] = await Promise.all([computeTax(formA), computeTax(formB)])
      setResultA(resA)
      setResultB(resB)
    } else {
      const resA = await computeTax(formA)
      setResultA(resA)
      setResultB(null)
    }

    setCalculating(false)
  }

  const toggleCompare = () => {
    if (!comparing) {
      // Copy formA values to formB as starting point
      setFormB({ ...formA })
    }
    setComparing(!comparing)
    setResultB(null)
  }

  const formatCHF = (amount: number) => {
    return new Intl.NumberFormat('de-CH', {
      style: 'currency',
      currency: 'CHF',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatDiffCHF = (amount: number) => {
    const prefix = amount > 0 ? '+' : ''
    return prefix + formatCHF(amount)
  }

  const diff = resultA && resultB ? resultA.totalTax - resultB.totalTax : null

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
        <div className={comparing ? 'max-w-6xl mx-auto px-4 sm:px-6 lg:px-8' : 'container-narrow'}>
          {/* Compare toggle */}
          <div className="flex justify-end mb-4">
            <button
              type="button"
              onClick={toggleCompare}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                comparing
                  ? 'bg-navy-100 text-navy-700 hover:bg-navy-200'
                  : 'bg-white border-2 border-navy-200 text-navy-600 hover:border-navy-400 hover:text-navy-800'
              }`}
            >
              {comparing ? (
                <>
                  <X className="w-4 h-4" />
                  {t.taxCalc.compareRemove}
                </>
              ) : (
                <>
                  <GitCompareArrows className="w-4 h-4" />
                  {t.taxCalc.compare}
                </>
              )}
            </button>
          </div>

          {/* Forms */}
          <div className={comparing ? 'grid grid-cols-1 lg:grid-cols-2 gap-6' : ''}>
            <div className="card p-8 sm:p-10">
              <TaxForm
                form={formA}
                setForm={setFormA}
                label={comparing ? 'A' : undefined}
                locale={locale}
                t={t}
              />

              {!comparing && (
                <button
                  onClick={handleCalculate}
                  disabled={calculating}
                  className="btn-primary !px-8 !py-4 w-full mt-8 group disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {calculating ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      {t.taxCalc.loading}
                    </>
                  ) : (
                    <>
                      <Calculator className="w-5 h-5 mr-2" />
                      {t.taxCalc.calculate}
                    </>
                  )}
                </button>
              )}
            </div>

            {comparing && (
              <div className="card p-8 sm:p-10">
                <TaxForm
                  form={formB}
                  setForm={setFormB}
                  label="B"
                  locale={locale}
                  t={t}
                />
              </div>
            )}
          </div>

          {/* Shared calculate button in compare mode */}
          {comparing && (
            <button
              onClick={handleCalculate}
              disabled={calculating}
              className="btn-primary !px-8 !py-4 w-full mt-6 group disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {calculating ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  {t.taxCalc.loading}
                </>
              ) : (
                <>
                  <Calculator className="w-5 h-5 mr-2" />
                  {t.taxCalc.calculate}
                </>
              )}
            </button>
          )}

          {/* Results - single mode */}
          {!comparing && resultA && (
            <div className="card p-8 sm:p-10 mt-8">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 rounded-xl bg-trust-100 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-trust-600" />
                </div>
                <h2 className="font-heading text-2xl font-bold text-navy-900">
                  {t.taxCalc.results.title}
                </h2>
              </div>
              <ResultColumn result={resultA} t={t} formatCHF={formatCHF} />
            </div>
          )}

          {/* Results - compare mode */}
          {comparing && (resultA || resultB) && (
            <div className="card p-8 sm:p-10 mt-8">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 rounded-xl bg-trust-100 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-trust-600" />
                </div>
                <h2 className="font-heading text-2xl font-bold text-navy-900">
                  {t.taxCalc.results.title}
                </h2>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Scenario A */}
                <div>
                  <h3 className="font-heading text-lg font-bold text-navy-900 mb-4 flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-navy-100 flex items-center justify-center text-sm font-bold text-navy-600">A</span>
                    {t.taxCalc.scenarioA}
                    {formA.selectedCity && (
                      <span className="text-sm font-normal text-navy-400">
                        — {formA.selectedCity.name} ({formA.canton})
                      </span>
                    )}
                  </h3>
                  {resultA ? (
                    <ResultColumn result={resultA} t={t} formatCHF={formatCHF} />
                  ) : (
                    <p className="text-navy-400 italic py-4">—</p>
                  )}
                </div>

                {/* Scenario B */}
                <div>
                  <h3 className="font-heading text-lg font-bold text-navy-900 mb-4 flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-navy-100 flex items-center justify-center text-sm font-bold text-navy-600">B</span>
                    {t.taxCalc.scenarioB}
                    {formB.selectedCity && (
                      <span className="text-sm font-normal text-navy-400">
                        — {formB.selectedCity.name} ({formB.canton})
                      </span>
                    )}
                  </h3>
                  {resultB ? (
                    <ResultColumn result={resultB} t={t} formatCHF={formatCHF} />
                  ) : (
                    <p className="text-navy-400 italic py-4">—</p>
                  )}
                </div>
              </div>

              {/* Difference summary */}
              {diff !== null && (
                <div className={`mt-8 p-5 rounded-xl border-2 ${
                  diff > 0
                    ? 'bg-green-50 border-green-200'
                    : diff < 0
                      ? 'bg-red-50 border-red-200'
                      : 'bg-navy-50 border-navy-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-navy-600">{t.taxCalc.difference}</p>
                      <p className={`text-sm mt-1 ${
                        diff > 0 ? 'text-green-700' : diff < 0 ? 'text-red-700' : 'text-navy-600'
                      }`}>
                        {diff > 0
                          ? `${t.taxCalc.scenarioB}: ${formatCHF(Math.abs(diff))} ${t.taxCalc.savings}`
                          : diff < 0
                            ? `${t.taxCalc.scenarioB}: ${formatCHF(Math.abs(diff))} ${t.taxCalc.moreExpensive}`
                            : '—'}
                      </p>
                    </div>
                    <span className={`text-2xl font-bold ${
                      diff > 0 ? 'text-green-700' : diff < 0 ? 'text-red-700' : 'text-navy-700'
                    }`}>
                      {formatDiffCHF(resultA!.totalTax - resultB!.totalTax)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* CTA after results */}
          {(resultA || resultB) && (
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
