'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useI18n } from '@/lib/i18n/context'
import { cantons } from '@/lib/swiss-data'
import { Check, ArrowRight, Star, ChevronDown } from 'lucide-react'

type Tier = 'basic' | 'standard' | 'premium'

export default function PricingPage() {
  const { t, locale } = useI18n()

  const [employmentType, setEmploymentType] = useState<string>('')
  const [propertyOwner, setPropertyOwner] = useState<boolean | null>(null)
  const [hasSecurities, setHasSecurities] = useState<boolean | null>(null)
  const [canton, setCanton] = useState<string>('')
  const [incomeSources, setIncomeSources] = useState<number>(1)

  const recommendedTier = useMemo((): Tier | null => {
    if (!employmentType) return null

    if (employmentType === 'selfEmployed' || propertyOwner) {
      return 'premium'
    }
    if (incomeSources > 1 || hasSecurities) {
      return 'standard'
    }
    return 'basic'
  }, [employmentType, propertyOwner, hasSecurities, incomeSources])

  const tiers = [
    { key: 'basic' as Tier, ...t.pricing.tiers.basic, popular: false },
    { key: 'standard' as Tier, ...t.pricing.tiers.standard },
    { key: 'premium' as Tier, ...t.pricing.tiers.premium, popular: false },
  ]

  return (
    <>
      {/* Hero */}
      <section className="gradient-hero pt-32 pb-20 lg:pt-40 lg:pb-28 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-navy-700/20 blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-heading text-4xl sm:text-5xl font-bold text-white">
            {t.pricing.title}
          </h1>
          <p className="mt-4 text-xl text-navy-200 max-w-2xl mx-auto">
            {t.pricing.subtitle}
          </p>
        </div>
      </section>

      {/* Pricing cards */}
      <section className="section-padding -mt-12">
        <div className="container-wide">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {tiers.map((tier) => {
              const { key, name, description, price, features, popular } = tier
              const isRecommended = recommendedTier === key
              const isPopular = popular

              return (
                <div
                  key={key}
                  className={`card p-8 relative ${
                    isRecommended
                      ? 'ring-2 ring-gold-500 shadow-lg scale-[1.02]'
                      : isPopular && !recommendedTier
                      ? 'ring-2 ring-navy-300 shadow-lg scale-[1.02]'
                      : ''
                  } transition-all duration-300`}
                >
                  {(isRecommended || (isPopular && !recommendedTier)) && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className={`inline-flex items-center gap-1 px-4 py-1 rounded-full text-xs font-semibold text-white ${isRecommended ? 'bg-gold-500' : 'bg-navy-700'}`}>
                        <Star className="w-3 h-3" />
                        {isRecommended
                          ? (locale === 'de' ? 'Empfohlen für Sie' : 'Recommended for You')
                          : (locale === 'de' ? 'Am beliebtesten' : 'Most Popular')}
                      </span>
                    </div>
                  )}

                  <div className="text-center mb-6">
                    <h3 className="font-heading text-xl font-bold text-navy-900">{name}</h3>
                    <p className="text-navy-600 text-sm mt-1">{description}</p>
                    <div className="mt-4">
                      <span className="text-4xl font-bold text-navy-900">{price}</span>
                    </div>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-trust-500 shrink-0 mt-0.5" />
                        <span className="text-navy-700 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    href="/auth/register"
                    className={`w-full text-center ${
                      isRecommended || (isPopular && !recommendedTier)
                        ? 'btn-gold'
                        : 'btn-secondary'
                    } group`}
                  >
                    {t.pricing.cta}
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Price Calculator */}
      <section className="section-padding bg-navy-50/50">
        <div className="container-narrow">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl font-bold text-navy-900">
              {t.pricing.calculatorTitle}
            </h2>
            <p className="mt-4 text-navy-600 text-lg">
              {t.pricing.calculatorSubtitle}
            </p>
          </div>

          <div className="card p-8 sm:p-10">
            <div className="space-y-8">
              {/* Employment type */}
              <div>
                <label className="block text-sm font-semibold text-navy-900 mb-3">
                  {t.pricing.questions.employmentType}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {Object.entries(t.pricing.questions.employmentOptions).map(([key, label]) => (
                    <button
                      key={key}
                      onClick={() => setEmploymentType(key)}
                      className={`px-4 py-3 rounded-xl text-sm font-medium border-2 transition-all ${
                        employmentType === key
                          ? 'border-navy-800 bg-navy-800 text-white'
                          : 'border-navy-200 text-navy-700 hover:border-navy-400'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Property owner */}
              <div>
                <label className="block text-sm font-semibold text-navy-900 mb-3">
                  {t.pricing.questions.propertyOwner}
                </label>
                <div className="flex gap-3">
                  {[true, false].map((val) => (
                    <button
                      key={String(val)}
                      onClick={() => setPropertyOwner(val)}
                      className={`px-6 py-3 rounded-xl text-sm font-medium border-2 transition-all ${
                        propertyOwner === val
                          ? 'border-navy-800 bg-navy-800 text-white'
                          : 'border-navy-200 text-navy-700 hover:border-navy-400'
                      }`}
                    >
                      {val ? t.pricing.questions.yes : t.pricing.questions.no}
                    </button>
                  ))}
                </div>
              </div>

              {/* Securities */}
              <div>
                <label className="block text-sm font-semibold text-navy-900 mb-3">
                  {t.pricing.questions.securities}
                </label>
                <div className="flex gap-3">
                  {[true, false].map((val) => (
                    <button
                      key={String(val)}
                      onClick={() => setHasSecurities(val)}
                      className={`px-6 py-3 rounded-xl text-sm font-medium border-2 transition-all ${
                        hasSecurities === val
                          ? 'border-navy-800 bg-navy-800 text-white'
                          : 'border-navy-200 text-navy-700 hover:border-navy-400'
                      }`}
                    >
                      {val ? t.pricing.questions.yes : t.pricing.questions.no}
                    </button>
                  ))}
                </div>
              </div>

              {/* Canton */}
              <div>
                <label className="block text-sm font-semibold text-navy-900 mb-3">
                  {t.pricing.questions.canton}
                </label>
                <div className="relative">
                  <select
                    value={canton}
                    onChange={(e) => setCanton(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border-2 border-navy-200 text-navy-700 bg-white focus:border-navy-500 focus:ring-0 outline-none appearance-none cursor-pointer"
                  >
                    <option value="">{locale === 'de' ? 'Kanton wählen...' : 'Select canton...'}</option>
                    {cantons.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.name[locale]}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-navy-400 pointer-events-none" />
                </div>
              </div>

              {/* Income sources */}
              <div>
                <label className="block text-sm font-semibold text-navy-900 mb-3">
                  {t.pricing.questions.incomeSources}
                </label>
                <div className="flex gap-3">
                  {[1, 2, 3].map((num) => (
                    <button
                      key={num}
                      onClick={() => setIncomeSources(num)}
                      className={`px-6 py-3 rounded-xl text-sm font-medium border-2 transition-all ${
                        incomeSources === num
                          ? 'border-navy-800 bg-navy-800 text-white'
                          : 'border-navy-200 text-navy-700 hover:border-navy-400'
                      }`}
                    >
                      {num}{num === 3 ? '+' : ''}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Result */}
            {recommendedTier && (
              <div className="mt-10 p-6 rounded-2xl bg-navy-50 border border-navy-100">
                <div className="text-center">
                  <p className="text-sm font-medium text-navy-600 mb-2">
                    {locale === 'de' ? 'Empfohlenes Paket:' : 'Recommended Package:'}
                  </p>
                  <h3 className="text-2xl font-bold text-navy-900">
                    {t.pricing.tiers[recommendedTier].name} – {t.pricing.tiers[recommendedTier].price}
                  </h3>
                  <p className="text-navy-600 mt-2">{t.pricing.tiers[recommendedTier].description}</p>
                  <Link
                    href="/auth/register"
                    className="btn-gold !px-8 !py-3 mt-6 group inline-flex"
                  >
                    {t.pricing.cta}
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  )
}
