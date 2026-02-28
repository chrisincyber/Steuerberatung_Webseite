export const cantons = [
  { code: 'AG', name: { de: 'Aargau', en: 'Aargau' }, taxMultiplier: 1.09 },
  { code: 'AI', name: { de: 'Appenzell Innerrhoden', en: 'Appenzell Innerrhoden' }, taxMultiplier: 0.82 },
  { code: 'AR', name: { de: 'Appenzell Ausserrhoden', en: 'Appenzell Ausserrhoden' }, taxMultiplier: 0.98 },
  { code: 'BE', name: { de: 'Bern', en: 'Bern' }, taxMultiplier: 1.12 },
  { code: 'BL', name: { de: 'Basel-Landschaft', en: 'Basel-Landschaft' }, taxMultiplier: 1.05 },
  { code: 'BS', name: { de: 'Basel-Stadt', en: 'Basel-Stadt' }, taxMultiplier: 1.08 },
  { code: 'FR', name: { de: 'Freiburg', en: 'Fribourg' }, taxMultiplier: 1.10 },
  { code: 'GE', name: { de: 'Genf', en: 'Geneva' }, taxMultiplier: 1.15 },
  { code: 'GL', name: { de: 'Glarus', en: 'Glarus' }, taxMultiplier: 0.95 },
  { code: 'GR', name: { de: 'Graubünden', en: 'Graubünden' }, taxMultiplier: 0.96 },
  { code: 'JU', name: { de: 'Jura', en: 'Jura' }, taxMultiplier: 1.14 },
  { code: 'LU', name: { de: 'Luzern', en: 'Lucerne' }, taxMultiplier: 0.96 },
  { code: 'NE', name: { de: 'Neuenburg', en: 'Neuchâtel' }, taxMultiplier: 1.12 },
  { code: 'NW', name: { de: 'Nidwalden', en: 'Nidwalden' }, taxMultiplier: 0.76 },
  { code: 'OW', name: { de: 'Obwalden', en: 'Obwalden' }, taxMultiplier: 0.78 },
  { code: 'SG', name: { de: 'St. Gallen', en: 'St. Gallen' }, taxMultiplier: 1.04 },
  { code: 'SH', name: { de: 'Schaffhausen', en: 'Schaffhausen' }, taxMultiplier: 0.98 },
  { code: 'SO', name: { de: 'Solothurn', en: 'Solothurn' }, taxMultiplier: 1.06 },
  { code: 'SZ', name: { de: 'Schwyz', en: 'Schwyz' }, taxMultiplier: 0.72 },
  { code: 'TG', name: { de: 'Thurgau', en: 'Thurgau' }, taxMultiplier: 0.97 },
  { code: 'TI', name: { de: 'Tessin', en: 'Ticino' }, taxMultiplier: 1.02 },
  { code: 'UR', name: { de: 'Uri', en: 'Uri' }, taxMultiplier: 0.85 },
  { code: 'VD', name: { de: 'Waadt', en: 'Vaud' }, taxMultiplier: 1.14 },
  { code: 'VS', name: { de: 'Wallis', en: 'Valais' }, taxMultiplier: 1.00 },
  { code: 'ZG', name: { de: 'Zug', en: 'Zug' }, taxMultiplier: 0.68 },
  { code: 'ZH', name: { de: 'Zürich', en: 'Zurich' }, taxMultiplier: 1.00 },
] as const

export const cantonDeadlines = [
  { code: 'AG', deadline: '31. März', extension: '30. November' },
  { code: 'AI', deadline: '30. April', extension: '31. Dezember' },
  { code: 'AR', deadline: '30. April', extension: '31. Dezember' },
  { code: 'BE', deadline: '15. März', extension: '15. September' },
  { code: 'BL', deadline: '31. März', extension: '30. September' },
  { code: 'BS', deadline: '31. März', extension: '30. September' },
  { code: 'FR', deadline: '31. März', extension: '30. September' },
  { code: 'GE', deadline: '31. März', extension: '31. Dezember' },
  { code: 'GL', deadline: '31. März', extension: '30. September' },
  { code: 'GR', deadline: '31. März', extension: '30. September' },
  { code: 'JU', deadline: '31. März', extension: '30. November' },
  { code: 'LU', deadline: '31. März', extension: '30. September' },
  { code: 'NE', deadline: '31. März', extension: '30. September' },
  { code: 'NW', deadline: '31. März', extension: '30. November' },
  { code: 'OW', deadline: '31. März', extension: '30. September' },
  { code: 'SG', deadline: '30. April', extension: '30. September' },
  { code: 'SH', deadline: '31. März', extension: '30. September' },
  { code: 'SO', deadline: '31. März', extension: '30. November' },
  { code: 'SZ', deadline: '31. März', extension: '30. September' },
  { code: 'TG', deadline: '31. März', extension: '30. November' },
  { code: 'TI', deadline: '30. April', extension: '31. Dezember' },
  { code: 'UR', deadline: '31. März', extension: '30. September' },
  { code: 'VD', deadline: '15. März', extension: '30. Juni' },
  { code: 'VS', deadline: '31. März', extension: '30. November' },
  { code: 'ZG', deadline: '30. April', extension: '31. Oktober' },
  { code: 'ZH', deadline: '31. März', extension: '30. September' },
] as const

