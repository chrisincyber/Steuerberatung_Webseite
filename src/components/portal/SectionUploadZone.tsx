'use client'

import { useState, useCallback } from 'react'
import { useI18n } from '@/lib/i18n/context'
import { createClient } from '@/lib/supabase/client'
import { ACCEPTED_EXTENSIONS, MAX_FILE_SIZE } from '@/lib/types/portal'
import type { DocumentCategory } from '@/lib/types/portal'
import { Upload, Loader2, CheckCircle, X, FileText } from 'lucide-react'

interface SectionUploadZoneProps {
  taxYearId: string
  userId: string
  year: number
  categories: string[]
  onUploaded: () => void
}

interface PendingFile {
  file: File
  category: DocumentCategory
  uploading: boolean
  done: boolean
  error: boolean
}

export function SectionUploadZone({ taxYearId, userId, year, categories, onUploaded }: SectionUploadZoneProps) {
  const { t } = useI18n()
  const [files, setFiles] = useState<PendingFile[]>([])
  const [dragActive, setDragActive] = useState(false)
  const [uploading, setUploading] = useState(false)

  const defaultCategory = (categories.length === 1 ? categories[0] : 'sonstige') as DocumentCategory

  const addFiles = useCallback((newFiles: FileList | File[]) => {
    const filtered = Array.from(newFiles).filter((f) => f.size <= MAX_FILE_SIZE)
    const pending: PendingFile[] = filtered.map((file) => ({
      file,
      category: defaultCategory,
      uploading: false,
      done: false,
      error: false,
    }))
    setFiles((prev) => [...prev, ...pending])
  }, [defaultCategory])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
    addFiles(e.dataTransfer.files)
  }, [addFiles])

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
    setFiles((prev) => prev.filter((f) => !f.done))
    onUploaded()
  }

  const inputId = `section-upload-${categories.join('-')}`

  return (
    <div className="space-y-3">
      {/* Dropzone */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setDragActive(true) }}
        onDragLeave={() => setDragActive(false)}
        onClick={() => document.getElementById(inputId)?.click()}
        className={`border-2 border-dashed rounded-xl p-4 text-center transition-all cursor-pointer ${
          dragActive ? 'border-navy-500 bg-navy-50' : 'border-navy-200 hover:border-navy-400'
        }`}
      >
        <input
          id={inputId}
          type="file"
          multiple
          accept={ACCEPTED_EXTENSIONS}
          onChange={(e) => { if (e.target.files) addFiles(e.target.files) }}
          className="hidden"
        />
        <Upload className="w-5 h-5 text-navy-400 mx-auto mb-1" />
        <p className="text-navy-600 text-sm">{t.uploadModal.dropzone}</p>
      </div>

      {/* Pending files */}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((pf, i) => (
            <div key={i} className="flex items-center gap-2 p-2 bg-navy-50 rounded-lg">
              <div className="shrink-0">
                {pf.done ? (
                  <CheckCircle className="w-4 h-4 text-trust-500" />
                ) : pf.uploading ? (
                  <Loader2 className="w-4 h-4 text-navy-500 animate-spin" />
                ) : pf.error ? (
                  <X className="w-4 h-4 text-red-500" />
                ) : (
                  <FileText className="w-4 h-4 text-navy-500" />
                )}
              </div>
              <p className="text-xs font-medium text-navy-900 truncate flex-1">{pf.file.name}</p>

              {/* Category picker (only when multiple categories and not yet uploaded) */}
              {!pf.done && !pf.uploading && categories.length > 1 && (
                <select
                  value={pf.category}
                  onChange={(e) => updateCategory(i, e.target.value as DocumentCategory)}
                  className="text-xs px-1.5 py-0.5 rounded border border-navy-200 text-navy-700 bg-white"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {t.docCategories.items[cat as keyof typeof t.docCategories.items] || cat}
                    </option>
                  ))}
                </select>
              )}

              {!pf.done && !pf.uploading && (
                <button onClick={() => removeFile(i)} className="text-navy-400 hover:text-red-500 shrink-0">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}

          <button
            onClick={handleUpload}
            disabled={uploading}
            className="btn-primary w-full !py-2 text-sm disabled:opacity-50"
          >
            {uploading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                {t.uploadModal.uploading}
              </span>
            ) : (
              t.uploadModal.uploadButton
            )}
          </button>
        </div>
      )}
    </div>
  )
}
