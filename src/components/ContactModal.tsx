'use client'

import { useState } from 'react'
import { useI18n } from '@/lib/i18n/context'
import { X, Send, Loader2, CheckCircle } from 'lucide-react'

interface ContactModalProps {
  isOpen: boolean
  onClose: () => void
  source?: string // e.g. "3a-Rechner" - which tool the user came from
}

export function ContactModal({ isOpen, onClose, source }: ContactModalProps) {
  const { t } = useI18n()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async () => {
    if (!name.trim() || !email.trim()) return
    setSending(true)
    setError(false)
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, message, source }),
      })
      if (!res.ok) throw new Error()
      setSent(true)
    } catch {
      setError(true)
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full p-6 sm:p-8">
        <button onClick={onClose} className="absolute top-4 right-4 text-navy-400 hover:text-navy-600">
          <X className="w-5 h-5" />
        </button>

        {sent ? (
          <div className="py-8 text-center">
            <CheckCircle className="w-12 h-12 text-trust-500 mx-auto mb-3" />
            <p className="text-navy-700 font-medium">{t.contactModal.success}</p>
          </div>
        ) : (
          <>
            <h3 className="font-heading text-xl font-bold text-navy-900 mb-1">
              {t.contactModal.title}
            </h3>
            <p className="text-sm text-navy-500 mb-5">{t.contactModal.subtitle}</p>

            <div className="space-y-3">
              <input
                type="text"
                placeholder={t.contactModal.name}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border-2 border-navy-200 text-navy-900 text-sm focus:border-navy-500 focus:ring-0 outline-none"
              />
              <input
                type="email"
                placeholder={t.contactModal.email}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border-2 border-navy-200 text-navy-900 text-sm focus:border-navy-500 focus:ring-0 outline-none"
              />
              <input
                type="tel"
                placeholder={t.contactModal.phone}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border-2 border-navy-200 text-navy-900 text-sm focus:border-navy-500 focus:ring-0 outline-none"
              />
              <textarea
                placeholder={t.contactModal.messagePlaceholder}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 rounded-lg border-2 border-navy-200 text-navy-900 text-sm focus:border-navy-500 focus:ring-0 outline-none resize-none"
              />
            </div>

            {source && (
              <p className="text-xs text-navy-400 mt-2">
                {t.contactModal.source}: {source}
              </p>
            )}

            {error && <p className="text-sm text-red-600 mt-2">{t.contactModal.error}</p>}

            <button
              onClick={handleSubmit}
              disabled={sending || !name.trim() || !email.trim()}
              className="btn-primary w-full !py-3 mt-4 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {sending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t.contactModal.sending}
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  {t.contactModal.send}
                </>
              )}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
