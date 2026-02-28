'use client'

import { useState, useCallback } from 'react'
import { useI18n } from '@/lib/i18n/context'
import { createClient } from '@/lib/supabase/client'
import { DOCUMENT_CATEGORY_GROUPS, ACCEPTED_EXTENSIONS, MAX_FILE_SIZE } from '@/lib/types/portal'
import type { DocumentCategory } from '@/lib/types/portal'
import { X, Upload, FileText, Loader2, CheckCircle } from 'lucide-react'

interface DocumentUploadModalProps {
  taxYearId: string
  userId: string
  year: number
  onClose: () => void
  onUploaded: () => void
}

interface PendingFile {
  file: File
  category: DocumentCategory
  uploading: boolean
  done: boolean
  error: boolean
}

export function DocumentUploadModal({ taxYearId, userId, year, onClose, onUploaded }: DocumentUploadModalProps) {
  const { t } = useI18n()
  const [files, setFiles] = useState<PendingFile[]>([])
  const [dragActive, setDragActive] = useState(false)
  const [uploading, setUploading] = useState(false)

  const addFiles = useCallback((newFiles: FileList | File[]) => {
    const filtered = Array.from(newFiles).filter((f) => f.size <= MAX_FILE_SIZE)
    const pending: PendingFile[] = filtered.map((file) => ({
      file,
      category: 'sonstige' as DocumentCategory,
      uploading: false,
      done: false,
      error: false,
    }))
    setFiles((prev) => [...prev, ...pending])
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
    addFiles(e.dataTransfer.files)
  }, [addFiles])

  const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) addFiles(e.target.files)
  }

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const updateCategory = (index: number, category: DocumentCategory) => {
    setFiles((prev) => prev.map((f, i) => (i === index ? { ...f, category } : f)))
  }

  const handleUpload = async () => {
    if (files.length === 0) return
    setUploading(true)

    const supabase = createClient()
    if (!supabase) { setUploading(false); return }

    for (let i = 0; i < files.length; i++) {
      const pf = files[i]
      if (pf.done) continue

      setFiles((prev) => prev.map((f, idx) => (idx === i ? { ...f, uploading: true } : f)))

      const storagePath = `${userId}/${year}/${Date.now()}-${pf.file.name}`

      const { error: uploadError } = await supabase.storage
        .from('portal-documents')
        .upload(storagePath, pf.file, { contentType: pf.file.type, upsert: false })

      if (uploadError) {
        setFiles((prev) => prev.map((f, idx) => (idx === i ? { ...f, uploading: false, error: true } : f)))
        continue
      }

      const { error: dbError } = await supabase.from('portal_documents').insert({
        user_id: userId,
        tax_year_id: taxYearId,
        file_name: pf.file.name,
        original_name: pf.file.name,
        file_size: pf.file.size,
        file_type: pf.file.type,
        storage_path: storagePath,
        category: pf.category,
        status: 'offen',
      })

      if (dbError) {
        setFiles((prev) => prev.map((f, idx) => (idx === i ? { ...f, uploading: false, error: true } : f)))
        continue
      }

      setFiles((prev) => prev.map((f, idx) => (idx === i ? { ...f, uploading: false, done: true } : f)))
    }

    setUploading(false)
    onUploaded()
  }

  const allDone = files.length > 0 && files.every((f) => f.done)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-900/50" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-navy-100">
          <h2 className="font-heading text-lg font-bold text-navy-900">{t.uploadModal.title}</h2>
          <button onClick={onClose} className="text-navy-400 hover:text-navy-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Dropzone */}
          <div
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setDragActive(true) }}
            onDragLeave={() => setDragActive(false)}
            className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${
              dragActive ? 'border-navy-500 bg-navy-50' : 'border-navy-200 hover:border-navy-400'
            }`}
            onClick={() => document.getElementById('upload-input')?.click()}
          >
            <input
              id="upload-input"
              type="file"
              multiple
              accept={ACCEPTED_EXTENSIONS}
              onChange={handleSelect}
              className="hidden"
            />
            <Upload className="w-8 h-8 text-navy-400 mx-auto mb-2" />
            <p className="text-navy-700 font-medium text-sm">{t.uploadModal.dropzone}</p>
            <p className="text-navy-400 text-xs mt-1">{t.dashboard.documents.formats}</p>
          </div>

          {/* File list */}
          {files.length > 0 && (
            <div className="space-y-3">
              {files.map((pf, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-navy-50 rounded-xl">
                  <div className="shrink-0">
                    {pf.done ? (
                      <CheckCircle className="w-5 h-5 text-trust-500" />
                    ) : pf.uploading ? (
                      <Loader2 className="w-5 h-5 text-navy-500 animate-spin" />
                    ) : pf.error ? (
                      <X className="w-5 h-5 text-red-500" />
                    ) : (
                      <FileText className="w-5 h-5 text-navy-500" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-navy-900 truncate">{pf.file.name}</p>
                    {!pf.done && !pf.uploading && (
                      <select
                        value={pf.category}
                        onChange={(e) => updateCategory(i, e.target.value as DocumentCategory)}
                        className="mt-1 w-full text-xs px-2 py-1 rounded-lg border border-navy-200 text-navy-700 bg-white"
                      >
                        {DOCUMENT_CATEGORY_GROUPS.map((group) => (
                          <optgroup key={group.groupKey} label={t.docCategories.groups[group.groupKey as keyof typeof t.docCategories.groups]}>
                            {group.categories.map((cat) => (
                              <option key={cat} value={cat}>
                                {t.docCategories.items[cat as keyof typeof t.docCategories.items]}
                              </option>
                            ))}
                          </optgroup>
                        ))}
                      </select>
                    )}
                  </div>

                  {!pf.done && !pf.uploading && (
                    <button onClick={() => removeFile(i)} className="text-navy-400 hover:text-red-500 shrink-0">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Upload button */}
          {files.length > 0 && !allDone && (
            <button
              onClick={handleUpload}
              disabled={uploading || files.length === 0}
              className="btn-primary w-full !py-3 disabled:opacity-50"
            >
              {uploading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {t.uploadModal.uploading}
                </span>
              ) : (
                t.uploadModal.uploadButton
              )}
            </button>
          )}

          {allDone && (
            <button onClick={onClose} className="btn-primary w-full !py-3">
              {t.common.close}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
