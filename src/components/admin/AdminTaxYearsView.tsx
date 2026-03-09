'use client'

import { useI18n } from '@/lib/i18n/context'
import type { TaxYear, Profile, TaxYearStatus } from '@/lib/types/portal'
import { STATUS_ORDER } from '@/lib/types/portal'
import { Calendar, Users } from 'lucide-react'

interface ClientRow {
  profile: Profile
  taxYears: TaxYear[]
}

interface AdminTaxYearsViewProps {
  clients: ClientRow[]
  allTaxYears: TaxYear[]
  onSelectYear: (year: number) => void
}

export function AdminTaxYearsView({ clients, allTaxYears, onSelectYear }: AdminTaxYearsViewProps) {
  const { t } = useI18n()

  // Group tax years by year
  const yearMap = new Map<number, TaxYear[]>()
  for (const ty of allTaxYears) {
    const list = yearMap.get(ty.year) || []
    list.push(ty)
    yearMap.set(ty.year, list)
  }

  // Sort years descending
  const years = Array.from(yearMap.keys()).sort((a, b) => b - a)

  // Summary stats
  const totalClients = clients.length
  const totalDeclarations = allTaxYears.length

  return (
    <div className="space-y-6">
      {/* Summary header */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="card p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
            <Users className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-navy-500">{t.admin.totalClients}</p>
            <p className="text-2xl font-bold text-navy-900">{totalClients}</p>
          </div>
        </div>
        <div className="card p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-gold-100 flex items-center justify-center">
            <Calendar className="w-5 h-5 text-gold-600" />
          </div>
          <div>
            <p className="text-sm text-navy-500">{t.admin.openDeclarations}</p>
            <p className="text-2xl font-bold text-navy-900">{totalDeclarations}</p>
          </div>
        </div>
      </div>

      {/* Year cards grid */}
      <div>
        <h2 className="font-heading text-lg font-semibold text-navy-900 mb-4">
          {t.admin.drillDown.taxYearsTitle}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {years.map((year) => {
            const taxYears = yearMap.get(year)!
            // Count unique clients for this year
            const clientIds = new Set(taxYears.map((ty) => ty.user_id))
            const clientCount = clientIds.size

            // Status breakdown
            const statusCounts: Partial<Record<TaxYearStatus, number>> = {}
            for (const ty of taxYears) {
              statusCounts[ty.status] = (statusCounts[ty.status] || 0) + 1
            }

            return (
              <button
                key={year}
                onClick={() => onSelectYear(year)}
                className="card p-6 text-left hover:shadow-md hover:border-navy-200 transition-all group"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="font-heading text-2xl font-bold text-navy-900 group-hover:text-navy-700">
                    {year}
                  </span>
                  <span className="text-sm text-navy-500">
                    {clientCount} {clientCount === 1 ? 'Kunde' : 'Kunden'}
                  </span>
                </div>

                {/* Status breakdown */}
                <div className="space-y-1.5">
                  {STATUS_ORDER.filter((s) => statusCounts[s]).map((s) => (
                    <div key={s} className="flex items-center justify-between text-xs">
                      <span className="text-navy-600">{t.dashboard.status[s]}</span>
                      <span className="font-medium text-navy-800">{statusCounts[s]}</span>
                    </div>
                  ))}
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
