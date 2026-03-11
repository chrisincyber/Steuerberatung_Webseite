'use client'

import { useMemo, useState, useEffect } from 'react'
import SwissMap, { type MapDataItem } from './SwissMap'
import MapLegend from './MapLegend'

// Canton number (BFS) → canton code
const CANTON_NUMBER_TO_CODE: Record<number, string> = {
  1: 'ZH', 2: 'BE', 3: 'LU', 4: 'UR', 5: 'SZ', 6: 'OW', 7: 'NW', 8: 'GL',
  9: 'ZG', 10: 'FR', 11: 'SO', 12: 'BS', 13: 'BL', 14: 'SH', 15: 'AR',
  16: 'AI', 17: 'SG', 18: 'GR', 19: 'AG', 20: 'TG', 21: 'TI', 22: 'VD',
  23: 'VS', 24: 'NE', 25: 'GE', 26: 'JU',
}

const CANTON_CODE_TO_NUMBER: Record<string, number> = Object.fromEntries(
  Object.entries(CANTON_NUMBER_TO_CODE).map(([k, v]) => [v, Number(k)])
)

// Approximate canton centers for zooming
const CANTON_CENTERS: Record<string, [number, number]> = {
  ZH: [8.65, 47.38], BE: [7.45, 46.95], LU: [8.15, 47.05], UR: [8.63, 46.78],
  SZ: [8.73, 47.02], OW: [8.25, 46.87], NW: [8.38, 46.93], GL: [9.05, 47.02],
  ZG: [8.52, 47.17], FR: [7.1, 46.77], SO: [7.55, 47.32], BS: [7.59, 47.56],
  BL: [7.68, 47.44], SH: [8.63, 47.7], AR: [9.28, 47.38], AI: [9.41, 47.32],
  SG: [9.28, 47.25], GR: [9.55, 46.73], AG: [8.08, 47.4], TG: [9.05, 47.57],
  TI: [8.85, 46.25], VD: [6.6, 46.6], VS: [7.6, 46.23], NE: [6.85, 47.0],
  GE: [6.15, 46.2], JU: [7.15, 47.35],
}

interface CantonResult {
  code: string
  name: string
  totalTax: number
  effectiveRate: number
}

interface GemeindeResult {
  taxLocationId: number
  bfsId: number
  name: string
  totalTax: number
  effectiveRate: number
}

interface TaxMapProps {
  mode: 'canton' | 'municipality'
  cantonResults?: CantonResult[]
  gemeindeResults?: GemeindeResult[]
  selectedCanton?: string
  onCantonClick?: (cantonCode: string) => void
  onMunicipalityClick?: (bfsId: number) => void
  labels: {
    lowestTax: string
    highestTax: string
    noData: string
    clickForDetails: string
  }
}

export default function TaxMap({
  mode,
  cantonResults = [],
  gemeindeResults = [],
  selectedCanton,
  onCantonClick,
  onMunicipalityClick,
  labels,
}: TaxMapProps) {
  const [muniGeoLoaded, setMuniGeoLoaded] = useState(false)

  // Preload municipality geo when in municipality mode
  useEffect(() => {
    if (mode === 'municipality' && !muniGeoLoaded) {
      fetch('/geo/municipalities.json')
        .then(() => setMuniGeoLoaded(true))
        .catch(() => {})
    }
  }, [mode, muniGeoLoaded])

  // Canton data map: canton number → data
  const cantonData = useMemo(() => {
    const map = new Map<number, MapDataItem>()
    for (const r of cantonResults) {
      const num = CANTON_CODE_TO_NUMBER[r.code]
      if (num) {
        map.set(num, { totalTax: r.totalTax, effectiveRate: r.effectiveRate, name: r.name })
      }
    }
    return map
  }, [cantonResults])

  // Municipality data map: bfsId → data (average tax per BFS municipality)
  const muniData = useMemo(() => {
    const groups = new Map<number, { totalTax: number; effectiveRate: number; name: string; count: number }>()
    for (const r of gemeindeResults) {
      const existing = groups.get(r.bfsId)
      if (existing) {
        existing.totalTax += r.totalTax
        existing.effectiveRate += r.effectiveRate
        existing.count += 1
      } else {
        groups.set(r.bfsId, { totalTax: r.totalTax, effectiveRate: r.effectiveRate, name: r.name, count: 1 })
      }
    }
    const map = new Map<number, MapDataItem>()
    for (const [bfsId, g] of groups) {
      map.set(bfsId, {
        totalTax: Math.round(g.totalTax / g.count),
        effectiveRate: g.effectiveRate / g.count,
        name: g.name,
      })
    }
    return map
  }, [gemeindeResults])

  const data = mode === 'canton' ? cantonData : muniData
  const taxes = Array.from(data.values()).map((d) => d.totalTax)
  const minTax = taxes.length > 0 ? Math.min(...taxes) : 0
  const maxTax = taxes.length > 0 ? Math.max(...taxes) : 1

  // Zoom into canton when in municipality mode
  const center = mode === 'municipality' && selectedCanton
    ? (CANTON_CENTERS[selectedCanton] ?? [8.2275, 46.8182])
    : [8.2275, 46.8182] as [number, number]

  const zoom = mode === 'municipality' && selectedCanton ? 4 : 1

  const geoUrl = mode === 'canton' ? '/geo/cantons.json' : '/geo/municipalities.json'

  const handleFeatureClick = (id: number) => {
    if (mode === 'canton') {
      const code = CANTON_NUMBER_TO_CODE[id]
      if (code && onCantonClick) {
        onCantonClick(code)
      }
    } else if (mode === 'municipality') {
      onMunicipalityClick?.(id)
    }
  }

  if (data.size === 0) return null

  return (
    <div className="card p-4 overflow-hidden">
      <SwissMap
        geoUrl={geoUrl}
        data={data}
        colorDomain={[minTax, maxTax]}
        onFeatureClick={handleFeatureClick}
        clickLabel={labels.clickForDetails}
        center={center as [number, number]}
        zoom={zoom}
      />
      <MapLegend
        min={minTax}
        max={maxTax}
        lowestLabel={labels.lowestTax}
        highestLabel={labels.highestTax}
        noDataLabel={labels.noData}
      />
    </div>
  )
}
