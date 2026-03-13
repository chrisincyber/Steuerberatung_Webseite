'use client'

import { useState } from 'react'
import { useI18n } from '@/lib/i18n/context'
import type { ChecklistSection as ChecklistSectionType, Document as PortalDocument } from '@/lib/types/portal'
import { DocumentCard } from './DocumentCard'
import { SectionUploadZone } from './SectionUploadZone'
import { ChevronDown, ChevronRight, CheckCircle2, RotateCcw } from 'lucide-react'

interface ChecklistSectionProps {
  section: ChecklistSectionType
  documents: PortalDocument[]
  taxYearId: string
  userId: string
  year: number
  onToggleDone: () => void
  onDocumentsChanged: () => void
}

export function ChecklistSection({
  section,
  documents,
  taxYearId,
  userId,
  year,
  onToggleDone,
  onDocumentsChanged,
}: ChecklistSectionProps) {
  const { t } = useI18n()
  const [expanded, setExpanded] = useState(!section.done)

  const groupLabel = t.docCategories.groups[section.groupKey as keyof typeof t.docCategories.groups] || section.groupKey
  const sectionDocs = documents.filter((d) => section.categories.includes(d.category))
  const docCount = sectionDocs.length

  if (section.done) {
    return (
      <div className="card border-l-4 border-l-trust-400 bg-trust-50/30 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-trust-500" />
            <div>
              <p className="font-medium text-navy-900">{groupLabel}</p>
              <p className="text-xs text-navy-500">
                {docCount} {t.checklist.documents}
              </p>
            </div>
          </div>
          <button
            onClick={onToggleDone}
            className="flex items-center gap-1.5 text-xs text-navy-500 hover:text-navy-700 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            {t.checklist.reopen}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="card overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-navy-50/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          {expanded ? (
            <ChevronDown className="w-5 h-5 text-navy-400" />
          ) : (
            <ChevronRight className="w-5 h-5 text-navy-400" />
          )}
          <div className="text-left">
            <p className="font-medium text-navy-900">{groupLabel}</p>
            <p className="text-xs text-navy-500">
              {docCount} {t.checklist.documents}
            </p>
          </div>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onToggleDone() }}
          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-trust-50 text-trust-700 hover:bg-trust-100 transition-colors"
        >
          {t.checklist.markDone}
        </button>
      </button>

      {/* Body */}
      {expanded && (
        <div className="border-t border-navy-100 p-4 space-y-4">
          {/* Sub-categories with their documents */}
          {section.categories.map((cat) => {
            const catLabel = t.docCategories.items[cat as keyof typeof t.docCategories.items] || cat
            const catDocs = sectionDocs.filter((d) => d.category === cat)

            return (
              <div key={cat}>
                <p className="text-sm font-medium text-navy-700 mb-2">{catLabel}</p>
                {catDocs.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-2">
                    {catDocs.map((doc) => (
                      <DocumentCard key={doc.id} doc={doc} onUpdate={onDocumentsChanged} />
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-navy-400 italic mb-2">{t.checklist.noDocsYet}</p>
                )}
              </div>
            )
          })}

          {/* Upload zone */}
          <div className="pt-2 border-t border-navy-50">
            <SectionUploadZone
              taxYearId={taxYearId}
              userId={userId}
              year={year}
              categories={section.categories}
              onUploaded={onDocumentsChanged}
            />
          </div>
        </div>
      )}
    </div>
  )
}
