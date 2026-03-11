import { NextRequest, NextResponse } from 'next/server'

const ESTV_BASE =
  'https://swisstaxcalculator.estv.admin.ch/delegate/ost-integration/v1/lg-proxy/operation/c3b67379_ESTV'

const RELATIONSHIP_MAP: Record<string, number> = {
  single: 1,
  married: 2,
  divorced: 1,
  widowed: 1,
}

interface BatchRequest {
  taxLocationIds: number[]
  taxYear?: number
  grossIncome: number
  maritalStatus: 'single' | 'married' | 'divorced' | 'widowed'
  children: number
  confession?: number
}

interface BatchResultItem {
  taxLocationId: number
  federalTax: number
  cantonalTax: number
  municipalTax: number
  churchTax: number
  fortuneTax: number
  totalTax: number
  effectiveRate: number
  taxableIncome: number
  source: 'estv'
  error?: undefined
}

interface BatchErrorItem {
  taxLocationId: number
  error: string
}

type BatchResult = BatchResultItem | BatchErrorItem

const MAX_CONCURRENCY = 5
const MAX_LOCATIONS = 80

// In-memory cache for tax calculations (key: locationId|year|income|status|children)
const taxCache = new Map<string, { data: BatchResultItem; ts: number }>()
const TAX_CACHE_TTL = 7 * 24 * 60 * 60 * 1000 // 7 days

async function runWithConcurrency<T>(
  tasks: (() => Promise<T>)[],
  concurrency: number
): Promise<T[]> {
  const results: T[] = new Array(tasks.length)
  let index = 0

  async function worker() {
    while (index < tasks.length) {
      const i = index++
      results[i] = await tasks[i]()
    }
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, tasks.length) }, () => worker()))
  return results
}

export async function POST(request: NextRequest) {
  let body: BatchRequest
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const {
    taxLocationIds,
    taxYear = 2025,
    grossIncome,
    maritalStatus,
    children,
    confession = 5,
  } = body

  if (!taxLocationIds?.length || !grossIncome || grossIncome <= 0) {
    return NextResponse.json(
      { error: 'taxLocationIds and grossIncome are required' },
      { status: 400 }
    )
  }

  if (taxLocationIds.length > MAX_LOCATIONS) {
    return NextResponse.json(
      { error: `Maximum ${MAX_LOCATIONS} locations per request` },
      { status: 400 }
    )
  }

  const relationshipId = RELATIONSHIP_MAP[maritalStatus] ?? 1
  const isCouple = relationshipId === 2
  const childrenArray = Array.from({ length: children }, () => ({ Age: 10 }))

  // Check cache and split into cached vs uncached
  const cachedResults: BatchResult[] = []
  const uncachedLocationIds: number[] = []

  for (const locationId of taxLocationIds) {
    const cacheKey = `${locationId}|${taxYear}|${grossIncome}|${maritalStatus}|${children}|${confession}`
    const cached = taxCache.get(cacheKey)
    if (cached && Date.now() - cached.ts < TAX_CACHE_TTL) {
      cachedResults.push(cached.data)
    } else {
      uncachedLocationIds.push(locationId)
    }
  }

  // Only call ESTV for uncached locations
  const tasks = uncachedLocationIds.map(
    (locationId) => async (): Promise<BatchResult> => {
      try {
        const controller = new AbortController()
        const timeout = setTimeout(() => controller.abort(), 8000)

        const estvPayload = {
          TaxYear: taxYear,
          TaxLocationID: locationId,
          Relationship: relationshipId,
          Confession1: confession,
          Confession2: isCouple ? confession : 0,
          Children: childrenArray,
          Age1: 40,
          Age2: isCouple ? 40 : 0,
          RevenueType1: 1,
          Revenue1: Math.round(grossIncome),
          RevenueType2: 0,
          Revenue2: 0,
          Fortune: 0,
        }

        const res = await fetch(`${ESTV_BASE}/API_calculateDetailedTaxes`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(estvPayload),
          signal: controller.signal,
        })

        clearTimeout(timeout)

        if (!res.ok) {
          return { taxLocationId: locationId, error: 'ESTV error' }
        }

        const json = await res.json()
        const data = json.response ?? json

        const result: BatchResultItem = {
          taxLocationId: locationId,
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
          source: 'estv' as const,
        }

        // Store in cache
        const cacheKey = `${locationId}|${taxYear}|${grossIncome}|${maritalStatus}|${children}|${confession}`
        taxCache.set(cacheKey, { data: result, ts: Date.now() })

        return result
      } catch {
        return { taxLocationId: locationId, error: 'timeout' }
      }
    }
  )

  const freshResults = uncachedLocationIds.length > 0
    ? await runWithConcurrency(tasks, MAX_CONCURRENCY)
    : []

  // Evict old cache entries periodically
  if (taxCache.size > 5000) {
    const now = Date.now()
    for (const [key, val] of taxCache) {
      if (now - val.ts > TAX_CACHE_TTL) taxCache.delete(key)
    }
  }

  const allResults = [...cachedResults, ...freshResults]
  return NextResponse.json(allResults)
}
