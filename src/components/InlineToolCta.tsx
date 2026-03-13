'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useI18n } from '@/lib/i18n/context'
import { ArrowRight, Sparkles } from 'lucide-react'
import { ContactModal } from '@/components/ContactModal'

interface InlineToolCtaProps {
  toolKey: 'pillar3a' | 'quellensteuer' | 'checkliste' | 'steuervergleich' | 'steuerkarte' | 'abzugsrechner' | 'steuertipps' | 'pkEinkauf'
}

export function InlineToolCta({ toolKey }: InlineToolCtaProps) {
  const { t } = useI18n()
  const [showContact, setShowContact] = useState(false)

  // Access t.inlineCta[toolKey] for title and text
  const ctaData = (t.inlineCta as unknown as Record<string, { title: string; text: string }>)[toolKey]
  if (!ctaData) return null

  return (
    <>
      <div className="bg-trust-50 border border-trust-200 rounded-xl p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-start gap-3 flex-1">
            <Sparkles className="w-5 h-5 text-trust-500 mt-0.5 shrink-0" />
            <div>
              <h3 className="font-semibold text-navy-900 text-sm">{ctaData.title}</h3>
              <p className="text-navy-600 text-sm mt-0.5">{ctaData.text}</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:shrink-0">
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-navy-800 text-white text-sm font-medium hover:bg-navy-900 transition-colors"
            >
              {t.inlineCta.button1}
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <button
              onClick={() => setShowContact(true)}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg border border-navy-200 text-navy-700 text-sm font-medium hover:bg-navy-50 transition-colors"
            >
              {t.inlineCta.button2}
            </button>
          </div>
        </div>
      </div>
      <ContactModal
        isOpen={showContact}
        onClose={() => setShowContact(false)}
        source={ctaData.title}
      />
    </>
  )
}
