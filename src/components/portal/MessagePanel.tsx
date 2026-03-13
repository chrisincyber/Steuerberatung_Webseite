'use client'

import { useEffect } from 'react'
import { useI18n } from '@/lib/i18n/context'
import { MessageThread } from './MessageThread'
import { X } from 'lucide-react'

interface MessagePanelProps {
  clientId: string
  currentUserId: string
  currentUserName: string
  otherPartyName: string
  onClose: () => void
}

export function MessagePanel({ clientId, currentUserId, currentUserName, otherPartyName, onClose }: MessagePanelProps) {
  const { t } = useI18n()

  // Prevent body scroll when panel is open
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-navy-900/30" onClick={onClose} />

      {/* Slide-over panel */}
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md flex flex-col bg-white shadow-2xl animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-navy-100">
          <h2 className="font-heading text-lg font-bold text-navy-900">{t.yearDetail.tabs.messages}</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-navy-400 hover:bg-navy-50 hover:text-navy-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message thread */}
        <div className="flex-1 overflow-hidden">
          <MessageThread
            clientId={clientId}
            currentUserId={currentUserId}
            currentUserRole="client"
            currentUserName={currentUserName}
            otherPartyName={otherPartyName}
            embedded
          />
        </div>
      </div>
    </>
  )
}
