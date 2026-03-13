'use client'

import { useState, useEffect } from 'react'
import { useI18n } from '@/lib/i18n/context'
import { createClient } from '@/lib/supabase/client'
import { DOCUMENT_CATEGORY_GROUPS } from '@/lib/types/portal'
import type { ChecklistSection, ChecklistVorlage, Document as PortalDocument } from '@/lib/types/portal'
import { Loader2, BookTemplate, Check } from 'lucide-react'

interface ChecklistWizardProps {
  taxYearId: string
  userId: string
  existingDocs: PortalDocument[]
  onCreated: () => void
}

export function ChecklistWizard({ taxYearId, userId, existingDocs, onCreated }: ChecklistWizardProps) {
  const { t } = useI18n()
  const [selectedGroups, setSelectedGroups] = useState<Set<string>>(new Set())
  const [categoryOverrides, setCategoryOverrides] = useState<Record<string, Set<string>>>({})
  const [vorlagen, setVorlagen] = useState<ChecklistVorlage[]>([])
  const [saveAsVorlage, setSaveAsVorlage] = useState(false)
  const [vorlageName, setVorlageName] = useState('Meine Vorlage')
  const [creating, setCreating] = useState(false)
  const [showVorlagen, setShowVorlagen] = useState(false)

  // Auto-suggest groups based on existing documents
  useEffect(() => {
    if (existingDocs.length === 0) return
    const docCategories = new Set(existingDocs.map((d) => d.category))
    const autoSelected = new Set<string>()

    for (const group of DOCUMENT_CATEGORY_GROUPS) {
      if (group.categories.some((cat) => docCategories.has(cat))) {
        autoSelected.add(group.groupKey)
      }
    }
    if (autoSelected.size > 0) {
      setSelectedGroups(autoSelected)
    }
  }, [existingDocs])

  // Fetch user's Vorlagen
  useEffect(() => {
    const fetchVorlagen = async () => {
      const supabase = createClient()
      if (!supabase) return
      const { data } = await supabase
        .from('checklist_vorlagen')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
      if (data) setVorlagen(data as ChecklistVorlage[])
    }
    fetchVorlagen()
  }, [userId])

  const toggleGroup = (groupKey: string) => {
    setSelectedGroups((prev) => {
      const next = new Set(prev)
      if (next.has(groupKey)) {
        next.delete(groupKey)
      } else {
        next.add(groupKey)
      }
      return next
    })
  }

  const toggleCategory = (groupKey: string, category: string) => {
    setCategoryOverrides((prev) => {
      const group = DOCUMENT_CATEGORY_GROUPS.find((g) => g.groupKey === groupKey)
      if (!group) return prev

      const current = prev[groupKey] ?? new Set(group.categories)
      const next = new Set(current)
      if (next.has(category)) {
        next.delete(category)
      } else {
        next.add(category)
      }
      return { ...prev, [groupKey]: next }
    })
  }

  const getActiveCategoriesForGroup = (groupKey: string): string[] => {
    const group = DOCUMENT_CATEGORY_GROUPS.find((g) => g.groupKey === groupKey)
    if (!group) return []
    if (categoryOverrides[groupKey]) {
      return group.categories.filter((c) => categoryOverrides[groupKey].has(c))
    }
    return [...group.categories]
  }

  const loadVorlage = (vorlage: ChecklistVorlage) => {
    const groups = new Set<string>()
    const overrides: Record<string, Set<string>> = {}
    for (const section of vorlage.sections) {
      groups.add(section.groupKey)
      overrides[section.groupKey] = new Set(section.categories)
    }
    setSelectedGroups(groups)
    setCategoryOverrides(overrides)
    setShowVorlagen(false)
  }

  const handleCreate = async () => {
    if (selectedGroups.size === 0) return
    setCreating(true)

    const supabase = createClient()
    if (!supabase) { setCreating(false); return }

    const sections: ChecklistSection[] = Array.from(selectedGroups)
      .map((groupKey) => ({
        groupKey,
        categories: getActiveCategoriesForGroup(groupKey),
        done: false,
      }))
      .filter((s) => s.categories.length > 0)

    // Sort sections by DOCUMENT_CATEGORY_GROUPS order
    const groupOrder = DOCUMENT_CATEGORY_GROUPS.map((g) => g.groupKey as string)
    sections.sort((a, b) => groupOrder.indexOf(a.groupKey) - groupOrder.indexOf(b.groupKey))

    const { error } = await supabase.from('checklists').insert({
      tax_year_id: taxYearId,
      user_id: userId,
      sections,
    })

    if (error) {
      setCreating(false)
      return
    }

    // Save as Vorlage if requested
    if (saveAsVorlage) {
      await supabase.from('checklist_vorlagen').insert({
        user_id: userId,
        name: vorlageName.trim() || 'Meine Vorlage',
        sections: sections.map(({ groupKey, categories }) => ({ groupKey, categories })),
      })
    }

    setCreating(false)
    onCreated()
  }

  // Filter out 'sonstiges' group as it's always shown as catch-all
  const selectableGroups = DOCUMENT_CATEGORY_GROUPS.filter((g) => g.groupKey !== 'sonstiges')

  return (
    <div className="card p-6 space-y-6">
      <div>
        <h2 className="font-heading text-lg font-bold text-navy-900">{t.checklist.wizardTitle}</h2>
        <p className="text-sm text-navy-500 mt-1">{t.checklist.wizardSubtitle}</p>
      </div>

      {/* Vorlage loader */}
      {vorlagen.length > 0 && (
        <div>
          <button
            onClick={() => setShowVorlagen(!showVorlagen)}
            className="flex items-center gap-2 text-sm text-navy-600 hover:text-navy-800 transition-colors"
          >
            <BookTemplate className="w-4 h-4" />
            {t.checklist.loadVorlage}
          </button>
          {showVorlagen && (
            <div className="mt-2 space-y-2">
              {vorlagen.map((v) => (
                <button
                  key={v.id}
                  onClick={() => loadVorlage(v)}
                  className="w-full text-left px-3 py-2 rounded-lg bg-navy-50 hover:bg-navy-100 text-sm text-navy-700 transition-colors"
                >
                  {v.name}
                  <span className="text-navy-400 ml-2">({v.sections.length} {t.checklist.sections})</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Step 1: Select groups */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {selectableGroups.map((group) => {
          const isSelected = selectedGroups.has(group.groupKey)
          const label = t.docCategories.groups[group.groupKey as keyof typeof t.docCategories.groups] || group.groupKey

          return (
            <button
              key={group.groupKey}
              onClick={() => toggleGroup(group.groupKey)}
              className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left ${
                isSelected
                  ? 'border-navy-800 bg-navy-50'
                  : 'border-navy-100 hover:border-navy-300 bg-white'
              }`}
            >
              <div className={`w-5 h-5 rounded flex items-center justify-center shrink-0 ${
                isSelected ? 'bg-navy-800' : 'border-2 border-navy-300'
              }`}>
                {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
              </div>
              <div>
                <p className="font-medium text-navy-900">{label}</p>
                <p className="text-xs text-navy-500">
                  {group.categories.length} {t.checklist.subcategories}
                </p>
              </div>
            </button>
          )
        })}
      </div>

      {/* Step 2: Customize categories (appears when groups selected) */}
      {selectedGroups.size > 0 && (
        <div className="space-y-4 border-t border-navy-100 pt-4">
          <p className="text-sm font-medium text-navy-700">{t.checklist.customizeTitle}</p>

          {selectableGroups
            .filter((g) => selectedGroups.has(g.groupKey))
            .map((group) => {
              const groupLabel = t.docCategories.groups[group.groupKey as keyof typeof t.docCategories.groups] || group.groupKey
              const activeCategories = categoryOverrides[group.groupKey] ?? new Set(group.categories)

              return (
                <div key={group.groupKey} className="space-y-2">
                  <p className="text-sm font-medium text-navy-800">{groupLabel}</p>
                  <div className="flex flex-wrap gap-2">
                    {group.categories.map((cat) => {
                      const isActive = activeCategories.has(cat)
                      const catLabel = t.docCategories.items[cat as keyof typeof t.docCategories.items] || cat

                      return (
                        <button
                          key={cat}
                          onClick={() => toggleCategory(group.groupKey, cat)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                            isActive
                              ? 'bg-navy-800 text-white'
                              : 'bg-navy-50 text-navy-500 hover:bg-navy-100'
                          }`}
                        >
                          {isActive && <Check className="w-3 h-3" />}
                          {catLabel}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )
            })}

          {/* Save as Vorlage */}
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={() => setSaveAsVorlage(!saveAsVorlage)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                saveAsVorlage
                  ? 'bg-gold-100 text-gold-700'
                  : 'bg-navy-50 text-navy-600 hover:bg-navy-100'
              }`}
            >
              <BookTemplate className="w-3.5 h-3.5" />
              {t.checklist.saveAsVorlage}
            </button>
            {saveAsVorlage && (
              <input
                type="text"
                value={vorlageName}
                onChange={(e) => setVorlageName(e.target.value)}
                placeholder="Meine Vorlage"
                className="flex-1 px-3 py-1.5 rounded-lg border border-navy-200 text-sm text-navy-900 focus:border-navy-500 outline-none"
              />
            )}
          </div>

          {/* Create button */}
          <button
            onClick={handleCreate}
            disabled={creating || selectedGroups.size === 0}
            className="btn-primary w-full !py-3 disabled:opacity-50"
          >
            {creating ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                {t.common.loading}
              </span>
            ) : (
              t.checklist.createChecklist
            )}
          </button>
        </div>
      )}

      {/* Existing docs notice */}
      {existingDocs.length > 0 && (
        <p className="text-xs text-navy-500 text-center">
          {t.checklist.existingDocsNotice.replace('{count}', String(existingDocs.length))}
        </p>
      )}
    </div>
  )
}
