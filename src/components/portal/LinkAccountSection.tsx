'use client'

import { useState, useEffect, useCallback } from 'react'
import { useI18n } from '@/lib/i18n/context'
import { Link2, Unlink, Eye, EyeOff, Loader2, CheckCircle, Copy, Check, HelpCircle, Key, UserPlus, ChevronDown } from 'lucide-react'

const inputClass = 'w-full px-3 py-2 rounded-lg border-2 border-navy-200 text-navy-900 text-sm focus:border-navy-500 focus:ring-0 outline-none transition-colors'

interface LinkStatus {
  linked: boolean
  linkId?: string
  myShareVisible?: boolean
  partnerShareVisible?: boolean
  partner?: {
    id: string
    first_name: string
    last_name: string
    email: string
  }
}

export function LinkAccountSection() {
  const { t } = useI18n()
  const [linkStatus, setLinkStatus] = useState<LinkStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [generatedPin, setGeneratedPin] = useState<string | null>(null)
  const [pinCopied, setPinCopied] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [redeemEmail, setRedeemEmail] = useState('')
  const [redeemPin, setRedeemPin] = useState('')
  const [redeeming, setRedeeming] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [togglingVisibility, setTogglingVisibility] = useState(false)
  const [showGuide, setShowGuide] = useState(false)

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/account-links/status')
      if (res.ok) {
        const data = await res.json()
        setLinkStatus(data)
      }
    } catch { /* ignore */ }
    setLoading(false)
  }, [])

  useEffect(() => { fetchStatus() }, [fetchStatus])

  useEffect(() => {
    if (!success && !error) return
    const timer = setTimeout(() => { setSuccess(''); setError('') }, 5000)
    return () => clearTimeout(timer)
  }, [success, error])

  const handleGeneratePin = async () => {
    setGenerating(true)
    setError('')
    setGeneratedPin(null)
    try {
      const res = await fetch('/api/account-links/generate-pin', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Failed')
        return
      }
      setGeneratedPin(data.pin)
    } catch {
      setError('Failed')
    } finally {
      setGenerating(false)
    }
  }

  const handleCopyPin = async () => {
    if (!generatedPin) return
    await navigator.clipboard.writeText(generatedPin)
    setPinCopied(true)
    setTimeout(() => setPinCopied(false), 2000)
  }

  const handleRedeemPin = async () => {
    if (!redeemEmail.trim() || !redeemPin.trim()) return
    setRedeeming(true)
    setError('')
    try {
      const res = await fetch('/api/account-links/redeem-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: redeemEmail, pin: redeemPin }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(t.account.linking.invalidPinOrEmail)
        return
      }
      if (data.success) {
        setSuccess(t.account.linking.linkSuccess)
        setRedeemEmail('')
        setRedeemPin('')
        fetchStatus()
      }
    } catch {
      setError(t.account.linking.invalidPinOrEmail)
    } finally {
      setRedeeming(false)
    }
  }

  const handleUnlink = async () => {
    if (!confirm(t.account.linking.unlinkConfirm)) return
    try {
      const res = await fetch('/api/account-links/unlink', { method: 'DELETE' })
      if (res.ok) {
        setSuccess(t.account.linking.unlinkSuccess)
        setLinkStatus({ linked: false })
      }
    } catch { /* ignore */ }
  }

  const handleToggleVisibility = async () => {
    if (!linkStatus?.linked) return
    setTogglingVisibility(true)
    try {
      const res = await fetch('/api/account-links/visibility', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visible: !linkStatus.myShareVisible }),
      })
      if (res.ok) {
        setLinkStatus(prev => prev ? { ...prev, myShareVisible: !prev.myShareVisible } : prev)
      }
    } catch { /* ignore */ }
    setTogglingVisibility(false)
  }

  const guideFlows = [
    { icon: Key, title: t.account.linking.guidePinTitle, steps: t.account.linking.guidePinSteps },
    { icon: UserPlus, title: t.account.linking.guideClaimTitle, steps: t.account.linking.guideClaimSteps },
    { icon: Eye, title: t.account.linking.guideVisibilityTitle, steps: t.account.linking.guideVisibilitySteps },
  ]

  const guideCard = (
    <div className="mb-4">
      <button
        onClick={() => setShowGuide(!showGuide)}
        className="flex items-center gap-2 text-sm text-navy-500 hover:text-navy-700 transition-colors"
      >
        <HelpCircle className="w-4 h-4" />
        <span>{t.account.linking.guideToggle}</span>
        <ChevronDown className={`w-3 h-3 transition-transform ${showGuide ? 'rotate-180' : ''}`} />
      </button>
      {showGuide && (
        <div className="mt-3 bg-navy-50 rounded-xl p-4 space-y-4">
          {guideFlows.map(({ icon: Icon, title, steps }) => (
            <div key={title}>
              <div className="flex items-center gap-2 mb-2">
                <Icon className="w-4 h-4 text-navy-600" />
                <h4 className="text-sm font-semibold text-navy-900">{title}</h4>
              </div>
              <ol className="list-decimal list-inside space-y-1 text-sm text-navy-700">
                {steps.map((step: string, i: number) => (
                  <li key={i}>{step}</li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      )}
    </div>
  )

  if (loading) {
    return (
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Link2 className="w-4 h-4 text-navy-600" />
          <h2 className="font-heading text-base font-bold text-navy-900">{t.account.linking.title}</h2>
        </div>
        <div className="flex justify-center py-4">
          <Loader2 className="w-5 h-5 animate-spin text-navy-400" />
        </div>
      </div>
    )
  }

  // ---- Linked state ----
  if (linkStatus?.linked && linkStatus.partner) {
    return (
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Link2 className="w-4 h-4 text-trust-600" />
          <h2 className="font-heading text-base font-bold text-navy-900">{t.account.linking.title}</h2>
        </div>

        {guideCard}

        {(success || error) && (
          <div className={`mb-4 p-3 rounded-xl text-sm ${success ? 'bg-trust-50 border border-trust-200 text-trust-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>
            {success || error}
          </div>
        )}

        {/* Partner info */}
        <div className="p-4 bg-trust-50 rounded-xl border border-trust-200 mb-4">
          <p className="text-sm text-navy-500">{t.account.linking.linked}</p>
          <p className="font-semibold text-navy-900">
            {linkStatus.partner.first_name} {linkStatus.partner.last_name}
          </p>
          <p className="text-sm text-navy-500">{linkStatus.partner.email}</p>
        </div>

        {/* Visibility */}
        <div className="space-y-3 mb-4">
          <h3 className="text-sm font-semibold text-navy-900">{t.account.linking.visibility}</h3>

          <label className="flex items-center justify-between p-3 rounded-xl border border-navy-200 cursor-pointer hover:bg-navy-50 transition-colors">
            <div className="flex items-center gap-3">
              {linkStatus.myShareVisible ? (
                <Eye className="w-5 h-5 text-trust-500" />
              ) : (
                <EyeOff className="w-5 h-5 text-navy-400" />
              )}
              <div>
                <p className="text-sm font-medium text-navy-900">{t.account.linking.shareMyYears}</p>
                <p className="text-xs text-navy-500">{t.account.linking.shareMyYearsDescription}</p>
              </div>
            </div>
            <button
              onClick={handleToggleVisibility}
              disabled={togglingVisibility}
              className={`relative w-11 h-6 rounded-full transition-colors ${
                linkStatus.myShareVisible ? 'bg-trust-500' : 'bg-navy-200'
              }`}
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform shadow-sm ${
                linkStatus.myShareVisible ? 'translate-x-5' : ''
              }`} />
            </button>
          </label>

          <div className="flex items-center gap-3 p-3 rounded-xl border border-navy-100 bg-navy-50/50">
            {linkStatus.partnerShareVisible ? (
              <>
                <Eye className="w-5 h-5 text-trust-500" />
                <p className="text-sm text-navy-700">{t.account.linking.partnerShares}</p>
              </>
            ) : (
              <>
                <EyeOff className="w-5 h-5 text-navy-400" />
                <p className="text-sm text-navy-500">{t.account.linking.partnerNotSharing}</p>
              </>
            )}
          </div>
        </div>

        {/* Unlink */}
        <button
          onClick={handleUnlink}
          className="flex items-center gap-2 text-sm text-red-500 hover:text-red-700 transition-colors"
        >
          <Unlink className="w-4 h-4" />
          {t.account.linking.unlinkAccount}
        </button>
      </div>
    )
  }

  // ---- Unlinked state ----
  return (
    <div className="card p-5">
      <div className="flex items-center gap-2 mb-2">
        <Link2 className="w-4 h-4 text-navy-600" />
        <h2 className="font-heading text-base font-bold text-navy-900">{t.account.linking.title}</h2>
      </div>
      <p className="text-sm text-navy-500 mb-4">{t.account.linking.description}</p>

      {guideCard}

      {(success || error) && (
        <div className={`mb-4 p-3 rounded-xl text-sm ${success ? 'bg-trust-50 border border-trust-200 text-trust-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>
          {success || error}
        </div>
      )}

      {/* Generate PIN section */}
      <div className="border border-navy-200 rounded-xl p-4 mb-4">
        <h3 className="text-sm font-semibold text-navy-900 mb-1">{t.account.linking.generatePin}</h3>
        <p className="text-xs text-navy-500 mb-3">{t.account.linking.generatePinDescription}</p>

        {generatedPin ? (
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-navy-50 rounded-xl p-3 text-center">
              <p className="text-xs text-navy-500 mb-1">{t.account.linking.yourPin}</p>
              <p className="font-mono text-2xl font-bold text-navy-900 tracking-[0.3em]">{generatedPin}</p>
              <p className="text-xs text-navy-400 mt-1">{t.account.linking.pinExpiry}</p>
            </div>
            <button onClick={handleCopyPin} className="p-2 rounded-lg hover:bg-navy-50 text-navy-500">
              {pinCopied ? <Check className="w-5 h-5 text-trust-500" /> : <Copy className="w-5 h-5" />}
            </button>
          </div>
        ) : (
          <button
            onClick={handleGeneratePin}
            disabled={generating}
            className="btn-primary !py-2 !px-4 text-sm flex items-center gap-2"
          >
            {generating && <Loader2 className="w-4 h-4 animate-spin" />}
            {t.account.linking.generatePin}
          </button>
        )}
      </div>

      {/* Redeem PIN section */}
      <div className="border border-navy-200 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-navy-900 mb-1">{t.account.linking.enterPin}</h3>
        <p className="text-xs text-navy-500 mb-3">{t.account.linking.enterPinDescription}</p>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-navy-700 mb-1">{t.account.linking.partnerEmail}</label>
            <input
              type="email"
              value={redeemEmail}
              onChange={(e) => setRedeemEmail(e.target.value)}
              placeholder="partner@email.ch"
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-navy-700 mb-1">{t.account.linking.pin}</label>
            <input
              type="text"
              value={redeemPin}
              onChange={(e) => setRedeemPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              maxLength={6}
              className={`${inputClass} font-mono tracking-widest text-center`}
            />
          </div>
          <button
            onClick={handleRedeemPin}
            disabled={redeeming || !redeemEmail.trim() || redeemPin.length !== 6}
            className="btn-primary !py-2 !px-4 text-sm w-full flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {redeeming && <Loader2 className="w-4 h-4 animate-spin" />}
            {t.account.linking.linkAccount}
          </button>
        </div>
      </div>
    </div>
  )
}
