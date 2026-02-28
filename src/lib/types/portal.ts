// ============ STATUS & TIER TYPES ============

export type TaxYearStatus =
  | 'preis_berechnen'
  | 'dokumente_hochladen'
  | 'angebot_ausstehend'
  | 'angebot_gesendet'
  | 'in_bearbeitung'
  | 'warten_auf_pruefung'
  | 'erledigt'

export type TaxYearTier = 1 | 2 | 3

export type DocumentStatus = 'offen' | 'in_bearbeitung' | 'vollstaendig'

export type Zivilstand = 'einzelperson' | 'verheiratet'

export type Religion =
  | 'evangelisch_reformiert'
  | 'roemisch_katholisch'
  | 'christkatholisch'
  | 'keine_andere'

export type JobStatus =
  | 'angestellt'
  | 'selbstaendig'
  | 'rentner'
  | 'nicht_erwerbstaetig'
  | 'andere'

// ============ DOCUMENT CATEGORIES ============

export const DOCUMENT_CATEGORIES = {
  // Einkommen
  lohnausweis: 'lohnausweis',
  rentenbescheinigung: 'rentenbescheinigung',
  arbeitslosenentschaedigung: 'arbeitslosenentschaedigung',
  quellensteuerausweis: 'quellensteuerausweis',
  // Selbstständigkeit
  jahresrechnung: 'jahresrechnung',
  mwst_abrechnung: 'mwst_abrechnung',
  // Wertschriften & Vermögen
  wertschriftenverzeichnis: 'wertschriftenverzeichnis',
  bankkontoauszuege: 'bankkontoauszuege',
  schuldzinsbescheinigung: 'schuldzinsbescheinigung',
  // Liegenschaften
  hypothekarzinsausweis: 'hypothekarzinsausweis',
  mieteinnahmen: 'mieteinnahmen',
  unterhaltskosten_liegenschaft: 'unterhaltskosten_liegenschaft',
  // Abzüge
  krankheitskosten: 'krankheitskosten',
  behinderungskosten: 'behinderungskosten',
  spenden: 'spenden',
  saeule_3a: 'saeule_3a',
  einkauf_pensionskasse: 'einkauf_pensionskasse',
  berufskosten: 'berufskosten',
  kinderdrittbetreuung: 'kinderdrittbetreuung',
  alimente: 'alimente',
  // Sonstiges
  sonstige: 'sonstige',
} as const

export type DocumentCategory = (typeof DOCUMENT_CATEGORIES)[keyof typeof DOCUMENT_CATEGORIES]

// Grouped for the upload modal dropdown
export const DOCUMENT_CATEGORY_GROUPS = [
  {
    groupKey: 'einkommen',
    categories: ['lohnausweis', 'rentenbescheinigung', 'arbeitslosenentschaedigung', 'quellensteuerausweis'],
  },
  {
    groupKey: 'selbstaendigkeit',
    categories: ['jahresrechnung', 'mwst_abrechnung'],
  },
  {
    groupKey: 'wertschriften_vermoegen',
    categories: ['wertschriftenverzeichnis', 'bankkontoauszuege', 'schuldzinsbescheinigung'],
  },
  {
    groupKey: 'liegenschaften',
    categories: ['hypothekarzinsausweis', 'mieteinnahmen', 'unterhaltskosten_liegenschaft'],
  },
  {
    groupKey: 'abzuege',
    categories: [
      'krankheitskosten', 'behinderungskosten', 'spenden', 'saeule_3a',
      'einkauf_pensionskasse', 'berufskosten', 'kinderdrittbetreuung', 'alimente',
    ],
  },
  {
    groupKey: 'sonstiges',
    categories: ['sonstige'],
  },
] as const

// ============ DATA MODELS ============

export interface PersonData {
  dob: string
  religion: Religion | ''
  job_status: JobStatus | ''
  company: string
  job_title: string
}

export interface Profile {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string | null
  role: 'client' | 'admin'
  address_street: string | null
  address_zip: string | null
  address_city: string | null
  address_canton: string | null
  created_at: string
}

export interface TaxYear {
  id: string
  user_id: string
  year: number
  status: TaxYearStatus
  tier: TaxYearTier | null
  price: number | null
  offer_amount: number | null
  offer_message: string | null
  canton: string | null
  zivilstand: Zivilstand | null
  basisdaten_confirmed: boolean
  address_per_31dec_street: string | null
  address_per_31dec_zip: string | null
  address_per_31dec_city: string | null
  address_is_same_as_on_file: boolean
  p1_dob: string | null
  p1_religion: string | null
  p1_job_status: string | null
  p1_company: string | null
  p1_job_title: string | null
  p2_dob: string | null
  p2_religion: string | null
  p2_job_status: string | null
  p2_company: string | null
  p2_job_title: string | null
  admin_notes: string | null
  created_at: string
  updated_at: string
}

export interface Document {
  id: string
  user_id: string
  tax_year_id: string
  file_name: string
  original_name: string
  file_size: number
  file_type: string
  storage_path: string
  category: DocumentCategory
  remarks: string | null
  status: DocumentStatus
  uploaded_at: string
}

// ============ STATUS HELPERS ============

export const STATUS_ORDER: TaxYearStatus[] = [
  'preis_berechnen',
  'dokumente_hochladen',
  'angebot_ausstehend',
  'angebot_gesendet',
  'in_bearbeitung',
  'warten_auf_pruefung',
  'erledigt',
]

// Pipeline steps (simplified 4-step view for the stepper)
export const PIPELINE_STEPS = [
  { status: 'dokumente_hochladen' as const, responsible: 'client' as const },
  { status: 'in_bearbeitung' as const, responsible: 'admin' as const },
  { status: 'warten_auf_pruefung' as const, responsible: 'client' as const },
  { status: 'erledigt' as const, responsible: 'admin' as const },
]

export function getPipelineIndex(status: TaxYearStatus): number {
  switch (status) {
    case 'preis_berechnen':
    case 'dokumente_hochladen':
    case 'angebot_ausstehend':
    case 'angebot_gesendet':
      return 0
    case 'in_bearbeitung':
      return 1
    case 'warten_auf_pruefung':
      return 2
    case 'erledigt':
      return 3
    default:
      return 0
  }
}

export function isClientTurn(status: TaxYearStatus): boolean {
  return ['preis_berechnen', 'dokumente_hochladen', 'angebot_gesendet', 'warten_auf_pruefung'].includes(status)
}

// Accepted file types for upload
export const ACCEPTED_FILE_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // DOCX
  'application/msword', // DOC
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // XLSX
  'application/vnd.ms-excel', // XLS
]

export const ACCEPTED_EXTENSIONS = '.pdf,.jpg,.jpeg,.png,.webp,.doc,.docx,.xls,.xlsx'
export const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB
