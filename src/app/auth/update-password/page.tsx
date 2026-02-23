'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useI18n } from '@/lib/i18n/context'
import { createClient } from '@/lib/supabase/client'
import { Lock, Eye, EyeOff, AlertCircle, KeyRound } from 'lucide-react'

export default function UpdatePasswordPage() {
  const { t, locale } = useI18n()
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError(locale === 'de' ? 'Passwörter stimmen nicht überein' : 'Passwords do not match')
      return
    }

    setLoading(true)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.updateUser({ password })

      if (error) {
        setError(error.message)
        return
      }

      router.push('/dashboard')
    } catch {
      setError(t.common.error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-navy-50/30 px-4 pt-20">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-navy-100 flex items-center justify-center mx-auto mb-4">
            <KeyRound className="w-8 h-8 text-navy-600" />
          </div>
          <h1 className="font-heading text-2xl font-bold text-navy-900">
            {t.auth.newPassword}
          </h1>
        </div>

        <div className="card p-8">
          <form onSubmit={handleUpdate} className="space-y-5">
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-navy-900 mb-2">
                {t.auth.newPassword}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-navy-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  className="w-full pl-10 pr-12 py-3 rounded-xl border-2 border-navy-200 text-navy-900 focus:border-navy-500 focus:ring-0 outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-navy-400 hover:text-navy-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-navy-900 mb-2">
                {t.auth.confirmPassword}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-navy-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={8}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-navy-200 text-navy-900 focus:border-navy-500 focus:ring-0 outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full !py-3 disabled:opacity-50"
            >
              {loading ? t.common.loading : t.common.save}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
