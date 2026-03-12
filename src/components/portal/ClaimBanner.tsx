'use client'

import { useState, useEffect } from 'react'
import { useI18n } from '@/lib/i18n/context'
import { UserPlus, Loader2, X } from 'lucide-react'

interface ClaimBannerProps {
  onClaimed: () => void
}

interface ClaimableData {
  claimable: boolean
  partnerId?: string
  primaryUserId?: string
  primaryUserName?: string
}

export function ClaimBanner({ onClaimed }: ClaimBannerProps) {
  const { t } = useI18n()
  const [data, setData] = useState<ClaimableData | null>(null)
  const [dismissed, setDismissed] = useState(false)
  const [claiming, setClaiming] = useState(false)

  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch('/api/account-links/check-claimable')
        if (res.ok) {
          const result = await res.json()
          setData(result)
        }
      } catch { /* ignore */ }
    }
    check()
  }, [])

  if (!data?.claimable || dismissed) return null

  const handleClaim = async (action: 'link' | 'unlink') => {
    setClaiming(true)
    try {
      const res = await fetch('/api/account-links/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ partnerId: data.partnerId, action }),
      })
      if (res.ok) {
        onClaimed()
      }
    } catch { /* ignore */ }
    setClaiming(false)
  }

  return (
    <div className="mb-6 p-4 rounded-xl bg-trust-50 border border-trust-200">
      <div className="flex items-start gap-3">
        <UserPlus className="w-5 h-5 text-trust-600 shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm font-medium text-navy-900">
            {t.dashboard.partner.claimBanner.replace('{name}', data.primaryUserName || '')}
          </p>
          <div className="flex flex-wrap gap-2 mt-3">
            <button
              onClick={() => handleClaim('link')}
              disabled={claiming}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-trust-600 text-white hover:bg-trust-700 transition-colors disabled:opacity-50"
            >
              {claiming && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {t.dashboard.partner.claimStayLinked}
            </button>
            <button
              onClick={() => handleClaim('unlink')}
              disabled={claiming}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-white text-navy-700 border border-navy-200 hover:bg-navy-50 transition-colors disabled:opacity-50"
            >
              {t.dashboard.partner.claimTakeOver}
            </button>
            <button
              onClick={() => setDismissed(true)}
              className="inline-flex items-center gap-1 px-2 py-1.5 text-sm text-navy-500 hover:text-navy-700 transition-colors"
            >
              {t.dashboard.partner.claimDismiss}
            </button>
          </div>
        </div>
        <button onClick={() => setDismissed(true)} className="text-navy-400 hover:text-navy-600">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
