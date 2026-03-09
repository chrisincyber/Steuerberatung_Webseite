'use client'

import { useState, useEffect, useCallback } from 'react'
import { useI18n } from '@/lib/i18n/context'
import { createClient } from '@/lib/supabase/client'
import type { TaxYear, Profile, TaxYearStatus } from '@/lib/types/portal'
import { AdminTaxYearsView } from '@/components/admin/AdminTaxYearsView'
import { AdminClientsView } from '@/components/admin/AdminClientsView'
import { AdminClientDetailView } from '@/components/admin/AdminClientDetailView'
import { ChevronRight } from 'lucide-react'

type AdminView =
  | { level: 'taxYears' }
  | { level: 'clients'; year: number }
  | { level: 'clientDetail'; year: number; taxYear: TaxYear; profile: Profile }

interface ClientRow {
  profile: Profile
  taxYears: TaxYear[]
}

export default function AdminPage() {
  const { t } = useI18n()
  const [view, setView] = useState<AdminView>({ level: 'taxYears' })
  const [clients, setClients] = useState<ClientRow[]>([])
  const [allTaxYears, setAllTaxYears] = useState<TaxYear[]>([])
  const [loading, setLoading] = useState(true)

  const fetchClients = useCallback(async () => {
    const supabase = createClient()
    if (!supabase) return

    const { data: profiles } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'client')
      .order('created_at', { ascending: false })

    if (!profiles) { setLoading(false); return }

    const { data: taxYears } = await supabase
      .from('tax_years')
      .select('*')
      .order('year', { ascending: false })

    const typedProfiles = profiles as Profile[]
    const typedTaxYears = (taxYears || []) as TaxYear[]

    const clientRows: ClientRow[] = typedProfiles.map((profile) => ({
      profile,
      taxYears: typedTaxYears.filter((ty) => ty.user_id === profile.id),
    }))

    setClients(clientRows)
    setAllTaxYears(typedTaxYears)
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchClients()
  }, [fetchClients])

  const handleStatusChange = async (taxYearId: string, newStatus: TaxYearStatus) => {
    const supabase = createClient()
    if (!supabase) return
    await supabase.from('tax_years').update({ status: newStatus }).eq('id', taxYearId)
    fetchClients()
  }

  // Breadcrumb navigation
  const breadcrumbs: { label: string; onClick?: () => void }[] = [
    {
      label: t.admin.drillDown.taxYearsTitle,
      onClick: view.level !== 'taxYears' ? () => setView({ level: 'taxYears' }) : undefined,
    },
  ]

  if (view.level === 'clients' || view.level === 'clientDetail') {
    breadcrumbs.push({
      label: String(view.year),
      onClick: view.level !== 'clients' ? () => setView({ level: 'clients', year: view.year }) : undefined,
    })
  }

  if (view.level === 'clientDetail') {
    breadcrumbs.push({
      label: `${view.profile.first_name} ${view.profile.last_name}`,
    })
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header + Breadcrumbs */}
        <div className="mb-8">
          <h1 className="font-heading text-3xl font-bold text-navy-900 mb-3">{t.admin.title}</h1>
          <nav className="flex items-center gap-1 text-sm">
            {breadcrumbs.map((crumb, i) => (
              <span key={i} className="flex items-center gap-1">
                {i > 0 && <ChevronRight className="w-4 h-4 text-navy-400" />}
                {crumb.onClick ? (
                  <button
                    onClick={crumb.onClick}
                    className="text-navy-500 hover:text-navy-800 hover:underline transition-colors"
                  >
                    {crumb.label}
                  </button>
                ) : (
                  <span className="text-navy-900 font-medium">{crumb.label}</span>
                )}
              </span>
            ))}
          </nav>
        </div>

        {/* Views */}
        {view.level === 'taxYears' && (
          <AdminTaxYearsView
            clients={clients}
            allTaxYears={allTaxYears}
            onSelectYear={(year) => setView({ level: 'clients', year })}
          />
        )}

        {view.level === 'clients' && (
          <AdminClientsView
            year={view.year}
            clients={clients}
            allTaxYears={allTaxYears}
            onSelectClient={(profile, taxYear) =>
              setView({ level: 'clientDetail', year: view.year, taxYear, profile })
            }
          />
        )}

        {view.level === 'clientDetail' && (
          <AdminClientDetailView
            profile={view.profile}
            taxYear={view.taxYear}
            onStatusChange={handleStatusChange}
            onRefresh={fetchClients}
          />
        )}
      </div>
    </div>
  )
}
