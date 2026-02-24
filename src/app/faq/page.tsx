'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useI18n } from '@/lib/i18n/context'
import { ChevronDown, ArrowRight, HelpCircle } from 'lucide-react'

export default function FAQPage() {
  const { t } = useI18n()
  // Pre-expand first 3 questions
  const [openIndices, setOpenIndices] = useState<Set<number>>(new Set([0, 1, 2]))

  const toggleIndex = (i: number) => {
    setOpenIndices(prev => {
      const next = new Set(prev)
      if (next.has(i)) {
        next.delete(i)
      } else {
        next.add(i)
      }
      return next
    })
  }

  return (
    <>
      {/* Hero */}
      <section className="gradient-hero pt-32 pb-20 lg:pt-40 lg:pb-28 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-navy-700/20 blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-heading text-4xl sm:text-5xl font-bold dark-text-primary">
            {t.faq.title}
          </h1>
          <p className="mt-4 text-xl dark-text-secondary max-w-2xl mx-auto">
            {t.faq.subtitle}
          </p>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section className="section-padding">
        <div className="container-narrow">
          <div className="space-y-3">
            {t.faq.items.map((item, i) => {
              const isOpen = openIndices.has(i)
              // Add contextual CTA after key answers (documents, data security)
              const showCta = i === 0 || i === 2

              return (
                <div
                  key={i}
                  className="card overflow-hidden"
                >
                  <button
                    onClick={() => toggleIndex(i)}
                    className="w-full flex items-center justify-between p-6 text-left hover:bg-navy-50/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-navy-100 flex items-center justify-center shrink-0">
                        <HelpCircle className="w-5 h-5 text-navy-600" />
                      </div>
                      <span className="font-semibold text-navy-900">{item.question}</span>
                    </div>
                    <ChevronDown
                      className={`w-5 h-5 text-navy-400 shrink-0 ml-4 transition-transform duration-200 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-6 pt-0">
                      <div className="pl-14">
                        <p className="text-navy-600 leading-relaxed">{item.answer}</p>
                        {showCta && (
                          <Link
                            href="/auth/register"
                            className="inline-flex items-center gap-1 mt-4 text-sm font-medium text-navy-700 hover:text-navy-900 transition-colors"
                          >
                            {t.faq.ctaButton}
                            <ArrowRight className="w-4 h-4" />
                          </Link>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* CTA */}
          <div className="text-center mt-14">
            <p className="text-navy-600 mb-4">
              {t.faq.ctaText}
            </p>
            <Link href="/auth/register" className="btn-gold !px-8 !py-4 group">
              {t.faq.ctaButton}
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
