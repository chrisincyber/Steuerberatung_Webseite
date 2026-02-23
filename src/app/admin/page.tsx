'use client'

import { useState } from 'react'
import { useI18n } from '@/lib/i18n/context'
import {
  Users,
  FileText,
  DollarSign,
  TrendingUp,
  Search,
  Download,
  Upload,
  Send,
  MessageSquare,
  Bell,
  Gift,
  Eye,
  Flag,
  StickyNote,
  X,
  CheckCircle,
  Clock,
  BarChart3,
} from 'lucide-react'

type ClientStatus = 'documents_outstanding' | 'in_progress' | 'review' | 'completed'
type AdminTab = 'overview' | 'clients' | 'messages' | 'notifications' | 'referrals'

interface Client {
  id: string
  name: string
  email: string
  phone: string
  status: ClientStatus
  year: number
  tier: string
  paid: boolean
  notes: string[]
  flagged: boolean
  created_at: string
}

export default function AdminPage() {
  const { t, locale } = useI18n()
  const [activeTab, setActiveTab] = useState<AdminTab>('overview')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [newNote, setNewNote] = useState('')
  const [bulkMessage, setBulkMessage] = useState('')
  const [bulkChannel, setBulkChannel] = useState<'email' | 'sms' | 'both'>('email')

  // Demo data
  const [clients, setClients] = useState<Client[]>([
    {
      id: '1', name: 'Sarah Müller', email: 'sarah@example.com', phone: '+41791234567',
      status: 'in_progress', year: 2025, tier: 'Standard', paid: true, notes: [], flagged: false,
      created_at: '2025-01-15',
    },
    {
      id: '2', name: 'Thomas Keller', email: 'thomas@example.com', phone: '+41791234568',
      status: 'documents_outstanding', year: 2025, tier: 'Basic', paid: false, notes: [], flagged: false,
      created_at: '2025-02-01',
    },
    {
      id: '3', name: 'Laura Brunner', email: 'laura@example.com', phone: '+41791234569',
      status: 'completed', year: 2025, tier: 'Premium', paid: true, notes: ['VIP Kundin'], flagged: false,
      created_at: '2024-12-20',
    },
    {
      id: '4', name: 'Marco Rossi', email: 'marco@example.com', phone: '+41791234570',
      status: 'review', year: 2025, tier: 'Standard', paid: true, notes: [], flagged: true,
      created_at: '2025-01-28',
    },
  ])

  const filteredClients = clients.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const statusLabels: Record<ClientStatus, string> = {
    documents_outstanding: t.dashboard.status.documentsOutstanding,
    in_progress: t.dashboard.status.inProgress,
    review: t.dashboard.status.review,
    completed: t.dashboard.status.completed,
  }

  const statusColors: Record<ClientStatus, string> = {
    documents_outstanding: 'bg-gold-100 text-gold-700',
    in_progress: 'bg-blue-100 text-blue-700',
    review: 'bg-purple-100 text-purple-700',
    completed: 'bg-trust-100 text-trust-700',
  }

  const updateClientStatus = (clientId: string, newStatus: ClientStatus) => {
    setClients(prev => prev.map(c =>
      c.id === clientId ? { ...c, status: newStatus } : c
    ))
  }

  const addNote = (clientId: string) => {
    if (!newNote.trim()) return
    setClients(prev => prev.map(c =>
      c.id === clientId ? { ...c, notes: [...c.notes, newNote] } : c
    ))
    setNewNote('')
  }

  const toggleFlag = (clientId: string) => {
    setClients(prev => prev.map(c =>
      c.id === clientId ? { ...c, flagged: !c.flagged } : c
    ))
  }

  // Analytics
  const totalRevenue = clients.filter(c => c.paid).reduce((sum, c) => {
    const prices: Record<string, number> = { Basic: 99, Standard: 149, Premium: 224 }
    return sum + (prices[c.tier] || 0)
  }, 0)
  const completedCount = clients.filter(c => c.status === 'completed').length
  const activeCount = clients.filter(c => c.status !== 'completed').length

  const tabs = [
    { key: 'overview' as const, label: t.admin.analytics.title, icon: BarChart3 },
    { key: 'clients' as const, label: t.admin.clients.title, icon: Users },
    { key: 'messages' as const, label: t.dashboard.messages.title, icon: MessageSquare },
    { key: 'notifications' as const, label: t.admin.notifications.title, icon: Bell },
    { key: 'referrals' as const, label: t.admin.referrals.title, icon: Gift },
  ]

  return (
    <div className="min-h-screen bg-navy-50/30 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-heading text-3xl font-bold text-navy-900">{t.admin.title}</h1>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === tab.key
                  ? 'bg-navy-800 text-white shadow-sm'
                  : 'bg-white text-navy-600 hover:bg-navy-100 border border-navy-100'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="card p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-trust-100 flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-trust-600" />
                  </div>
                  <span className="text-sm font-medium text-navy-600">{t.admin.analytics.revenue}</span>
                </div>
                <div className="text-3xl font-bold text-navy-900">CHF {totalRevenue.toLocaleString('de-CH')}</div>
                <p className="text-xs text-navy-500 mt-1">{t.admin.analytics.thisYear}</p>
              </div>

              <div className="card p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <span className="text-sm font-medium text-navy-600">{t.admin.analytics.completedDeclarations}</span>
                </div>
                <div className="text-3xl font-bold text-navy-900">{completedCount}</div>
                <p className="text-xs text-navy-500 mt-1">{t.admin.analytics.thisYear}</p>
              </div>

              <div className="card p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-gold-100 flex items-center justify-center">
                    <Users className="w-5 h-5 text-gold-600" />
                  </div>
                  <span className="text-sm font-medium text-navy-600">{t.admin.analytics.activeClients}</span>
                </div>
                <div className="text-3xl font-bold text-navy-900">{activeCount}</div>
              </div>

              <div className="card p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-purple-600" />
                  </div>
                  <span className="text-sm font-medium text-navy-600">{t.admin.analytics.revenue}</span>
                </div>
                <div className="text-3xl font-bold text-navy-900">CHF {Math.round(totalRevenue / 12).toLocaleString('de-CH')}</div>
                <p className="text-xs text-navy-500 mt-1">{t.admin.analytics.thisMonth}</p>
              </div>
            </div>

            {/* Status distribution */}
            <div className="card p-6">
              <h3 className="font-heading font-bold text-navy-900 mb-4">
                {locale === 'de' ? 'Status-Verteilung' : 'Status Distribution'}
              </h3>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {(Object.entries(statusLabels) as [ClientStatus, string][]).map(([key, label]) => {
                  const count = clients.filter(c => c.status === key).length
                  return (
                    <div key={key} className="p-4 bg-navy-50 rounded-xl text-center">
                      <div className="text-2xl font-bold text-navy-900">{count}</div>
                      <div className="text-xs text-navy-600 mt-1">{label}</div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* Clients Tab */}
        {activeTab === 'clients' && (
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-navy-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.admin.clients.search}
                className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-navy-200 text-navy-900 focus:border-navy-500 focus:ring-0 outline-none bg-white"
              />
            </div>

            {/* Client list */}
            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-navy-100 bg-navy-50/50">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-navy-600 uppercase">
                        {locale === 'de' ? 'Kunde' : 'Client'}
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-navy-600 uppercase">Status</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-navy-600 uppercase">
                        {locale === 'de' ? 'Paket' : 'Tier'}
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-navy-600 uppercase">
                        {locale === 'de' ? 'Zahlung' : 'Payment'}
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-navy-600 uppercase">
                        {locale === 'de' ? 'Aktionen' : 'Actions'}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredClients.map((client) => (
                      <tr key={client.id} className="border-b border-navy-50 hover:bg-navy-50/30">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            {client.flagged && <Flag className="w-4 h-4 text-red-500" />}
                            <div>
                              <div className="text-sm font-semibold text-navy-900">{client.name}</div>
                              <div className="text-xs text-navy-500">{client.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <select
                            value={client.status}
                            onChange={(e) => updateClientStatus(client.id, e.target.value as ClientStatus)}
                            className={`text-xs font-medium rounded-full px-3 py-1 border-0 cursor-pointer ${statusColors[client.status]}`}
                          >
                            {(Object.entries(statusLabels) as [ClientStatus, string][]).map(([key, label]) => (
                              <option key={key} value={key}>{label}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-3 text-sm text-navy-700">{client.tier}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 text-xs font-medium ${
                            client.paid ? 'text-trust-600' : 'text-gold-600'
                          }`}>
                            {client.paid ? <CheckCircle className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                            {client.paid ? t.dashboard.payments.paid : t.dashboard.payments.pending}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => setSelectedClient(client)}
                              className="p-1.5 rounded-lg hover:bg-navy-100 text-navy-500 hover:text-navy-700"
                              title={locale === 'de' ? 'Details' : 'Details'}
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => toggleFlag(client.id)}
                              className={`p-1.5 rounded-lg hover:bg-navy-100 ${
                                client.flagged ? 'text-red-500' : 'text-navy-500 hover:text-navy-700'
                              }`}
                              title={t.admin.clients.flagIssue}
                            >
                              <Flag className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Client detail modal */}
            {selectedClient && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-900/50">
                <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto">
                  <div className="flex items-center justify-between p-6 border-b border-navy-100">
                    <h3 className="font-heading font-bold text-navy-900">{selectedClient.name}</h3>
                    <button onClick={() => setSelectedClient(null)} className="text-navy-400 hover:text-navy-600">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="p-6 space-y-6">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-navy-500">Email:</span>
                        <p className="font-medium text-navy-900">{selectedClient.email}</p>
                      </div>
                      <div>
                        <span className="text-navy-500">{locale === 'de' ? 'Telefon' : 'Phone'}:</span>
                        <p className="font-medium text-navy-900">{selectedClient.phone}</p>
                      </div>
                      <div>
                        <span className="text-navy-500">{locale === 'de' ? 'Paket' : 'Tier'}:</span>
                        <p className="font-medium text-navy-900">{selectedClient.tier}</p>
                      </div>
                      <div>
                        <span className="text-navy-500">{locale === 'de' ? 'Jahr' : 'Year'}:</span>
                        <p className="font-medium text-navy-900">{selectedClient.year}</p>
                      </div>
                    </div>

                    {/* Documents section */}
                    <div>
                      <h4 className="font-semibold text-navy-900 mb-2">{t.dashboard.documents.title}</h4>
                      <div className="flex gap-2">
                        <button className="btn-secondary !py-2 !px-3 !text-xs">
                          <Download className="w-3.5 h-3.5 mr-1" />
                          {locale === 'de' ? 'Dokumente' : 'Documents'}
                        </button>
                        <button className="btn-secondary !py-2 !px-3 !text-xs">
                          <Upload className="w-3.5 h-3.5 mr-1" />
                          {locale === 'de' ? 'Hochladen' : 'Upload'}
                        </button>
                      </div>
                    </div>

                    {/* Notes */}
                    <div>
                      <h4 className="font-semibold text-navy-900 mb-2">
                        {locale === 'de' ? 'Notizen' : 'Notes'}
                      </h4>
                      {selectedClient.notes.map((note, i) => (
                        <div key={i} className="flex items-start gap-2 mb-2 p-2 bg-navy-50 rounded-lg">
                          <StickyNote className="w-4 h-4 text-navy-400 mt-0.5 shrink-0" />
                          <span className="text-sm text-navy-700">{note}</span>
                        </div>
                      ))}
                      <div className="flex gap-2 mt-2">
                        <input
                          type="text"
                          value={newNote}
                          onChange={(e) => setNewNote(e.target.value)}
                          placeholder={t.admin.clients.addNote}
                          className="flex-1 px-3 py-2 rounded-lg border border-navy-200 text-sm focus:border-navy-500 outline-none"
                        />
                        <button
                          onClick={() => addNote(selectedClient.id)}
                          className="btn-primary !py-2 !px-3 !text-xs"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Messages Tab */}
        {activeTab === 'messages' && (
          <div className="card p-8">
            <h2 className="font-heading text-xl font-bold text-navy-900 mb-4">
              {locale === 'de' ? 'Nachrichten-Posteingang' : 'Message Inbox'}
            </h2>
            <div className="space-y-3">
              {clients.map(client => (
                <div
                  key={client.id}
                  className="flex items-center justify-between p-4 bg-navy-50 rounded-xl hover:bg-navy-100 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-navy-200 flex items-center justify-center">
                      <span className="text-sm font-bold text-navy-700">
                        {client.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-navy-900">{client.name}</div>
                      <div className="text-xs text-navy-500">
                        {locale === 'de' ? 'Keine neuen Nachrichten' : 'No new messages'}
                      </div>
                    </div>
                  </div>
                  <MessageSquare className="w-4 h-4 text-navy-400" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div className="space-y-6">
            <div className="card p-8">
              <h2 className="font-heading text-xl font-bold text-navy-900 mb-4">
                {t.admin.notifications.sendBulk}
              </h2>
              <div className="space-y-4">
                <div className="flex gap-3">
                  {(['email', 'sms', 'both'] as const).map(channel => (
                    <button
                      key={channel}
                      onClick={() => setBulkChannel(channel)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium border-2 transition-all ${
                        bulkChannel === channel
                          ? 'border-navy-800 bg-navy-800 text-white'
                          : 'border-navy-200 text-navy-700 hover:border-navy-400'
                      }`}
                    >
                      {channel === 'email' ? 'Email' : channel === 'sms' ? 'SMS' : locale === 'de' ? 'Beide' : 'Both'}
                    </button>
                  ))}
                </div>
                <textarea
                  value={bulkMessage}
                  onChange={(e) => setBulkMessage(e.target.value)}
                  rows={4}
                  placeholder={locale === 'de' ? 'Nachricht eingeben...' : 'Enter message...'}
                  className="w-full px-4 py-3 rounded-xl border-2 border-navy-200 text-navy-900 focus:border-navy-500 focus:ring-0 outline-none resize-none"
                />
                <button className="btn-primary" disabled={!bulkMessage.trim()}>
                  <Send className="w-4 h-4 mr-2" />
                  {t.admin.notifications.sendBulk}
                </button>
              </div>
            </div>

            {/* Notification templates */}
            <div className="card p-8">
              <h3 className="font-heading font-bold text-navy-900 mb-4">
                {locale === 'de' ? 'Vorlagen' : 'Templates'}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {[
                  locale === 'de' ? 'Willkommen' : 'Welcome',
                  locale === 'de' ? 'Dokumente erhalten' : 'Documents Received',
                  locale === 'de' ? 'In Bearbeitung' : 'In Progress',
                  locale === 'de' ? 'Erklärung fertig' : 'Declaration Complete',
                  locale === 'de' ? 'Zahlungserinnerung' : 'Payment Reminder',
                  locale === 'de' ? 'Fristen-Erinnerung' : 'Deadline Reminder',
                ].map((template) => (
                  <button
                    key={template}
                    className="p-3 bg-navy-50 rounded-xl text-sm text-left text-navy-700 hover:bg-navy-100 transition-colors"
                  >
                    <Bell className="w-4 h-4 text-navy-400 mb-1" />
                    {template}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Referrals Tab */}
        {activeTab === 'referrals' && (
          <div className="card p-8">
            <h2 className="font-heading text-xl font-bold text-navy-900 mb-4">
              {t.admin.referrals.title}
            </h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-navy-50 rounded-xl">
                <div>
                  <div className="text-sm font-semibold text-navy-900">FREUND20</div>
                  <div className="text-xs text-navy-500">CHF 20 {locale === 'de' ? 'Rabatt' : 'Discount'}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-navy-900">
                    12x {locale === 'de' ? 'verwendet' : 'used'}
                  </div>
                  <span className="text-xs text-trust-600">{locale === 'de' ? 'Aktiv' : 'Active'}</span>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-navy-50 rounded-xl">
                <div>
                  <div className="text-sm font-semibold text-navy-900">NEUKUNDE</div>
                  <div className="text-xs text-navy-500">CHF 15 {locale === 'de' ? 'Rabatt' : 'Discount'}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-navy-900">
                    8x {locale === 'de' ? 'verwendet' : 'used'}
                  </div>
                  <span className="text-xs text-trust-600">{locale === 'de' ? 'Aktiv' : 'Active'}</span>
                </div>
              </div>
            </div>
            <button className="btn-secondary mt-4">
              + {locale === 'de' ? 'Neuen Code erstellen' : 'Create New Code'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
