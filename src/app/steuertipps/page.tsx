'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useI18n } from '@/lib/i18n/context'
import { BookOpen, ArrowRight, Shield, Tag } from 'lucide-react'

export default function SteuertippsPage() {
  const { t } = useI18n()
  const [expandedSlug, setExpandedSlug] = useState<string | null>(null)

  const toggleArticle = (slug: string) => {
    setExpandedSlug(prev => (prev === slug ? null : slug))
  }

  return (
    <>
      {/* Hero */}
      <section className="gradient-hero pt-24 pb-16 lg:pt-36 lg:pb-20 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-navy-700/20 blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6">
            <BookOpen className="w-4 h-4 text-white/80" />
            <span className="text-sm font-medium text-white/90">{t.taxTips.badge}</span>
          </div>
          <h1 className="font-heading text-4xl sm:text-5xl font-bold dark-text-primary">
            {t.taxTips.title}
          </h1>
          <p className="mt-3 text-lg dark-text-secondary max-w-2xl mx-auto">
            {t.taxTips.subtitle}
          </p>
        </div>
      </section>

      {/* Articles Grid */}
      <section className="px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
        <div className="container-wide">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {t.taxTips.articles.map((article) => {
              const isExpanded = expandedSlug === article.slug

              return (
                <div
                  key={article.slug}
                  className={`card p-6 flex flex-col transition-all duration-300 ${
                    isExpanded ? 'sm:col-span-2 lg:col-span-3' : ''
                  }`}
                >
                  {/* Category Badge */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-navy-50 text-navy-600 text-xs font-semibold uppercase tracking-wider">
                      <Tag className="w-3.5 h-3.5" />
                      {article.category}
                    </span>
                  </div>

                  {/* Title */}
                  <h2 className="font-heading text-lg font-bold text-navy-900 mb-2">
                    {article.title}
                  </h2>

                  {/* Summary */}
                  <p className="text-navy-600 text-sm leading-relaxed mb-4 flex-1">
                    {article.summary}
                  </p>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="mt-2 mb-4 border-t border-navy-100 pt-4">
                      <div className="space-y-4">
                        {article.content.split('\n\n').map((paragraph, i) => (
                          <p key={i} className="text-navy-600 text-sm leading-relaxed">
                            {paragraph}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Toggle Button */}
                  <button
                    onClick={() => toggleArticle(article.slug)}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-navy-700 hover:text-navy-900 transition-colors mt-auto"
                  >
                    {isExpanded ? (
                      <>
                        <Shield className="w-4 h-4" />
                        {t.taxTips.backToOverview}
                      </>
                    ) : (
                      <>
                        {t.taxTips.readMore}
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
        <div className="container-wide">
          <div className="relative overflow-hidden rounded-2xl gradient-navy p-6 sm:p-10 lg:p-12">
            <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="relative text-center max-w-2xl mx-auto">
              <h2 className="font-heading text-xl sm:text-2xl lg:text-3xl font-bold dark-text-primary mb-5">
                {t.taxTips.ctaTitle}
              </h2>
              <p className="dark-text-secondary mb-6">{t.taxTips.ctaText}</p>
              <span className="inline-block px-3 py-1 rounded-full bg-white/10 text-white/90 text-sm font-medium border border-white/10 mb-4">
                {t.discount.hint}
              </span>
              <br />
              <Link href="/pricing" className="btn-white !px-8 !py-3 !text-sm group">
                {t.hero.cta}
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Legal disclaimer */}
      <section className="bg-navy-50 border-t border-navy-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-navy-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-navy-700 mb-1">{t.toolDisclaimer.title}</h3>
              <p className="text-xs text-navy-500 leading-relaxed">{t.toolDisclaimer.text}</p>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
