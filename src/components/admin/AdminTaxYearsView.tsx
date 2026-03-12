'use client'

import { useState } from 'react'
import { useI18n } from '@/lib/i18n/context'
import { createClient } from '@/lib/supabase/client'
import type { TaxYear, Profile, TaxYearStatus } from '@/lib/types/portal'
import { STATUS_ORDER } from '@/lib/types/portal'
import { Calendar, Users, Plus, Archive, ArchiveRestore, X, Search, Loader2 } from 'lucide-react'

interface ClientRow {
  profile: Profile
  taxYears: TaxYear[]
}

interface AdminTaxYearsViewProps {
  clients: ClientRow[]
  allTaxYears: TaxYear[]
  onSelectYear: (year: number) => void
  onRefresh: () => void
}

export function AdminTaxYearsView({ clients, allTaxYears, onSelectYear, onRefresh }: AdminTaxYearsViewProps) {
  const { t } = useI18n()
  const [showOpenYear, setShowOpenYear] = useState(false)
  const [showArchived, setShowArchived] = useState(false)

  // Split active vs archived
  const activeTaxYears = allTaxYears.filter((ty) => !ty.archived)
  const archivedTaxYears = allTaxYears.filter((ty) => ty.archived)

  // Group active tax years by year
  const yearMap = new Map<number, TaxYear[]>()
  for (const ty of activeTaxYears) {
    const list = yearMap.get(ty.year) || []
    list.push(ty)
    yearMap.set(ty.year, list)
  }
  const years = Array.from(yearMap.keys()).sort((a, b) => b - a)

  // Group archived by year
  const archivedYearMap = new Map<number, TaxYear[]>()
  for (const ty of archivedTaxYears) {
    const list = archivedYearMap.get(ty.year) || []
    list.push(ty)
    archivedYearMap.set(ty.year, list)
  }
  const archivedYears = Array.from(archivedYearMap.keys()).sort((a, b) => b - a)

  const totalClients = clients.length
  const totalDeclarations = activeTaxYears.length

  const handleArchiveYear = async (year: number) => {
    const supabase = createClient()
    if (!supabase) return
    const ids = yearMap.get(year)?.map((ty) => ty.id) || []
    if (ids.length === 0) return
    await supabase.from('tax_years').update({ archived: true }).in('id', ids)
    // Remove from globally open years
    await supabase.from('open_tax_years').delete().eq('year', year)
    onRefresh()
  }

  const handleUnarchiveYear = async (year: number) => {
    const supabase = createClient()
    if (!supabase) return
    const ids = archivedYearMap.get(year)?.map((ty) => ty.id) || []
    if (ids.length === 0) return
    await supabase.from('tax_years').update({ archived: false }).in('id', ids)
    // Re-add to globally open years
    await supabase.from('open_tax_years').upsert({ year }, { onConflict: 'year' })
    onRefresh()
  }

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
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading text-lg font-semibold text-navy-900">
            {t.admin.drillDown.taxYearsTitle}
          </h2>
          <button
            onClick={() => setShowOpenYear(true)}
            className="btn-primary !rounded-lg !py-2 !px-3 !text-sm flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            {t.admin.taxYears.openNewYear}
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {years.map((year) => {
            const taxYears = yearMap.get(year)!
            const clientIds = new Set(taxYears.map((ty) => ty.user_id))
            const clientCount = clientIds.size

            const statusCounts: Partial<Record<TaxYearStatus, number>> = {}
            for (const ty of taxYears) {
              statusCounts[ty.status] = (statusCounts[ty.status] || 0) + 1
            }

            return (
              <div
                key={year}
                className="card p-6 text-left hover:shadow-md hover:border-navy-200 transition-all group"
              >
                <div className="flex items-center justify-between mb-4">
                  <button
                    onClick={() => onSelectYear(year)}
                    className="font-heading text-2xl font-bold text-navy-900 group-hover:text-navy-700"
                  >
                    {year}
                  </button>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-navy-500">
                      {clientCount} {clientCount === 1 ? 'Kunde' : 'Kunden'}
                    </span>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleArchiveYear(year) }}
                      className="p-1.5 rounded-lg hover:bg-navy-100 text-navy-400 hover:text-navy-700 transition-colors"
                      title={t.admin.taxYears.archive}
                    >
                      <Archive className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => onSelectYear(year)}
                  className="w-full text-left"
                >
                  <div className="space-y-1.5">
                    {STATUS_ORDER.filter((s) => statusCounts[s]).map((s) => (
                      <div key={s} className="flex items-center justify-between text-xs">
                        <span className="text-navy-600">{t.dashboard.status[s]}</span>
                        <span className="font-medium text-navy-800">{statusCounts[s]}</span>
                      </div>
                    ))}
                  </div>
                </button>
              </div>
            )
          })}
        </div>
      </div>

      {/* Archived years */}
      {archivedYears.length > 0 && (
        <div>
          <button
            onClick={() => setShowArchived(!showArchived)}
            className="flex items-center gap-2 text-sm font-medium text-navy-500 hover:text-navy-800 transition-colors mb-4"
          >
            <Archive className="w-4 h-4" />
            {t.admin.taxYears.archivedYears} ({archivedYears.length})
          </button>
          {showArchived && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {archivedYears.map((year) => {
                const taxYears = archivedYearMap.get(year)!
                const clientIds = new Set(taxYears.map((ty) => ty.user_id))
                const clientCount = clientIds.size

                return (
                  <div
                    key={year}
                    className="card p-6 text-left opacity-70 hover:opacity-100 transition-all"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <button
                        onClick={() => onSelectYear(year)}
                        className="font-heading text-2xl font-bold text-navy-700"
                      >
                        {year}
                      </button>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-navy-500">
                          {clientCount} {clientCount === 1 ? 'Kunde' : 'Kunden'}
                        </span>
                        <button
                          onClick={() => handleUnarchiveYear(year)}
                          className="p-1.5 rounded-lg hover:bg-navy-100 text-navy-400 hover:text-navy-700 transition-colors"
                          title={t.admin.taxYears.unarchive}
                        >
                          <ArchiveRestore className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1 text-xs text-navy-400">
                      <Archive className="w-3 h-3" />
                      {t.admin.taxYears.archived}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Open New Year Modal */}
      {showOpenYear && (
        <OpenYearModal
          clients={clients}
          allTaxYears={allTaxYears}
          onClose={() => setShowOpenYear(false)}
          onRefresh={onRefresh}
        />
      )}
    </div>
  )
}

function OpenYearModal({
  clients,
  allTaxYears,
  onClose,
  onRefresh,
}: {
  clients: ClientRow[]
  allTaxYears: TaxYear[]
  onClose: () => void
  onRefresh: () => void
}) {
  const { t } = useI18n()
  const [year, setYear] = useState(new Date().getFullYear())
  const [search, setSearch] = useState('')
  const [selectedClients, setSelectedClients] = useState<string[]>([])
  const [creating, setCreating] = useState(false)
  const [mode, setMode] = useState<'all' | 'specific'>('all')

  // Clients who don't have this year yet
  const existingUserIds = new Set(
    allTaxYears.filter((ty) => ty.year === year).map((ty) => ty.user_id)
  )
  const eligibleClients = clients.filter((c) => !existingUserIds.has(c.profile.id))

  const filteredClients = eligibleClients.filter((c) => {
    if (!search) return true
    const name = `${c.profile.first_name} ${c.profile.last_name} ${c.profile.email}`.toLowerCase()
    return name.includes(search.toLowerCase())
  })

  const toggleClient = (id: string) => {
    setSelectedClients((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  const handleCreate = async () => {
    const targetIds = mode === 'all'
      ? eligibleClients.map((c) => c.profile.id)
      : selectedClients
    if (mode === 'specific' && targetIds.length === 0) return
    setCreating(true)
    const supabase = createClient()
    if (!supabase) { setCreating(false); return }

    // Create tax_year rows for existing eligible clients
    if (targetIds.length > 0) {
      const rows = targetIds.map((clientId) => ({
        user_id: clientId,
        year,
        status: 'preis_berechnen' as const,
        tier: null,
        price: null,
        archived: false,
      }))
      await supabase.from('tax_years').insert(rows)
    }

    // Always mark the year as globally open so future new clients get it
    if (mode === 'all') {
      await supabase.from('open_tax_years').upsert({ year }, { onConflict: 'year' })
    }

    setCreating(false)
    onRefresh()
    onClose()
  }

  const yearOptions = Array.from({ length: 2050 - 2015 + 1 }, (_, i) => 2050 - i)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 max-h-[85vh] flex flex-col">
        <div className="p-4 border-b border-navy-100 flex items-center justify-between">
          <h3 className="font-heading font-semibold text-navy-900">{t.admin.taxYears.openNewYear}</h3>
          <button onClick={onClose} className="text-navy-400 hover:text-navy-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4 flex-1 overflow-hidden flex flex-col">
          {/* Year selector */}
          <div>
            <label className="block text-sm font-medium text-navy-700 mb-1">
              {t.admin.clients.year}
            </label>
            <select
              value={year}
              onChange={(e) => { setYear(parseInt(e.target.value)); setSelectedClients([]) }}
              className="w-full px-4 py-2.5 rounded-xl border-2 border-navy-200 text-navy-900 bg-white focus:border-navy-500 outline-none"
            >
              {yearOptions.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          {/* Mode toggle: all clients vs specific */}
          <div className="flex gap-2">
            <button
              onClick={() => { setMode('all'); setSelectedClients([]) }}
              className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                mode === 'all'
                  ? 'bg-navy-800 text-white'
                  : 'bg-navy-50 text-navy-600 hover:bg-navy-100'
              }`}
            >
              {t.admin.taxYears.allClients} ({eligibleClients.length})
            </button>
            <button
              onClick={() => setMode('specific')}
              className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                mode === 'specific'
                  ? 'bg-navy-800 text-white'
                  : 'bg-navy-50 text-navy-600 hover:bg-navy-100'
              }`}
            >
              {t.admin.taxYears.specificClients}
            </button>
          </div>

          {mode === 'all' ? (
            <div className="flex-1 flex items-center justify-center text-center p-6">
              <div>
                <Users className="w-8 h-8 text-navy-300 mx-auto mb-2" />
                <p className="text-sm text-navy-600">
                  {t.admin.taxYears.openForAllDesc.replace('{count}', String(eligibleClients.length)).replace('{year}', String(year))}
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Client search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t.admin.clients.search}
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-navy-200 text-sm focus:border-navy-500 outline-none"
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-navy-500">
                  {selectedClients.length} {t.admin.taxYears.selected}
                </span>
              </div>

              {/* Client list */}
              <div className="flex-1 overflow-y-auto space-y-1 min-h-0">
                {filteredClients.length === 0 ? (
                  <p className="text-sm text-navy-500 text-center py-6">{t.admin.taxYears.allClientsHaveYear}</p>
                ) : (
                  filteredClients.map((c) => (
                    <button
                      key={c.profile.id}
                      onClick={() => toggleClient(c.profile.id)}
                      className={`w-full text-left p-3 rounded-lg flex items-center gap-3 transition-colors ${
                        selectedClients.includes(c.profile.id) ? 'bg-trust-50 border border-trust-200' : 'hover:bg-navy-50'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 ${
                        selectedClients.includes(c.profile.id) ? 'bg-trust-500 border-trust-500' : 'border-navy-300'
                      }`}>
                        {selectedClients.includes(c.profile.id) && (
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-navy-900 truncate">
                          {c.profile.first_name} {c.profile.last_name}
                        </p>
                        <p className="text-xs text-navy-500 truncate">{c.profile.email}</p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </>
          )}
        </div>

        <div className="p-4 border-t border-navy-100">
          <button
            onClick={handleCreate}
            disabled={(mode === 'specific' && selectedClients.length === 0) || creating}
            className="btn-primary w-full !py-3 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {creating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Plus className="w-4 h-4" />
                {mode === 'all'
                  ? `${t.admin.taxYears.openForAll} (${eligibleClients.length})`
                  : `${t.admin.taxYears.openForSelected} (${selectedClients.length})`
                }
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
