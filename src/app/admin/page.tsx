'use client'

import { useState, useEffect, useCallback } from 'react'
import { useI18n } from '@/lib/i18n/context'
import { createClient } from '@/lib/supabase/client'
import type { TaxYear, Profile, Document as PortalDocument, TaxYearStatus } from '@/lib/types/portal'
import { STATUS_ORDER } from '@/lib/types/portal'
import { StatusBadge } from '@/components/portal/StatusBadge'
import { DocumentCard } from '@/components/portal/DocumentCard'
import {
  Users, FileText, DollarSign, TrendingUp, Search, Eye, X,
  CheckCircle, Clock, Send, StickyNote, Loader2,
} from 'lucide-react'

type AdminTab = 'overview' | 'clients'

interface ClientRow {
  profile: Profile
  taxYears: TaxYear[]
}

export default function AdminPage() {
  const { t, locale } = useI18n()
  const [activeTab, setActiveTab] = useState<AdminTab>('overview')
  const [clients, setClients] = useState<ClientRow[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [selectedClient, setSelectedClient] = useState<ClientRow | null>(null)
  const [selectedTaxYear, setSelectedTaxYear] = useState<TaxYear | null>(null)
  const [clientDocs, setClientDocs] = useState<PortalDocument[]>([])
  const [newNote, setNewNote] = useState('')
  const [offerAmount, setOfferAmount] = useState('')
  const [offerMessage, setOfferMessage] = useState('')
  const [sendingOffer, setSendingOffer] = useState(false)
  const [offerSent, setOfferSent] = useState(false)
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

    const { data: allTaxYears } = await supabase
      .from('tax_years')
      .select('*')
      .order('year', { ascending: false })

    const clientRows: ClientRow[] = (profiles as Profile[]).map((profile) => ({
      profile,
      taxYears: ((allTaxYears || []) as TaxYear[]).filter((ty) => ty.user_id === profile.id),
    }))

    setClients(clientRows)
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchClients()
  }, [fetchClients])

  const fetchClientDocs = useCallback(async (taxYearId: string) => {
    const supabase = createClient()
    if (!supabase) return
    const { data } = await supabase
      .from('portal_documents')
      .select('*')
      .eq('tax_year_id', taxYearId)
      .order('uploaded_at', { ascending: false })
    if (data) setClientDocs(data as PortalDocument[])
  }, [])

  const handleSelectClient = (client: ClientRow) => {
    setSelectedClient(client)
    setSelectedTaxYear(client.taxYears[0] || null)
    setOfferSent(false)
    if (client.taxYears[0]) {
      fetchClientDocs(client.taxYears[0].id)
    }
  }

  const handleStatusChange = async (taxYearId: string, newStatus: TaxYearStatus) => {
    const supabase = createClient()
    if (!supabase) return
    await supabase.from('tax_years').update({ status: newStatus }).eq('id', taxYearId)
    fetchClients()
    if (selectedTaxYear?.id === taxYearId) {
      setSelectedTaxYear({ ...selectedTaxYear, status: newStatus })
    }
  }

  const handleSendOffer = async () => {
    if (!selectedTaxYear || !offerAmount) return
    setSendingOffer(true)

    try {
      const res = await fetch('/api/offers/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taxYearId: selectedTaxYear.id,
          amount: parseFloat(offerAmount),
          message: offerMessage || null,
        }),
      })
      if (res.ok) {
        setOfferSent(true)
        setOfferAmount('')
        setOfferMessage('')
        fetchClients()
      }
    } catch { /* ignore */ }

    setSendingOffer(false)
  }

  const handleAddNote = async () => {
    if (!selectedTaxYear || !newNote.trim()) return
    const supabase = createClient()
    if (!supabase) return

    const existingNotes = selectedTaxYear.admin_notes || ''
    const timestamp = new Date().toLocaleDateString(locale === 'de' ? 'de-CH' : 'en-US')
    const updatedNotes = existingNotes
      ? `${existingNotes}\n[${timestamp}] ${newNote}`
      : `[${timestamp}] ${newNote}`

    await supabase.from('tax_years').update({ admin_notes: updatedNotes }).eq('id', selectedTaxYear.id)
    setSelectedTaxYear({ ...selectedTaxYear, admin_notes: updatedNotes })
    setNewNote('')
    fetchClients()
  }

  // Filtered clients
  const filtered = clients.filter((c) => {
    const nameMatch = `${c.profile.first_name} ${c.profile.last_name} ${c.profile.email}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
    if (!nameMatch) return false
    if (filterStatus === 'all') return true
    return c.taxYears.some((ty) => ty.status === filterStatus)
  })

  // Analytics
  const totalClients = clients.length
  const openDeclarations = clients.reduce(
    (sum, c) => sum + c.taxYears.filter((ty) => ty.status !== 'erledigt').length, 0
  )
  const awaitingOffers = clients.reduce(
    (sum, c) => sum + c.taxYears.filter((ty) => ty.status === 'angebot_ausstehend').length, 0
  )
  const completedThisYear = clients.reduce(
    (sum, c) => sum + c.taxYears.filter((ty) => ty.status === 'erledigt').length, 0
  )

  const tabs = [
    { key: 'overview' as const, label: t.admin.overview, icon: TrendingUp },
    { key: 'clients' as const, label: t.admin.clients.title, icon: Users },
  ]

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
        <div className="mb-8">
          <h1 className="font-heading text-3xl font-bold text-navy-900">{t.admin.title}</h1>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === tab.key
                  ? 'bg-navy-800 text-white shadow-sm'
                  : 'bg-white text-navy-600 hover:bg-navy-100 border border-navy-100'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="card p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <span className="text-sm font-medium text-navy-600">{t.admin.totalClients}</span>
              </div>
              <div className="text-3xl font-bold text-navy-900">{totalClients}</div>
            </div>
            <div className="card p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-gold-100 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-gold-600" />
                </div>
                <span className="text-sm font-medium text-navy-600">{t.admin.openDeclarations}</span>
              </div>
              <div className="text-3xl font-bold text-navy-900">{openDeclarations}</div>
            </div>
            <div className="card p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-purple-600" />
                </div>
                <span className="text-sm font-medium text-navy-600">{t.admin.awaitingOffers}</span>
              </div>
              <div className="text-3xl font-bold text-navy-900">{awaitingOffers}</div>
            </div>
            <div className="card p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-trust-100 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-trust-600" />
                </div>
                <span className="text-sm font-medium text-navy-600">{t.admin.completedThisYear}</span>
              </div>
              <div className="text-3xl font-bold text-navy-900">{completedThisYear}</div>
            </div>
          </div>
        )}

        {/* Clients Tab */}
        {activeTab === 'clients' && (
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

            {/* Client list */}
            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-navy-100 bg-navy-50/50">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-navy-600 uppercase">{t.admin.clients.name}</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-navy-600 uppercase">{t.admin.clients.email}</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-navy-600 uppercase">{t.admin.clients.year}</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-navy-600 uppercase">{t.admin.clients.tier}</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-navy-600 uppercase">{t.admin.clients.status}</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-navy-600 uppercase">{t.admin.clients.actions}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((client) => {
                      const latestTy = client.taxYears[0]
                      return (
                        <tr key={client.profile.id} className="border-b border-navy-50 hover:bg-navy-50/30">
                          <td className="px-4 py-3">
                            <div className="text-sm font-semibold text-navy-900">
                              {client.profile.first_name} {client.profile.last_name}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-navy-600">{client.profile.email}</td>
                          <td className="px-4 py-3 text-sm text-navy-700">{latestTy?.year || '–'}</td>
                          <td className="px-4 py-3 text-sm text-navy-700">
                            {latestTy?.tier ? `Tier ${latestTy.tier}` : '–'}
                          </td>
                          <td className="px-4 py-3">
                            {latestTy ? <StatusBadge status={latestTy.status} /> : '–'}
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => handleSelectClient(client)}
                              className="p-1.5 rounded-lg hover:bg-navy-100 text-navy-500 hover:text-navy-700"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Client Detail Modal */}
            {selectedClient && selectedTaxYear && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-900/50">
                <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto">
                  <div className="flex items-center justify-between p-6 border-b border-navy-100">
                    <h3 className="font-heading font-bold text-navy-900">
                      {selectedClient.profile.first_name} {selectedClient.profile.last_name}
                    </h3>
                    <button onClick={() => setSelectedClient(null)} className="text-navy-400 hover:text-navy-600">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="p-6 space-y-6">
                    {/* Client info */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-navy-500">{t.admin.clients.email}:</span>
                        <p className="font-medium text-navy-900">{selectedClient.profile.email}</p>
                      </div>
                      <div>
                        <span className="text-navy-500">{t.admin.clients.year}:</span>
                        <p className="font-medium text-navy-900">{selectedTaxYear.year}</p>
                      </div>
                      <div>
                        <span className="text-navy-500">{t.admin.clients.tier}:</span>
                        <p className="font-medium text-navy-900">
                          {selectedTaxYear.tier ? `Tier ${selectedTaxYear.tier}` : '–'}
                        </p>
                      </div>
                      <div>
                        <span className="text-navy-500">{t.yearDetail.price}:</span>
                        <p className="font-medium text-navy-900">
                          {selectedTaxYear.price ? `CHF ${selectedTaxYear.price}` : '–'}
                        </p>
                      </div>
                    </div>

                    {/* Status change */}
                    <div>
                      <label className="block text-sm font-semibold text-navy-900 mb-2">
                        {t.admin.clientDetail.changeStatus}
                      </label>
                      <select
                        value={selectedTaxYear.status}
                        onChange={(e) => handleStatusChange(selectedTaxYear.id, e.target.value as TaxYearStatus)}
                        className="w-full px-4 py-3 rounded-xl border-2 border-navy-200 text-navy-900 bg-white focus:border-navy-500 outline-none"
                      >
                        {STATUS_ORDER.map((s) => (
                          <option key={s} value={s}>{t.dashboard.status[s]}</option>
                        ))}
                      </select>
                    </div>

                    {/* Send offer (Tier 3) */}
                    {selectedTaxYear.tier === 3 && selectedTaxYear.status === 'angebot_ausstehend' && (
                      <div className="bg-navy-50 rounded-xl p-4 space-y-3">
                        <h4 className="font-semibold text-navy-900">{t.admin.clientDetail.sendOffer}</h4>
                        {offerSent ? (
                          <div className="flex items-center gap-2 text-trust-600 text-sm">
                            <CheckCircle className="w-4 h-4" />
                            {t.admin.clientDetail.offerSent}
                          </div>
                        ) : (
                          <>
                            <input
                              type="number"
                              placeholder={t.admin.clientDetail.offerAmount}
                              value={offerAmount}
                              onChange={(e) => setOfferAmount(e.target.value)}
                              className="w-full px-4 py-2 rounded-lg border border-navy-200 text-navy-900 focus:border-navy-500 outline-none"
                            />
                            <textarea
                              placeholder={t.admin.clientDetail.offerMessage}
                              value={offerMessage}
                              onChange={(e) => setOfferMessage(e.target.value)}
                              rows={2}
                              className="w-full px-4 py-2 rounded-lg border border-navy-200 text-navy-900 focus:border-navy-500 outline-none resize-none"
                            />
                            <button
                              onClick={handleSendOffer}
                              disabled={sendingOffer || !offerAmount}
                              className="btn-primary !py-2 !px-4 !text-sm disabled:opacity-50"
                            >
                              {sendingOffer ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <>
                                  <Send className="w-4 h-4 mr-2" />
                                  {t.admin.clientDetail.sendOfferButton}
                                </>
                              )}
                            </button>
                          </>
                        )}
                      </div>
                    )}

                    {/* Documents */}
                    <div>
                      <h4 className="font-semibold text-navy-900 mb-3">{t.admin.clientDetail.documents}</h4>
                      {clientDocs.length === 0 ? (
                        <p className="text-sm text-navy-500">{t.dashboard.documents.noDocuments}</p>
                      ) : (
                        <div className="space-y-3">
                          {clientDocs.map((doc) => (
                            <DocumentCard
                              key={doc.id}
                              doc={doc}
                              onUpdate={() => fetchClientDocs(selectedTaxYear.id)}
                              isAdmin
                            />
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Internal notes */}
                    <div>
                      <h4 className="font-semibold text-navy-900 mb-2">
                        {t.admin.clientDetail.internalNotes}
                      </h4>
                      {selectedTaxYear.admin_notes && (
                        <div className="mb-3 space-y-1">
                          {selectedTaxYear.admin_notes.split('\n').map((note, i) => (
                            <div key={i} className="flex items-start gap-2 p-2 bg-navy-50 rounded-lg">
                              <StickyNote className="w-4 h-4 text-navy-400 mt-0.5 shrink-0" />
                              <span className="text-sm text-navy-700">{note}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newNote}
                          onChange={(e) => setNewNote(e.target.value)}
                          placeholder={t.admin.clients.addNote}
                          className="flex-1 px-3 py-2 rounded-lg border border-navy-200 text-sm focus:border-navy-500 outline-none"
                          onKeyDown={(e) => e.key === 'Enter' && handleAddNote()}
                        />
                        <button onClick={handleAddNote} className="btn-primary !py-2 !px-3 !text-xs">
                          {t.admin.clientDetail.addNoteButton}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
