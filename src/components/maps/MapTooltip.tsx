'use client'

interface MapTooltipProps {
  x: number
  y: number
  name: string
  totalTax: number
  effectiveRate: number
  clickLabel: string
}

export default function MapTooltip({ x, y, name, totalTax, effectiveRate, clickLabel }: MapTooltipProps) {
  return (
    <div
      className="pointer-events-none fixed z-50 rounded-xl bg-white shadow-lg border border-navy-200 px-4 py-3 text-sm"
      style={{
        left: x + 12,
        top: y - 40,
        transform: 'translateY(-100%)',
      }}
    >
      <p className="font-semibold text-navy-900">{name}</p>
      <p className="text-navy-700">
        CHF {new Intl.NumberFormat('de-CH', { minimumFractionDigits: 0 }).format(totalTax)}
      </p>
      <p className="text-navy-500">{effectiveRate.toFixed(1)}%</p>
      <p className="text-xs text-navy-400 mt-1">{clickLabel}</p>
    </div>
  )
}
