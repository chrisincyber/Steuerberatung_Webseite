'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useI18n } from '@/lib/i18n/context'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import type { TaxYear, Profile, TaxYearStatus, TaxCalculation, KonkubinatPartner } from '@/lib/types/portal'
import { StatusBadge } from '@/components/portal/StatusBadge'
import { AddPartnerModal } from '@/components/portal/AddPartnerModal'
import { ClaimBanner } from '@/components/portal/ClaimBanner'
import { ArrowRight, Calculator, CheckCircle, Download, Trash2, Pencil, Loader2, Check, X, PiggyBank, BarChart3, CheckSquare, Archive, UserPlus, UserMinus, Share2 } from 'lucide-react'

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
  const [partner, setPartner] = useState<KonkubinatPartner | null>(null)
  const [showAddPartner, setShowAddPartner] = useState(false)
  const [linkedPartner, setLinkedPartner] = useState<{ name: string; taxYears: TaxYear[] } | null>(null)

  const fetchData = useCallback(async () => {
    const supabase = createClient()
    if (!supabase) return

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    setUser(user)

    try {
      const profileRes = await fetch('/api/profile')
      if (profileRes.ok) {
        const profileData = await profileRes.json()
        setProfile(profileData as Profile)

        // Redirect admin to /admin unless viewing client dashboard or processing Stripe callback
        if (
          (profileData as Profile).role === 'admin' &&
          !searchParams.get('view') &&
          !searchParams.get('session_id')
        ) {
          router.replace('/admin')
          return
        }
      }
    } catch {
      // Profile fetch failed, continue with user metadata fallback
    }

    // Fetch partner
    const { data: partnerData } = await supabase
      .from('konkubinat_partners')
      .select('*')
      .eq('primary_user_id', user.id)
      .maybeSingle()
    setPartner(partnerData as KonkubinatPartner | null)

    // Auto-create tax years for globally open years the client doesn't have yet
    const { data: openYears } = await supabase
      .from('open_tax_years')
      .select('year')
    const { data: existingYears } = await supabase
      .from('tax_years')
      .select('year, partner_id')
      .eq('user_id', user.id)

    if (openYears && existingYears) {
      const existingSelfSet = new Set(
        existingYears.filter((y: { year: number; partner_id: string | null }) => !y.partner_id).map((y: { year: number }) => y.year)
      )
      const missingSelf = openYears.filter((oy: { year: number }) => !existingSelfSet.has(oy.year))
      if (missingSelf.length > 0) {
        await supabase.from('tax_years').insert(
          missingSelf.map((oy: { year: number }) => ({
            user_id: user.id,
            year: oy.year,
            status: 'preis_berechnen' as TaxYearStatus,
            archived: false,
          }))
        )
      }

      // Auto-create partner tax years if partner exists
      if (partnerData) {
        const existingPartnerSet = new Set(
          existingYears.filter((y: { year: number; partner_id: string | null }) => y.partner_id).map((y: { year: number }) => y.year)
        )
        const missingPartner = openYears.filter((oy: { year: number }) => !existingPartnerSet.has(oy.year))
        if (missingPartner.length > 0) {
          await supabase.from('tax_years').insert(
            missingPartner.map((oy: { year: number }) => ({
              user_id: user.id,
              year: oy.year,
              partner_id: partnerData.id,
              status: 'preis_berechnen' as TaxYearStatus,
              archived: false,
            }))
          )
        }
      }
    }

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

    // Fetch linked partner's shared tax years
    try {
      const linkRes = await fetch('/api/account-links/status')
      if (linkRes.ok) {
        const linkData = await linkRes.json()
        if (linkData.linked && linkData.partnerShareVisible && linkData.partner) {
          // The RLS policy allows us to select partner's tax years if they share
          const { data: linkedYears } = await supabase
            .from('tax_years')
            .select('*')
            .eq('user_id', linkData.partner.id)
            .is('partner_id', null)
            .eq('archived', false)
            .order('year', { ascending: false })

          if (linkedYears && linkedYears.length > 0) {
            setLinkedPartner({
              name: `${linkData.partner.first_name} ${linkData.partner.last_name}`,
              taxYears: linkedYears as TaxYear[],
            })
          } else {
            setLinkedPartner(null)
          }
        } else {
          setLinkedPartner(null)
        }
      }
    } catch {
      setLinkedPartner(null)
    }

    setLoading(false)
  }, [searchParams, router])

  // Stripe payment callback (session_id)
  useEffect(() => {
    const sessionId = searchParams.get('session_id')
    if (!sessionId) return

    const processStripeCallback = async () => {
      const supabase = createClient()
      if (!supabase) return

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      try {
        const res = await fetch(`/api/stripe/verify-session?session_id=${encodeURIComponent(sessionId)}`)
        const data = await res.json()

        if (!data.paid) return

        const year = parseInt(data.metadata.year, 10)
        const price = parseFloat(data.metadata.price)
        const isAbo = data.metadata.abo === 'true'
        const partnerId = data.metadata.partner_id || null

        if (isNaN(year) || isNaN(price)) return

        if (partnerId) {
          // Partner payment: update by matching user_id + year + partner_id
          await supabase
            .from('tax_years')
            .update({
              tier: 1 as const,
              price,
              status: 'dokumente_hochladen' as TaxYearStatus,
              is_abo: isAbo || null,
            })
            .eq('user_id', user.id)
            .eq('year', year)
            .eq('partner_id', partnerId)
        } else {
          await supabase
            .from('tax_years')
            .upsert({
              user_id: user.id,
              year,
              tier: 1 as const,
              price,
              status: 'dokumente_hochladen' as TaxYearStatus,
              is_abo: isAbo || null,
              stripe_session_id: sessionId,
            }, { onConflict: 'user_id,year' })
        }

        const msg = t.dashboard.paymentSuccess.replace('{year}', String(year))
        setToast(isAbo ? `${msg} ${t.dashboard.paymentSuccessAbo}` : msg)
      } catch (error) {
        console.error('Failed to verify Stripe session:', error)
      }

      router.replace('/dashboard')
      fetchData()
    }

    processStripeCallback()
  }, [searchParams, router, fetchData, t])

  // Selbständige callback (no Stripe)
  useEffect(() => {
    const yearParam = searchParams.get('year')
    const selbstaendigParam = searchParams.get('selbstaendig')

    if (!yearParam || selbstaendigParam !== 'true') return
    // Don't process if this is a Stripe callback
    if (searchParams.get('session_id')) return

    const year = parseInt(yearParam, 10)
    if (isNaN(year)) return

    const processSelbstaendigCallback = async () => {
      const supabase = createClient()
      if (!supabase) return

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const partnerIdParam = searchParams.get('partner_id')

      if (partnerIdParam) {
        await supabase
          .from('tax_years')
          .update({
            tier: 1 as const,
            price: 0,
            status: 'angebot_ausstehend' as TaxYearStatus,
          })
          .eq('user_id', user.id)
          .eq('year', year)
          .eq('partner_id', partnerIdParam)
      } else {
        await supabase
          .from('tax_years')
          .upsert({
            user_id: user.id,
            year,
            tier: 1 as const,
            price: 0,
            status: 'angebot_ausstehend' as TaxYearStatus,
          }, { onConflict: 'user_id,year' })
      }

      setToast(t.dashboard.pricingCallbackTier3)
      router.replace('/dashboard')
      fetchData()
    }

    processSelbstaendigCallback()
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

  // Split active vs archived, then self vs partner
  const activeYears = taxYears.filter((ty) => !ty.archived)
  const archivedYears = taxYears.filter((ty) => ty.archived)
  const myYears = activeYears.filter((ty) => !ty.partner_id)
  const partnerYears = activeYears.filter((ty) => ty.partner_id)

  const partnerName = partner ? `${partner.first_name} ${partner.last_name}` : ''

  const handleRemovePartner = async () => {
    if (!confirm(t.dashboard.partner.removeConfirm)) return
    const supabase = createClient()
    if (!supabase || !partner) return
    await supabase.from('konkubinat_partners').delete().eq('id', partner.id)
    await supabase.from('profiles').update({ zivilstand: 'einzelperson' }).eq('id', user!.id)
    setPartner(null)
    setToast(t.dashboard.partner.partnerRemoved)
    fetchData()
  }

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

        {/* Claim Banner */}
        <ClaimBanner onClaimed={fetchData} />

        {/* Header */}
        <div className="mb-8">
          <h1 className="font-heading text-3xl font-bold text-navy-900">
            {t.dashboard.welcome}, {userName}!
          </h1>
          <p className="text-navy-600 mt-1">{t.dashboard.title}</p>
        </div>

        {/* My Year Cards */}
        <div className="mb-2 flex items-center justify-between">
          <h2 className="font-heading text-xl font-bold text-navy-900">
            {t.dashboard.taxYear}e
          </h2>
          {!partner && (
            <button
              onClick={() => setShowAddPartner(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-navy-600 hover:bg-navy-50 border border-navy-200 transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              {t.dashboard.partner.addPartner}
            </button>
          )}
        </div>
        {myYears.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {myYears.map((ty) => (
              <YearCard key={ty.id} taxYear={ty} />
            ))}
          </div>
        ) : (
          <div className="card p-8 text-center">
            <p className="text-navy-500">{t.dashboard.noActiveYears}</p>
          </div>
        )}

        {/* Partner Year Cards */}
        {partner && (
          <div className="mt-10">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="font-heading text-xl font-bold text-navy-900">
                {t.dashboard.partner.partnerSection.replace('{name}', partnerName)}
              </h2>
              <button
                onClick={handleRemovePartner}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 border border-red-200 transition-colors"
              >
                <UserMinus className="w-4 h-4" />
                {t.dashboard.partner.removePartner}
              </button>
            </div>
            {partnerYears.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {partnerYears.map((ty) => (
                  <YearCard key={ty.id} taxYear={ty} partnerName={partnerName} partnerId={partner.id} />
                ))}
              </div>
            ) : (
              <div className="card p-8 text-center">
                <p className="text-navy-500">{t.dashboard.noActiveYears}</p>
              </div>
            )}
          </div>
        )}

        {/* Linked Partner's Shared Tax Years */}
        {linkedPartner && linkedPartner.taxYears.length > 0 && (
          <div className="mt-10">
            <div className="mb-2 flex items-center gap-2">
              <Share2 className="w-4 h-4 text-trust-500" />
              <h2 className="font-heading text-xl font-bold text-navy-900">
                {t.dashboard.partner.linkedPartnerSection.replace('{name}', linkedPartner.name)}
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {linkedPartner.taxYears.map((ty) => (
                <LinkedYearCard key={ty.id} taxYear={ty} partnerName={linkedPartner.name} />
              ))}
            </div>
          </div>
        )}

        {/* Past Years */}
        {archivedYears.length > 0 && (
          <PastYearsSection taxYears={archivedYears} />
        )}

        {/* Add Partner Modal */}
        {showAddPartner && user && (
          <AddPartnerModal
            userId={user.id}
            onClose={() => setShowAddPartner(false)}
            onAdded={() => {
              setShowAddPartner(false)
              setToast(t.dashboard.partner.partnerAdded)
              fetchData()
            }}
          />
        )}

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

function getToolIcon(toolType?: string) {
  switch (toolType) {
    case '3a-rechner': return <PiggyBank className="w-4 h-4 text-trust-500" />
    case 'quellensteuer': return <Calculator className="w-4 h-4 text-navy-600" />
    case 'checkliste': return <CheckSquare className="w-4 h-4 text-trust-500" />
    case 'steuervergleich': return <BarChart3 className="w-4 h-4 text-navy-600" />
    default: return <Calculator className="w-4 h-4 text-navy-600" />
  }
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
  const toolType = (calc as unknown as Record<string, unknown>).tool_type as string | undefined

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
      if (toolType && toolType !== 'steuerrechner') {
        // Tool-specific PDFs
        const res = await fetch('/api/tool-pdf', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            toolType,
            pdfData: {
              locale: calc.locale,
              calculatedAt: dateStr,
              ...formData,
              ...resultData,
            },
          }),
        })
        if (!res.ok) throw new Error()
        const blob = await res.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${calc.name.replace(/\s+/g, '-')}.pdf`
        a.click()
        URL.revokeObjectURL(url)
      } else {
        // Original steuerrechner PDF
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
      }
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
          <>
            {toolType && toolType !== 'steuerrechner' && (
              <div className="flex items-center gap-1.5 mb-1">
                {getToolIcon(toolType)}
                <span className="text-xs font-medium text-navy-500">
                  {(t.toolTypes as Record<string, string>)[toolType] || toolType}
                </span>
              </div>
            )}
            <p className="font-semibold text-navy-900 truncate">{calc.name}</p>
          </>
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

function YearCard({ taxYear, partnerName, partnerId }: { taxYear: TaxYear; partnerName?: string; partnerId?: string }) {
  const { t } = useI18n()

  const showPrice = taxYear.price && taxYear.status !== 'preis_berechnen'
  const pricingHref = partnerId
    ? `/pricing?partner_id=${partnerId}&year=${taxYear.year}`
    : '/pricing'
  const yearDetailHref = partnerId
    ? `/dashboard/year/${taxYear.year}?partner=${partnerId}`
    : `/dashboard/year/${taxYear.year}`

  return (
    <div className="card p-6 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-heading text-xl font-bold text-navy-900">
            {t.dashboard.taxYear} {taxYear.year}
          </h2>
          {partnerName && (
            <p className="text-xs text-navy-500 mt-0.5">
              {t.dashboard.partner.partnerLabel}: {partnerName}
            </p>
          )}
        </div>
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
          href={pricingHref}
          className="btn-primary w-full !py-3 mt-4 flex items-center justify-center gap-2"
        >
          <Calculator className="w-5 h-5" />
          {t.dashboard.calculatePrice}
        </Link>
      ) : (
        <Link
          href={yearDetailHref}
          className="btn-primary w-full !py-3 mt-4 flex items-center justify-center gap-2"
        >
          {t.dashboard.openYear}
          <ArrowRight className="w-5 h-5" />
        </Link>
      )}
    </div>
  )
}

function LinkedYearCard({ taxYear, partnerName }: { taxYear: TaxYear; partnerName: string }) {
  const { t } = useI18n()

  return (
    <div className="card p-6 flex flex-col border-trust-200 bg-trust-50/30">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-heading text-xl font-bold text-navy-900">
            {t.dashboard.taxYear} {taxYear.year}
          </h2>
          <p className="text-xs text-trust-600 mt-0.5">
            {t.dashboard.partner.sharedLabel} — {partnerName}
          </p>
        </div>
        <StatusBadge status={taxYear.status} />
      </div>

      {taxYear.price && taxYear.status !== 'preis_berechnen' && (
        <p className="text-sm text-navy-600 mb-2">
          CHF {taxYear.price.toLocaleString('de-CH')}
        </p>
      )}
    </div>
  )
}

function PastYearsSection({ taxYears }: { taxYears: TaxYear[] }) {
  const { t } = useI18n()
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="mt-10">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 text-sm font-medium text-navy-500 hover:text-navy-800 transition-colors mb-4"
      >
        <Archive className="w-4 h-4" />
        {t.dashboard.pastYears} ({taxYears.length})
      </button>
      {expanded && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {taxYears.map((ty) => (
            <div key={ty.id} className="card p-6 flex flex-col opacity-75">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-heading text-xl font-bold text-navy-700">
                  {t.dashboard.taxYear} {ty.year}
                </h2>
                <div className="flex items-center gap-2">
                  <StatusBadge status={ty.status} />
                </div>
              </div>

              {ty.price && (
                <p className="text-sm text-navy-500 mb-2">
                  CHF {ty.price.toLocaleString('de-CH')}
                </p>
              )}

              <div className="flex-1" />

              <Link
                href={`/dashboard/year/${ty.year}`}
                className="w-full !py-3 mt-4 flex items-center justify-center gap-2 rounded-xl border-2 border-navy-200 text-navy-600 hover:bg-navy-50 font-medium text-sm transition-colors"
              >
                {t.dashboard.viewPastYear}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
