'use client'

import { useState, useEffect } from 'react'
import { useI18n } from '@/lib/i18n/context'
import { createClient } from '@/lib/supabase/client'
import type { Document as PortalDocument } from '@/lib/types/portal'
import { X, Download, Loader2, FileText } from 'lucide-react'

interface DocumentPreviewProps {
  doc: PortalDocument
  onClose: () => void
}

export function DocumentPreview({ doc, onClose }: DocumentPreviewProps) {
  const { t } = useI18n()
  const [signedUrl, setSignedUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const isImage = doc.file_type.startsWith('image/')
  const isPdf = doc.file_type === 'application/pdf'

  useEffect(() => {
    const getUrl = async () => {
      const supabase = createClient()
      if (!supabase) { setError(true); setLoading(false); return }

      const { data, error: urlError } = await supabase.storage
        .from('portal-documents')
        .createSignedUrl(doc.storage_path, 300) // 5 min expiry

      if (urlError || !data?.signedUrl) {
        setError(true)
      } else {
        setSignedUrl(data.signedUrl)
      }
      setLoading(false)
    }
    getUrl()
  }, [doc.storage_path])

  const handleDownload = () => {
    if (signedUrl) {
      const a = document.createElement('a')
      a.href = signedUrl
      a.download = doc.original_name || doc.file_name
      a.click()
    }
  }

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-900/60" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-navy-100">
          <div className="min-w-0 flex-1">
            <p className="font-medium text-navy-900 truncate">{doc.file_name}</p>
            <p className="text-xs text-navy-500">{formatSize(doc.file_size)}</p>
          </div>
          <div className="flex items-center gap-2 ml-3">
            {signedUrl && (
              <button
                onClick={handleDownload}
                className="p-2 rounded-lg text-navy-500 hover:bg-navy-50 hover:text-navy-700 transition-colors"
                title={t.dashboard.documents.download}
              >
                <Download className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-navy-400 hover:bg-navy-50 hover:text-navy-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4 flex items-center justify-center min-h-[300px]">
          {loading ? (
            <Loader2 className="w-8 h-8 animate-spin text-navy-400" />
          ) : error || !signedUrl ? (
            <div className="text-center text-navy-500">
              <FileText className="w-12 h-12 mx-auto mb-3 text-navy-300" />
              <p className="text-sm">{t.preview.unavailable}</p>
            </div>
          ) : isImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={signedUrl}
              alt={doc.file_name}
              className="max-w-full max-h-[70vh] object-contain rounded-lg"
            />
          ) : isPdf ? (
            <iframe
              src={signedUrl}
              title={doc.file_name}
              className="w-full h-[70vh] rounded-lg border border-navy-100"
            />
          ) : (
            <div className="text-center">
              <FileText className="w-16 h-16 mx-auto mb-4 text-navy-300" />
              <p className="text-navy-700 font-medium mb-1">{doc.file_name}</p>
              <p className="text-sm text-navy-500 mb-4">{formatSize(doc.file_size)}</p>
              <button onClick={handleDownload} className="btn-primary">
                <Download className="w-4 h-4 mr-2" />
                {t.preview.download}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
