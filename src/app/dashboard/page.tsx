'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useI18n } from '@/lib/i18n/context'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import type { TaxYear, Profile, TaxYearStatus, TaxCalculation } from '@/lib/types/portal'
import { StatusBadge } from '@/components/portal/StatusBadge'
import { ArrowRight, Calculator, CheckCircle, Download, Trash2, Pencil, Loader2, Check, X } from 'lucide-react'

export default function DashboardPage() {
  return (
    <Suspense>
      <DashboardContent />
    </Suspense>
  )
}

function DashboardContent() {
  const { t } = useI18n()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [taxYears, setTaxYears] = useState<TaxYear[]>([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<string | null>(null)
  const [taxCalcs, setTaxCalcs] = useState<TaxCalculation[]>([])

  const fetchData = useCallback(async () => {
    const supabase = createClient()
    if (!supabase) return

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    setUser(user)

    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    if (profileData) setProfile(profileData as Profile)

    const { data: yearsData } = await supabase
      .from('tax_years')
      .select('*')
      .eq('user_id', user.id)
      .order('year', { ascending: false })
    if (yearsData) setTaxYears(yearsData as TaxYear[])

    const { data: calcsData } = await supabase
      .from('tax_calculations')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    if (calcsData) setTaxCalcs(calcsData as TaxCalculation[])

    setLoading(false)
  }, [])

  // Pricing callback integration
  useEffect(() => {
    const tierParam = searchParams.get('tier')
    const priceParam = searchParams.get('price')
    const yearParam = searchParams.get('year')

    if (!tierParam || !yearParam) return

    const tier = parseInt(tierParam, 10) as 1 | 2 | 3
    const price = priceParam ? parseFloat(priceParam) : null
    const year = parseInt(yearParam, 10)

    if (isNaN(tier) || isNaN(year)) return

    const processPricingCallback = async () => {
      const supabase = createClient()
      if (!supabase) return

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      let status: TaxYearStatus
      if (tier === 1 || tier === 2) {
        status = 'dokumente_hochladen'
      } else {
        status = 'angebot_ausstehend'
      }

      await supabase
        .from('tax_years')
        .upsert({
          user_id: user.id,
          year,
          tier,
          price: (tier === 1 || tier === 2) ? price : null,
          status,
        }, { onConflict: 'user_id,year' })

      if (tier === 1 || tier === 2) {
        setToast(t.dashboard.pricingCallbackSuccess.replace('{price}', String(price)))
      } else {
        setToast(t.dashboard.pricingCallbackTier3)
      }

      // Clean URL params
      router.replace('/dashboard')
      fetchData()
    }

    processPricingCallback()
  }, [searchParams, router, fetchData, t])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Auto-hide toast
  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(null), 5000)
    return () => clearTimeout(timer)
  }, [toast])

  const userName = profile?.first_name || user?.user_metadata?.first_name || user?.email?.split('@')[0] || ''

  // Ensure 2025 card exists
  const currentYear = 2025
  const has2025 = taxYears.some((ty) => ty.year === currentYear)

  if (loading) {
    return (
      <div className="min-h-screen bg-navy-50/30 pt-20 flex items-center justify-center">
        <div className="text-navy-500">{t.common.loading}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-navy-50/30 pt-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Toast */}
        {toast && (
          <div className="mb-6 p-4 rounded-xl bg-trust-50 border border-trust-200 text-trust-700 text-sm flex items-center gap-2">
            <CheckCircle className="w-5 h-5 shrink-0" />
            {toast}
          </div>
        )}

        {/* Header */}
        <div className="mb-8">
          <h1 className="font-heading text-3xl font-bold text-navy-900">
            {t.dashboard.welcome}, {userName}!
          </h1>
          <p className="text-navy-600 mt-1">{t.dashboard.title}</p>
        </div>

        {/* Year Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Existing tax years */}
          {taxYears.map((ty) => (
            <YearCard key={ty.id} taxYear={ty} />
          ))}

          {/* Default 2025 card if none exists */}
          {!has2025 && (
            <div className="card p-6 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-heading text-xl font-bold text-navy-900">
                  {t.dashboard.taxYear} {currentYear}
                </h2>
                <StatusBadge status="preis_berechnen" />
              </div>

              <div className="flex-1" />

              <Link
                href="/pricing"
                className="btn-primary w-full !py-3 mt-4 flex items-center justify-center gap-2"
              >
                <Calculator className="w-5 h-5" />
                {t.dashboard.calculatePrice}
              </Link>
            </div>
          )}
        </div>

        {/* Saved Tax Calculations */}
        {taxCalcs.length > 0 && (
          <div className="mt-10">
            <h2 className="font-heading text-xl font-bold text-navy-900 mb-4">
              {t.taxCalculations.title}
            </h2>
            <div className="space-y-3">
              {taxCalcs.map((calc) => (
                <TaxCalcCard
                  key={calc.id}
                  calc={calc}
                  onDelete={(id) => setTaxCalcs((prev) => prev.filter((c) => c.id !== id))}
                  onRename={(id, name) =>
                    setTaxCalcs((prev) => prev.map((c) => (c.id === id ? { ...c, name } : c)))
                  }
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function TaxCalcCard({
  calc,
  onDelete,
  onRename,
}: {
  calc: TaxCalculation
  onDelete: (id: string) => void
  onRename: (id: string, name: string) => void
}) {
  const { t, locale } = useI18n()
  const [editing, setEditing] = useState(false)
  const [editName, setEditName] = useState(calc.name)
  const [deleting, setDeleting] = useState(false)
  const [downloading, setDownloading] = useState(false)

  const formData = calc.form_data as Record<string, unknown>
  const resultData = calc.result_data as Record<string, unknown>
  const income = formData.grossIncome as string | undefined
  const canton = formData.canton as string | undefined
  const dateStr = new Date(calc.created_at).toLocaleDateString(locale === 'de' ? 'de-CH' : 'en-CH')

  const handleRename = async () => {
    if (!editName.trim() || editName === calc.name) {
      setEditing(false)
      return
    }
    await fetch(`/api/tax-calculations/${calc.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: editName }),
    })
    onRename(calc.id, editName)
    setEditing(false)
  }

  const handleDelete = async () => {
    if (!confirm(t.taxCalculations.deleteConfirm)) return
    setDeleting(true)
    await fetch(`/api/tax-calculations/${calc.id}`, { method: 'DELETE' })
    onDelete(calc.id)
  }

  const handleDownload = async () => {
    setDownloading(true)
    try {
      const selectedCity = formData.selectedCity as { name?: string } | null
      const pdfData = {
        locale: calc.locale,
        calculatedAt: dateStr,
        mode: calc.mode,
        form: {
          taxYear: (formData.taxYear as number) || 2025,
          grossIncome: (formData.grossIncome as string) || '0',
          canton: (formData.canton as string) || '',
          maritalStatus: (formData.maritalStatus as string) || 'single',
          children: (formData.children as number) || 0,
          municipalityName: selectedCity?.name,
          confession: formData.confession as string | undefined,
          income2: formData.income2 as string | undefined,
          fortune: formData.fortune as string | undefined,
        },
        result: {
          source: (resultData.source as string) || 'estv',
          federalTax: (resultData.federalTax as number) || 0,
          cantonalTax: (resultData.cantonalTax as number) || 0,
          municipalTax: (resultData.municipalTax as number) || 0,
          churchTax: resultData.churchTax as number | undefined,
          fortuneTax: resultData.fortuneTax as number | undefined,
          totalTax: (resultData.totalTax as number) || 0,
          effectiveRate: (resultData.effectiveRate as number) || 0,
          taxableIncome: resultData.taxableIncome as number | undefined,
        },
      }

      const res = await fetch('/api/tax-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pdfData }),
      })
      if (!res.ok) throw new Error()

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${calc.name.replace(/\s+/g, '-')}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      console.error('PDF download failed')
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="card p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-3">
      <div className="flex-1 min-w-0">
        {editing ? (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleRename()}
              className="flex-1 px-3 py-1.5 rounded-lg border-2 border-navy-200 text-navy-900 text-sm focus:border-navy-500 focus:ring-0 outline-none"
              autoFocus
            />
            <button onClick={handleRename} className="p-1.5 text-trust-600 hover:text-trust-700">
              <Check className="w-4 h-4" />
            </button>
            <button onClick={() => { setEditing(false); setEditName(calc.name) }} className="p-1.5 text-navy-400 hover:text-navy-600">
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <p className="font-semibold text-navy-900 truncate">{calc.name}</p>
        )}
        <p className="text-xs text-navy-400 mt-0.5">
          {t.taxCalculations.date}: {dateStr}
          {income && canton ? ` — CHF ${parseInt(income).toLocaleString('de-CH')} | ${canton}` : ''}
        </p>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-navy-600 hover:bg-navy-50 transition-colors disabled:opacity-50"
          title={t.taxCalculations.downloadPdf}
        >
          {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          {t.taxCalculations.downloadPdf}
        </button>
        <button
          onClick={() => setEditing(true)}
          className="p-1.5 rounded-lg text-navy-400 hover:text-navy-600 hover:bg-navy-50 transition-colors"
          title={t.taxCalculations.rename}
        >
          <Pencil className="w-4 h-4" />
        </button>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="p-1.5 rounded-lg text-navy-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
          title={t.taxCalculations.delete}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

function YearCard({ taxYear }: { taxYear: TaxYear }) {
  const { t } = useI18n()

  const showPrice = taxYear.price && taxYear.status !== 'preis_berechnen'

  return (
    <div className="card p-6 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-heading text-xl font-bold text-navy-900">
          {t.dashboard.taxYear} {taxYear.year}
        </h2>
        <StatusBadge status={taxYear.status} />
      </div>

      {showPrice && (
        <p className="text-sm text-navy-600 mb-2">
          CHF {taxYear.price?.toLocaleString('de-CH')}
        </p>
      )}

      <div className="flex-1" />

      {taxYear.status === 'preis_berechnen' ? (
        <Link
          href="/pricing"
          className="btn-primary w-full !py-3 mt-4 flex items-center justify-center gap-2"
        >
          <Calculator className="w-5 h-5" />
          {t.dashboard.calculatePrice}
        </Link>
      ) : (
        <Link
          href={`/dashboard/year/${taxYear.year}`}
          className="btn-primary w-full !py-3 mt-4 flex items-center justify-center gap-2"
        >
          {t.dashboard.openYear}
          <ArrowRight className="w-5 h-5" />
        </Link>
      )}
    </div>
  )
}
