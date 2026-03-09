'use client'

import { useState, useEffect } from 'react'
import { useI18n } from '@/lib/i18n/context'
import { createClient } from '@/lib/supabase/client'
import type { Document as PortalDocument, DocumentStatus } from '@/lib/types/portal'
import { FileText, Image as ImageIcon, Download, Loader2 } from 'lucide-react'

interface AdminDocumentCardProps {
  doc: PortalDocument
  onUpdate: () => void
}

export function AdminDocumentCard({ doc, onUpdate }: AdminDocumentCardProps) {
  const { t } = useI18n()
  const [signedUrl, setSignedUrl] = useState<string | null>(null)
  const [loadingUrl, setLoadingUrl] = useState(false)
  const [urlError, setUrlError] = useState(false)

  const isImage = doc.file_type.startsWith('image/')
  const isPdf = doc.file_type === 'application/pdf'
  const canPreview = isImage || isPdf

  const categoryLabel = t.docCategories.items[doc.category as keyof typeof t.docCategories.items] || doc.category

  useEffect(() => {
    let cancelled = false
    async function fetchUrl() {
      setLoadingUrl(true)
      setUrlError(false)
      const supabase = createClient()
      if (!supabase) { setLoadingUrl(false); return }
      const { data, error } = await supabase.storage
        .from('portal-documents')
        .createSignedUrl(doc.storage_path, 3600)
      if (cancelled) return
      if (error || !data?.signedUrl) {
        setUrlError(true)
      } else {
        setSignedUrl(data.signedUrl)
      }
      setLoadingUrl(false)
    }
    fetchUrl()
    return () => { cancelled = true }
  }, [doc.storage_path])

  const handleStatusChange = async (newStatus: DocumentStatus) => {
    const supabase = createClient()
    if (!supabase) return
    await supabase.from('portal_documents').update({ status: newStatus }).eq('id', doc.id)
    onUpdate()
  }

  return (
    <div className="card p-4 space-y-3">
      {/* File info row */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-navy-50 flex items-center justify-center shrink-0">
          {isImage ? (
            <ImageIcon className="w-5 h-5 text-navy-500" />
          ) : (
            <FileText className="w-5 h-5 text-navy-500" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-navy-900 truncate">{doc.file_name}</p>
          <p className="text-xs text-navy-500">{categoryLabel}</p>
        </div>

        {/* Status dropdown */}
        <select
          value={doc.status}
          onChange={(e) => handleStatusChange(e.target.value as DocumentStatus)}
          className="text-xs px-2 py-1 rounded-lg border border-navy-200 text-navy-700 bg-white shrink-0"
        >
          <option value="offen">{t.docStatus.offen}</option>
          <option value="in_bearbeitung">{t.docStatus.in_bearbeitung}</option>
          <option value="vollstaendig">{t.docStatus.vollstaendig}</option>
        </select>

        {/* Download button */}
        {signedUrl && (
          <a
            href={signedUrl}
            download={doc.file_name}
            className="p-2 rounded-lg hover:bg-navy-100 text-navy-500 hover:text-navy-700 shrink-0"
            title={t.admin.drillDown.download}
          >
            <Download className="w-4 h-4" />
          </a>
        )}
      </div>

      {/* Inline preview */}
      {loadingUrl && (
        <div className="flex items-center justify-center py-8 bg-navy-50 rounded-xl">
          <Loader2 className="w-5 h-5 animate-spin text-navy-400" />
        </div>
      )}
      {!loadingUrl && signedUrl && canPreview && (
        <div className="rounded-xl overflow-hidden bg-navy-50 border border-navy-100">
          {isImage ? (
            <img
              src={signedUrl}
              alt={doc.file_name}
              className="w-full max-h-[400px] object-contain"
            />
          ) : (
            <iframe
              src={signedUrl}
              title={doc.file_name}
              className="w-full h-[500px]"
            />
          )}
        </div>
      )}
      {!loadingUrl && !canPreview && !urlError && (
        <div className="flex items-center justify-center py-6 bg-navy-50 rounded-xl text-sm text-navy-500">
          {t.admin.drillDown.noPreview}
        </div>
      )}
      {urlError && (
        <div className="flex items-center justify-center py-6 bg-red-50 rounded-xl text-sm text-red-500">
          {t.common.error}
        </div>
      )}
    </div>
  )
}
