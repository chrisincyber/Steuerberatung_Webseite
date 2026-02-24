'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useI18n } from '@/lib/i18n/context'
import { createClient } from '@/lib/supabase/client'
import { Mail, AlertCircle, ArrowLeft, KeyRound } from 'lucide-react'

export default function ResetPasswordPage() {
  const { t } = useI18n()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const supabase = createClient()
      if (!supabase) { setError('Service unavailable'); return }
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/update-password`,
      })

      if (error) {
        setError(error.message)
        return
      }

      setSuccess(true)
    } catch {
      setError(t.common.error)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-navy-50/30 px-4 pt-20">
        <div className="w-full max-w-md text-center">
          <div className="card p-8">
            <div className="w-16 h-16 rounded-full bg-trust-100 flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-trust-600" />
            </div>
            <h2 className="font-heading text-xl font-bold text-navy-900 mb-2">
              {t.auth.resetPassword}
            </h2>
            <p className="text-navy-600 text-sm leading-relaxed">
              {t.auth.resetSent}
            </p>
            <Link href="/auth/login" className="btn-primary mt-6 inline-flex">
              {t.auth.login}
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-navy-50/30 px-4 pt-20">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-navy-100 flex items-center justify-center mx-auto mb-4">
            <KeyRound className="w-8 h-8 text-navy-600" />
          </div>
          <h1 className="font-heading text-2xl font-bold text-navy-900">
            {t.auth.resetPassword}
          </h1>
        </div>

        <div className="card p-8">
          <form onSubmit={handleReset} className="space-y-5">
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-navy-900 mb-2">
                {t.auth.email}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-navy-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-navy-200 text-navy-900 focus:border-navy-500 focus:ring-0 outline-none"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full !py-3 disabled:opacity-50"
            >
              {loading ? t.common.loading : t.auth.resetPassword}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-2 text-sm text-navy-600 hover:text-navy-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              {t.auth.login}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
