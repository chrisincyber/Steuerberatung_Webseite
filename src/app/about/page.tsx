'use client'

import Link from 'next/link'
import { useI18n } from '@/lib/i18n/context'
import { Award, Users, FileText, CheckCircle, ArrowRight } from 'lucide-react'

export default function AboutPage() {
  const { t, locale } = useI18n()

  return (
    <>
      {/* Hero */}
      <section className="gradient-hero pt-32 pb-20 lg:pt-40 lg:pb-28 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-navy-700/20 blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-heading text-4xl sm:text-5xl font-bold dark-text-primary">
            {t.about.title}
          </h1>
          <p className="mt-4 text-xl dark-text-secondary max-w-2xl mx-auto">
            {t.about.subtitle}
          </p>
        </div>
      </section>

      {/* About content */}
      <section className="section-padding">
        <div className="container-wide">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Photo placeholder */}
            <div className="relative">
              <div className="aspect-[4/5] rounded-3xl bg-navy-100 overflow-hidden relative">
                <div className="absolute inset-0 flex items-center justify-center bg-navy-50">
                  <div className="text-center">
                    <div className="w-32 h-32 rounded-full bg-navy-200 mx-auto mb-4 flex items-center justify-center">
                      <Users className="w-16 h-16 text-navy-400" />
                    </div>
                    <p className="text-navy-400 text-sm font-medium">
                      {locale === 'de' ? 'Ihr Foto hier' : 'Your Photo Here'}
                    </p>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-6 -right-6 w-32 h-32 rounded-2xl gradient-navy -z-10" />
              <div className="absolute -top-6 -left-6 w-24 h-24 rounded-2xl bg-navy-100 -z-10" />
            </div>

            {/* Text */}
            <div>
              <h2 className="font-heading text-3xl font-bold text-navy-900 mb-6">
                {t.about.heading}
              </h2>
              <p className="text-navy-700 leading-relaxed mb-4">
                {t.about.bio}
              </p>
              <p className="text-navy-700 leading-relaxed mb-8">
                {t.about.bioExtended}
              </p>

              {/* Credentials */}
              <div className="bg-navy-50 rounded-2xl p-6">
                <h3 className="font-heading font-bold text-navy-900 mb-4">
                  {t.about.credentials.title}
                </h3>
                <ul className="space-y-3">
                  {t.about.credentials.items.map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-trust-500 shrink-0 mt-0.5" />
                      <span className="text-navy-700 text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust signals */}
      <section className="section-padding bg-navy-50/50">
        <div className="container-wide">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 lg:gap-8">
            {[
              {
                icon: Award,
                value: t.about.trust.experience,
                label: t.about.trust.experienceLabel,
              },
              {
                icon: Users,
                value: t.about.trust.clients,
                label: t.about.trust.clientsLabel,
              },
              {
                icon: FileText,
                value: t.about.trust.declarations,
                label: t.about.trust.declarationsLabel,
              },
            ].map((item, i) => (
              <div key={i} className="card p-8 text-center">
                <div className="w-14 h-14 rounded-2xl bg-navy-100 flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-7 h-7 text-navy-700" />
                </div>
                <div className="text-3xl font-bold text-navy-900 mb-1">{item.value}</div>
                <div className="text-navy-600 text-sm">{item.label}</div>
              </div>
            ))}
          </div>

          <div className="text-center mt-14">
            <Link href="/pricing" className="btn-primary !px-8 !py-4 group">
              {t.about.cta}
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
