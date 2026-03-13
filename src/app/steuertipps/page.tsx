'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { useI18n } from '@/lib/i18n/context'
import { BookOpen, ArrowRight, Shield, Tag, ChevronUp, Share2, Filter, Calendar, Link as LinkIcon, Check } from 'lucide-react'
import { InlineToolCta } from '@/components/InlineToolCta'

// Structured data for SEO (JSON-LD)
function ArticleJsonLd({ articles, locale }: { articles: readonly { slug: string; title: string; summary: string; content: string; category: string; updated?: string }[]; locale: string }) {
  const faqItems = articles.map((a) => ({
    '@type': 'Question' as const,
    name: a.title,
    acceptedAnswer: {
      '@type': 'Answer' as const,
      text: a.summary + ' ' + a.content.split('\n\n')[0],
    },
  }))

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'FAQPage',
        mainEntity: faqItems,
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: locale === 'de' ? 'Startseite' : 'Home', item: 'https://petertiltax.ch' },
          { '@type': 'ListItem', position: 2, name: locale === 'de' ? 'Steuertipps' : 'Tax Tips', item: 'https://petertiltax.ch/steuertipps' },
        ],
      },
      {
        '@type': 'ItemList',
        itemListElement: articles.map((a, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          url: `https://petertiltax.ch/steuertipps#${a.slug}`,
          name: a.title,
        })),
      },
    ],
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}

