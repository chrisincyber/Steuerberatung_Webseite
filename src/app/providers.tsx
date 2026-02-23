'use client'

import { type ReactNode } from 'react'
import { I18nProvider } from '@/lib/i18n/context'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import CookieConsent from '@/components/CookieConsent'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <I18nProvider>
      <Header />
      <main className="min-h-screen">
        {children}
      </main>
      <Footer />
      <CookieConsent />
    </I18nProvider>
  )
}
