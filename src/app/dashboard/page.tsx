'use client'

import { useState, useEffect, useCallback } from 'react'
import { useI18n } from '@/lib/i18n/context'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import {
  FileText,
  Upload,
  MessageSquare,
  CreditCard,
  Bell,
  CheckCircle,
  Clock,
  Download,
  Send,
  Trash2,
} from 'lucide-react'

type DeclarationStatus = 'documents_outstanding' | 'in_progress' | 'review' | 'completed'

interface Declaration {
  id: string
  year: number
  status: DeclarationStatus
  created_at: string
}

interface Message {
  id: string
  content: string
  sender: 'client' | 'admin'
  created_at: string
}

interface UploadedFile {
  name: string
  size: number
  created_at: string
}

export default function DashboardPage() {
  const { t, locale } = useI18n()
  const [user, setUser] = useState<User | null>(null)
  const [activeTab, setActiveTab] = useState<'status' | 'documents' | 'messages' | 'payments' | 'notifications'>('status')

  // Demo data
  const [declaration] = useState<Declaration>({
    id: '1',
    year: 2025,
    status: 'documents_outstanding',
    created_at: new Date().toISOString(),
  })
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [emailNotif, setEmailNotif] = useState(true)
  const [smsNotif, setSmsNotif] = useState(false)
  const [dragActive, setDragActive] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user))
  }, [])

  const statusSteps: Array<{ key: DeclarationStatus; label: string }> = [
    { key: 'documents_outstanding', label: t.dashboard.status.documentsOutstanding },
    { key: 'in_progress', label: t.dashboard.status.inProgress },
    { key: 'review', label: t.dashboard.status.review },
    { key: 'completed', label: t.dashboard.status.completed },
  ]

  const currentStepIndex = statusSteps.findIndex(s => s.key === declaration.status)

  const handleFileDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
    const files = Array.from(e.dataTransfer.files)
    const newFiles: UploadedFile[] = files
      .filter(f => ['application/pdf', 'image/jpeg', 'image/png'].includes(f.type))
      .filter(f => f.size <= 10 * 1024 * 1024)
      .map(f => ({ name: f.name, size: f.size, created_at: new Date().toISOString() }))
    setUploadedFiles(prev => [...prev, ...newFiles])
  }, [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const newFiles: UploadedFile[] = files
      .filter(f => f.size <= 10 * 1024 * 1024)
      .map(f => ({ name: f.name, size: f.size, created_at: new Date().toISOString() }))
    setUploadedFiles(prev => [...prev, ...newFiles])
  }

  const handleSendMessage = () => {
    if (!newMessage.trim()) return
    setMessages(prev => [...prev, {
      id: String(Date.now()),
      content: newMessage,
      sender: 'client',
      created_at: new Date().toISOString(),
    }])
    setNewMessage('')
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const userName = user?.user_metadata?.first_name || user?.email?.split('@')[0] || ''

  const tabs = [
    { key: 'status' as const, label: t.dashboard.status.title, icon: FileText },
    { key: 'documents' as const, label: t.dashboard.documents.title, icon: Upload },
    { key: 'messages' as const, label: t.dashboard.messages.title, icon: MessageSquare },
    { key: 'payments' as const, label: t.dashboard.payments.title, icon: CreditCard },
    { key: 'notifications' as const, label: t.dashboard.notifications.title, icon: Bell },
  ]

  return (
    <div className="min-h-screen bg-navy-50/30 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-heading text-3xl font-bold text-navy-900">{t.dashboard.title}</h1>
          <p className="text-navy-600 mt-1">
            {t.dashboard.welcome}, {userName}
          </p>
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

        {/* Status Tab */}
        {activeTab === 'status' && (
          <div className="card p-8">
            <h2 className="font-heading text-xl font-bold text-navy-900 mb-8">
              {t.dashboard.status.title} – {declaration.year}
            </h2>

            {/* Progress stepper */}
            <div className="relative">
              <div className="flex justify-between relative z-10">
                {statusSteps.map((step, i) => {
                  const isCompleted = i < currentStepIndex
                  const isCurrent = i === currentStepIndex
                  return (
                    <div key={step.key} className="flex flex-col items-center text-center flex-1">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all ${
                          isCompleted
                            ? 'bg-trust-500 border-trust-500 text-white'
                            : isCurrent
                            ? 'bg-navy-800 border-navy-800 text-white'
                            : 'bg-white border-navy-200 text-navy-400'
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle className="w-6 h-6" />
                        ) : (
                          <span className="text-sm font-bold">{i + 1}</span>
                        )}
                      </div>
                      <span className={`mt-3 text-xs sm:text-sm font-medium max-w-[100px] ${
                        isCurrent ? 'text-navy-900' : 'text-navy-500'
                      }`}>
                        {step.label}
                      </span>
                    </div>
                  )
                })}
              </div>
              {/* Progress line */}
              <div className="absolute top-6 left-[12.5%] right-[12.5%] h-0.5 bg-navy-200 -z-0">
                <div
                  className="h-full bg-trust-500 transition-all duration-500"
                  style={{ width: `${(currentStepIndex / (statusSteps.length - 1)) * 100}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Documents Tab */}
        {activeTab === 'documents' && (
          <div className="space-y-6">
            {/* Upload area */}
            <div className="card p-8">
              <h2 className="font-heading text-xl font-bold text-navy-900 mb-4">
                {t.dashboard.documents.upload}
              </h2>
              <div
                onDrop={handleFileDrop}
                onDragOver={(e) => { e.preventDefault(); setDragActive(true) }}
                onDragLeave={() => setDragActive(false)}
                className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all cursor-pointer ${
                  dragActive
                    ? 'border-navy-500 bg-navy-50'
                    : 'border-navy-200 hover:border-navy-400 hover:bg-navy-50/50'
                }`}
                onClick={() => document.getElementById('file-input')?.click()}
              >
                <input
                  id="file-input"
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <Upload className="w-10 h-10 text-navy-400 mx-auto mb-3" />
                <p className="text-navy-700 font-medium">{t.dashboard.documents.uploadDescription}</p>
                <p className="text-navy-400 text-sm mt-1">{t.dashboard.documents.formats}</p>
              </div>
            </div>

            {/* Uploaded files */}
            {uploadedFiles.length > 0 && (
              <div className="card p-8">
                <h3 className="font-heading text-lg font-bold text-navy-900 mb-4">
                  {t.dashboard.documents.uploaded}
                </h3>
                <div className="space-y-2">
                  {uploadedFiles.map((file, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-navy-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-navy-500" />
                        <div>
                          <div className="text-sm font-medium text-navy-900">{file.name}</div>
                          <div className="text-xs text-navy-500">{formatFileSize(file.size)}</div>
                        </div>
                      </div>
                      <button
                        onClick={() => setUploadedFiles(prev => prev.filter((_, idx) => idx !== i))}
                        className="text-navy-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Download area */}
            <div className="card p-8">
              <h3 className="font-heading text-lg font-bold text-navy-900 mb-4">
                {t.dashboard.documents.download}
              </h3>
              <div className="text-center py-8 text-navy-400">
                <Download className="w-10 h-10 mx-auto mb-2" />
                <p className="text-sm">
                  {locale === 'de'
                    ? 'Ihre fertige Steuererklärung wird hier verfügbar sein.'
                    : 'Your completed tax declaration will be available here.'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Messages Tab */}
        {activeTab === 'messages' && (
          <div className="card overflow-hidden">
            <div className="p-6 border-b border-navy-100">
              <h2 className="font-heading text-xl font-bold text-navy-900">
                {t.dashboard.messages.title}
              </h2>
            </div>

            {/* Messages list */}
            <div className="h-[400px] overflow-y-auto p-6 space-y-4">
              {messages.length === 0 ? (
                <div className="text-center py-16 text-navy-400">
                  <MessageSquare className="w-10 h-10 mx-auto mb-2" />
                  <p className="text-sm">{t.dashboard.messages.noMessages}</p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender === 'client' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                        msg.sender === 'client'
                          ? 'bg-navy-800 text-white'
                          : 'bg-navy-100 text-navy-900'
                      }`}
                    >
                      <p className="text-sm">{msg.content}</p>
                      <span className={`text-xs mt-1 block ${
                        msg.sender === 'client' ? 'text-navy-300' : 'text-navy-500'
                      }`}>
                        {new Date(msg.created_at).toLocaleTimeString(locale === 'de' ? 'de-CH' : 'en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Message input */}
            <div className="p-4 border-t border-navy-100 bg-navy-50/30">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder={t.dashboard.messages.placeholder}
                  className="flex-1 px-4 py-3 rounded-xl border-2 border-navy-200 text-navy-900 focus:border-navy-500 focus:ring-0 outline-none"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className="btn-primary !px-4 disabled:opacity-50"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Payments Tab */}
        {activeTab === 'payments' && (
          <div className="card p-8">
            <h2 className="font-heading text-xl font-bold text-navy-900 mb-6">
              {t.dashboard.payments.title}
            </h2>

            <div className="bg-navy-50 rounded-2xl p-6 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-navy-600">{t.dashboard.payments.status}</p>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-gold-100 text-gold-700 mt-1">
                    <Clock className="w-3.5 h-3.5" />
                    {t.dashboard.payments.pending}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-sm text-navy-600">
                    {locale === 'de' ? 'Steuererklärung 2025' : 'Tax Declaration 2025'}
                  </p>
                  <p className="text-2xl font-bold text-navy-900">CHF 99.00</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button className="btn-gold flex-1">
                <CreditCard className="w-5 h-5 mr-2" />
                {t.dashboard.payments.payNow}
              </button>
              <button className="btn-secondary flex-1">
                <Download className="w-5 h-5 mr-2" />
                {t.dashboard.payments.invoice}
              </button>
            </div>

            {/* Bank transfer info */}
            <div className="mt-8 p-6 bg-navy-50 rounded-2xl">
              <h3 className="font-semibold text-navy-900 mb-3">
                {locale === 'de' ? 'Banküberweisung' : 'Bank Transfer'}
              </h3>
              <div className="space-y-2 text-sm text-navy-700">
                <p><strong>IBAN:</strong> CH00 0000 0000 0000 0000 0</p>
                <p><strong>{locale === 'de' ? 'Empfänger' : 'Recipient'}:</strong> Steuerberatung Petertil</p>
                <p><strong>{locale === 'de' ? 'Verwendungszweck' : 'Reference'}:</strong> STK-2025-001</p>
              </div>
            </div>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div className="card p-8">
            <h2 className="font-heading text-xl font-bold text-navy-900 mb-6">
              {t.dashboard.notifications.title}
            </h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-navy-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-navy-200 flex items-center justify-center">
                    <Bell className="w-5 h-5 text-navy-600" />
                  </div>
                  <span className="font-medium text-navy-900">{t.dashboard.notifications.email}</span>
                </div>
                <button
                  onClick={() => setEmailNotif(!emailNotif)}
                  className={`relative w-12 h-7 rounded-full transition-colors ${
                    emailNotif ? 'bg-trust-500' : 'bg-navy-300'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-sm transition-transform ${
                      emailNotif ? 'left-[22px]' : 'left-0.5'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-navy-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-navy-200 flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-navy-600" />
                  </div>
                  <span className="font-medium text-navy-900">{t.dashboard.notifications.sms}</span>
                </div>
                <button
                  onClick={() => setSmsNotif(!smsNotif)}
                  className={`relative w-12 h-7 rounded-full transition-colors ${
                    smsNotif ? 'bg-trust-500' : 'bg-navy-300'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-sm transition-transform ${
                      smsNotif ? 'left-[22px]' : 'left-0.5'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
