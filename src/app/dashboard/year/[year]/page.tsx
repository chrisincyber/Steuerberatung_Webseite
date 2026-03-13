'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { useI18n } from '@/lib/i18n/context'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import type { TaxYear, Profile, Document as PortalDocument, KonkubinatPartner, Checklist, ChecklistSection } from '@/lib/types/portal'
import { BasisdatenForm } from '@/components/portal/BasisdatenForm'
import { StatusPipeline } from '@/components/portal/StatusPipeline'
import { OfferCard } from '@/components/portal/OfferCard'
import { DocumentCard } from '@/components/portal/DocumentCard'
import { DocumentUploadModal } from '@/components/portal/DocumentUploadModal'
import { StatusBadge } from '@/components/portal/StatusBadge'
import { ChecklistWizard } from '@/components/portal/ChecklistWizard'
import { ChecklistSection as ChecklistSectionComponent } from '@/components/portal/ChecklistSection'
import { SectionUploadZone } from '@/components/portal/SectionUploadZone'
import { MessagePanel } from '@/components/portal/MessagePanel'
import { useUnreadCount } from '@/hooks/useUnreadCount'
import { Upload, MessageCircle, Plus, Zap, Clock, CheckCircle2 } from 'lucide-react'

export default function YearDetailPage() {
  return (
    <Suspense>
      <YearDetailContent />
    </Suspense>
  )
}

