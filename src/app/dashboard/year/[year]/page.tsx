'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { useI18n } from '@/lib/i18n/context'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import type { TaxYear, Profile, Document as PortalDocument } from '@/lib/types/portal'
import { isClientTurn } from '@/lib/types/portal'
import { BasisdatenForm } from '@/components/portal/BasisdatenForm'
import { StatusPipeline } from '@/components/portal/StatusPipeline'
import { OfferCard } from '@/components/portal/OfferCard'
import { DocumentCard } from '@/components/portal/DocumentCard'
import { DocumentUploadModal } from '@/components/portal/DocumentUploadModal'
import { StatusBadge } from '@/components/portal/StatusBadge'
import { Upload, User as UserIcon, FileText, CreditCard, Clock } from 'lucide-react'

type Tab = 'overview' | 'deductions' | 'documents'

export default function YearDetailPage() {
  const params = useParams()
  const year = parseInt(params.year as string, 10)
  const { t } = useI18n()

  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [taxYear, setTaxYear] = useState<TaxYear | null>(null)
  const [documents, setDocuments] = useState<PortalDocument[]>([])
  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const [showUpload, setShowUpload] = useState(false)
  const [loading, setLoading] = useState(true)

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

    const { data: tyData } = await supabase
      .from('tax_years')
      .select('*')
      .eq('user_id', user.id)
      .eq('year', year)
      .single()
    if (tyData) setTaxYear(tyData as TaxYear)

    if (tyData) {
      const { data: docsData } = await supabase
        .from('portal_documents')
        .select('*')
        .eq('tax_year_id', tyData.id)
        .order('uploaded_at', { ascending: false })
      if (docsData) setDocuments(docsData as PortalDocument[])
    }

    setLoading(false)
  }, [year])

  useEffect(() => {
    fetchData()
  }, [fetchData])

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
          />
        </div>
      </div>
    )
  }

  const clientTurn = isClientTurn(taxYear.status)

  const tabs: { key: Tab; label: string; icon: typeof FileText }[] = [
    { key: 'overview', label: t.yearDetail.tabs.overview, icon: FileText },
    { key: 'deductions', label: t.yearDetail.tabs.deductions, icon: CreditCard },
    { key: 'documents', label: t.yearDetail.tabs.documents, icon: FileText },
  ]

  return (
    <div className="min-h-screen bg-navy-50/30 pt-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-heading text-2xl font-bold text-navy-900">
              {t.yearDetail.title} {year}
            </h1>
            <StatusBadge status={taxYear.status} />
          </div>
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

        {/* Tab Content */}
        <div className="relative">
          {/* ===== Tab 1: Übersicht ===== */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Responsibility tile */}
              <div className="card p-6">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    clientTurn ? 'bg-gold-100' : 'bg-trust-100'
                  }`}>
                    <UserIcon className={`w-5 h-5 ${clientTurn ? 'text-gold-600' : 'text-trust-600'}`} />
                  </div>
                  <div>
                    <p className="text-sm text-navy-600">{t.yearDetail.responsible}</p>
                    <p className="font-medium text-navy-900">
                      {clientTurn ? t.yearDetail.responsibleClient : t.yearDetail.responsibleAdmin}
                    </p>
                  </div>
                </div>
              </div>

              {/* Status Pipeline */}
              <div className="card p-8">
                <StatusPipeline status={taxYear.status} />
              </div>

              {/* Price / Offer tile */}
              <OfferCard
                taxYearId={taxYear.id}
                offerAmount={taxYear.offer_amount}
                offerMessage={taxYear.offer_message}
                price={taxYear.price}
                status={taxYear.status}
                onUpdate={fetchData}
              />
            </div>
          )}

          {/* ===== Tab 2: Abzüge ===== */}
          {activeTab === 'deductions' && (
            <div className="card p-8 text-center">
              <Clock className="w-10 h-10 text-navy-300 mx-auto mb-3" />
              <p className="text-navy-500 font-medium">{t.yearDetail.deductionsPlaceholder}</p>
            </div>
          )}

          {/* ===== Tab 3: Dokumente ===== */}
          {activeTab === 'documents' && (
            <div className="space-y-4">
              {documents.length === 0 ? (
                <div className="card p-8 text-center">
                  <FileText className="w-10 h-10 text-navy-300 mx-auto mb-3" />
                  <p className="text-navy-500">{t.dashboard.documents.noDocuments}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {documents.map((doc) => (
                    <DocumentCard key={doc.id} doc={doc} onUpdate={fetchData} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Persistent upload button */}
          <button
            onClick={() => setShowUpload(true)}
            className="fixed bottom-8 right-8 btn-primary !rounded-full !p-4 shadow-lg z-40"
            title={t.dashboard.documents.upload}
          >
            <Upload className="w-6 h-6" />
          </button>
        </div>
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
    </div>
  )
}