export default function SteuertippsPage() {
  const { t, locale } = useI18n()
  const [expandedSlug, setExpandedSlug] = useState<string | null>(null)
  const [activeFilter, setActiveFilter] = useState<string | null>(null)
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null)
  const articleRefs = useRef<Record<string, HTMLDivElement | null>>({})

  // Extract unique categories
  const categories = useMemo(() => {
    const cats = new Set(t.taxTips.articles.map((a: { category: string }) => a.category))
    return Array.from(cats) as string[]
  }, [t.taxTips.articles])

  // Filtered articles
  const filteredArticles = useMemo(() => {
    if (!activeFilter) return t.taxTips.articles
    return t.taxTips.articles.filter((a: { category: string }) => a.category === activeFilter)
  }, [t.taxTips.articles, activeFilter])

  // Handle hash on mount (deep link)
  useEffect(() => {
    const hash = window.location.hash.slice(1)
    if (hash) {
      setExpandedSlug(hash)
      setTimeout(() => {
        articleRefs.current[hash]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100)
    }
  }, [])

  const toggleArticle = (slug: string) => {
    const next = expandedSlug === slug ? null : slug
    setExpandedSlug(next)

    if (next) {
      // Update URL hash without scrolling
      window.history.replaceState(null, '', `#${slug}`)
      // Scroll into view
      setTimeout(() => {
        articleRefs.current[slug]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 50)
    } else {
      window.history.replaceState(null, '', window.location.pathname)
    }
  }

  const shareArticle = async (slug: string, title: string) => {
    const url = `${window.location.origin}/steuertipps#${slug}`
    if (navigator.share) {
      try {
        await navigator.share({ title, url })
      } catch {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(url)
      setCopiedSlug(slug)
      setTimeout(() => setCopiedSlug(null), 2000)
    }
  }

  // Find related articles (same category, different slug)
  const getRelated = (slug: string, category: string) => {
    return t.taxTips.articles
      .filter((a: { slug: string; category: string }) => a.category === category && a.slug !== slug)
      .slice(0, 2)
  }

  return (
    <>
      <ArticleJsonLd articles={t.taxTips.articles} locale={locale} />

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
          <p className="mt-2 text-sm text-white/50">
            {t.taxTips.lastUpdated}
          </p>
        </div>
      </section>

      {/* Category Filter */}
      <section className="px-4 sm:px-6 lg:px-8 pt-8 lg:pt-10">
        <div className="container-wide">
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            <Filter className="w-4 h-4 text-navy-400 shrink-0" />
            <button
              onClick={() => setActiveFilter(null)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                !activeFilter
                  ? 'bg-navy-800 text-white'
                  : 'bg-navy-50 text-navy-600 hover:bg-navy-100'
              }`}
            >
              {t.taxTips.allCategories}
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveFilter(activeFilter === cat ? null : cat)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  activeFilter === cat
                    ? 'bg-navy-800 text-white'
                    : 'bg-navy-50 text-navy-600 hover:bg-navy-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <p className="text-xs text-navy-400 mt-2">
            {filteredArticles.length} {t.taxTips.articlesCount}
          </p>
        </div>
      </section>

      {/* Articles Grid */}
      <section className="px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
        <div className="container-wide">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArticles.map((article: { slug: string; title: string; summary: string; content: string; category: string; updated?: string; relatedSlugs?: string[] }) => {
              const isExpanded = expandedSlug === article.slug
              const related = getRelated(article.slug, article.category)

              return (
                <div
                  key={article.slug}
                  id={article.slug}
                  ref={(el) => { articleRefs.current[article.slug] = el }}
                  className={`card p-6 flex flex-col transition-all duration-300 scroll-mt-24 ${
                    isExpanded ? 'sm:col-span-2 lg:col-span-3' : ''
                  }`}
                >
                  {/* Category Badge + Date */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-navy-50 text-navy-600 text-xs font-semibold uppercase tracking-wider">
                      <Tag className="w-3.5 h-3.5" />
                      {article.category}
                    </span>
                    {article.updated && (
                      <span className="inline-flex items-center gap-1 text-xs text-navy-400">
                        <Calendar className="w-3 h-3" />
                        {article.updated}
                      </span>
                    )}
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
                      <div className="space-y-4 max-w-3xl">
                        {article.content.split('\n\n').map((paragraph: string, i: number) => (
                          <p key={i} className="text-navy-600 text-sm leading-relaxed">
                            {paragraph}
                          </p>
                        ))}
                      </div>

                      {/* Share + Link */}
                      <div className="flex items-center gap-3 mt-6 pt-4 border-t border-navy-50">
                        <button
                          onClick={() => shareArticle(article.slug, article.title)}
                          className="inline-flex items-center gap-1.5 text-xs font-medium text-navy-500 hover:text-navy-700 transition-colors"
                        >
                          {copiedSlug === article.slug ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-trust-500" />
                              {t.taxTips.linkCopied}
                            </>
                          ) : (
                            <>
                              <Share2 className="w-3.5 h-3.5" />
                              {t.taxTips.share}
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(`${window.location.origin}/steuertipps#${article.slug}`)
                            setCopiedSlug(article.slug)
                            setTimeout(() => setCopiedSlug(null), 2000)
                          }}
                          className="inline-flex items-center gap-1.5 text-xs font-medium text-navy-500 hover:text-navy-700 transition-colors"
                        >
                          <LinkIcon className="w-3.5 h-3.5" />
                          {t.taxTips.copyLink}
                        </button>
                      </div>

                      {/* Related articles */}
                      {related.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-navy-50">
                          <p className="text-xs font-semibold text-navy-500 uppercase tracking-wider mb-2">
                            {t.taxTips.relatedArticles}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {related.map((rel: { slug: string; title: string }) => (
                              <button
                                key={rel.slug}
                                onClick={() => toggleArticle(rel.slug)}
                                className="text-xs px-3 py-1.5 rounded-lg bg-navy-50 text-navy-700 hover:bg-navy-100 transition-colors"
                              >
                                {rel.title}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Toggle Button */}
                  <button
                    onClick={() => toggleArticle(article.slug)}
                    aria-expanded={isExpanded}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-navy-700 hover:text-navy-900 transition-colors mt-auto"
                  >
                    {isExpanded ? (
                      <>
                        <ChevronUp className="w-4 h-4" />
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

          {/* Inline CTA */}
          <div className="mt-8">
            <InlineToolCta toolKey="steuertipps" />
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
              <p className="text-white/60 text-sm mt-4">{t.bottomCta.socialProof}</p>
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
