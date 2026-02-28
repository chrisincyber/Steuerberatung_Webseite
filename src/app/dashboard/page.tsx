'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useI18n } from '@/lib/i18n/context'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import type { TaxYear, Profile, TaxYearStatus } from '@/lib/types/portal'
import { StatusBadge } from '@/components/portal/StatusBadge'
import { ArrowRight, Calculator, CheckCircle } from 'lucide-react'

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
