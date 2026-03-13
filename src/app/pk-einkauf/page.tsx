'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useI18n } from '@/lib/i18n/context'
import { cantons, cantonCapitals, calculateSwissTax } from '@/lib/swiss-data'
import { calculateTaxESTV, type TaxCity } from '@/lib/estv-tax'
import { useMunicipalitySearch } from '@/hooks/useMunicipalitySearch'
import { TrendingUp, ArrowRight, Shield, Landmark, ChevronDown, Loader2, Search, AlertTriangle } from 'lucide-react'
import { InlineToolCta } from '@/components/InlineToolCta'

const CONFESSION_MAP: Record<string, number> = {
  none: 5,
  protestant: 1,
  catholic: 2,
  christCatholic: 3,
}

function formatCHF(amount: number): string {
  return 'CHF ' + new Intl.NumberFormat('de-CH', { minimumFractionDigits: 0 }).format(Math.round(amount))
}

// Simplified capital withdrawal tax calculation (progressive)
function calcWithdrawalTax(amount: number, cantonMultiplier: number, isMarried: boolean): number {
  let federalTax = 0
  const brackets = [
    { limit: 25000, rate: 0 },
    { limit: 50000, rate: 0.01 },
    { limit: 100000, rate: 0.015 },
    { limit: 200000, rate: 0.02 },
    { limit: 500000, rate: 0.025 },
    { limit: 1000000, rate: 0.03 },
    { limit: Infinity, rate: 0.035 },
  ]
  let remaining = amount
  let prevLimit = 0
  for (const bracket of brackets) {
    const taxable = Math.min(remaining, bracket.limit - prevLimit)
    if (taxable <= 0) break
    federalTax += taxable * bracket.rate
    remaining -= taxable
    prevLimit = bracket.limit
  }
  if (isMarried) federalTax *= 0.85

  const cantonalRate = 0.03 * cantonMultiplier
  const cantonalTax = amount * cantonalRate
  const municipalTax = cantonalTax * 0.8

  return Math.round(federalTax + cantonalTax + municipalTax)
}

