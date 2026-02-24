'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useI18n } from '@/lib/i18n/context'
import { Cookie, X } from 'lucide-react'

export default function CookieConsent() {
  const { t } = useI18n()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem('cookieConsent')
    if (consent === null) {
      // Small delay for smoother UX
      const timer = setTimeout(() => setVisible(true), 1000)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleAccept = () => {
    localStorage.setItem('cookieConsent', 'true')
    setVisible(false)
  }

  const handleDecline = () => {
    localStorage.setItem('cookieConsent', 'false')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[60] p-4 sm:p-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-2xl border border-navy-100 p-6">
        <div className="flex items-start gap-4">
          <div className="hidden sm:flex w-10 h-10 rounded-xl bg-navy-100 items-center justify-center shrink-0">
            <Cookie className="w-5 h-5 text-navy-600" />
          </div>
          <div className="flex-1">
            <p className="text-navy-700 text-sm leading-relaxed">
              {t.cookie.message}{' '}
              <Link href="/privacy" className="text-navy-900 underline underline-offset-2 hover:text-navy-600">
                {t.cookie.learnMore}
              </Link>
            </p>
            <div className="flex items-center gap-3 mt-4">
              <button
                onClick={handleAccept}
                className="btn-primary !py-2 !px-5 !text-sm"
              >
                {t.cookie.accept}
              </button>
              <button
                onClick={handleDecline}
                className="btn-secondary !py-2 !px-5 !text-sm"
              >
                {t.cookie.decline}
              </button>
            </div>
          </div>
          <button
            onClick={handleDecline}
            className="text-navy-400 hover:text-navy-600 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
