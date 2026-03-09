'use client'

import { useState } from 'react'
import { useI18n } from '@/lib/i18n/context'
import type { TaxYear, Profile } from '@/lib/types/portal'
import { STATUS_ORDER } from '@/lib/types/portal'
import { StatusBadge } from '@/components/portal/StatusBadge'
import { Search, Eye } from 'lucide-react'

interface ClientRow {
  profile: Profile
  taxYears: TaxYear[]
}

interface AdminClientsViewProps {
  year: number
  clients: ClientRow[]
  allTaxYears: TaxYear[]
  onSelectClient: (profile: Profile, taxYear: TaxYear) => void
}

export function AdminClientsView({ year, clients, allTaxYears, onSelectClient }: AdminClientsViewProps) {
  const { t } = useI18n()
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')

  // Tax years for this year, grouped by user
  const taxYearsForYear = allTaxYears.filter((ty) => ty.year === year)
  const userIds = new Set(taxYearsForYear.map((ty) => ty.user_id))

  // Build rows: client + their tax year for this year
  const rows = clients
    .filter((c) => userIds.has(c.profile.id))
    .map((c) => {
      const tyForYear = taxYearsForYear.find((ty) => ty.user_id === c.profile.id)!
      return { profile: c.profile, taxYear: tyForYear, docCount: 0 }
    })

  // Filter
  const filtered = rows.filter((row) => {
    const nameMatch = `${row.profile.first_name} ${row.profile.last_name} ${row.profile.email}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
    if (!nameMatch) return false
    if (filterStatus === 'all') return true
    return row.taxYear.status === filterStatus
  })

  return (
    <div className="space-y-4">
      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-navy-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.admin.clients.search}
            className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-navy-200 text-navy-900 focus:border-navy-500 focus:ring-0 outline-none bg-white"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-3 rounded-xl border-2 border-navy-200 text-navy-700 bg-white focus:border-navy-500 outline-none"
        >
          <option value="all">{t.admin.clients.all}</option>
          {STATUS_ORDER.map((s) => (
            <option key={s} value={s}>{t.dashboard.status[s]}</option>
          ))}
        </select>
      </div>

      {/* Client table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-navy-100 bg-navy-50/50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-navy-600 uppercase">{t.admin.clients.name}</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-navy-600 uppercase">{t.admin.clients.email}</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-navy-600 uppercase">{t.admin.clients.tier}</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-navy-600 uppercase">{t.admin.clients.status}</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-navy-600 uppercase">{t.admin.clients.actions}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr key={row.profile.id} className="border-b border-navy-50 hover:bg-navy-50/30">
                  <td className="px-4 py-3">
                    <div className="text-sm font-semibold text-navy-900">
                      {row.profile.first_name} {row.profile.last_name}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-navy-600">{row.profile.email}</td>
                  <td className="px-4 py-3 text-sm text-navy-700">
                    {row.taxYear.tier ? `Tier ${row.taxYear.tier}` : '–'}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={row.taxYear.status} />
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => onSelectClient(row.profile, row.taxYear)}
                      className="p-1.5 rounded-lg hover:bg-navy-100 text-navy-500 hover:text-navy-700"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-sm text-navy-500">
                    {t.admin.clients.search} — 0 {t.admin.drillDown.results}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
