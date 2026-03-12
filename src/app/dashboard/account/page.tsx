'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useI18n } from '@/lib/i18n/context'
import { createClient } from '@/lib/supabase/client'
import type { Profile, Zivilstand } from '@/lib/types/portal'
import { ArrowLeft, CheckCircle, AlertCircle, Loader2, User, Mail, Lock } from 'lucide-react'

const inputClass = 'w-full px-3 py-2 rounded-lg border-2 border-navy-200 text-navy-900 text-sm focus:border-navy-500 focus:ring-0 outline-none transition-colors'
const labelClass = 'block text-sm font-semibold text-navy-900 mb-1'
const disabledInputClass = 'w-full px-3 py-2 rounded-lg border-2 border-navy-100 bg-navy-50/50 text-navy-500 text-sm cursor-not-allowed'

function InlineStatus({ type, message }: { type: 'idle' | 'success' | 'error'; message?: string }) {
  if (type === 'idle') return null
  return (
    <span className={`flex items-center gap-1.5 text-sm ${type === 'success' ? 'text-trust-600' : 'text-red-600'}`}>
      {type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
      {message}
    </span>
  )
}

export default function AccountPage() {
  const { t } = useI18n()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchProfile = useCallback(async () => {
    const supabase = createClient()
    if (!supabase) return
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    if (data) setProfile(data as Profile)
    setLoading(false)
  }, [])

  useEffect(() => { fetchProfile() }, [fetchProfile])

  if (loading) {
    return (
      <div className="min-h-screen bg-navy-50/30 pt-20 flex items-center justify-center">
        <div className="text-navy-500">{t.common.loading}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-navy-50/30 pt-20">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-navy-600 hover:text-navy-900 mb-4">
          <ArrowLeft className="w-4 h-4" />
          {t.nav.dashboard}
        </Link>

        <h1 className="font-heading text-2xl font-bold text-navy-900 mb-1">{t.account.title}</h1>
        <p className="text-navy-600 text-sm mb-6">{t.account.subtitle}</p>

        <div className="space-y-4">
          <PersonalInfoSection profile={profile} onSaved={(p) => setProfile(p)} />
          <EmailSection profile={profile} />
          <PasswordSection />
        </div>
      </div>
    </div>
  )
}

function PersonalInfoSection({
  profile,
  onSaved,
}: {
  profile: Profile | null
  onSaved: (p: Profile) => void
}) {
  const { t } = useI18n()
  const [firstName, setFirstName] = useState(profile?.first_name || '')
  const [lastName, setLastName] = useState(profile?.last_name || '')
  const [birthday, setBirthday] = useState(profile?.birthday || '')
  const [zivilstand, setZivilstand] = useState<Zivilstand | ''>(profile?.zivilstand || '')
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')

  useEffect(() => {
    if (status === 'idle') return
    const timer = setTimeout(() => setStatus('idle'), 4000)
    return () => clearTimeout(timer)
  }, [status])

  const handleSave = async () => {
    setSaving(true)
    setStatus('idle')
    try {
      const supabase = createClient()
      if (!supabase || !profile) {
        setStatus('error')
        setSaving(false)
        return
      }

      const updatePayload: Record<string, unknown> = {
        first_name: firstName,
        last_name: lastName,
        birthday: birthday || null,
        zivilstand: zivilstand || null,
      }

      let { data, error } = await supabase
        .from('profiles')
        .update(updatePayload)
        .eq('id', profile.id)
        .select()
        .single()

      // Fallback: if zivilstand column doesn't exist yet, retry without it
      if (error && error.message?.includes('zivilstand')) {
        const { zivilstand: _, ...fallback } = updatePayload
        void _
        const res = await supabase.from('profiles').update(fallback).eq('id', profile.id).select().single()
        data = res.data
        error = res.error
      }

      if (error) throw error
      onSaved(data as Profile)
      setStatus('success')
    } catch (err) {
      console.error('Profile save error:', err)
      setStatus('error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="card p-5">
      <div className="flex items-center gap-2 mb-4">
        <User className="w-4 h-4 text-navy-600" />
        <h2 className="font-heading text-base font-bold text-navy-900">{t.account.personalInfo}</h2>
      </div>
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>{t.account.firstName}</label>
            <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>{t.account.lastName}</label>
            <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} className={inputClass} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>{t.account.birthday}</label>
            <input type="date" value={birthday} onChange={(e) => setBirthday(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>{t.account.zivilstand}</label>
            <select value={zivilstand} onChange={(e) => setZivilstand(e.target.value as Zivilstand | '')} className={inputClass}>
              <option value="">—</option>
              <option value="einzelperson">{t.account.einzelperson}</option>
              <option value="verheiratet">{t.account.verheiratet}</option>
            </select>
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 pt-1">
          <InlineStatus type={status} message={status === 'success' ? t.account.saved : t.account.savingError} />
          <button onClick={handleSave} disabled={saving} className="btn-primary !py-2 !px-5 text-sm flex items-center gap-2">
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            {t.common.save}
          </button>
        </div>
      </div>
    </div>
  )
}

function EmailSection({ profile }: { profile: Profile | null }) {
  const { t } = useI18n()
  const [newEmail, setNewEmail] = useState('')
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')

  useEffect(() => {
    if (status === 'idle') return
    const timer = setTimeout(() => setStatus('idle'), 4000)
    return () => clearTimeout(timer)
  }, [status])

  const handleChangeEmail = async () => {
    if (!newEmail.trim()) return
    setSaving(true)
    setStatus('idle')
    try {
      const supabase = createClient()
      if (!supabase) return
      const { error } = await supabase.auth.updateUser({ email: newEmail })
      if (error) throw error
      setNewEmail('')
      setStatus('success')
    } catch {
      setStatus('error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="card p-5">
      <div className="flex items-center gap-2 mb-4">
        <Mail className="w-4 h-4 text-navy-600" />
        <h2 className="font-heading text-base font-bold text-navy-900">{t.account.changeEmail}</h2>
      </div>
      <div className="space-y-3">
        <div>
          <label className={labelClass}>{t.auth.email}</label>
          <input type="email" value={profile?.email || ''} disabled className={disabledInputClass} />
        </div>
        <div>
          <label className={labelClass}>{t.account.newEmail}</label>
          <input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="neue@email.ch" className={inputClass} />
          <p className="text-xs text-navy-500 mt-1">{t.account.changeEmailDescription}</p>
        </div>
        <div className="flex items-center justify-end gap-3 pt-1">
          <InlineStatus type={status} message={status === 'success' ? t.account.emailSent : t.account.savingError} />
          <button onClick={handleChangeEmail} disabled={saving || !newEmail.trim()} className="btn-primary !py-2 !px-5 text-sm flex items-center gap-2 disabled:opacity-50">
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            {t.common.save}
          </button>
        </div>
      </div>
    </div>
  )
}

function PasswordSection() {
  const { t } = useI18n()
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState<{ type: 'idle' | 'success' | 'error'; message?: string }>({ type: 'idle' })

  useEffect(() => {
    if (status.type === 'idle') return
    const timer = setTimeout(() => setStatus({ type: 'idle' }), 4000)
    return () => clearTimeout(timer)
  }, [status])

  const handleChangePassword = async () => {
    if (newPassword.length < 6) {
      setStatus({ type: 'error', message: t.account.passwordTooShort })
      return
    }
    if (newPassword !== confirmPassword) {
      setStatus({ type: 'error', message: t.account.passwordMismatch })
      return
    }
    setSaving(true)
    setStatus({ type: 'idle' })
    try {
      const supabase = createClient()
      if (!supabase) return
      const { error } = await supabase.auth.updateUser({ password: newPassword })
      if (error) throw error
      setNewPassword('')
      setConfirmPassword('')
      setStatus({ type: 'success', message: t.account.passwordChanged })
    } catch {
      setStatus({ type: 'error', message: t.account.savingError })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="card p-5">
      <div className="flex items-center gap-2 mb-4">
        <Lock className="w-4 h-4 text-navy-600" />
        <h2 className="font-heading text-base font-bold text-navy-900">{t.account.changePassword}</h2>
      </div>
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>{t.account.newPassword}</label>
            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>{t.account.confirmPassword}</label>
            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className={inputClass} />
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 pt-1">
          <InlineStatus type={status.type} message={status.message} />
          <button onClick={handleChangePassword} disabled={saving || !newPassword} className="btn-primary !py-2 !px-5 text-sm flex items-center gap-2 disabled:opacity-50">
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            {t.common.save}
          </button>
        </div>
      </div>
    </div>
  )
}
