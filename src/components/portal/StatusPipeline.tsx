'use client'

import { CheckCircle } from 'lucide-react'
import type { TaxYearStatus } from '@/lib/types/portal'
import { getPipelineIndex } from '@/lib/types/portal'
import { useI18n } from '@/lib/i18n/context'

interface StatusPipelineProps {
  status: TaxYearStatus
}

export function StatusPipeline({ status }: StatusPipelineProps) {
  const { t } = useI18n()
  const currentIndex = getPipelineIndex(status)

  const steps = [
    { label: t.yearDetail.pipeline.step1, who: t.yearDetail.pipeline.step1Who },
    { label: t.yearDetail.pipeline.step2, who: t.yearDetail.pipeline.step2Who },
    { label: t.yearDetail.pipeline.step3, who: t.yearDetail.pipeline.step3Who },
    { label: t.yearDetail.pipeline.step4, who: t.yearDetail.pipeline.step4Who },
  ]

  return (
    <div className="relative">
      <div className="flex justify-between relative z-10">
        {steps.map((step, i) => {
          const isCompleted = i < currentIndex
          const isCurrent = i === currentIndex
          return (
            <div key={i} className="flex flex-col items-center text-center flex-1">
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
              <span className={`text-xs mt-0.5 ${isCurrent ? 'text-navy-600' : 'text-navy-400'}`}>
                {step.who}
              </span>
            </div>
          )
        })}
      </div>
      {/* Progress line */}
      <div className="absolute top-6 left-[12.5%] right-[12.5%] h-0.5 bg-navy-200 -z-0">
        <div
          className="h-full bg-trust-500 transition-all duration-500"
          style={{ width: `${(currentIndex / (steps.length - 1)) * 100}%` }}
        />
      </div>
    </div>
  )
}
