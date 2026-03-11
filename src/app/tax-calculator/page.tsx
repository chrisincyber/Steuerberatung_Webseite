'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useI18n } from '@/lib/i18n/context'
import { cantons, cantonCapitals, calculateSwissTax } from '@/lib/swiss-data'
import { calculateTaxESTV, type TaxCity, type EstvTaxResult } from '@/lib/estv-tax'
import { useMunicipalitySearch } from '@/hooks/useMunicipalitySearch'
import { Calculator, ArrowRight, ChevronDown, TrendingUp, Search, Loader2, GitCompareArrows, X, Plus, Trash2, Info, SlidersHorizontal, ShieldAlert, Download, Mail, Shield } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

type FallbackResult = ReturnType<typeof calculateSwissTax>
type TaxResult = (EstvTaxResult | NonNullable<FallbackResult>) & { source: 'estv' | 'fallback' }

type MaritalStatus = 'single' | 'married' | 'divorced' | 'widowed'
type CalcMode = 'simple' | 'complex'

interface FormState {
  taxYear: number
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
  // Complex mode fields
  incomeType1: number // 1=Gross, 2=Net, 3=Pension
  age1: string
  income2: string
  incomeType2: number
  age2: string
  confession2: string
  fortune: string
  childAges: string[]
}

const TAX_YEARS = [2025, 2024, 2023, 2022, 2021]

const CONFESSION_MAP: Record<string, number> = {
  none: 5,
  protestant: 1,
  catholic: 2,
  christCatholic: 3,
}

const INCOME_TYPE_MAP: Record<number, string> = {
  1: 'gross',
  2: 'net',
  3: 'pension',
}

function createDefaultForm(cantonCode = 'ZH'): FormState {
  const capital = cantonCapitals[cantonCode]
  return {
    taxYear: 2025,
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
    incomeType1: 1,
    age1: '',
    income2: '',
    incomeType2: 1,
    age2: '',
    confession2: 'none',
    fortune: '',
    childAges: [],
  }
}

// Municipality search hook - imported from @/hooks/useMunicipalitySearch

async function computeTax(form: FormState, mode: CalcMode): Promise<TaxResult | null> {
  const income = parseFloat(form.grossIncome) || 0
  if (income <= 0) return null

  if (form.selectedCity) {
    const params: Parameters<typeof calculateTaxESTV>[0] = {
      taxYear: form.taxYear,
      taxLocationId: form.selectedCity.id,
      grossIncome: income,
      maritalStatus: form.maritalStatus,
      children: mode === 'complex' ? form.childAges.length : form.children,
      confession: CONFESSION_MAP[form.confession] ?? 5,
    }

    if (mode === 'complex') {
      params.incomeType1 = form.incomeType1
      params.age1 = parseInt(form.age1) || 40
      params.fortune = parseFloat(form.fortune) || 0
      if (form.childAges.length > 0) {
        params.childAges = form.childAges.map((a) => parseInt(a) || 10)
      }
      if (form.maritalStatus === 'married') {
        params.income2 = parseFloat(form.income2) || 0
        params.incomeType2 = form.incomeType2
        params.age2 = parseInt(form.age2) || 40
        params.confession2 = CONFESSION_MAP[form.confession2] ?? 5
      }
    }

    const estvResult = await calculateTaxESTV(params)
    if (estvResult) return estvResult
  }

  const fallbackResult = calculateSwissTax({
    grossIncome: income,
    cantonCode: form.canton,
    maritalStatus: form.maritalStatus,
    children: mode === 'complex' ? form.childAges.length : form.children,
    deductions3a: parseFloat(form.deductions3a) || 0,
    commuting: parseFloat(form.commuting) || 0,
    otherDeductions: parseFloat(form.otherDeductions) || 0,
  })

  return fallbackResult ? { ...fallbackResult, source: 'fallback' as const } : null
}

// Shared select wrapper
function SelectField({
  value,
  onChange,
  children,
}: {
  value: string | number
  onChange: (v: string) => void
  children: React.ReactNode
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 rounded-lg border-2 border-navy-200 text-navy-700 text-sm bg-white focus:border-navy-500 focus:ring-0 outline-none appearance-none"
      >
        {children}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400 pointer-events-none" />
    </div>
  )
}

