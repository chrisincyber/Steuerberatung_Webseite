import { NextRequest, NextResponse } from 'next/server'

const ESTV_BASE =
  'https://swisstaxcalculator.estv.admin.ch/delegate/ost-integration/v1/lg-proxy/operation/c3b67379_ESTV'

interface EstvCity {
  TaxLocationID: number
  ZipCode: string
  BfsID: number
  CantonID: number
  BfsName: string
  City: string
  Canton: string
}

interface NormalizedCity {
  id: number
  zipCode: string
  name: string
  cantonCode: string
  bfsId: number
}

// In-memory cache: key = "search|year", value = { data, timestamp }
const cache = new Map<string, { data: NormalizedCity[]; ts: number }>()
const CACHE_TTL = 24 * 60 * 60 * 1000 // 24 hours

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const search = searchParams.get('search')?.trim()
  const year = parseInt(searchParams.get('year') || '2025', 10)

  if (!search || search.length < 2) {
    return NextResponse.json([])
  }

  const cacheKey = `${search.toLowerCase()}|${year}`
  const cached = cache.get(cacheKey)
  if (cached && Date.now() - cached.ts < CACHE_TTL) {
    return NextResponse.json(cached.data)
  }

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 5000)

    const res = await fetch(`${ESTV_BASE}/API_searchLocation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        Language: 1, // German
        Search: search,
        TaxYear: year,
      }),
      signal: controller.signal,
    })

    clearTimeout(timeout)

    if (!res.ok) {
      return NextResponse.json(
        { error: 'ESTV API error' },
        { status: 502 }
      )
    }

    const json = await res.json()
    const data: EstvCity[] = json.response ?? json

    // Normalize response
    const cities = data.map((c) => ({
      id: c.TaxLocationID,
      zipCode: c.ZipCode,
      name: c.City,
      cantonCode: c.Canton,
      bfsId: c.BfsID,
    }))

    cache.set(cacheKey, { data: cities, ts: Date.now() })

    // Evict old entries if cache grows too large
    if (cache.size > 500) {
      const now = Date.now()
      for (const [key, val] of cache) {
        if (now - val.ts > CACHE_TTL) cache.delete(key)
      }
    }

    return NextResponse.json(cities)
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      return NextResponse.json(
        { error: 'ESTV API timeout' },
        { status: 504 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to reach ESTV API' },
      { status: 502 }
    )
  }
}
