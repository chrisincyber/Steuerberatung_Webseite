'use client'

import { useI18n } from '@/lib/i18n/context'
import type { TaxYear, Profile } from '@/lib/types/portal'
import { Zap, Clock, CheckCircle2, AlertTriangle, User } from 'lucide-react'

interface ClientRow {
  profile: Profile
  taxYears: TaxYear[]
}

function getExpressCountdown(confirmedAt: string, deadlineDays: number) {
  const confirmed = new Date(confirmedAt)
  const deadline = new Date(confirmed.getTime() + deadlineDays * 24 * 60 * 60 * 1000)
  const now = new Date()
  const remaining = deadline.getTime() - now.getTime()

  if (remaining <= 0) {
    return { expired: true, days: 0, hours: 0, minutes: 0, deadline, percent: 100 }
  }

  const totalMs = deadlineDays * 24 * 60 * 60 * 1000
  const elapsed = now.getTime() - confirmed.getTime()
  const percent = Math.min(100, Math.round((elapsed / totalMs) * 100))

  const days = Math.floor(remaining / (24 * 60 * 60 * 1000))
  const hours = Math.floor((remaining % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000))
  const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000))

  return { expired: false, days, hours, minutes, deadline, percent }
}

export function AdminExpressView({
  clients,
  allTaxYears,
  onSelectClient,
}: {
  clients: ClientRow[]
  allTaxYears: TaxYear[]
  onSelectClient: (profile: Profile, taxYear: TaxYear) => void
}) {
  const { t } = useI18n()
  const deadlineDays = 5

  const expressTaxYears = allTaxYears
    .filter((ty) => ty.express)
    .sort((a, b) => {
      // Confirmed first (most urgent), then waiting for client
      if (a.express_confirmed_at && !b.express_confirmed_at) return -1
      if (!a.express_confirmed_at && b.express_confirmed_at) return 1
      // Within confirmed: sort by deadline (most urgent first)
      if (a.express_confirmed_at && b.express_confirmed_at) {
        return new Date(a.express_confirmed_at).getTime() - new Date(b.express_confirmed_at).getTime()
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })

  if (expressTaxYears.length === 0) {
    return (
      <div className="card p-12 text-center">
        <Zap className="w-12 h-12 text-navy-300 mx-auto mb-3" />
        <p className="text-navy-500">{t.admin.express.noExpressOrders}</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {expressTaxYears.map((ty) => {
        const client = clients.find((c) => c.profile.id === ty.user_id)
        if (!client) return null

        const confirmed = !!ty.express_confirmed_at
        const countdown = confirmed ? getExpressCountdown(ty.express_confirmed_at!, deadlineDays) : null

        return (
          <button
            key={ty.id}
            onClick={() => onSelectClient(client.profile, ty)}
            className="card p-5 w-full text-left hover:shadow-md hover:border-navy-200 transition-all"
          >
            <div className="flex items-start gap-4">
              {/* Status icon */}
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                confirmed
                  ? countdown?.expired
                    ? 'bg-red-100'
                    : 'bg-gold-100'
                  : 'bg-navy-100'
              }`}>
                {confirmed ? (
                  countdown?.expired ? (
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                  ) : (
                    <Clock className="w-5 h-5 text-gold-600" />
                  )
                ) : (
                  <User className="w-5 h-5 text-navy-500" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                {/* Client info row */}
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-navy-900">
                    {client.profile.first_name} {client.profile.last_name}
                  </span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700 uppercase tracking-wide">
                    {t.admin.express.badge}
                  </span>
                  <span className="text-sm text-navy-500">
                    {ty.year}
                  </span>
                  {ty.price && (
                    <span className="text-sm text-navy-400">
                      CHF {ty.price.toFixed(0)}
                    </span>
                  )}
                </div>

                {/* Status */}
                <div className="flex items-center gap-3">
                  {confirmed ? (
                    <>
                      <div className="flex items-center gap-1.5 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-trust-600" />
                        <span className="text-trust-700 font-medium">{t.admin.express.clientConfirmed}</span>
                      </div>

                      {/* Countdown */}
                      {countdown && !countdown.expired && (
                        <div className="flex items-center gap-2 flex-1">
                          <div className="flex-1 h-2 bg-navy-100 rounded-full overflow-hidden max-w-[200px]">
                            <div
                              className={`h-full rounded-full transition-all ${
                                countdown.percent > 80 ? 'bg-red-500' : countdown.percent > 50 ? 'bg-gold-500' : 'bg-trust-500'
                              }`}
                              style={{ width: `${countdown.percent}%` }}
                            />
                          </div>
                          <span className={`text-sm font-medium ${
                            countdown.percent > 80 ? 'text-red-600' : 'text-navy-600'
                          }`}>
                            {countdown.days > 0
                              ? t.admin.express.daysRemaining.replace('{days}', String(countdown.days)).replace('{hours}', String(countdown.hours))
                              : t.admin.express.hoursRemaining.replace('{hours}', String(countdown.hours)).replace('{minutes}', String(countdown.minutes))
                            }
                          </span>
                        </div>
                      )}

                      {countdown?.expired && (
                        <span className="text-sm font-semibold text-red-600">
                          {t.admin.express.expired}
                        </span>
                      )}
                    </>
                  ) : (
                    <span className="text-sm text-navy-500">
                      {t.admin.express.waitingForClient}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </button>
        )
      })}
    </div>
  )
}