export default function PkEinkaufCalculator() {
  const { t, locale } = useI18n()
  const p = t.pkEinkaufCalc

  // Input states
  const [incomeMode, setIncomeMode] = useState<'brutto' | 'netto'>('brutto')
  const [incomeInput, setIncomeInput] = useState(100000)
  const grossIncome = incomeMode === 'netto' ? Math.round(incomeInput * 1.15) : incomeInput
  const [cantonCode, setCantonCode] = useState('ZH')
  const [municipalitySearch, setMunicipalitySearch] = useState(cantonCapitals['ZH']?.name || '')
  const [selectedCity, setSelectedCity] = useState<TaxCity | null>(null)
  const [maritalStatus, setMaritalStatus] = useState<'single' | 'married'>('single')
  const [children, setChildren] = useState(0)
  const [age, setAge] = useState(45)
  const [confession, setConfession] = useState('none')
  const [purchaseAmount, setPurchaseAmount] = useState(50000)
  const [staggeringYears, setStaggeringYears] = useState(1)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [expectedReturn, setExpectedReturn] = useState(4)
  const [expectedPkReturn, setExpectedPkReturn] = useState(1.5)
  const [existingPkCapital, setExistingPkCapital] = useState(0)
  const [existing3aCapital, setExisting3aCapital] = useState(0)

  // Municipality search
  const muni = useMunicipalitySearch()

  // ESTV states
  const [estvWithdrawalTax, setEstvWithdrawalTax] = useState<number | null>(null)
  const [estvIncomeTax, setEstvIncomeTax] = useState<{ without: number; with: number } | null>(null)
  const [estvLoading, setEstvLoading] = useState(false)
  const [estvIncomeLoading, setEstvIncomeLoading] = useState(false)

  const retirementAge = 65
  const yearsToRetirement = Math.max(retirementAge - age, 1)

  const canton = cantons.find(c => c.code === cantonCode)
  const cantonMultiplier = canton?.taxMultiplier ?? 1

  const handleCantonChange = (code: string) => {
    setCantonCode(code)
    const capital = cantonCapitals[code]
    if (capital) {
      setMunicipalitySearch(capital.name)
      setSelectedCity(null)
    }
  }

  const handleMunicipalityInput = (value: string) => {
    setMunicipalitySearch(value)
    setSelectedCity(null)
    muni.handleSearch(value)
  }

  const selectCity = (city: TaxCity) => {
    setSelectedCity(city)
    setMunicipalitySearch(`${city.zipCode} ${city.name}`)
    if (city.cantonCode !== cantonCode) {
      setCantonCode(city.cantonCode)
    }
    muni.setShowDropdown(false)
  }

  // Get the taxLocationId to use for ESTV calls
  const getTaxLocationId = (): number => {
    if (selectedCity) return selectedCity.id
    return cantonCapitals[cantonCode]?.taxLocationId ?? 0
  }

  // Total capital at retirement (for progressive withdrawal tax)
  const totalCapitalAtRetirement = existingPkCapital + purchaseAmount + existing3aCapital

  const results = useMemo(() => {
    // Reset ESTV results when inputs change
    setEstvWithdrawalTax(null)
    setEstvIncomeTax(null)

    const taxWithout = calculateSwissTax({
      grossIncome,
      cantonCode,
      maritalStatus,
      children,
      deductions3a: 0,
      commuting: 0,
      otherDeductions: 0,
    })

    if (!taxWithout) return null

    // Lump sum calculation
    const taxWithLump = calculateSwissTax({
      grossIncome,
      cantonCode,
      maritalStatus,
      children,
      deductions3a: 0,
      commuting: 0,
      otherDeductions: purchaseAmount,
    })
    if (!taxWithLump) return null
    const lumpSumSavings = taxWithout.totalTax - taxWithLump.totalTax

    // Marginal tax rate on the purchase
    const marginalRate = purchaseAmount > 0 ? (lumpSumSavings / purchaseAmount) * 100 : 0

    // Staggered calculation
    const annualPurchase = Math.round(purchaseAmount / staggeringYears)
    const taxWithStaggered = calculateSwissTax({
      grossIncome,
      cantonCode,
      maritalStatus,
      children,
      deductions3a: 0,
      commuting: 0,
      otherDeductions: annualPurchase,
    })
    if (!taxWithStaggered) return null
    const perYearSavings = taxWithout.totalTax - taxWithStaggered.totalTax
    const totalStaggeredSavings = perYearSavings * staggeringYears
    const staggeringBenefit = totalStaggeredSavings - lumpSumSavings

    // Withdrawal tax on total capital (progressive)
    const isMarried = maritalStatus === 'married'
    const withdrawalTaxTotal = calcWithdrawalTax(totalCapitalAtRetirement, cantonMultiplier, isMarried)
    const withdrawalTaxWithoutPurchase = calcWithdrawalTax(totalCapitalAtRetirement - purchaseAmount, cantonMultiplier, isMarried)
    // Marginal withdrawal tax attributable to the purchase amount
    const withdrawalTaxOnPurchase = withdrawalTaxTotal - withdrawalTaxWithoutPurchase

    const effectiveSavings = staggeringYears > 1 ? totalStaggeredSavings : lumpSumSavings
    const netBenefit = effectiveSavings - withdrawalTaxOnPurchase

    // ROI comparison (advanced)
    const pkReturn = expectedPkReturn / 100
    const altReturn = expectedReturn / 100
    const scenarioA =
      purchaseAmount * Math.pow(1 + pkReturn, yearsToRetirement) -
      withdrawalTaxOnPurchase +
      effectiveSavings * Math.pow(1 + altReturn, yearsToRetirement)
    const scenarioB = purchaseAmount * Math.pow(1 + altReturn, yearsToRetirement)
    const roiAdvantage = scenarioA - scenarioB

    const returnPercent = purchaseAmount > 0 ? (lumpSumSavings / purchaseAmount) * 100 : 0

    // Staggering year-by-year breakdown
    const staggeringTable = Array.from({ length: staggeringYears }, (_, i) => ({
      year: i + 1,
      purchase: annualPurchase,
      saving: perYearSavings,
    }))

    return {
      taxWithout: taxWithout.totalTax,
      taxWith: taxWithLump.totalTax,
      lumpSumSavings,
      marginalRate: Math.round(marginalRate * 10) / 10,
      annualPurchase,
      perYearSavings,
      totalStaggeredSavings,
      staggeringBenefit,
      withdrawalTaxTotal,
      withdrawalTaxOnPurchase,
      netBenefit,
      returnPercent: Math.round(returnPercent * 10) / 10,
      scenarioA: Math.round(scenarioA),
      scenarioB: Math.round(scenarioB),
      roiAdvantage: Math.round(roiAdvantage),
      staggeringTable,
    }
  }, [grossIncome, cantonCode, maritalStatus, children, purchaseAmount, staggeringYears, cantonMultiplier, expectedReturn, expectedPkReturn, yearsToRetirement, totalCapitalAtRetirement])

  // ESTV exact withdrawal tax calculation
  const handleEstvWithdrawal = async () => {
    setEstvLoading(true)
    try {
      const taxLocationId = getTaxLocationId()
      if (!taxLocationId) return

      // Calculate tax on total capital and on capital without purchase
      const [resultTotal, resultWithout] = await Promise.all([
        calculateTaxESTV({
          taxYear: 2025,
          taxLocationId,
          grossIncome: totalCapitalAtRetirement,
          maritalStatus,
          children,
          incomeType1: 3,
          confession: CONFESSION_MAP[confession] ?? 5,
          age1: 65,
        }),
        calculateTaxESTV({
          taxYear: 2025,
          taxLocationId,
          grossIncome: Math.max(totalCapitalAtRetirement - purchaseAmount, 1),
          maritalStatus,
          children,
          incomeType1: 3,
          confession: CONFESSION_MAP[confession] ?? 5,
          age1: 65,
        }),
      ])
      if (resultTotal && resultWithout) {
        setEstvWithdrawalTax(resultTotal.totalTax - resultWithout.totalTax)
      } else if (resultTotal) {
        setEstvWithdrawalTax(resultTotal.totalTax)
      }
    } finally {
      setEstvLoading(false)
    }
  }

  // ESTV exact income tax calculation
  const handleEstvIncome = async () => {
    setEstvIncomeLoading(true)
    try {
      const taxLocationId = getTaxLocationId()
      if (!taxLocationId) return

      const [resultWithout, resultWith] = await Promise.all([
        calculateTaxESTV({
          taxYear: 2025,
          taxLocationId,
          grossIncome,
          maritalStatus,
          children,
          confession: CONFESSION_MAP[confession] ?? 5,
          age1: age,
        }),
        calculateTaxESTV({
          taxYear: 2025,
          taxLocationId,
          grossIncome: grossIncome - purchaseAmount, // PK buy-in reduces taxable income
          maritalStatus,
          children,
          confession: CONFESSION_MAP[confession] ?? 5,
          age1: age,
        }),
      ])
      if (resultWithout && resultWith) {
        setEstvIncomeTax({ without: resultWithout.totalTax, with: resultWith.totalTax })
      }
    } finally {
      setEstvIncomeLoading(false)
    }
  }

  const displayWithdrawalTax = estvWithdrawalTax ?? results?.withdrawalTaxOnPurchase ?? 0
  const displaySavings = estvIncomeTax
    ? estvIncomeTax.without - estvIncomeTax.with
    : (results ? results.lumpSumSavings : 0)
  const effectiveTotalSavings = estvIncomeTax
    ? (staggeringYears > 1 ? displaySavings * staggeringYears : displaySavings)
    : (results ? (staggeringYears > 1 ? results.totalStaggeredSavings : results.lumpSumSavings) : 0)
  const displayNetBenefit = effectiveTotalSavings - displayWithdrawalTax

  return (
    <main>
      {/* Hero */}
      <section className="gradient-hero pt-24 pb-16 lg:pt-36 lg:pb-20 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-navy-700/20 blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-trust-500/10 border border-trust-500/20 text-trust-400 text-sm font-medium mb-6">
            <Landmark className="w-4 h-4" />
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
                onChange={(e) => handleCantonChange(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-navy-200 bg-white text-navy-900 focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-transparent"
              >
                {cantons.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.name[locale]}
                  </option>
                ))}
              </select>
            </div>

            {/* Municipality search */}
            <div ref={muni.dropdownRef} className="relative">
              <label className="block text-sm font-medium text-navy-700 mb-1">
                {p.municipality}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={municipalitySearch}
                  onChange={(e) => handleMunicipalityInput(e.target.value)}
                  onFocus={() => municipalitySearch.length >= 2 && muni.setShowDropdown(true)}
                  placeholder={p.municipalityPlaceholder}
                  className="w-full px-3 py-2.5 pr-9 rounded-xl border border-navy-200 bg-white text-navy-900 focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-navy-400">
                  {muni.searchLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                </div>
              </div>
              {muni.showDropdown && muni.municipalities.length > 0 && (
                <div className="absolute z-50 mt-1 w-full bg-white border border-navy-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                  {muni.municipalities.map((city) => (
                    <button
                      key={city.id}
                      onClick={() => selectCity(city)}
                      className="w-full text-left px-4 py-2.5 hover:bg-navy-50 text-sm transition-colors"
                    >
                      <span className="font-medium">{city.zipCode}</span> {city.name}
                      <span className="text-navy-400 ml-1">({city.cantonCode})</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Marital Status + Children row */}
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
                  {p.children}
                </label>
                <input
                  type="number"
                  value={children}
                  onChange={(e) => setChildren(Math.min(Math.max(Number(e.target.value) || 0, 0), 10))}
                  className="w-full px-3 py-2.5 rounded-xl border border-navy-200 bg-white text-navy-900 focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                  min={0}
                  max={10}
                />
              </div>
            </div>

            {/* Age + Confession row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm font-medium text-navy-700">{p.age}</label>
                  <span className="text-xs text-navy-500">{p.yearsToRetirement}: {yearsToRetirement}</span>
                </div>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(Math.min(Math.max(Number(e.target.value) || 25, 25), 64))}
                  className="w-full px-3 py-2.5 rounded-xl border border-navy-200 bg-white text-navy-900 focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                  min={25}
                  max={64}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1">
                  {p.confession}
                </label>
                <select
                  value={confession}
                  onChange={(e) => setConfession(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-navy-200 bg-white text-navy-900 focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                >
                  <option value="none">{p.confessionOptions.none}</option>
                  <option value="protestant">{p.confessionOptions.protestant}</option>
                  <option value="catholic">{p.confessionOptions.catholic}</option>
                  <option value="christCatholic">{p.confessionOptions.christCatholic}</option>
                </select>
              </div>
            </div>

            {/* Purchase Amount Slider + Input */}
            <div>
              <label className="block text-sm font-medium text-navy-700 mb-1">
                {p.purchaseAmount}
              </label>
              <input
                type="range"
                min={0}
                max={500000}
                step={1000}
                value={purchaseAmount}
                onChange={(e) => setPurchaseAmount(Number(e.target.value))}
                className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-navy-200 accent-navy-700 mb-1.5"
              />
              <input
                type="number"
                value={purchaseAmount}
                onChange={(e) => {
                  const val = Number(e.target.value) || 0
                  setPurchaseAmount(Math.max(val, 0))
                }}
                className="w-full px-3 py-2.5 rounded-xl border border-navy-200 bg-white text-navy-900 focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                min={0}
                step={1000}
              />
            </div>

            {/* Staggering */}
            <div>
              <label className="block text-sm font-medium text-navy-700 mb-1">
                {p.staggering}
              </label>
              <div className="flex gap-1.5">
                {[1, 2, 3, 4, 5].map((y) => (
                  <button
                    key={y}
                    onClick={() => setStaggeringYears(y)}
                    className={`flex-1 px-2 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                      staggeringYears === y
                        ? 'bg-navy-800 text-white border-navy-800'
                        : 'bg-white text-navy-700 border-navy-200 hover:bg-navy-50'
                    }`}
                  >
                    {y}
                  </button>
                ))}
              </div>
            </div>

            {/* Advanced Settings */}
            <div>
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-1.5 text-sm text-navy-600 hover:text-navy-800 transition-colors"
              >
                <ChevronDown className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
                {p.advancedSettings}
              </button>
              {showAdvanced && (
                <div className="mt-3 space-y-3 pl-1">
                  {/* Existing PK capital */}
                  <div>
                    <label className="block text-sm font-medium text-navy-700 mb-1">{p.existingPkCapital}</label>
                    <input
                      type="number"
                      value={existingPkCapital}
                      onChange={(e) => setExistingPkCapital(Math.max(Number(e.target.value) || 0, 0))}
                      className="w-full px-3 py-2.5 rounded-xl border border-navy-200 bg-white text-navy-900 focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                      min={0}
                      step={10000}
                    />
                  </div>
                  {/* Existing 3a capital */}
                  <div>
                    <label className="block text-sm font-medium text-navy-700 mb-1">{p.existing3aCapital}</label>
                    <input
                      type="number"
                      value={existing3aCapital}
                      onChange={(e) => setExisting3aCapital(Math.max(Number(e.target.value) || 0, 0))}
                      className="w-full px-3 py-2.5 rounded-xl border border-navy-200 bg-white text-navy-900 focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                      min={0}
                      step={10000}
                    />
                    <p className="text-xs text-navy-400 mt-1">{p.existingCapitalHint}</p>
                  </div>
                  {/* Expected returns */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-sm font-medium text-navy-700">{p.expectedReturn}</label>
                      <span className="text-xs text-navy-500 font-medium">{expectedReturn}%</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={8}
                      step={0.5}
                      value={expectedReturn}
                      onChange={(e) => setExpectedReturn(Number(e.target.value))}
                      className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-navy-200 accent-navy-700"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-sm font-medium text-navy-700">{p.expectedPkReturn}</label>
                      <span className="text-xs text-navy-500 font-medium">{expectedPkReturn}%</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={4}
                      step={0.25}
                      value={expectedPkReturn}
                      onChange={(e) => setExpectedPkReturn(Number(e.target.value))}
                      className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-navy-200 accent-navy-700"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Results */}
          <div className="card p-4 lg:p-5 space-y-4">
            <h2 className="text-lg font-semibold text-navy-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-trust-500" />
              {p.resultsTitle}
            </h2>

            {results ? (
              <div className="space-y-4">
                {/* Tax savings this year */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between py-2 border-b border-navy-200">
                    <span className="text-navy-600 text-sm">{p.taxWithout}</span>
                    <span className="text-navy-900 font-medium">
                      {estvIncomeTax ? formatCHF(estvIncomeTax.without) : formatCHF(results.taxWithout)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-navy-200">
                    <span className="text-navy-600 text-sm">{p.taxWith}</span>
                    <span className="text-navy-900 font-medium">
                      {estvIncomeTax ? formatCHF(estvIncomeTax.with) : formatCHF(results.taxWith)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-3 px-3 rounded-xl bg-trust-50 border border-trust-200">
                    <span className="text-trust-600 font-medium text-sm">{p.annualSavings}</span>
                    <span className="text-trust-600 text-lg font-bold">
                      {formatCHF(displaySavings)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-navy-200">
                    <span className="text-navy-600 text-sm">{p.marginalRate}</span>
                    <span className="text-navy-900 font-semibold">{results.marginalRate}%</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-navy-200">
                    <span className="text-navy-600 text-sm">{p.returnPercent}</span>
                    <span className="text-navy-900 font-semibold">{results.returnPercent}%</span>
                  </div>
                  {/* ESTV exact income tax button */}
                  <button
                    onClick={handleEstvIncome}
                    disabled={estvIncomeLoading}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-navy-200 text-navy-700 text-xs font-medium hover:bg-navy-50 transition-colors disabled:opacity-60"
                  >
                    {estvIncomeLoading ? (
                      <>
                        <Loader2 className="w-3 h-3 animate-spin" />
                        {p.withdrawalTaxLoading}
                      </>
                    ) : (
                      p.withdrawalTaxExactIncome
                    )}
                  </button>
                  {estvIncomeTax && (
                    <p className="text-xs text-trust-600">ESTV {selectedCity ? `(${municipalitySearch})` : `(${cantonCapitals[cantonCode]?.name})`}</p>
                  )}
                </div>

                {/* Staggering comparison */}
                {staggeringYears > 1 && (
                  <div className="rounded-xl border border-navy-200 overflow-hidden">
                    <div className="bg-navy-50 px-3 py-2">
                      <h3 className="text-sm font-semibold text-navy-800">{p.staggeringTitle}</h3>
                    </div>
                    <div className="divide-y divide-navy-100">
                      <div className="grid grid-cols-3 px-3 py-1.5 text-xs font-medium text-navy-500">
                        <span>{p.staggeringYear}</span>
                        <span className="text-right">{p.staggeringAnnualPurchase}</span>
                        <span className="text-right">{p.staggeringAnnualSaving}</span>
                      </div>
                      {results.staggeringTable.map((row) => (
                        <div key={row.year} className="grid grid-cols-3 px-3 py-1.5 text-sm">
                          <span className="text-navy-700">{row.year}</span>
                          <span className="text-right text-navy-700">{formatCHF(row.purchase)}</span>
                          <span className="text-right text-trust-600 font-medium">{formatCHF(row.saving)}</span>
                        </div>
                      ))}
                      <div className="bg-navy-50 px-3 py-2 space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-navy-600">{p.staggeringTotal}</span>
                          <span className="font-semibold text-navy-900">{formatCHF(results.totalStaggeredSavings)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-navy-600">{p.lumpSumSavings}</span>
                          <span className="text-navy-700">{formatCHF(results.lumpSumSavings)}</span>
                        </div>
                        {results.staggeringBenefit > 0 && (
                          <div className="flex justify-between text-sm pt-1 border-t border-navy-200">
                            <span className="text-trust-600 font-medium">{p.staggeringBenefit}</span>
                            <span className="text-trust-600 font-bold">{formatCHF(results.staggeringBenefit)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Withdrawal tax */}
                <div className="rounded-xl border border-navy-200 p-3 space-y-2">
                  <h3 className="text-sm font-semibold text-navy-800">{p.withdrawalTaxTitle}</h3>
                  {(existingPkCapital > 0 || existing3aCapital > 0) && (
                    <div className="flex items-center justify-between py-1.5 text-xs text-navy-500">
                      <span>{p.totalCapitalAtRetirement}</span>
                      <span>{formatCHF(totalCapitalAtRetirement)}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between py-2">
                    <span className="text-navy-600 text-sm">{p.withdrawalTaxOnPurchase}</span>
                    <span className="text-navy-900 font-medium">{formatCHF(displayWithdrawalTax)}</span>
                  </div>
                  <button
                    onClick={handleEstvWithdrawal}
                    disabled={estvLoading}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-navy-200 text-navy-700 text-xs font-medium hover:bg-navy-50 transition-colors disabled:opacity-60"
                  >
                    {estvLoading ? (
                      <>
                        <Loader2 className="w-3 h-3 animate-spin" />
                        {p.withdrawalTaxLoading}
                      </>
                    ) : (
                      p.withdrawalTaxExact
                    )}
                  </button>
                  {estvWithdrawalTax !== null && (
                    <p className="text-xs text-trust-600">ESTV {selectedCity ? `(${municipalitySearch})` : `(${cantonCapitals[cantonCode]?.name})`}</p>
                  )}
                </div>

                {/* Net benefit */}
                <div className="flex items-center justify-between py-3 px-3 rounded-xl bg-trust-50 border border-trust-200">
                  <div>
                    <span className="text-trust-600 font-medium text-sm block">{p.netBenefitTitle}</span>
                    <span className="text-trust-500 text-xs">{p.netBenefit}</span>
                  </div>
                  <span className={`text-lg font-bold ${displayNetBenefit >= 0 ? 'text-trust-600' : 'text-red-600'}`}>
                    {formatCHF(displayNetBenefit)}
                  </span>
                </div>

                {/* ROI Comparison (advanced) */}
                {showAdvanced && (
                  <div className="rounded-xl border border-navy-200 p-3 space-y-2">
                    <h3 className="text-sm font-semibold text-navy-800">{p.roiTitle}</h3>
                    <p className="text-xs text-navy-500">{p.yearsToRetirement}: {yearsToRetirement}</p>
                    <div className="flex items-center justify-between py-2 border-b border-navy-100">
                      <span className="text-navy-600 text-sm">{p.roiPkPurchase}</span>
                      <span className="text-navy-900 font-medium">{formatCHF(results.scenarioA)}</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-navy-100">
                      <span className="text-navy-600 text-sm">{p.roiAlternative}</span>
                      <span className="text-navy-900 font-medium">{formatCHF(results.scenarioB)}</span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className={`font-medium text-sm ${results.roiAdvantage >= 0 ? 'text-trust-600' : 'text-red-600'}`}>
                        {p.roiAdvantage}
                      </span>
                      <span className={`font-bold ${results.roiAdvantage >= 0 ? 'text-trust-600' : 'text-red-600'}`}>
                        {formatCHF(results.roiAdvantage)}
                      </span>
                    </div>
                  </div>
                )}

                {/* Important warnings */}
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 space-y-2">
                  <h3 className="text-sm font-semibold text-amber-800 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4" />
                    {p.warningTitle}
                  </h3>
                  <ul className="text-xs text-amber-700 space-y-1.5">
                    <li>{p.warning3YearRule}</li>
                    <li>{p.warningWef}</li>
                    <li>{p.warningMaxPurchase}</li>
                  </ul>
                </div>

                <p className="text-xs text-navy-500 pt-1">
                  {p.disclaimer}
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Landmark className="w-10 h-10 text-navy-300 mb-2" />
                <p className="text-navy-600 text-sm">{p.grossIncome}</p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6">
          <InlineToolCta toolKey="pkEinkauf" />
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
        <div className="container-wide">
          <div className="relative overflow-hidden rounded-2xl gradient-navy p-6 sm:p-10 lg:p-12">
            <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="relative text-center max-w-2xl mx-auto">
              <h2 className="font-heading text-xl sm:text-2xl lg:text-3xl font-bold dark-text-primary mb-5">
                {p.ctaTitle}
              </h2>
              <p className="dark-text-secondary mb-6">{p.ctaText}</p>
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
