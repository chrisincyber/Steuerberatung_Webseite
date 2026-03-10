import { NextRequest, NextResponse } from 'next/server'

const ESTV_BASE =
  'https://swisstaxcalculator.estv.admin.ch/delegate/ost-integration/v1/lg-proxy/operation/c3b67379_ESTV'

// Map our marital status to ESTV Relationship IDs
const RELATIONSHIP_MAP: Record<string, number> = {
  single: 1,
  married: 2,
  divorced: 1, // treated as single
  widowed: 1,  // treated as single
}

interface TaxRequest {
  taxYear?: number
  taxLocationId: number
  grossIncome: number
  maritalStatus: 'single' | 'married' | 'divorced' | 'widowed'
  children: number
  confession?: number // 1=Protestant, 2=Roman Catholic, 3=Christian Catholic, 5=None
  fortune?: number
  // Extended fields for complex mode
  incomeType1?: number // 1=Gross, 2=Net, 3=Pension
  income2?: number
  incomeType2?: number
  confession2?: number
  age1?: number
  age2?: number
  childAges?: number[]
}

export async function POST(request: NextRequest) {
  let body: TaxRequest
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const {
    taxYear = 2025,
    taxLocationId,
    grossIncome,
    maritalStatus,
    children,
    confession = 5, // default: no church tax
    fortune = 0,
    incomeType1 = 1,
    income2 = 0,
    incomeType2 = 0,
    confession2,
    age1 = 40,
    age2,
    childAges,
  } = body

  if (!taxLocationId || !grossIncome || grossIncome <= 0) {
    return NextResponse.json(
      { error: 'taxLocationId and grossIncome are required' },
      { status: 400 }
    )
  }

  const relationshipId = RELATIONSHIP_MAP[maritalStatus] ?? 1
  const isCouple = relationshipId === 2

  // Build children array - use provided ages or default to 10
  const childrenArray = childAges && childAges.length > 0
    ? childAges.map((age) => ({ Age: age }))
    : Array.from({ length: children }, () => ({ Age: 10 }))

  const estvPayload = {
    TaxYear: taxYear,
    TaxLocationID: taxLocationId,
    Relationship: relationshipId,
    Confession1: confession,
    Confession2: isCouple ? (confession2 ?? confession) : 0,
    Children: childrenArray,
    Age1: age1,
    Age2: isCouple ? (age2 ?? 40) : 0,
    RevenueType1: incomeType1,
    Revenue1: Math.round(grossIncome),
    RevenueType2: isCouple && income2 > 0 ? (incomeType2 || 1) : 0,
    Revenue2: isCouple ? Math.round(income2) : 0,
    Fortune: Math.round(fortune),
  }

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 5000)

    const res = await fetch(`${ESTV_BASE}/API_calculateDetailedTaxes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(estvPayload),
      signal: controller.signal,
    })

    clearTimeout(timeout)

    if (!res.ok) {
      return NextResponse.json(
        { error: 'estv_error', message: 'ESTV API returned an error' },
        { status: 502 }
      )
    }

    const json = await res.json()
    const data = json.response ?? json

    return NextResponse.json({
      federalTax: Math.round(data.IncomeTaxFed ?? 0),
      cantonalTax: Math.round(data.IncomeTaxCanton ?? 0),
      municipalTax: Math.round(data.IncomeTaxCity ?? 0),
      churchTax: Math.round(data.IncomeTaxChurch ?? 0),
      fortuneTax: Math.round(
        (data.FortuneTaxCanton ?? 0) +
        (data.FortuneTaxCity ?? 0) +
        (data.FortuneTaxChurch ?? 0)
      ),
      totalTax: Math.round(data.TotalTax ?? 0),
      effectiveRate:
        grossIncome > 0
          ? Math.round(((data.TotalTax ?? 0) / grossIncome) * 1000) / 10
          : 0,
      taxableIncome: Math.round(data.TaxableIncomeCanton ?? 0),
      taxableIncomeFed: Math.round(data.TaxableIncomeFed ?? 0),
      source: 'estv' as const,
    })
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      return NextResponse.json(
        { error: 'estv_timeout', message: 'ESTV API timeout' },
        { status: 504 }
      )
    }
    return NextResponse.json(
      { error: 'estv_unreachable', message: 'Failed to reach ESTV API' },
      { status: 502 }
    )
  }
}
