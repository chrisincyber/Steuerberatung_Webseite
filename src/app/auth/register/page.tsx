'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useI18n } from '@/lib/i18n/context'
import { createClient } from '@/lib/supabase/client'
import { Mail, Lock, User, Phone, Eye, EyeOff, AlertCircle, UserPlus } from 'lucide-react'

export default function RegisterPage() {
  const { t, locale } = useI18n()

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError(locale === 'de' ? 'Passwörter stimmen nicht überein' : 'Passwords do not match')
      return
    }

    if (password.length < 8) {
      setError(locale === 'de' ? 'Passwort muss mindestens 8 Zeichen lang sein' : 'Password must be at least 8 characters')
      return
    }

    setLoading(true)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            phone,
          },
        },
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
              {t.auth.verifyEmail}
            </h2>
            <p className="text-navy-600 text-sm leading-relaxed">
              {t.auth.verifyEmailSent}
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
    <div className="min-h-screen flex items-center justify-center bg-navy-50/30 px-4 py-20 pt-24">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl gradient-navy flex items-center justify-center text-white font-bold text-xl shadow-sm">
              SP
            </div>
          </Link>
          <h1 className="font-heading text-2xl font-bold text-navy-900 mt-4">
            {t.auth.register}
          </h1>
        </div>

        <div className="card p-8">
          <form onSubmit={handleRegister} className="space-y-5">
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-navy-900 mb-2">
                  {t.auth.firstName}
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-navy-400" />
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-navy-200 text-navy-900 focus:border-navy-500 focus:ring-0 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-navy-900 mb-2">
                  {t.auth.lastName}
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl border-2 border-navy-200 text-navy-900 focus:border-navy-500 focus:ring-0 outline-none"
                />
              </div>
            </div>

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

            <div>
              <label className="block text-sm font-semibold text-navy-900 mb-2">
                {t.auth.phone}
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-navy-400" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-navy-200 text-navy-900 focus:border-navy-500 focus:ring-0 outline-none"
                  placeholder="+41 79 000 00 00"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-navy-900 mb-2">
                {t.auth.password}
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
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  {t.common.loading}
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <UserPlus className="w-5 h-5" />
                  {t.auth.register}
                </span>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-navy-600">
              {t.auth.hasAccount}{' '}
              <Link href="/auth/login" className="font-semibold text-navy-900 hover:text-gold-600 transition-colors">
                {t.auth.login}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