function YearDetailContent() {
  const params = useParams()
  const searchParams = useSearchParams()
  const year = parseInt(params.year as string, 10)
  const partnerId = searchParams.get('partner') || null
  const { t } = useI18n()

  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [taxYear, setTaxYear] = useState<TaxYear | null>(null)
  const [documents, setDocuments] = useState<PortalDocument[]>([])
  const [checklist, setChecklist] = useState<Checklist | null>(null)
  const [showUpload, setShowUpload] = useState(false)
  const [showMessages, setShowMessages] = useState(false)
  const [loading, setLoading] = useState(true)
  const [partnerInfo, setPartnerInfo] = useState<KonkubinatPartner | null>(null)
  const [expressConfirming, setExpressConfirming] = useState(false)
  const unreadCount = useUnreadCount(user?.id ?? null, 'client')

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

    // Fetch partner info if viewing partner year
    if (partnerId) {
      const { data: pData } = await supabase
        .from('konkubinat_partners')
        .select('*')
        .eq('id', partnerId)
        .single()
      if (pData) setPartnerInfo(pData as KonkubinatPartner)
    }

    let tyQuery = supabase
      .from('tax_years')
      .select('*')
      .eq('user_id', user.id)
      .eq('year', year)

    if (partnerId) {
      tyQuery = tyQuery.eq('partner_id', partnerId)
    } else {
      tyQuery = tyQuery.is('partner_id', null)
    }

    const { data: tyData } = await tyQuery.single()
    if (tyData) setTaxYear(tyData as TaxYear)

    if (tyData) {
      // Fetch documents
      const { data: docsData } = await supabase
        .from('portal_documents')
        .select('*')
        .eq('tax_year_id', tyData.id)
        .order('uploaded_at', { ascending: false })
      if (docsData) setDocuments(docsData as PortalDocument[])

      // Fetch checklist
      const { data: checklistData } = await supabase
        .from('checklists')
        .select('*')
        .eq('tax_year_id', tyData.id)
        .single()
      if (checklistData) setChecklist(checklistData as Checklist)
      else setChecklist(null)
    }

    setLoading(false)
  }, [year, partnerId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleToggleSectionDone = async (sectionIndex: number) => {
    if (!checklist) return
    const supabase = createClient()
    if (!supabase) return

    const updated = checklist.sections.map((s, i) =>
      i === sectionIndex ? { ...s, done: !s.done } : s
    )

    await supabase
      .from('checklists')
      .update({ sections: updated })
      .eq('id', checklist.id)

    setChecklist({ ...checklist, sections: updated })
  }

  const handleAddSection = async () => {
    // This would ideally open a small picker. For now, find groups not yet in checklist
    // and add the first one found. A more complete UX could show a dropdown.
    if (!checklist) return
    const supabase = createClient()
    if (!supabase) return

    const { DOCUMENT_CATEGORY_GROUPS } = await import('@/lib/types/portal')
    const existingKeys = new Set(checklist.sections.map((s) => s.groupKey))
    const available = DOCUMENT_CATEGORY_GROUPS.filter(
      (g) => !existingKeys.has(g.groupKey) && g.groupKey !== 'sonstiges'
    )

    if (available.length === 0) return

    // Add first available group
    const newSection: ChecklistSection = {
      groupKey: available[0].groupKey,
      categories: [...available[0].categories],
      done: false,
    }

    const updated = [...checklist.sections, newSection]
    await supabase
      .from('checklists')
      .update({ sections: updated })
      .eq('id', checklist.id)

    setChecklist({ ...checklist, sections: updated })
  }

  const handleExpressConfirm = async () => {
    if (!taxYear) return
    setExpressConfirming(true)
    try {
      const res = await fetch('/api/declarations/express-confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taxYearId: taxYear.id }),
      })
      if (res.ok) {
        fetchData()
      }
    } catch {
      // ignore
    } finally {
      setExpressConfirming(false)
    }
  }

  function getExpressCountdown(confirmedAt: string) {
    const deadlineDays = 5
    const confirmed = new Date(confirmedAt)
    const deadline = new Date(confirmed.getTime() + deadlineDays * 24 * 60 * 60 * 1000)
    const now = new Date()
    const remaining = deadline.getTime() - now.getTime()
    if (remaining <= 0) return { expired: true, days: 0, hours: 0, minutes: 0, percent: 100 }
    const totalMs = deadlineDays * 24 * 60 * 60 * 1000
    const percent = Math.min(100, Math.round(((now.getTime() - confirmed.getTime()) / totalMs) * 100))
    const days = Math.floor(remaining / (24 * 60 * 60 * 1000))
    const hours = Math.floor((remaining % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000))
    const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000))
    return { expired: false, days, hours, minutes, percent }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-navy-50/30 pt-20 flex items-center justify-center">
        <div className="text-navy-500">{t.common.loading}</div>
      </div>
    )
  }

  if (!taxYear || !profile || !user) {
    return (
      <div className="min-h-screen bg-navy-50/30 pt-20 flex items-center justify-center">
        <div className="text-navy-500">{t.common.error}</div>
      </div>
    )
  }

  // Basisdaten gate
  if (!taxYear.basisdaten_confirmed) {
    return (
      <div className="min-h-screen bg-navy-50/30 pt-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="font-heading text-2xl font-bold text-navy-900 mb-6">
            {t.yearDetail.title} {year}
          </h1>
          <BasisdatenForm
            taxYearId={taxYear.id}
            year={year}
            profile={profile}
            onConfirmed={fetchData}
            isPartnerTaxYear={!!partnerId}
          />
        </div>
      </div>
    )
  }

  // Documents not in any checklist section (for catch-all)
  const checklistCategories = checklist
    ? new Set(checklist.sections.flatMap((s) => s.categories))
    : new Set<string>()
  const catchAllDocs = documents.filter(
    (d) => !checklistCategories.has(d.category) || d.category === 'sonstige'
  )

  return (
    <div className="min-h-screen bg-navy-50/30 pt-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-heading text-2xl font-bold text-navy-900">
                {t.yearDetail.title} {year}
              </h1>
              {partnerInfo && (
                <p className="text-sm text-navy-500 mt-0.5">
                  {t.dashboard.partner.partnerLabel}: {partnerInfo.first_name} {partnerInfo.last_name}
                </p>
              )}
            </div>
            <StatusBadge status={taxYear.status} />
          </div>
        </div>

        {/* Status Pipeline (condensed) */}
        <div className="card p-6">
          <StatusPipeline status={taxYear.status} />
        </div>

        {/* Express card */}
        {taxYear.express && (
          <div className={`card overflow-hidden border-2 ${
            taxYear.express_confirmed_at ? 'border-gold-300' : 'border-red-200'
          }`}>
            <div className={`px-5 py-3 flex items-center gap-2 ${
              taxYear.express_confirmed_at ? 'bg-gold-50' : 'bg-red-50'
            }`}>
              <Zap className={`w-4 h-4 ${taxYear.express_confirmed_at ? 'text-gold-600' : 'text-red-600'}`} />
              <span className={`text-sm font-bold uppercase tracking-wide ${
                taxYear.express_confirmed_at ? 'text-gold-700' : 'text-red-700'
              }`}>
                EXPRESS
              </span>
            </div>
            <div className="p-5">
              {taxYear.express_confirmed_at ? (
                // Countdown display
                (() => {
                  const cd = getExpressCountdown(taxYear.express_confirmed_at)
                  return (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        {cd.expired ? (
                          <CheckCircle2 className="w-5 h-5 text-trust-600" />
                        ) : (
                          <Clock className="w-5 h-5 text-gold-600" />
                        )}
                        <span className="font-semibold text-navy-900">{t.express.confirmed}</span>
                      </div>
                      {!cd.expired ? (
                        <div>
                          <div className="flex items-center justify-between text-sm mb-1.5">
                            <span className="text-navy-600">{t.express.countdown}</span>
                            <span className={`font-semibold ${cd.percent > 80 ? 'text-red-600' : 'text-navy-900'}`}>
                              {cd.days > 0
                                ? t.express.daysRemaining.replace('{days}', String(cd.days)).replace('{hours}', String(cd.hours))
                                : t.express.hoursRemaining.replace('{hours}', String(cd.hours)).replace('{minutes}', String(cd.minutes))
                              }
                            </span>
                          </div>
                          <div className="h-2.5 bg-navy-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                cd.percent > 80 ? 'bg-red-500' : cd.percent > 50 ? 'bg-gold-500' : 'bg-trust-500'
                              }`}
                              style={{ width: `${cd.percent}%` }}
                            />
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-navy-600">{t.express.expired}</p>
                      )}
                    </div>
                  )
                })()
              ) : (
                // Mark complete button
                <div className="space-y-3">
                  <p className="text-sm text-navy-600">{t.express.markCompleteDesc}</p>
                  <button
                    onClick={handleExpressConfirm}
                    disabled={expressConfirming}
                    className="btn-primary flex items-center gap-2 disabled:opacity-50"
                  >
                    {expressConfirming ? (
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    ) : (
                      <CheckCircle2 className="w-4 h-4" />
                    )}
                    {t.express.confirmButton}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Offer card (if applicable) */}
        {(taxYear.status === 'angebot_gesendet' || taxYear.offer_amount) && (
          <OfferCard
            taxYearId={taxYear.id}
            offerAmount={taxYear.offer_amount}
            offerMessage={taxYear.offer_message}
            price={taxYear.price}
            status={taxYear.status}
            onUpdate={fetchData}
          />
        )}

        {/* Action Bar */}
        <div className="flex gap-3">
          <button
            onClick={() => setShowUpload(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            {t.dashboard.documents.upload}
          </button>
          <button
            onClick={() => setShowMessages(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-white text-navy-600 hover:bg-navy-100 border border-navy-100 transition-all"
          >
            <MessageCircle className="w-4 h-4" />
            {t.yearDetail.tabs.messages}
            {unreadCount > 0 && (
              <span className="inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold rounded-full bg-gold-500 text-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
        </div>

        {/* Checklist or Wizard */}
        {!checklist ? (
          <ChecklistWizard
            taxYearId={taxYear.id}
            userId={user.id}
            existingDocs={documents}
            onCreated={fetchData}
          />
        ) : (
          <div className="space-y-4">
            {/* Checklist sections */}
            {checklist.sections.map((section, index) => (
              <ChecklistSectionComponent
                key={`${section.groupKey}-${index}`}
                section={section}
                documents={documents}
                taxYearId={taxYear.id}
                userId={user.id}
                year={year}
                onToggleDone={() => handleToggleSectionDone(index)}
                onDocumentsChanged={fetchData}
              />
            ))}

            {/* Sonstige Dokumente (catch-all) */}
            <div className="card overflow-hidden">
              <div className="p-4">
                <p className="font-medium text-navy-900 mb-1">
                  {t.docCategories.groups.sonstiges}
                </p>
                <p className="text-xs text-navy-500 mb-3">
                  {catchAllDocs.length} {t.checklist.documents}
                </p>
                {catchAllDocs.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                    {catchAllDocs.map((doc) => (
                      <DocumentCard key={doc.id} doc={doc} onUpdate={fetchData} />
                    ))}
                  </div>
                )}
                <SectionUploadZone
                  taxYearId={taxYear.id}
                  userId={user.id}
                  year={year}
                  categories={['sonstige']}
                  onUploaded={fetchData}
                />
              </div>
            </div>

            {/* Add section button */}
            {checklist.sections.length < 5 && (
              <button
                onClick={handleAddSection}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-navy-200 text-navy-500 hover:border-navy-400 hover:text-navy-700 transition-all text-sm font-medium"
              >
                <Plus className="w-4 h-4" />
                {t.checklist.addSection}
              </button>
            )}
          </div>
        )}

        {/* Existing docs notice when no checklist */}
        {!checklist && documents.length > 0 && (
          <div className="card p-4">
            <p className="text-sm font-medium text-navy-700 mb-3">{t.checklist.existingDocsTitle}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {documents.map((doc) => (
                <DocumentCard key={doc.id} doc={doc} onUpdate={fetchData} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUpload && (
        <DocumentUploadModal
          taxYearId={taxYear.id}
          userId={user.id}
          year={year}
          onClose={() => setShowUpload(false)}
          onUploaded={fetchData}
        />
      )}

      {/* Message Panel (slide-over) */}
      {showMessages && user && profile && (
        <MessagePanel
          clientId={user.id}
          currentUserId={user.id}
          currentUserName={`${profile.first_name} ${profile.last_name}`}
          otherPartyName={t.yearDetail.responsibleAdmin}
          onClose={() => setShowMessages(false)}
        />
      )}
    </div>
  )
}
