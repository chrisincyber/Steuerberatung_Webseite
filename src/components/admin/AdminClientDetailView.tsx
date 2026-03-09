'use client'

import { useState, useEffect, useCallback } from 'react'
import { useI18n } from '@/lib/i18n/context'
import { createClient } from '@/lib/supabase/client'
import type { TaxYear, Profile, Document as PortalDocument, TaxYearStatus } from '@/lib/types/portal'
import { STATUS_ORDER } from '@/lib/types/portal'
import { StatusBadge } from '@/components/portal/StatusBadge'
import { StatusPipeline } from '@/components/portal/StatusPipeline'
import { AdminDocumentCard } from './AdminDocumentCard'
import {
  Send, StickyNote, Loader2, CheckCircle,
} from 'lucide-react'

interface AdminClientDetailViewProps {
  profile: Profile
  taxYear: TaxYear
  onStatusChange: (taxYearId: string, newStatus: TaxYearStatus) => void
  onRefresh: () => void
}

export function AdminClientDetailView({ profile, taxYear: initialTaxYear, onStatusChange, onRefresh }: AdminClientDetailViewProps) {
  const { t, locale } = useI18n()
  const [taxYear, setTaxYear] = useState(initialTaxYear)
  const [clientDocs, setClientDocs] = useState<PortalDocument[]>([])
  const [loadingDocs, setLoadingDocs] = useState(true)
  const [newNote, setNewNote] = useState('')
  const [offerAmount, setOfferAmount] = useState('')
  const [offerMessage, setOfferMessage] = useState('')
  const [sendingOffer, setSendingOffer] = useState(false)
  const [offerSent, setOfferSent] = useState(false)

  // Keep in sync with parent
  useEffect(() => {
    setTaxYear(initialTaxYear)
    setOfferSent(false)
  }, [initialTaxYear])

  const fetchDocs = useCallback(async () => {
    setLoadingDocs(true)
    const supabase = createClient()
    if (!supabase) { setLoadingDocs(false); return }
    const { data } = await supabase
      .from('portal_documents')
      .select('*')
      .eq('tax_year_id', taxYear.id)
      .order('uploaded_at', { ascending: false })
    if (data) setClientDocs(data as PortalDocument[])
    setLoadingDocs(false)
  }, [taxYear.id])

  useEffect(() => {
    fetchDocs()
  }, [fetchDocs])

  const handleStatusChange = async (newStatus: TaxYearStatus) => {
    onStatusChange(taxYear.id, newStatus)
    setTaxYear({ ...taxYear, status: newStatus })
  }

  const handleSendOffer = async () => {
    if (!offerAmount) return
    setSendingOffer(true)
    try {
      const res = await fetch('/api/offers/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taxYearId: taxYear.id,
          amount: parseFloat(offerAmount),
          message: offerMessage || null,
        }),
      })
      if (res.ok) {
        setOfferSent(true)
        setOfferAmount('')
        setOfferMessage('')
        onRefresh()
      }
    } catch { /* ignore */ }
    setSendingOffer(false)
  }

  const handleAddNote = async () => {
    if (!newNote.trim()) return
    const supabase = createClient()
    if (!supabase) return

    const existingNotes = taxYear.admin_notes || ''
    const timestamp = new Date().toLocaleDateString(locale === 'de' ? 'de-CH' : 'en-US')
    const updatedNotes = existingNotes
      ? `${existingNotes}\n[${timestamp}] ${newNote}`
      : `[${timestamp}] ${newNote}`

    await supabase.from('tax_years').update({ admin_notes: updatedNotes }).eq('id', taxYear.id)
    setTaxYear({ ...taxYear, admin_notes: updatedNotes })
    setNewNote('')
    onRefresh()
  }

  return (
    <div className="space-y-8">
      {/* Client info header */}
      <div className="card p-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
          <div className="flex-1">
            <h2 className="font-heading text-xl font-bold text-navy-900">
              {profile.first_name} {profile.last_name}
            </h2>
            <p className="text-sm text-navy-500">{profile.email}</p>
          </div>
          <StatusBadge status={taxYear.status} />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-navy-500">{t.admin.clients.year}:</span>
            <p className="font-medium text-navy-900">{taxYear.year}</p>
          </div>
          <div>
            <span className="text-navy-500">{t.admin.clients.tier}:</span>
            <p className="font-medium text-navy-900">
              {taxYear.tier ? `Tier ${taxYear.tier}` : '–'}
            </p>
          </div>
          <div>
            <span className="text-navy-500">{t.yearDetail.price}:</span>
            <p className="font-medium text-navy-900">
              {taxYear.price ? `CHF ${taxYear.price}` : '–'}
            </p>
          </div>
          <div>
            <span className="text-navy-500">{t.admin.clients.email}:</span>
            <p className="font-medium text-navy-900">{profile.phone || '–'}</p>
          </div>
        </div>
      </div>

      {/* Status pipeline + change */}
      <div className="card p-6 space-y-4">
        <StatusPipeline status={taxYear.status} />
        <div className="pt-4 border-t border-navy-100">
          <label className="block text-sm font-semibold text-navy-900 mb-2">
            {t.admin.clientDetail.changeStatus}
          </label>
          <select
            value={taxYear.status}
            onChange={(e) => handleStatusChange(e.target.value as TaxYearStatus)}
            className="w-full sm:w-auto px-4 py-3 rounded-xl border-2 border-navy-200 text-navy-900 bg-white focus:border-navy-500 outline-none"
          >
            {STATUS_ORDER.map((s) => (
              <option key={s} value={s}>{t.dashboard.status[s]}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Send offer (Tier 3) */}
      {taxYear.tier === 3 && taxYear.status === 'angebot_ausstehend' && (
        <div className="card p-6 space-y-3">
          <h3 className="font-semibold text-navy-900">{t.admin.clientDetail.sendOffer}</h3>
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
      <div className="space-y-3">
        <h3 className="font-heading text-lg font-semibold text-navy-900">
          {t.admin.clientDetail.documents} ({clientDocs.length})
        </h3>
        {loadingDocs ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-navy-400" />
          </div>
        ) : clientDocs.length === 0 ? (
          <div className="card p-6 text-center text-sm text-navy-500">
            {t.dashboard.documents.noDocuments}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {clientDocs.map((doc) => (
              <AdminDocumentCard
                key={doc.id}
                doc={doc}
                onUpdate={fetchDocs}
              />
            ))}
          </div>
        )}
      </div>

      {/* Internal notes */}
      <div className="card p-6 space-y-3">
        <h3 className="font-semibold text-navy-900">
          {t.admin.clientDetail.internalNotes}
        </h3>
        {taxYear.admin_notes && (
          <div className="space-y-1">
            {taxYear.admin_notes.split('\n').map((note, i) => (
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
  )
}
