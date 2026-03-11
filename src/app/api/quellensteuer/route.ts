import { NextRequest, NextResponse } from 'next/server'
import tariffData from '@/data/qst-tariffs-2026.json'

/**
 * Quellensteuer (withholding tax) calculation using official ESTV 2026 tariff data.
 *
 * Tariff codes:
 *   A = Single (ledig, geschieden, verwitwet)
 *   B = Married, single earner (verheiratet, Alleinverdiener)
 *   C = Married, dual earner (verheiratet, Doppelverdiener)
 *   H = Single parent (alleinerziehend)
 *
 * The number suffix is the number of children (0-5).
 * Church surcharge is stored per canton as _c and added to the base rate.
 */

interface QstRequest {
  canton: string
  grossMonthlyIncome: number
  tariffCode: string  // e.g. "A0", "B2", "C1", "H1"
  churchMember: boolean
}

const data = tariffData as Record<string, Record<string, number[] | number>>

function lookupRate(cantonData: Record<string, number[] | number>, tariffCode: string, monthlyIncome: number, churchMember: boolean): number | null {
  const brackets = cantonData[tariffCode]
  if (!brackets || !Array.isArray(brackets) || brackets.length < 2) return null

  // Binary search in flat array [inc0, rate0, inc1, rate1, ...]
  let rate = brackets[1] // default to first bracket rate
  for (let i = 0; i < brackets.length - 2; i += 2) {
    const inc = brackets[i]
    const nextInc = brackets[i + 2]
    if (monthlyIncome >= inc && (nextInc === undefined || monthlyIncome < nextInc)) {
      rate = brackets[i + 1]
      break
    }
    if (i + 2 >= brackets.length - 1) {
      // Last bracket
      rate = brackets[brackets.length - 1]
    }
  }

  // Add church surcharge if applicable
  if (churchMember) {
    const surcharge = (cantonData['_c'] as number) ?? 0
    rate += surcharge
  }

  return Math.round(rate * 100) / 100
}

export async function POST(request: NextRequest) {
  let body: QstRequest
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { canton, grossMonthlyIncome, tariffCode, churchMember } = body

  if (!canton || !tariffCode || grossMonthlyIncome == null) {
    return NextResponse.json({ error: 'canton, tariffCode, and grossMonthlyIncome are required' }, { status: 400 })
  }

  const cantonUpper = canton.toUpperCase()
  const cantonData = data[cantonUpper]
  if (!cantonData) {
    return NextResponse.json({ error: `Unknown canton: ${canton}` }, { status: 400 })
  }

  const rate = lookupRate(cantonData, tariffCode, grossMonthlyIncome, churchMember)
  if (rate === null) {
    return NextResponse.json({ error: `Tariff ${tariffCode} not found for canton ${cantonUpper}` }, { status: 404 })
  }

  const monthlyTax = Math.round(grossMonthlyIncome * rate / 100)
  const annualTax = monthlyTax * 12
  const annualIncome = Math.round(grossMonthlyIncome * 12)

  return NextResponse.json({
    canton: cantonUpper,
    tariffCode,
    churchMember,
    grossMonthlyIncome,
    grossAnnualIncome: annualIncome,
    withholdingRate: rate,
    monthlyTax,
    annualTax,
    effectiveRate: annualIncome > 0 ? Math.round((annualTax / annualIncome) * 1000) / 10 : 0,
    source: 'estv-2026',
  })
}
