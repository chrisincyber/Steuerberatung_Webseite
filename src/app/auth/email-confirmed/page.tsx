import Link from 'next/link'
import { CheckCircle, ArrowRight, Upload, LogIn } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'E-Mail bestätigt | Petertil Tax',
  robots: { index: false },
}

export default function EmailConfirmedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-navy-50/30 px-4 pt-20">
      <div className="w-full max-w-lg text-center">
        <div className="card p-8 sm:p-10">
          {/* Success icon */}
          <div className="w-20 h-20 rounded-full bg-trust-100 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-trust-600" />
          </div>

          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-navy-900 mb-3">
            E-Mail erfolgreich bestätigt
          </h1>
          <p className="text-navy-600 text-sm leading-relaxed max-w-sm mx-auto">
            Ihr Konto ist jetzt aktiv. Sie können sich ab sofort einloggen und Ihre Steuerunterlagen hochladen.
          </p>

          {/* Next steps */}
          <div className="mt-8 space-y-3 text-left max-w-sm mx-auto">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-navy-50 border border-navy-100">
              <div className="w-8 h-8 rounded-lg bg-navy-800 flex items-center justify-center shrink-0 mt-0.5">
                <LogIn className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-navy-900">Einloggen</p>
                <p className="text-xs text-navy-500 mt-0.5">Melden Sie sich mit Ihren Zugangsdaten an</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-xl bg-navy-50 border border-navy-100">
              <div className="w-8 h-8 rounded-lg bg-navy-800 flex items-center justify-center shrink-0 mt-0.5">
                <Upload className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-navy-900">Dokumente hochladen</p>
                <p className="text-xs text-navy-500 mt-0.5">Laden Sie Ihre Steuerbelege im Dashboard hoch</p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <Link
            href="/auth/login"
            className="btn-primary mt-8 inline-flex items-center gap-2"
          >
            Zum Login
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}
