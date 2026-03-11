'use client'

import { useState, useMemo, useCallback, useEffect, useRef, memo } from 'react'
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps'
import { scaleSequential } from 'd3-scale'
import { interpolateRdYlBu } from 'd3-scale-chromatic'
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react'
import MapTooltip from './MapTooltip'

export interface MapDataItem {
  totalTax: number
  effectiveRate: number
  name: string
}

interface SwissMapProps {
  geoUrl: string
  data: Map<number, MapDataItem>
  colorDomain: [number, number]
  onFeatureClick?: (id: number) => void
  clickLabel: string
  center?: [number, number]
  zoom?: number
}

const MemoGeography = memo(function MemoGeo({
  geo,
  fill,
  onMouseEnter,
  onMouseLeave,
  onClick,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  geo: any
  fill: string
  onMouseEnter: (e: React.MouseEvent) => void
  onMouseLeave: () => void
  onClick: () => void
}) {
  return (
    <Geography
      geography={geo}
      fill={fill}
      stroke="#fff"
      strokeWidth={0.4}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
      style={{
        default: { outline: 'none' },
        hover: { outline: 'none', opacity: 0.8, cursor: 'pointer' },
        pressed: { outline: 'none' },
      }}
    />
  )
})

const DEFAULT_CENTER: [number, number] = [8.2275, 46.8182]

export default function SwissMap({
  geoUrl,
  data,
  colorDomain,
  onFeatureClick,
  clickLabel,
  center = DEFAULT_CENTER,
  zoom: initialZoom = 1,
}: SwissMapProps) {
  const [tooltip, setTooltip] = useState<{
    x: number
    y: number
    item: MapDataItem
  } | null>(null)

  const [currentZoom, setCurrentZoom] = useState(initialZoom)
  const [currentCenter, setCurrentCenter] = useState<[number, number]>(center)
  const mapRef = useRef<HTMLDivElement>(null)

  // Sync with props when they change (e.g. canton zoom)
  const [prevCenter, setPrevCenter] = useState(center)
  const [prevZoom, setPrevZoom] = useState(initialZoom)
  if (center[0] !== prevCenter[0] || center[1] !== prevCenter[1]) {
    setPrevCenter(center)
    setCurrentCenter(center)
  }
  if (initialZoom !== prevZoom) {
    setPrevZoom(initialZoom)
    setCurrentZoom(initialZoom)
  }

  // Block wheel events from reaching d3-zoom inside the SVG.
  // Using capture phase + stopImmediatePropagation ensures d3-zoom never sees it.
  // The page scrolls normally because we don't call preventDefault.
  useEffect(() => {
    const el = mapRef.current
    if (!el) return
    const svg = el.querySelector('svg')
    if (!svg) return
    const blockZoom = (e: WheelEvent) => {
      e.stopImmediatePropagation()
    }
    svg.addEventListener('wheel', blockZoom, { capture: true, passive: true })
    return () => svg.removeEventListener('wheel', blockZoom, { capture: true })
  })

  const colorScale = useMemo(
    () => scaleSequential(interpolateRdYlBu).domain([colorDomain[1], colorDomain[0]]),
    [colorDomain]
  )

  const getFill = useCallback(
    (id: number) => {
      const item = data.get(id)
      if (!item) return '#e8edf3'
      return colorScale(item.totalTax)
    },
    [data, colorScale]
  )

  const handleMouseEnter = useCallback(
    (e: React.MouseEvent, id: number) => {
      const item = data.get(id)
      if (!item) return
      setTooltip({ x: e.clientX, y: e.clientY, item })
    },
    [data]
  )

  const handleMouseLeave = useCallback(() => {
    setTooltip(null)
  }, [])

  const handleClick = useCallback(
    (id: number) => {
      onFeatureClick?.(id)
    },
    [onFeatureClick]
  )

  const handleZoomIn = () => setCurrentZoom((z) => Math.min(z * 1.5, 12))
  const handleZoomOut = () => setCurrentZoom((z) => Math.max(z / 1.5, 0.8))
  const handleReset = () => {
    setCurrentZoom(initialZoom)
    setCurrentCenter(center)
  }

  const handleMoveEnd = useCallback((position: { coordinates: [number, number]; zoom: number }) => {
    setCurrentCenter(position.coordinates)
    setCurrentZoom(position.zoom)
  }, [])

  return (
    <div className="relative w-full" ref={mapRef}>
      {/* Zoom controls */}
      <div className="absolute top-3 right-3 z-10 flex flex-col gap-1.5">
        <button
          type="button"
          onClick={handleZoomIn}
          className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-navy-200 shadow-sm text-navy-600 hover:bg-navy-50 transition"
          aria-label="Zoom in"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={handleZoomOut}
          className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-navy-200 shadow-sm text-navy-600 hover:bg-navy-50 transition"
          aria-label="Zoom out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={handleReset}
          className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-navy-200 shadow-sm text-navy-600 hover:bg-navy-50 transition"
          aria-label="Reset zoom"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      <ComposableMap
        projection="geoMercator"
        projectionConfig={{
          center: DEFAULT_CENTER,
          scale: 8500,
        }}
        width={800}
        height={480}
        style={{ width: '100%', height: 'auto' }}
      >
        <ZoomableGroup
          zoom={currentZoom}
          center={currentCenter}
          minZoom={0.8}
          maxZoom={12}
          onMoveEnd={handleMoveEnd}
          translateExtent={[[-200, -200], [1000, 680]]}
        >
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const id = Number(geo.id)
                return (
                  <MemoGeography
                    key={geo.rsmKey}
                    geo={geo}
                    fill={getFill(id)}
                    onMouseEnter={(e) => handleMouseEnter(e, id)}
                    onMouseLeave={handleMouseLeave}
                    onClick={() => handleClick(id)}
                  />
                )
              })
            }
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>

      {tooltip && (
        <MapTooltip
          x={tooltip.x}
          y={tooltip.y}
          name={tooltip.item.name}
          totalTax={tooltip.item.totalTax}
          effectiveRate={tooltip.item.effectiveRate}
          clickLabel={clickLabel}
        />
      )}
    </div>
  )
}
