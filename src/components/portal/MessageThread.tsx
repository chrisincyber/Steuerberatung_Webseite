'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useI18n } from '@/lib/i18n/context'
import { createClient } from '@/lib/supabase/client'
import type { PortalMessage } from '@/lib/types/portal'
import { Send, MessageCircle, Loader2 } from 'lucide-react'

interface MessageThreadProps {
  clientId: string
  currentUserId: string
  currentUserRole: 'client' | 'admin'
  currentUserName: string
  otherPartyName: string
  embedded?: boolean
}

export function MessageThread({
  clientId,
  currentUserId,
  currentUserRole,
  currentUserName,
  otherPartyName,
  embedded = false,
}: MessageThreadProps) {
  const { t } = useI18n()
  const [messages, setMessages] = useState<PortalMessage[]>([])
  const [body, setBody] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  // Mark unread messages from the other party as read
  const markAsRead = useCallback(async () => {
    const supabase = createClient()
    if (!supabase) return

    const otherRole = currentUserRole === 'client' ? 'admin' : 'client'
    await supabase
      .from('portal_messages')
      .update({ read_at: new Date().toISOString() })
      .eq('client_id', clientId)
      .eq('sender_role', otherRole)
      .is('read_at', null)
  }, [clientId, currentUserRole])

  // Fetch messages
  useEffect(() => {
    const supabase = createClient()
    if (!supabase) return

    const fetchMessages = async () => {
      const { data } = await supabase
        .from('portal_messages')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: true })

      if (data) {
        setMessages(data as PortalMessage[])
      }
      setLoading(false)
      markAsRead()
    }

    fetchMessages()

    // Realtime subscription
    const channel = supabase
      .channel(`messages-${clientId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'portal_messages',
          filter: `client_id=eq.${clientId}`,
        },
        (payload) => {
          const newMsg = payload.new as PortalMessage
          setMessages((prev) => {
            if (prev.some((m) => m.id === newMsg.id)) return prev
            return [...prev, newMsg]
          })
          // Mark as read if from other party
          if (newMsg.sender_role !== currentUserRole) {
            markAsRead()
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [clientId, currentUserRole, markAsRead])

  // Auto-scroll on new messages
  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  const handleSend = async () => {
    const trimmed = body.trim()
    if (!trimmed || sending) return

    setSending(true)
    const supabase = createClient()
    if (!supabase) { setSending(false); return }

    await supabase.from('portal_messages').insert({
      client_id: clientId,
      sender_id: currentUserId,
      sender_role: currentUserRole,
      body: trimmed,
    })

    setBody('')
    setSending(false)
  }

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const isToday = date.toDateString() === now.toDateString()

    const yesterday = new Date(now)
    yesterday.setDate(yesterday.getDate() - 1)
    const isYesterday = date.toDateString() === yesterday.toDateString()

    const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

    if (isToday) return `${t.dashboard.messages.today || 'Heute'}, ${time}`
    if (isYesterday) return `${t.dashboard.messages.yesterday || 'Gestern'}, ${time}`
    return `${date.toLocaleDateString()}, ${time}`
  }

  const getSenderName = (msg: PortalMessage) => {
    if (msg.sender_id === currentUserId) return t.dashboard.messages.you || 'Sie'
    return otherPartyName
  }

  if (loading) {
    return (
      <div className={`${embedded ? '' : 'card h-[500px]'} flex items-center justify-center`}>
        <Loader2 className="w-6 h-6 animate-spin text-navy-400" />
      </div>
    )
  }

  return (
    <div className={`${embedded ? 'h-full' : 'card h-[500px]'} flex flex-col`}>
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-navy-400">
            <MessageCircle className="w-10 h-10 mb-3" />
            <p className="text-sm">{t.dashboard.messages.noMessages}</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isSelf = msg.sender_id === currentUserId
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isSelf ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                    isSelf
                      ? 'bg-navy-800 text-white'
                      : 'bg-navy-50 text-navy-900'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap break-words">{msg.body}</p>
                </div>
                <p className={`text-xs mt-1 ${isSelf ? 'text-navy-400' : 'text-navy-400'}`}>
                  {getSenderName(msg)} · {formatTime(msg.created_at)}
                </p>
              </div>
            )
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div className="border-t border-navy-100 p-3 flex gap-2">
        <input
          type="text"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
          placeholder={t.dashboard.messages.placeholder}
          maxLength={5000}
          className="flex-1 px-4 py-2.5 rounded-xl border border-navy-200 text-sm text-navy-900 focus:border-navy-500 outline-none"
        />
        <button
          onClick={handleSend}
          disabled={!body.trim() || sending}
          className="btn-primary !rounded-xl !p-2.5 disabled:opacity-50"
          title={t.dashboard.messages.send}
        >
          {sending ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </button>
      </div>
    </div>
  )
}
