'use client'

import { useState } from 'react'
import { useI18n } from '@/lib/i18n/context'
import { createClient } from '@/lib/supabase/client'
import { DollarSign, Check, X } from 'lucide-react'

interface OfferCardProps {
  taxYearId: string
  offerAmount: number | null
  offerMessage: string | null
  price: number | null
  status: string
  onUpdate: () => void
}

export function OfferCard({ taxYearId, offerAmount, offerMessage, price, status, onUpdate }: OfferCardProps) {
  const { t } = useI18n()
  const [declining, setDeclining] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleAccept = async () => {
    setLoading(true)
    const supabase = createClient()
    if (!supabase) return
    await supabase
      .from('tax_years')
      .update({
        status: 'dokumente_hochladen',
        price: offerAmount,
      })
      .eq('id', taxYearId)
    setLoading(false)
    onUpdate()
  }

  const handleDecline = async () => {
    setLoading(true)
    const supabase = createClient()
    if (!supabase) return
    await supabase
      .from('tax_years')
      .update({ status: 'angebot_ausstehend', offer_amount: null, offer_message: null })
      .eq('id', taxYearId)
    setLoading(false)
    setDeclining(true)
  }

  // Show confirmed price
  if (price && status !== 'angebot_gesendet') {
    return (
      <div className="card p-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-trust-100 flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-trust-600" />
          </div>
          <span className="text-sm font-medium text-navy-600">{t.yearDetail.price}</span>
        </div>
        <div className="text-3xl font-bold text-navy-900">CHF {price.toLocaleString('de-CH')}</div>
      </div>
    )
  }

  // Offer pending (Tier 3, no offer yet)
  if (status === 'angebot_ausstehend') {
    return (
      <div className="card p-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-purple-600" />
          </div>
          <span className="text-sm font-medium text-navy-600">{t.yearDetail.price}</span>
        </div>
        <p className="text-navy-600">{t.yearDetail.offerPending}</p>
        {declining && (
          <p className="text-sm text-navy-500 mt-2">{t.yearDetail.offerDeclined}</p>
        )}
      </div>
    )
  }

  // Offer sent - show accept/decline
  if (status === 'angebot_gesendet' && offerAmount) {
    return (
      <div className="card p-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-blue-600" />
          </div>
          <span className="text-sm font-medium text-navy-600">{t.yearDetail.price}</span>
        </div>
        <div className="text-3xl font-bold text-navy-900 mb-2">CHF {offerAmount.toLocaleString('de-CH')}</div>
        {offerMessage && (
          <p className="text-sm text-navy-600 mb-4 bg-navy-50 rounded-lg p-3">{offerMessage}</p>
        )}
        <div className="flex gap-3">
          <button
            onClick={handleAccept}
            disabled={loading}
            className="btn-primary !py-2 !px-4 !text-sm flex items-center gap-2 disabled:opacity-50"
          >
            <Check className="w-4 h-4" />
            {t.yearDetail.acceptOffer}
          </button>
          <button
            onClick={handleDecline}
            disabled={loading}
            className="btn-secondary !py-2 !px-4 !text-sm flex items-center gap-2 disabled:opacity-50"
          >
            <X className="w-4 h-4" />
            {t.yearDetail.declineOffer}
          </button>
        </div>
      </div>
    )
  }

  return null
}
