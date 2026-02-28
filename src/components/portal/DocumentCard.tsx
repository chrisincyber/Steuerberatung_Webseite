'use client'

import { useState } from 'react'
import { useI18n } from '@/lib/i18n/context'
import { createClient } from '@/lib/supabase/client'
import type { Document as PortalDocument, DocumentStatus, DocumentCategory } from '@/lib/types/portal'
import { DocStatusBadge } from './StatusBadge'
import { FileText, Image, Trash2, Pencil, Check, X } from 'lucide-react'

interface DocumentCardProps {
  doc: PortalDocument
  onUpdate: () => void
  isAdmin?: boolean
}

export function DocumentCard({ doc, onUpdate, isAdmin }: DocumentCardProps) {
  const { t } = useI18n()
  const [editingName, setEditingName] = useState(false)
  const [editingRemarks, setEditingRemarks] = useState(false)
  const [fileName, setFileName] = useState(doc.file_name)
  const [remarks, setRemarks] = useState(doc.remarks || '')
  const [confirmDelete, setConfirmDelete] = useState(false)

  const isImage = doc.file_type.startsWith('image/')

  const handleSaveName = async () => {
    const supabase = createClient()
    if (!supabase) return
    await supabase.from('portal_documents').update({ file_name: fileName }).eq('id', doc.id)
    setEditingName(false)
    onUpdate()
  }

  const handleSaveRemarks = async () => {
    const supabase = createClient()
    if (!supabase) return
    await supabase.from('portal_documents').update({ remarks }).eq('id', doc.id)
    setEditingRemarks(false)
    onUpdate()
  }

  const handleDelete = async () => {
    const supabase = createClient()
    if (!supabase) return
    await supabase.storage.from('portal-documents').remove([doc.storage_path])
    await supabase.from('portal_documents').delete().eq('id', doc.id)
    setConfirmDelete(false)
    onUpdate()
  }

  const handleStatusChange = async (newStatus: DocumentStatus) => {
    const supabase = createClient()
    if (!supabase) return
    await supabase.from('portal_documents').update({ status: newStatus }).eq('id', doc.id)
    onUpdate()
  }

  const categoryLabel = t.docCategories.items[doc.category as keyof typeof t.docCategories.items] || doc.category

  return (
    <div className="card p-4 space-y-3">
      {/* Thumbnail / icon */}
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-xl bg-navy-50 flex items-center justify-center shrink-0">
          {isImage ? (
            <Image className="w-6 h-6 text-navy-500" />
          ) : (
            <FileText className="w-6 h-6 text-navy-500" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          {/* File name */}
          {editingName ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                className="flex-1 px-2 py-1 rounded-lg border border-navy-200 text-sm text-navy-900 focus:border-navy-500 outline-none"
                autoFocus
              />
              <button onClick={handleSaveName} className="text-trust-500 hover:text-trust-600">
                <Check className="w-4 h-4" />
              </button>
              <button onClick={() => { setEditingName(false); setFileName(doc.file_name) }} className="text-navy-400 hover:text-navy-600">
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-navy-900 truncate">{doc.file_name}</p>
              <button onClick={() => setEditingName(true)} className="text-navy-400 hover:text-navy-600 shrink-0">
                <Pencil className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Category */}
          <p className="text-xs text-navy-500 mt-0.5">{categoryLabel}</p>
        </div>

        {/* Status badge + admin status change */}
        <div className="shrink-0">
          {isAdmin ? (
            <select
              value={doc.status}
              onChange={(e) => handleStatusChange(e.target.value as DocumentStatus)}
              className="text-xs px-2 py-1 rounded-lg border border-navy-200 text-navy-700 bg-white"
            >
              <option value="offen">{t.docStatus.offen}</option>
              <option value="in_bearbeitung">{t.docStatus.in_bearbeitung}</option>
              <option value="vollstaendig">{t.docStatus.vollstaendig}</option>
            </select>
          ) : (
            <DocStatusBadge status={doc.status} />
          )}
        </div>
      </div>

      {/* Remarks */}
      {editingRemarks ? (
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder={t.dashboard.documents.remarksPlaceholder}
            className="flex-1 px-2 py-1 rounded-lg border border-navy-200 text-sm text-navy-700 focus:border-navy-500 outline-none"
            autoFocus
          />
          <button onClick={handleSaveRemarks} className="text-trust-500 hover:text-trust-600">
            <Check className="w-4 h-4" />
          </button>
          <button onClick={() => { setEditingRemarks(false); setRemarks(doc.remarks || '') }} className="text-navy-400 hover:text-navy-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <p className="text-xs text-navy-500 italic flex-1 truncate">
            {doc.remarks || t.dashboard.documents.remarksPlaceholder}
          </p>
          <button onClick={() => setEditingRemarks(true)} className="text-navy-400 hover:text-navy-600 shrink-0">
            <Pencil className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Delete */}
      <div className="flex justify-end">
        {confirmDelete ? (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-red-600">{t.dashboard.documents.deleteConfirm}</span>
            <button onClick={handleDelete} className="text-red-600 font-medium hover:text-red-700">{t.common.yes}</button>
            <button onClick={() => setConfirmDelete(false)} className="text-navy-500 font-medium hover:text-navy-700">{t.common.no}</button>
          </div>
        ) : (
          <button onClick={() => setConfirmDelete(true)} className="text-navy-400 hover:text-red-500 transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  )
}
