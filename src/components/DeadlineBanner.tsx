'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Clock, ArrowRight, X } from 'lucide-react'
import { useI18n } from '@/lib/i18n/context'

interface Deadline {
  activeFrom: { month: number; day: number }
  deadline: { month: number; day: number }
  labelKey: 'taxDeadline' | 'extensionRequest' | 'extendedDeadline' | 'finalSubmission'
}

const DEADLINES: Deadline[] = [
  { activeFrom: { month: 1, day: 1 }, deadline: { month: 3, day: 31 }, labelKey: 'taxDeadline' },
  { activeFrom: { month: 4, day: 1 }, deadline: { month: 4, day: 30 }, labelKey: 'extensionRequest' },
  { activeFrom: { month: 5, day: 1 }, deadline: { month: 6, day: 30 }, labelKey: 'extendedDeadline' },
  { activeFrom: { month: 7, day: 1 }, deadline: { month: 11, day: 30 }, labelKey: 'finalSubmission' },
]

const DISMISS_KEY = 'deadline-banner-dismissed'

function getNextDeadline(now: Date): { days: number; labelKey: Deadline['labelKey'] } | null {
  const month = now.getMonth() + 1
  if (month === 12) return null

  const entry = DEADLINES.find((d) => month >= d.activeFrom.month && month <= d.deadline.month)
  if (!entry) return null

  const deadlineDate = new Date(now.getFullYear(), entry.deadline.month - 1, entry.deadline.day)
  const diffMs = deadlineDate.getTime() - new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  const days = Math.round(diffMs / (1000 * 60 * 60 * 24))

  if (days < 0) return null
  return { days, labelKey: entry.labelKey }
}

function isDismissed(): boolean {
  try {
    const dismissed = localStorage.getItem(DISMISS_KEY)
    if (!dismissed) return false
    return Date.now() - Number(dismissed) < 24 * 60 * 60 * 1000
  } catch {
    return false
  }
}

export default function DeadlineBanner() {
  const { t } = useI18n()
  const [hidden, setHidden] = useState(true)

  useEffect(() => {
    setHidden(isDismissed())
  }, [])

  const result = getNextDeadline(new Date())
  if (!result || hidden) return null

  const { days, labelKey } = result
  const label = t.deadlineBanner.labels[labelKey]
  const text =
    days === 0
      ? t.deadlineBanner.lastDay
      : t.deadlineBanner.daysUntil
          .replace('{days}', String(days))
          .replace('{label}', label)

  return (
    <div className="relative w-full bg-navy-900 text-white text-center hover:bg-navy-800 transition-colors">
      <Link
        href="/pricing"
        className="flex items-center justify-center gap-2 h-9 px-10 text-sm font-medium"
      >
        <Clock className="w-3.5 h-3.5 shrink-0" />
        <span>{text}</span>
        <ArrowRight className="w-3.5 h-3.5 shrink-0" />
      </Link>
      <button
        onClick={(e) => {
          e.stopPropagation()
          try { localStorage.setItem(DISMISS_KEY, String(Date.now())) } catch {}
          setHidden(true)
        }}
        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-white/60 hover:text-white hover:bg-white/10 transition-colors"
        aria-label="Close"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}