// Tax form component used for both scenarios
function TaxForm({
  form,
  setForm,
  label,
  locale,
  t,
  mode,
}: {
  form: FormState
  setForm: (f: FormState | ((prev: FormState) => FormState)) => void
  label?: string
  locale: 'de' | 'en'
  t: ReturnType<typeof useI18n>['t']
  mode: CalcMode
}) {
  const muni = useMunicipalitySearch()
  const [showDeductions, setShowDeductions] = useState(false)

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
    muni.handleSearch(term, form.taxYear)
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

  const addChild = () => {
    setForm((prev) => ({
      ...prev,
      childAges: [...prev.childAges, ''],
    }))
  }

  const removeChild = (index: number) => {
    setForm((prev) => ({
      ...prev,
      childAges: prev.childAges.filter((_, i) => i !== index),
    }))
  }

  const updateChildAge = (index: number, value: string) => {
    setForm((prev) => ({
      ...prev,
      childAges: prev.childAges.map((a, i) => (i === index ? value : a)),
    }))
  }

  const isCouple = form.maritalStatus === 'married'

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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-4">

        {/* === SIMPLE MODE: single income field === */}
        {mode === 'simple' && (
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-navy-900 mb-1">
              {t.taxCalc.grossIncome}
            </label>
            <input
              type="number"
              value={form.grossIncome}
              onChange={(e) => updateField('grossIncome', e.target.value)}
              placeholder="80000"
              className="w-full px-3 py-2 rounded-lg border-2 border-navy-200 text-navy-900 text-sm focus:border-navy-500 focus:ring-0 outline-none"
            />
          </div>
        )}

        {/* === COMPLEX MODE: Person 1 === */}
        {mode === 'complex' && (
          <>
            <div className="md:col-span-2">
              <p className="text-sm font-bold text-navy-700 mb-3 uppercase tracking-wide">
                {isCouple ? t.taxCalc.person1 : ''}
              </p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-navy-900 mb-1">
                {t.taxCalc.income}
              </label>
              <input
                type="number"
                value={form.grossIncome}
                onChange={(e) => updateField('grossIncome', e.target.value)}
                placeholder="100000"
                className="w-full px-3 py-2 rounded-lg border-2 border-navy-200 text-navy-900 text-sm focus:border-navy-500 focus:ring-0 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-navy-900 mb-1">
                {t.taxCalc.incomeType}
              </label>
              <SelectField
                value={form.incomeType1}
                onChange={(v) => updateField('incomeType1', parseInt(v))}
              >
                {Object.entries(INCOME_TYPE_MAP).map(([id, key]) => (
                  <option key={id} value={id}>
                    {t.taxCalc.incomeTypes[key as keyof typeof t.taxCalc.incomeTypes]}
                  </option>
                ))}
              </SelectField>
            </div>
            <div>
              <label className="block text-sm font-semibold text-navy-900 mb-1">
                {t.taxCalc.age}
              </label>
              <input
                type="number"
                min="18"
                max="100"
                value={form.age1}
                onChange={(e) => updateField('age1', e.target.value)}
                placeholder="40"
                className="w-full px-3 py-2 rounded-lg border-2 border-navy-200 text-navy-900 text-sm focus:border-navy-500 focus:ring-0 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-navy-900 mb-1">
                {t.taxCalc.confession}
              </label>
              <SelectField
                value={form.confession}
                onChange={(v) => updateField('confession', v)}
              >
                {Object.entries(t.taxCalc.confessionOptions).map(([key, lbl]) => (
                  <option key={key} value={key}>{lbl}</option>
                ))}
              </SelectField>
            </div>
          </>
        )}

        {/* === COMPLEX MODE: Person 2 (married only) === */}
        {mode === 'complex' && isCouple && (
          <>
            <div className="md:col-span-2 mt-2">
              <div className="border-t border-navy-100 pt-4">
                <p className="text-sm font-bold text-navy-700 uppercase tracking-wide">
                  {t.taxCalc.person2}
                </p>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-navy-900 mb-1">
                {t.taxCalc.income}
              </label>
              <input
                type="number"
                value={form.income2}
                onChange={(e) => updateField('income2', e.target.value)}
                placeholder="60000"
                className="w-full px-3 py-2 rounded-lg border-2 border-navy-200 text-navy-900 text-sm focus:border-navy-500 focus:ring-0 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-navy-900 mb-1">
                {t.taxCalc.incomeType}
              </label>
              <SelectField
                value={form.incomeType2}
                onChange={(v) => updateField('incomeType2', parseInt(v))}
              >
                {Object.entries(INCOME_TYPE_MAP).map(([id, key]) => (
                  <option key={id} value={id}>
                    {t.taxCalc.incomeTypes[key as keyof typeof t.taxCalc.incomeTypes]}
                  </option>
                ))}
              </SelectField>
            </div>
            <div>
              <label className="block text-sm font-semibold text-navy-900 mb-1">
                {t.taxCalc.age}
              </label>
              <input
                type="number"
                min="18"
                max="100"
                value={form.age2}
                onChange={(e) => updateField('age2', e.target.value)}
                placeholder="38"
                className="w-full px-3 py-2 rounded-lg border-2 border-navy-200 text-navy-900 text-sm focus:border-navy-500 focus:ring-0 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-navy-900 mb-1">
                {t.taxCalc.confession}
              </label>
              <SelectField
                value={form.confession2}
                onChange={(v) => updateField('confession2', v)}
              >
                {Object.entries(t.taxCalc.confessionOptions).map(([key, lbl]) => (
                  <option key={key} value={key}>{lbl}</option>
                ))}
              </SelectField>
            </div>
          </>
        )}

        {/* Separator after persons in complex mode */}
        {mode === 'complex' && (
          <div className="md:col-span-2 mt-2">
            <div className="border-t border-navy-100 pt-4" />
          </div>
        )}

        {/* Tax Year */}
        <div>
          <label className="block text-sm font-semibold text-navy-900 mb-1">
            {t.taxCalc.taxYear}
          </label>
          <SelectField
            value={form.taxYear}
            onChange={(v) => updateField('taxYear', parseInt(v))}
          >
            {TAX_YEARS.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </SelectField>
        </div>

        {/* Canton */}
        <div>
          <label className="block text-sm font-semibold text-navy-900 mb-1">
            {t.taxCalc.canton}
          </label>
          <SelectField
            value={form.canton}
            onChange={handleCantonChange}
          >
            {cantons.map((c) => (
              <option key={c.code} value={c.code}>
                {c.name[locale]}
              </option>
            ))}
          </SelectField>
        </div>

        {/* Municipality */}
        <div ref={muni.dropdownRef} className="relative">
          <label className="block text-sm font-semibold text-navy-900 mb-1">
            {t.taxCalc.municipality}
          </label>
          <div className="relative">
            <input
              type="text"
              value={form.municipalitySearch}
              onChange={(e) => handleMunicipalityInput(e.target.value)}
              onFocus={() => form.municipalitySearch.length >= 2 && muni.setShowDropdown(true)}
              placeholder={t.taxCalc.municipalityPlaceholder}
              className="w-full px-3 py-2 pl-9 rounded-lg border-2 border-navy-200 text-navy-900 text-sm focus:border-navy-500 focus:ring-0 outline-none"
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
          <label className="block text-sm font-semibold text-navy-900 mb-1">
            {t.taxCalc.maritalStatus}
          </label>
          <SelectField
            value={form.maritalStatus}
            onChange={(v) => updateField('maritalStatus', v as MaritalStatus)}
          >
            {Object.entries(t.taxCalc.maritalOptions).map(([key, lbl]) => (
              <option key={key} value={key}>{lbl}</option>
            ))}
          </SelectField>
        </div>

        {/* Confession - only in simple mode (complex has it per-person) */}
        {mode === 'simple' && (
          <div>
            <label className="block text-sm font-semibold text-navy-900 mb-1">
              {t.taxCalc.confession}
            </label>
            <SelectField
              value={form.confession}
              onChange={(v) => updateField('confession', v)}
            >
              {Object.entries(t.taxCalc.confessionOptions).map(([key, lbl]) => (
                <option key={key} value={key}>{lbl}</option>
              ))}
            </SelectField>
          </div>
        )}

        {/* Children - simple mode: just a number */}
        {mode === 'simple' && (
          <div>
            <label className="block text-sm font-semibold text-navy-900 mb-1">
              {t.taxCalc.children}
            </label>
            <input
              type="number"
              min="0"
              max="10"
              value={form.children}
              onChange={(e) => updateField('children', parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 rounded-lg border-2 border-navy-200 text-navy-900 text-sm focus:border-navy-500 focus:ring-0 outline-none"
            />
          </div>
        )}

        {/* Children - complex mode: individual ages */}
        {mode === 'complex' && (
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-navy-900 mb-1">
              {t.taxCalc.children}
            </label>
            {form.childAges.length > 0 && (
              <div className="space-y-2 mb-3">
                {form.childAges.map((age, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-sm text-navy-500 w-20 shrink-0">
                      {t.taxCalc.childAge} {i + 1}
                    </span>
                    <input
                      type="number"
                      min="0"
                      max="25"
                      value={age}
                      onChange={(e) => updateChildAge(i, e.target.value)}
                      placeholder="5"
                      className="flex-1 px-4 py-2.5 rounded-xl border-2 border-navy-200 text-navy-900 focus:border-navy-500 focus:ring-0 outline-none text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => removeChild(i)}
                      className="p-2 text-navy-400 hover:text-red-500 transition-colors"
                      title={t.taxCalc.removeChild}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <button
              type="button"
              onClick={addChild}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-navy-600 hover:text-navy-800 transition-colors"
            >
              <Plus className="w-4 h-4" />
              {t.taxCalc.addChild}
            </button>
          </div>
        )}

        {/* Fortune - complex mode only */}
        {mode === 'complex' && (
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-navy-900 mb-1">
              {t.taxCalc.fortune}
            </label>
            <input
              type="number"
              value={form.fortune}
              onChange={(e) => updateField('fortune', e.target.value)}
              placeholder="250000"
              className="w-full px-3 py-2 rounded-lg border-2 border-navy-200 text-navy-900 text-sm focus:border-navy-500 focus:ring-0 outline-none"
            />
            <p className="text-xs text-navy-400 mt-1.5">{t.taxCalc.fortuneHint}</p>
          </div>
        )}

        {/* Simple mode deduction fields */}
        {mode === 'simple' && (
          <>
            <div>
              <label className="block text-sm font-semibold text-navy-900 mb-1">
                {t.taxCalc.deductions3a}
              </label>
              <input
                type="number"
                value={form.deductions3a}
                onChange={(e) => updateField('deductions3a', e.target.value)}
                placeholder="7056"
                className="w-full px-3 py-2 rounded-lg border-2 border-navy-200 text-navy-900 text-sm focus:border-navy-500 focus:ring-0 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-navy-900 mb-1">
                {t.taxCalc.commuting}
              </label>
              <input
                type="number"
                value={form.commuting}
                onChange={(e) => updateField('commuting', e.target.value)}
                placeholder="3000"
                className="w-full px-3 py-2 rounded-lg border-2 border-navy-200 text-navy-900 text-sm focus:border-navy-500 focus:ring-0 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-navy-900 mb-1">
                {t.taxCalc.otherDeductions}
              </label>
              <input
                type="number"
                value={form.otherDeductions}
                onChange={(e) => updateField('otherDeductions', e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2 rounded-lg border-2 border-navy-200 text-navy-900 text-sm focus:border-navy-500 focus:ring-0 outline-none"
              />
            </div>
          </>
        )}

        {/* Deductions guide - complex mode */}
        {mode === 'complex' && (
          <div className="md:col-span-2">
            <button
              type="button"
              onClick={() => setShowDeductions(!showDeductions)}
              className="inline-flex items-center gap-2 text-sm font-semibold text-navy-600 hover:text-navy-800 transition-colors"
            >
              <Info className="w-4 h-4" />
              {t.taxCalc.deductionsTitle}
              <ChevronDown className={`w-4 h-4 transition-transform ${showDeductions ? 'rotate-180' : ''}`} />
            </button>
            {showDeductions && (
              <div className="mt-3 p-4 bg-navy-50 rounded-xl">
                <p className="text-sm text-navy-600 mb-3">{t.taxCalc.deductionsHint}</p>
                <ul className="space-y-1.5">
                  {t.taxCalc.deductionsList.map((item, i) => (
                    <li key={i} className="text-sm text-navy-500 flex items-start gap-2">
                      <span className="text-navy-300 mt-0.5 shrink-0">&bull;</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
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
    <div className="space-y-1">
      {result.source === 'estv' && (
        <div className="flex justify-between items-center py-1.5 border-b border-navy-100">
          <span className="text-sm text-navy-600">{t.taxCalc.results.taxableIncome}</span>
          <span className="text-sm font-semibold text-navy-900">{formatCHF(result.taxableIncome)}</span>
        </div>
      )}
      <div className="flex justify-between items-center py-1.5 border-b border-navy-100">
        <span className="text-sm text-navy-600">{t.taxCalc.results.federal}</span>
        <span className="text-sm font-semibold text-navy-900">{formatCHF(result.federalTax)}</span>
      </div>
      <div className="flex justify-between items-center py-1.5 border-b border-navy-100">
        <span className="text-sm text-navy-600">{t.taxCalc.results.cantonal}</span>
        <span className="text-sm font-semibold text-navy-900">{formatCHF(result.cantonalTax)}</span>
      </div>
      <div className="flex justify-between items-center py-1.5 border-b border-navy-100">
        <span className="text-sm text-navy-600">{t.taxCalc.results.municipal}</span>
        <span className="text-sm font-semibold text-navy-900">{formatCHF(result.municipalTax)}</span>
      </div>
      {result.source === 'estv' && 'churchTax' in result && result.churchTax > 0 && (
        <div className="flex justify-between items-center py-1.5 border-b border-navy-100">
          <span className="text-sm text-navy-600">{t.taxCalc.results.churchTax}</span>
          <span className="text-sm font-semibold text-navy-900">{formatCHF(result.churchTax)}</span>
        </div>
      )}
      {result.source === 'estv' && 'fortuneTax' in result && result.fortuneTax > 0 && (
        <div className="flex justify-between items-center py-1.5 border-b border-navy-100">
          <span className="text-sm text-navy-600">{t.taxCalc.fortune}</span>
          <span className="text-sm font-semibold text-navy-900">{formatCHF(result.fortuneTax)}</span>
        </div>
      )}
      <div className="flex justify-between items-center py-2.5 bg-navy-50 rounded-lg px-3 -mx-3 mt-2">
        <span className="font-bold text-navy-900">{t.taxCalc.results.total}</span>
        <span className="text-xl font-bold text-navy-900">{formatCHF(result.totalTax)}</span>
      </div>
      <div className="flex justify-between items-center py-1.5">
        <span className="text-sm text-navy-600">{t.taxCalc.results.effective}</span>
        <span className="text-sm font-semibold text-navy-700">{result.effectiveRate}%</span>
      </div>
      <p className="text-xs text-navy-400 mt-1 italic">
        {result.source === 'estv'
          ? t.taxCalc.results.disclaimerEstv
          : t.taxCalc.results.disclaimerFallback}
      </p>
    </div>
  )
}

function buildPdfData(form: FormState, result: TaxResult, locale: 'de' | 'en', mode: CalcMode) {
  return {
    locale,
    calculatedAt: new Date().toLocaleDateString(locale === 'de' ? 'de-CH' : 'en-CH'),
    mode,
    form: {
      taxYear: form.taxYear,
      grossIncome: form.grossIncome,
      canton: form.canton,
      maritalStatus: form.maritalStatus,
      children: mode === 'complex' ? form.childAges.length : form.children,
      municipalityName: form.selectedCity?.name,
      confession: form.confession,
      income2: form.income2,
      fortune: form.fortune,
    },
    result: {
      source: result.source,
      federalTax: result.federalTax,
      cantonalTax: result.cantonalTax,
      municipalTax: result.municipalTax,
      churchTax: 'churchTax' in result ? result.churchTax : undefined,
      fortuneTax: 'fortuneTax' in result ? result.fortuneTax : undefined,
      totalTax: result.totalTax,
      effectiveRate: result.effectiveRate,
      taxableIncome: 'taxableIncome' in result ? result.taxableIncome : undefined,
    },
  }
}

function GuestPdfModal({
  onClose,
  onSend,
  sending,
  sent,
  error,
  t,
}: {
  onClose: () => void
  onSend: (data: { fullName: string; email: string; phone: string }) => void
  sending: boolean
  sent: boolean
  error: boolean
  t: ReturnType<typeof useI18n>['t']
}) {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full p-6 sm:p-8">
        <button onClick={onClose} className="absolute top-4 right-4 text-navy-400 hover:text-navy-600">
          <X className="w-5 h-5" />
        </button>

        <h3 className="font-heading text-xl font-bold text-navy-900 mb-4">
          {t.taxCalc.pdf.guestTitle}
        </h3>

        {sent ? (
          <div className="py-8 text-center">
            <Mail className="w-12 h-12 text-trust-500 mx-auto mb-3" />
            <p className="text-navy-700 font-medium">{t.taxCalc.pdf.success}</p>
          </div>
        ) : (
          <>
            <Link
              href="/auth/register?redirect=/tax-calculator"
              className="btn-primary w-full !py-3 flex items-center justify-center gap-2 mb-2"
            >
              {t.taxCalc.pdf.createAccount}
              <ArrowRight className="w-4 h-4" />
            </Link>
            <p className="text-xs text-navy-400 text-center mb-4">{t.taxCalc.pdf.createAccountHint}</p>

            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-navy-200" />
              <span className="text-sm text-navy-400">{t.taxCalc.pdf.or}</span>
              <div className="flex-1 h-px bg-navy-200" />
            </div>

            <p className="text-sm font-semibold text-navy-700 mb-3">{t.taxCalc.pdf.sendByEmail}</p>
            <div className="space-y-3">
              <input
                type="text"
                placeholder={t.taxCalc.pdf.fullName}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border-2 border-navy-200 text-navy-900 text-sm focus:border-navy-500 focus:ring-0 outline-none"
              />
              <input
                type="email"
                placeholder={t.taxCalc.pdf.email}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border-2 border-navy-200 text-navy-900 text-sm focus:border-navy-500 focus:ring-0 outline-none"
              />
              <input
                type="tel"
                placeholder={t.taxCalc.pdf.phone}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border-2 border-navy-200 text-navy-900 text-sm focus:border-navy-500 focus:ring-0 outline-none"
              />
            </div>
            {error && <p className="text-sm text-red-600 mt-2">{t.taxCalc.pdf.error}</p>}
            <button
              onClick={() => onSend({ fullName, email, phone })}
              disabled={sending || !fullName.trim() || !email.trim()}
              className="btn-primary w-full !py-3 mt-4 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {sending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t.taxCalc.pdf.sending}
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  {t.taxCalc.pdf.send}
                </>
              )}
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default function TaxCalculatorPage() {
  const { t, locale } = useI18n()

  const [mode, setMode] = useState<CalcMode>('simple')
  const [formA, setFormA] = useState<FormState>(() => createDefaultForm('ZH'))
  const [formB, setFormB] = useState<FormState>(() => createDefaultForm('ZH'))
  const [comparing, setComparing] = useState(false)

  const [resultA, setResultA] = useState<TaxResult | null>(null)
  const [resultB, setResultB] = useState<TaxResult | null>(null)
  const [calculating, setCalculating] = useState(false)

  const [user, setUser] = useState<User | null>(null)
  const [pdfLoading, setPdfLoading] = useState(false)
  const [showGuestModal, setShowGuestModal] = useState(false)
  const [guestSending, setGuestSending] = useState(false)
  const [guestSent, setGuestSent] = useState(false)
  const [guestError, setGuestError] = useState(false)
  const [pdfToast, setPdfToast] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    if (!supabase) return
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user))
  }, [])

  useEffect(() => {
    if (!pdfToast) return
    const timer = setTimeout(() => setPdfToast(null), 4000)
    return () => clearTimeout(timer)
  }, [pdfToast])

  const handleCalculate = async () => {
    setCalculating(true)

    if (comparing) {
      const [resA, resB] = await Promise.all([computeTax(formA, mode), computeTax(formB, mode)])
      setResultA(resA)
      setResultB(resB)
    } else {
      const resA = await computeTax(formA, mode)
      setResultA(resA)
      setResultB(null)
    }

    setCalculating(false)
  }

  const toggleCompare = () => {
    if (!comparing) {
      setFormB({ ...formA })
    }
    setComparing(!comparing)
    setResultB(null)
  }

  const switchMode = (newMode: CalcMode) => {
    setMode(newMode)
    setResultA(null)
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

  const handleDownloadPdf = async () => {
    if (!resultA) return

    if (!user) {
      setShowGuestModal(true)
      setGuestSent(false)
      setGuestError(false)
      return
    }

    setPdfLoading(true)
    try {
      const pdfData = buildPdfData(formA, resultA, locale, mode)
      const res = await fetch('/api/tax-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pdfData,
          saveToAccount: true,
          formState: formA,
          resultData: resultA,
          mode,
        }),
      })
      if (!res.ok) throw new Error('PDF generation failed')

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `steuerberechnung-${formA.taxYear}.pdf`
      a.click()
      URL.revokeObjectURL(url)
      setPdfToast(t.taxCalc.pdf.savedToAccount)
    } catch {
      console.error('PDF download failed')
    } finally {
      setPdfLoading(false)
    }
  }

  const handleGuestSend = async (data: { fullName: string; email: string; phone: string }) => {
    if (!resultA) return
    setGuestSending(true)
    setGuestError(false)
    try {
      const pdfData = buildPdfData(formA, resultA, locale, mode)
      const res = await fetch('/api/tax-pdf/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, pdfData }),
      })
      if (!res.ok) throw new Error()
      setGuestSent(true)
    } catch {
      setGuestError(true)
    } finally {
      setGuestSending(false)
    }
  }

  return (
    <>
      {/* Hero */}
      <section className="gradient-hero pt-24 pb-16 lg:pt-36 lg:pb-20 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-navy-700/20 blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-heading text-4xl sm:text-5xl font-bold dark-text-primary">
            {t.taxCalc.title}
          </h1>
          <p className="mt-3 text-lg dark-text-secondary max-w-2xl mx-auto">
            {t.taxCalc.subtitle}
          </p>
        </div>
      </section>

      {/* Calculator */}
      <section className="section-padding -mt-10">
        <div className={comparing ? 'max-w-6xl mx-auto px-4 sm:px-6 lg:px-8' : 'container-narrow'}>
          {/* Mode toggle + compare button */}
          <div className="flex items-center justify-between mb-4 gap-3">
            {/* Simple / Detailed toggle */}
            <div className="inline-flex rounded-xl border-2 border-navy-200 overflow-hidden">
              <button
                type="button"
                onClick={() => switchMode('simple')}
                className={`px-4 py-2 text-sm font-semibold transition-colors ${
                  mode === 'simple'
                    ? 'bg-navy-900 text-white'
                    : 'bg-white text-navy-600 hover:bg-navy-50'
                }`}
              >
                {t.taxCalc.modeSimple}
              </button>
              <button
                type="button"
                onClick={() => switchMode('complex')}
                className={`px-4 py-2 text-sm font-semibold transition-colors inline-flex items-center gap-1.5 ${
                  mode === 'complex'
                    ? 'bg-navy-900 text-white'
                    : 'bg-white text-navy-600 hover:bg-navy-50'
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                {t.taxCalc.modeComplex}
              </button>
            </div>

            {/* Compare toggle */}
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
            <div className="card p-6 sm:p-8">
              <TaxForm
                form={formA}
                setForm={setFormA}
                label={comparing ? 'A' : undefined}
                locale={locale}
                t={t}
                mode={mode}
              />

              {!comparing && (
                <button
                  onClick={handleCalculate}
                  disabled={calculating}
                  className="btn-primary !px-6 !py-3 w-full mt-6 group disabled:opacity-70 disabled:cursor-not-allowed"
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
              <div className="card p-6 sm:p-8">
                <TaxForm
                  form={formB}
                  setForm={setFormB}
                  label="B"
                  locale={locale}
                  t={t}
                  mode={mode}
                />
              </div>
            )}
          </div>

          {/* Shared calculate button in compare mode */}
          {comparing && (
            <button
              onClick={handleCalculate}
              disabled={calculating}
              className="btn-primary !px-6 !py-3 w-full mt-6 group disabled:opacity-70 disabled:cursor-not-allowed"
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
            <div className="card p-6 sm:p-8 mt-8">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-trust-100 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-trust-600" />
                </div>
                <h2 className="font-heading text-xl font-bold text-navy-900">
                  {t.taxCalc.results.title}
                </h2>
              </div>
              <ResultColumn result={resultA} t={t} formatCHF={formatCHF} />

              <button
                onClick={handleDownloadPdf}
                disabled={pdfLoading}
                className="btn-secondary w-full !py-3 mt-6 flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {pdfLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {t.taxCalc.pdf.downloading}
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    {t.taxCalc.pdf.download}
                  </>
                )}
              </button>
            </div>
          )}

          {/* Results - compare mode */}
          {comparing && (resultA || resultB) && (
            <div className="card p-6 sm:p-8 mt-8">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-trust-100 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-trust-600" />
                </div>
                <h2 className="font-heading text-xl font-bold text-navy-900">
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

              <button
                onClick={handleDownloadPdf}
                disabled={pdfLoading}
                className="btn-secondary w-full !py-3 mt-6 flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {pdfLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {t.taxCalc.pdf.downloading}
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    {t.taxCalc.pdf.download}
                  </>
                )}
              </button>
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
                <span className="inline-block px-3 py-1 rounded-full bg-white/10 text-white/90 text-sm font-medium border border-white/10 mb-4">
                  {t.discount.hint}
                </span>
                <br />
                <Link
                  href="/pricing"
                  className="btn-white !px-8 !py-4 group inline-flex"
                >
                  {t.taxCalc.ctaButton}
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          )}

          {/* Legal Disclaimer */}
          <div className="mt-8 rounded-xl border border-navy-200 bg-navy-50/50 p-6">
            <div className="flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-navy-400 mt-0.5 shrink-0" />
              <div>
                <h4 className="text-sm font-semibold text-navy-600 mb-2">
                  {t.taxCalc.disclaimer.title}
                </h4>
                <ul className="space-y-1 text-xs text-navy-400">
                  <li className="flex items-start gap-1.5">
                    <span className="mt-0.5 shrink-0">&bull;</span>
                    {t.taxCalc.disclaimer.notBinding}
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="mt-0.5 shrink-0">&bull;</span>
                    {t.taxCalc.disclaimer.noLiability}
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="mt-0.5 shrink-0">&bull;</span>
                    {t.taxCalc.disclaimer.notAdvice}
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="mt-0.5 shrink-0">&bull;</span>
                    {t.taxCalc.disclaimer.estvSource}
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="mt-0.5 shrink-0">&bull;</span>
                    {t.taxCalc.disclaimer.dataNote}
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PDF toast */}
      {pdfToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-trust-50 border border-trust-200 text-trust-700 px-5 py-3 rounded-xl shadow-lg text-sm font-medium animate-in slide-in-from-bottom-2">
          {pdfToast}
        </div>
      )}

      {/* Guest PDF modal */}
      {showGuestModal && resultA && (
        <GuestPdfModal
          onClose={() => setShowGuestModal(false)}
          onSend={handleGuestSend}
          sending={guestSending}
          sent={guestSent}
          error={guestError}
          t={t}
        />
      )}

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