export const cantonSlugs: Record<string, string> = {
  AG: 'aargau',
  AI: 'appenzell-innerrhoden',
  AR: 'appenzell-ausserrhoden',
  BE: 'bern',
  BL: 'basel-landschaft',
  BS: 'basel-stadt',
  FR: 'freiburg',
  GE: 'genf',
  GL: 'glarus',
  GR: 'graubuenden',
  JU: 'jura',
  LU: 'luzern',
  NE: 'neuenburg',
  NW: 'nidwalden',
  OW: 'obwalden',
  SG: 'st-gallen',
  SH: 'schaffhausen',
  SO: 'solothurn',
  SZ: 'schwyz',
  TG: 'thurgau',
  TI: 'tessin',
  UR: 'uri',
  VD: 'waadt',
  VS: 'wallis',
  ZG: 'zug',
  ZH: 'zuerich',
}

export function getCantonBySlug(slug: string) {
  const code = Object.entries(cantonSlugs).find(([, s]) => s === slug)?.[0]
  if (!code) return null
  const canton = cantons.find(c => c.code === code)
  const deadline = cantonDeadlines.find(d => d.code === code)
  if (!canton || !deadline) return null
  return { ...canton, ...deadline, slug }
}

export function calculateSwissTax(params: {
  grossIncome: number
  cantonCode: string
  maritalStatus: 'single' | 'married' | 'divorced' | 'widowed'
  children: number
  deductions3a: number
  commuting: number
  otherDeductions: number
}) {
  const { grossIncome, cantonCode, maritalStatus, children, deductions3a, commuting, otherDeductions } = params

  const canton = cantons.find(c => c.code === cantonCode)
  if (!canton) return null

  // Standard deductions
  const socialInsurance = grossIncome * 0.065 // AHV/IV/EO
  const pensionFund = grossIncome * 0.07 // BVG estimate
  const professionalExpenses = Math.min(Math.max(commuting, 2000), 4000)
  const insuranceDeduction = maritalStatus === 'married' ? 5200 : 2600

  const totalDeductions =
    socialInsurance +
    pensionFund +
    deductions3a +
    professionalExpenses +
    insuranceDeduction +
    otherDeductions

  let taxableIncome = Math.max(grossIncome - totalDeductions, 0)

  // Child deduction
  const childDeduction = children * 6600
  taxableIncome = Math.max(taxableIncome - childDeduction, 0)

  // Married splitting
  if (maritalStatus === 'married') {
    taxableIncome = taxableIncome * 1 // Already accounted for in rates
  }

  // Federal tax (simplified progressive rates)
  let federalTax = 0
  if (taxableIncome <= 17800) {
    federalTax = 0
  } else if (taxableIncome <= 31600) {
    federalTax = (taxableIncome - 17800) * 0.0077
  } else if (taxableIncome <= 41400) {
    federalTax = 106.26 + (taxableIncome - 31600) * 0.0088
  } else if (taxableIncome <= 55200) {
    federalTax = 192.58 + (taxableIncome - 41400) * 0.0264
  } else if (taxableIncome <= 72500) {
    federalTax = 556.70 + (taxableIncome - 55200) * 0.0297
  } else if (taxableIncome <= 78100) {
    federalTax = 1070.37 + (taxableIncome - 72500) * 0.0566
  } else if (taxableIncome <= 103600) {
    federalTax = 1387.31 + (taxableIncome - 78100) * 0.0617
  } else if (taxableIncome <= 134600) {
    federalTax = 2960.23 + (taxableIncome - 103600) * 0.0869
  } else if (taxableIncome <= 176000) {
    federalTax = 5654.13 + (taxableIncome - 134600) * 0.1005
  } else if (taxableIncome <= 755200) {
    federalTax = 9815.33 + (taxableIncome - 176000) * 0.1190
  } else {
    federalTax = 78706.13 + (taxableIncome - 755200) * 0.1350
  }

  if (maritalStatus === 'married') {
    federalTax = federalTax * 0.85 // Married discount
  }

  // Cantonal tax (simplified)
  const cantonalRate = 0.06 * canton.taxMultiplier
  const cantonalTax = taxableIncome * cantonalRate

  // Municipal tax (approximate as 80% of cantonal)
  const municipalTax = cantonalTax * 0.8

  const totalTax = federalTax + cantonalTax + municipalTax
  const effectiveRate = grossIncome > 0 ? (totalTax / grossIncome) * 100 : 0

  return {
    federalTax: Math.round(federalTax),
    cantonalTax: Math.round(cantonalTax),
    municipalTax: Math.round(municipalTax),
    totalTax: Math.round(totalTax),
    effectiveRate: Math.round(effectiveRate * 10) / 10,
    taxableIncome: Math.round(taxableIncome),
  }
}
