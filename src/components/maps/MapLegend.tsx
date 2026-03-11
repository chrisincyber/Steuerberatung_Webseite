'use client'

interface MapLegendProps {
  min: number
  max: number
  lowestLabel: string
  highestLabel: string
  noDataLabel: string
}

export default function MapLegend({ min, max, lowestLabel, highestLabel, noDataLabel }: MapLegendProps) {
  const formatCHF = (n: number) =>
    'CHF ' + new Intl.NumberFormat('de-CH', { minimumFractionDigits: 0 }).format(n)

  return (
    <div className="mt-4 px-2">
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <div
            className="h-3 rounded-full"
            style={{
              background: 'linear-gradient(to right, #2166ac, #67a9cf, #f7f7f7, #ef8a62, #b2182b)',
            }}
          />
          <div className="flex justify-between mt-1 text-xs text-navy-500">
            <span>{lowestLabel}: {formatCHF(min)}</span>
            <span>{highestLabel}: {formatCHF(max)}</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-navy-400">
          <div className="w-3 h-3 rounded bg-navy-100 border border-navy-200" />
          <span>{noDataLabel}</span>
        </div>
      </div>
    </div>
  )
}
