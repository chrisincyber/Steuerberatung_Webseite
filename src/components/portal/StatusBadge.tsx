'use client'

import type { TaxYearStatus, DocumentStatus } from '@/lib/types/portal'
import { useI18n } from '@/lib/i18n/context'

const STATUS_COLORS: Record<TaxYearStatus, string> = {
  preis_berechnen: 'bg-navy-100 text-navy-700',
  dokumente_hochladen: 'bg-gold-100 text-gold-700',
  angebot_ausstehend: 'bg-purple-100 text-purple-700',
  angebot_gesendet: 'bg-blue-100 text-blue-700',
  in_bearbeitung: 'bg-blue-100 text-blue-700',
  warten_auf_pruefung: 'bg-gold-100 text-gold-700',
  erledigt: 'bg-trust-100 text-trust-700',
}

const DOC_STATUS_COLORS: Record<DocumentStatus, string> = {
  offen: 'bg-red-100 text-red-700',
  in_bearbeitung: 'bg-yellow-100 text-yellow-700',
  vollstaendig: 'bg-trust-100 text-trust-700',
}

const DOC_STATUS_DOTS: Record<DocumentStatus, string> = {
  offen: 'bg-red-500',
  in_bearbeitung: 'bg-yellow-500',
  vollstaendig: 'bg-trust-500',
}

export function StatusBadge({ status }: { status: TaxYearStatus }) {
  const { t } = useI18n()
  const label = t.dashboard.status[status] || status
  const color = STATUS_COLORS[status] || 'bg-navy-100 text-navy-700'

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${color}`}>
      {label}
    </span>
  )
}

export function DocStatusBadge({ status }: { status: DocumentStatus }) {
  const { t } = useI18n()
  const label = t.docStatus[status] || status
  const color = DOC_STATUS_COLORS[status] || 'bg-navy-100 text-navy-700'
  const dot = DOC_STATUS_DOTS[status] || 'bg-navy-500'

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${color}`}>
      <span className={`w-2 h-2 rounded-full ${dot}`} />
      {label}
    </span>
  )
}
