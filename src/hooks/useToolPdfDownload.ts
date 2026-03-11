'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

type ToolType =
  | 'steuerrechner'
  | '3a-rechner'
  | 'quellensteuer'
  | 'checkliste'
  | 'steuervergleich'

interface UseToolPdfDownloadOptions {
  toolType: ToolType
  redirectPath: string
}

export function useToolPdfDownload({
  toolType,
  redirectPath,
}: UseToolPdfDownloadOptions) {
  const [user, setUser] = useState<User | null>(null)
  const [pdfLoading, setPdfLoading] = useState(false)
  const [showGuestModal, setShowGuestModal] = useState(false)
  const [guestSending, setGuestSending] = useState(false)
  const [guestSent, setGuestSent] = useState(false)
  const [guestError, setGuestError] = useState(false)
  const [pdfToast, setPdfToast] = useState<string | null>(null)

  // Check auth on mount
  useEffect(() => {
    const supabase = createClient()
    if (!supabase) return
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user))
  }, [])

  // Auto-hide toast
  useEffect(() => {
    if (!pdfToast) return
    const timer = setTimeout(() => setPdfToast(null), 4000)
    return () => clearTimeout(timer)
  }, [pdfToast])

  // Main download handler
  /* eslint-disable @typescript-eslint/no-explicit-any */
  const handleDownload = async (
    pdfData: any,
    formData?: any,
    resultData?: any,
    fileName?: string,
  /* eslint-enable @typescript-eslint/no-explicit-any */
  ) => {
    if (!user) {
      setShowGuestModal(true)
      setGuestSent(false)
      setGuestError(false)
      return
    }

    setPdfLoading(true)
    try {
      const res = await fetch('/api/tool-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toolType,
          pdfData,
          saveToAccount: true,
          formData,
          resultData,
        }),
      })
      if (!res.ok) throw new Error('PDF generation failed')

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = fileName || `${toolType}.pdf`
      a.click()
      URL.revokeObjectURL(url)
      setPdfToast(null)
      return true
    } catch {
      console.error('PDF download failed')
      return false
    } finally {
      setPdfLoading(false)
    }
  }

  // Guest email send handler
  const handleGuestSend = async (
    contactData: { fullName: string; email: string; phone: string },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    pdfData: any,
  ) => {
    setGuestSending(true)
    setGuestError(false)
    try {
      const res = await fetch('/api/tool-pdf/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...contactData,
          toolType,
          pdfData,
        }),
      })
      if (!res.ok) throw new Error()
      setGuestSent(true)
    } catch {
      setGuestError(true)
    } finally {
      setGuestSending(false)
    }
  }

  return {
    user,
    handleDownload,
    handleGuestSend,
    pdfLoading,
    pdfToast,
    setPdfToast,
    showGuestModal,
    setShowGuestModal,
    guestSending,
    guestSent,
    guestError,
    redirectPath,
  }
}
