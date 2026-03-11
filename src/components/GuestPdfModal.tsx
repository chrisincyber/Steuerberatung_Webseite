'use client'

import { useState } from 'react'
import Link from 'next/link'
import { X, ArrowRight, Mail, Loader2 } from 'lucide-react'
import { useI18n } from '@/lib/i18n/context'

interface GuestPdfModalProps {
  isOpen: boolean
  onClose: () => void
  onSend: (data: { fullName: string; email: string; phone: string }) => void
  sending: boolean
  sent: boolean
  error: boolean
  redirectPath: string
  toolTitle?: string
}

export default function GuestPdfModal({
  isOpen,
  onClose,
  onSend,
  sending,
  sent,
  error,
  redirectPath,
  toolTitle,
}: GuestPdfModalProps) {
  const { t } = useI18n()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')

  if (!isOpen) return null

  const pdf = t.toolPdf

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full p-6 sm:p-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-navy-400 hover:text-navy-600"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="font-heading text-xl font-bold text-navy-900 mb-4">
          {toolTitle || pdf.guestTitle}
        </h3>

        {sent ? (
          <div className="py-8 text-center">
            <Mail className="w-12 h-12 text-trust-500 mx-auto mb-3" />
            <p className="text-navy-700 font-medium">{pdf.success}</p>
          </div>
        ) : (
          <>
            <Link
              href={`/auth/register?redirect=${redirectPath}`}
              className="btn-primary w-full !py-3 flex items-center justify-center gap-2 mb-2"
            >
              {pdf.createAccount}
              <ArrowRight className="w-4 h-4" />
            </Link>
            <p className="text-xs text-navy-400 text-center mb-4">
              {pdf.createAccountHint}
            </p>

            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-navy-200" />
              <span className="text-sm text-navy-400">{pdf.or}</span>
              <div className="flex-1 h-px bg-navy-200" />
            </div>

            <p className="text-sm font-semibold text-navy-700 mb-3">
              {pdf.sendByEmail}
            </p>
            <div className="space-y-3">
              <input
                type="text"
                placeholder={pdf.fullName}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border-2 border-navy-200 text-navy-900 text-sm focus:border-navy-500 focus:ring-0 outline-none"
              />
              <input
                type="email"
                placeholder={pdf.email}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border-2 border-navy-200 text-navy-900 text-sm focus:border-navy-500 focus:ring-0 outline-none"
              />
              <input
                type="tel"
                placeholder={pdf.phone}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border-2 border-navy-200 text-navy-900 text-sm focus:border-navy-500 focus:ring-0 outline-none"
              />
            </div>
            {error && (
              <p className="text-sm text-red-600 mt-2">{pdf.error}</p>
            )}
            <button
              onClick={() => onSend({ fullName, email, phone })}
              disabled={sending || !fullName.trim() || !email.trim()}
              className="btn-primary w-full !py-3 mt-4 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {sending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {pdf.sending}
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  {pdf.send}
                </>
              )}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
