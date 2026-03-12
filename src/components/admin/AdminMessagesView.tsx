'use client'

import { useState, useEffect, useCallback } from 'react'
import { useI18n } from '@/lib/i18n/context'
import { createClient } from '@/lib/supabase/client'
import type { Profile, PortalMessage, PortalConversation } from '@/lib/types/portal'
import { MessageThread } from '@/components/portal/MessageThread'
import {
  MessageCircle, Archive, ArchiveRestore, Lock, Unlock,
  Search, Mail, MailOpen, Loader2, Plus, X, Users,
} from 'lucide-react'

type Filter = 'all' | 'unread' | 'archived' | 'closed'

interface ConversationRow {
  conversation: PortalConversation
  profile: Profile
  lastMessage: PortalMessage | null
  unreadCount: number
}

export function AdminMessagesView() {
  const { t } = useI18n()
  const [conversations, setConversations] = useState<ConversationRow[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<Filter>('all')
  const [search, setSearch] = useState('')
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null)
  const [adminUser, setAdminUser] = useState<{ id: string; name: string } | null>(null)
  const [showNewChat, setShowNewChat] = useState(false)
  const [allClients, setAllClients] = useState<Profile[]>([])
  const [newChatSearch, setNewChatSearch] = useState('')

  // Fetch admin info
  useEffect(() => {
    const fetchAdmin = async () => {
      const supabase = createClient()
      if (!supabase) return
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: adminProfile } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('id', user.id)
        .single()
      if (adminProfile) {
        setAdminUser({ id: user.id, name: `${adminProfile.first_name} ${adminProfile.last_name}` })
      }
    }
    fetchAdmin()
  }, [])

  const fetchConversations = useCallback(async () => {
    const supabase = createClient()
    if (!supabase) return

    // Fetch all conversations
    const { data: convos } = await supabase
      .from('portal_conversations')
      .select('*')
      .order('last_message_at', { ascending: false })

    if (!convos) { setLoading(false); return }

    const typedConvos = convos as PortalConversation[]

    // Fetch profiles for all clients in conversations
    const clientIds = typedConvos.map((c) => c.client_id)
    const { data: profiles } = await supabase
      .from('profiles')
      .select('*')
      .in('id', clientIds.length > 0 ? clientIds : ['00000000-0000-0000-0000-000000000000'])

    const profileMap = new Map<string, Profile>()
    if (profiles) {
      for (const p of profiles as Profile[]) {
        profileMap.set(p.id, p)
      }
    }

    // Fetch last message + unread count for each conversation
    const rows: ConversationRow[] = []
    for (const convo of typedConvos) {
      const profile = profileMap.get(convo.client_id)
      if (!profile) continue

      const { data: lastMsgData } = await supabase
        .from('portal_messages')
        .select('*')
        .eq('client_id', convo.client_id)
        .order('created_at', { ascending: false })
        .limit(1)

      const { count } = await supabase
        .from('portal_messages')
        .select('*', { count: 'exact', head: true })
        .eq('client_id', convo.client_id)
        .eq('sender_role', 'client')
        .is('read_at', null)

      rows.push({
        conversation: convo,
        profile,
        lastMessage: lastMsgData?.[0] as PortalMessage | null ?? null,
        unreadCount: count ?? 0,
      })
    }

    setConversations(rows)
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchConversations()
  }, [fetchConversations])

  // Realtime: refresh on new messages
  useEffect(() => {
    const supabase = createClient()
    if (!supabase) return

    const channel = supabase
      .channel('admin-conversations')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'portal_messages' },
        () => { fetchConversations() }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [fetchConversations])

  const handleToggleArchive = async (convo: PortalConversation) => {
    const supabase = createClient()
    if (!supabase) return
    await supabase
      .from('portal_conversations')
      .update({ archived: !convo.archived })
      .eq('id', convo.id)
    fetchConversations()
  }

  const handleToggleStatus = async (convo: PortalConversation) => {
    const supabase = createClient()
    if (!supabase) return
    await supabase
      .from('portal_conversations')
      .update({ status: convo.status === 'open' ? 'closed' : 'open' })
      .eq('id', convo.id)
    fetchConversations()
  }

  const handleMarkReadUnread = async (clientId: string, markAsUnread: boolean) => {
    const supabase = createClient()
    if (!supabase) return
    if (markAsUnread) {
      // Set the latest client message as unread
      const { data: lastMsg } = await supabase
        .from('portal_messages')
        .select('id')
        .eq('client_id', clientId)
        .eq('sender_role', 'client')
        .order('created_at', { ascending: false })
        .limit(1)
      if (lastMsg?.[0]) {
        await supabase
          .from('portal_messages')
          .update({ read_at: null })
          .eq('id', lastMsg[0].id)
      }
    } else {
      await supabase
        .from('portal_messages')
        .update({ read_at: new Date().toISOString() })
        .eq('client_id', clientId)
        .eq('sender_role', 'client')
        .is('read_at', null)
    }
    fetchConversations()
  }

  const handleNewChat = async (clientId: string) => {
    const supabase = createClient()
    if (!supabase) return
    // Create conversation if not exists
    await supabase
      .from('portal_conversations')
      .upsert({ client_id: clientId, status: 'open', archived: false }, { onConflict: 'client_id' })
    setShowNewChat(false)
    setNewChatSearch('')
    await fetchConversations()
    setSelectedClientId(clientId)
  }

  // Fetch all clients for "new chat" modal
  useEffect(() => {
    if (!showNewChat) return
    const fetch = async () => {
      const supabase = createClient()
      if (!supabase) return
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'client')
        .order('last_name', { ascending: true })
      if (data) setAllClients(data as Profile[])
    }
    fetch()
  }, [showNewChat])

  // Filter conversations
  const filtered = conversations.filter((row) => {
    if (filter === 'unread' && row.unreadCount === 0) return false
    if (filter === 'archived' && !row.conversation.archived) return false
    if (filter === 'closed' && row.conversation.status !== 'closed') return false
    if (filter === 'all' && row.conversation.archived) return false
    if (search) {
      const name = `${row.profile.first_name} ${row.profile.last_name}`.toLowerCase()
      if (!name.includes(search.toLowerCase())) return false
    }
    return true
  })

  const selectedRow = conversations.find((r) => r.profile.id === selectedClientId)

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const isToday = date.toDateString() === now.toDateString()
    const yesterday = new Date(now)
    yesterday.setDate(yesterday.getDate() - 1)
    const isYesterday = date.toDateString() === yesterday.toDateString()
    if (isToday) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    if (isYesterday) return t.dashboard.messages.yesterday || 'Gestern'
    return date.toLocaleDateString()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-navy-400" />
      </div>
    )
  }

  return (
    <div className="card overflow-hidden" style={{ height: 'calc(100vh - 220px)', minHeight: '500px' }}>
      <div className="flex h-full">
        {/* Left panel — conversation list */}
        <div className={`${selectedClientId ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-[380px] border-r border-navy-100`}>
          {/* Header */}
          <div className="p-4 border-b border-navy-100">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-heading text-lg font-bold text-navy-900">
                {t.admin.messaging.title}
              </h2>
              <button
                onClick={() => setShowNewChat(true)}
                className="btn-primary !rounded-lg !p-2 !text-xs"
                title={t.admin.messaging.newChat}
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            {/* Search */}
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t.admin.clients.search}
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-navy-200 text-sm focus:border-navy-500 outline-none"
              />
            </div>
            {/* Filter tabs */}
            <div className="flex gap-1">
              {(['all', 'unread', 'archived', 'closed'] as Filter[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    filter === f
                      ? 'bg-navy-800 text-white'
                      : 'bg-navy-50 text-navy-600 hover:bg-navy-100'
                  }`}
                >
                  {t.admin.messaging.filters[f]}
                </button>
              ))}
            </div>
          </div>

          {/* Conversation list */}
          <div className="flex-1 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-navy-400 p-6">
                <MessageCircle className="w-8 h-8 mb-2" />
                <p className="text-sm">{t.admin.messaging.noConversations}</p>
              </div>
            ) : (
              filtered.map((row) => (
                <button
                  key={row.profile.id}
                  onClick={() => setSelectedClientId(row.profile.id)}
                  className={`w-full text-left p-4 border-b border-navy-50 hover:bg-navy-50/50 transition-all ${
                    selectedClientId === row.profile.id ? 'bg-navy-50' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full bg-navy-200 flex items-center justify-center shrink-0">
                      <span className="text-sm font-bold text-navy-600">
                        {row.profile.first_name[0]}{row.profile.last_name[0]}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className={`text-sm ${row.unreadCount > 0 ? 'font-bold text-navy-900' : 'font-medium text-navy-800'}`}>
                          {row.profile.first_name} {row.profile.last_name}
                        </span>
                        <span className="text-[11px] text-navy-400 shrink-0 ml-2">
                          {row.lastMessage ? formatTime(row.lastMessage.created_at) : ''}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-0.5">
                        <p className={`text-xs truncate pr-2 ${row.unreadCount > 0 ? 'text-navy-700 font-medium' : 'text-navy-500'}`}>
                          {row.lastMessage
                            ? `${row.lastMessage.sender_role === 'admin' ? (t.dashboard.messages.you || 'Sie') + ': ' : ''}${row.lastMessage.body}`
                            : t.dashboard.messages.noMessages}
                        </p>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {row.conversation.status === 'closed' && (
                            <Lock className="w-3 h-3 text-navy-400" />
                          )}
                          {row.conversation.archived && (
                            <Archive className="w-3 h-3 text-navy-400" />
                          )}
                          {row.unreadCount > 0 && (
                            <span className="inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold rounded-full bg-gold-500 text-white">
                              {row.unreadCount > 9 ? '9+' : row.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Right panel — chat */}
        <div className={`${selectedClientId ? 'flex' : 'hidden md:flex'} flex-col flex-1`}>
          {selectedRow && adminUser ? (
            <>
              {/* Chat header */}
              <div className="p-4 border-b border-navy-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* Back button on mobile */}
                  <button
                    onClick={() => setSelectedClientId(null)}
                    className="md:hidden text-navy-500 hover:text-navy-800"
                  >
                    <X className="w-5 h-5" />
                  </button>
                  <div className="w-9 h-9 rounded-full bg-navy-200 flex items-center justify-center">
                    <span className="text-sm font-bold text-navy-600">
                      {selectedRow.profile.first_name[0]}{selectedRow.profile.last_name[0]}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-navy-900">
                      {selectedRow.profile.first_name} {selectedRow.profile.last_name}
                    </p>
                    <p className="text-[11px] text-navy-500">{selectedRow.profile.email}</p>
                  </div>
                </div>
                {/* Actions */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleMarkReadUnread(selectedRow.profile.id, selectedRow.unreadCount === 0)}
                    className="p-2 rounded-lg hover:bg-navy-50 text-navy-500 hover:text-navy-800 transition-colors"
                    title={selectedRow.unreadCount > 0 ? t.admin.messaging.markRead : t.admin.messaging.markUnread}
                  >
                    {selectedRow.unreadCount > 0 ? <MailOpen className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => handleToggleArchive(selectedRow.conversation)}
                    className="p-2 rounded-lg hover:bg-navy-50 text-navy-500 hover:text-navy-800 transition-colors"
                    title={selectedRow.conversation.archived ? t.admin.messaging.unarchive : t.admin.messaging.archive}
                  >
                    {selectedRow.conversation.archived ? <ArchiveRestore className="w-4 h-4" /> : <Archive className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => handleToggleStatus(selectedRow.conversation)}
                    className="p-2 rounded-lg hover:bg-navy-50 text-navy-500 hover:text-navy-800 transition-colors"
                    title={selectedRow.conversation.status === 'open' ? t.admin.messaging.close : t.admin.messaging.reopen}
                  >
                    {selectedRow.conversation.status === 'open' ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              {/* Thread */}
              <div className="flex-1 overflow-hidden">
                <MessageThread
                  clientId={selectedRow.profile.id}
                  currentUserId={adminUser.id}
                  currentUserRole="admin"
                  currentUserName={adminUser.name}
                  otherPartyName={`${selectedRow.profile.first_name} ${selectedRow.profile.last_name}`}
                  embedded
                />
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-navy-400">
              <MessageCircle className="w-12 h-12 mb-3" />
              <p className="text-sm font-medium">{t.admin.messaging.selectConversation}</p>
            </div>
          )}
        </div>
      </div>

      {/* New chat modal */}
      {showNewChat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4">
            <div className="p-4 border-b border-navy-100 flex items-center justify-between">
              <h3 className="font-semibold text-navy-900">{t.admin.messaging.newChat}</h3>
              <button onClick={() => { setShowNewChat(false); setNewChatSearch('') }} className="text-navy-400 hover:text-navy-800">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4">
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400" />
                <input
                  type="text"
                  value={newChatSearch}
                  onChange={(e) => setNewChatSearch(e.target.value)}
                  placeholder={t.admin.clients.search}
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-navy-200 text-sm focus:border-navy-500 outline-none"
                  autoFocus
                />
              </div>
              <div className="max-h-64 overflow-y-auto space-y-1">
                {allClients
                  .filter((c) => {
                    if (!newChatSearch) return true
                    const name = `${c.first_name} ${c.last_name} ${c.email}`.toLowerCase()
                    return name.includes(newChatSearch.toLowerCase())
                  })
                  .map((client) => {
                    const existing = conversations.find((r) => r.profile.id === client.id)
                    return (
                      <button
                        key={client.id}
                        onClick={() => handleNewChat(client.id)}
                        className="w-full text-left p-3 rounded-lg hover:bg-navy-50 flex items-center gap-3 transition-colors"
                      >
                        <div className="w-8 h-8 rounded-full bg-navy-200 flex items-center justify-center shrink-0">
                          <span className="text-xs font-bold text-navy-600">
                            {client.first_name[0]}{client.last_name[0]}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-navy-900 truncate">
                            {client.first_name} {client.last_name}
                          </p>
                          <p className="text-xs text-navy-500 truncate">{client.email}</p>
                        </div>
                        {existing && (
                          <span className="text-[10px] text-navy-400 bg-navy-50 px-2 py-0.5 rounded-full">
                            {t.admin.messaging.existing}
                          </span>
                        )}
                      </button>
                    )
                  })}
                {allClients.length === 0 && (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-5 h-5 animate-spin text-navy-400" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
