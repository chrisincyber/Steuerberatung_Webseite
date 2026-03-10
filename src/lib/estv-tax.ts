// Client-side wrapper for ESTV tax API routes

export interface TaxCity {
  id: number
  zipCode: string
  name: string
  cantonCode: string
  bfsId: number
}

export interface EstvTaxResult {
  federalTax: number
  cantonalTax: number
  municipalTax: number
  churchTax: number
  fortuneTax: number
  totalTax: number
  effectiveRate: number
  taxableIncome: number
  taxableIncomeFed: number
  source: 'estv'
}

export interface TaxCalculateParams {
  taxYear?: number
  taxLocationId: number
  grossIncome: number
  maritalStatus: 'single' | 'married' | 'divorced' | 'widowed'
  children: number
  confession?: number
  fortune?: number
}

export async function searchCities(
  term: string,
  year: number = 2025
): Promise<TaxCity[]> {
  if (!term || term.length < 2) return []

  const params = new URLSearchParams({ search: term, year: String(year) })
  const res = await fetch(`/api/tax-cities?${params}`)
  if (!res.ok) return []
  return res.json()
}

export async function calculateTaxESTV(
  params: TaxCalculateParams
): Promise<EstvTaxResult | null> {
  try {
    const res = await fetch('/api/tax-calculate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}
