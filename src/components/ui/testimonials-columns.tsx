'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'motion/react'
import { Quote, Star } from 'lucide-react'

interface Testimonial {
  name: string
  location: string
  text: string
  context: string
}

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  const initials = testimonial.name
    .split(' ')
    .map((n) => n[0])
    .join('')

  return (
    <div className="review-card relative mb-6">
      <Quote className="absolute top-6 right-6 w-8 h-8 text-navy-100" />

      <div className="flex items-center gap-1.5 mb-4">
        {[...Array(5)].map((_, j) => (
          <Star key={j} className="w-5 h-5 fill-gold-400 text-gold-400" />
        ))}
        <span className="text-sm font-semibold text-navy-700 ml-2">5.0</span>
      </div>

      <p className="text-navy-800 text-base leading-relaxed mb-4 relative z-10">
        &ldquo;{testimonial.text}&rdquo;
      </p>

      <div className="border-t border-navy-100 pt-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-navy-700 to-navy-900 flex items-center justify-center shrink-0">
            <span className="text-sm font-bold text-white">{initials}</span>
          </div>
          <div>
            <div className="text-sm font-semibold text-navy-900">
              {testimonial.name}
            </div>
            <div className="text-xs text-navy-500">
              {testimonial.location} &middot; {testimonial.context}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function TestimonialsColumn({
  testimonials,
  duration,
}: {
  testimonials: Testimonial[]
  duration: number
}) {
  const columnRef = useRef<HTMLDivElement>(null)
  const [columnHeight, setColumnHeight] = useState(0)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mq.matches)
    const handler = (e: MediaQueryListEvent) =>
      setPrefersReducedMotion(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  useEffect(() => {
    if (columnRef.current) {
      // Measure half the content (one set of testimonials)
      setColumnHeight(columnRef.current.scrollHeight / 2)
    }
  }, [testimonials])

  // Duplicate testimonials for seamless loop
  const doubled = useMemo(
    () => [...testimonials, ...testimonials],
    [testimonials]
  )

  return (
    <div className="h-[600px] overflow-hidden">
      <motion.div
        ref={columnRef}
        animate={
          prefersReducedMotion || columnHeight === 0
            ? {}
            : {
                y: [0, -columnHeight],
              }
        }
        transition={
          prefersReducedMotion || columnHeight === 0
            ? {}
            : {
                y: {
                  duration,
                  repeat: Infinity,
                  ease: 'linear',
                  repeatType: 'loop',
                },
              }
        }
      >
        {doubled.map((testimonial, i) => (
          <TestimonialCard key={i} testimonial={testimonial} />
        ))}
      </motion.div>
    </div>
  )
}

export function TestimonialsColumns({
  testimonials,
}: {
  testimonials: readonly Testimonial[]
}) {
  const col1 = testimonials.slice(0, 3)
  const col2 = testimonials.slice(3, 6)
  const col3 = testimonials.slice(6, 9)

  return (
    <div
      className="relative"
      style={{
        maskImage:
          'linear-gradient(to bottom, transparent, black 10%, black 90%, transparent)',
        WebkitMaskImage:
          'linear-gradient(to bottom, transparent, black 10%, black 90%, transparent)',
      }}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
        <TestimonialsColumn testimonials={col1} duration={25} />
        <div className="hidden md:block">
          <TestimonialsColumn testimonials={col2} duration={30} />
        </div>
        <div className="hidden lg:block">
          <TestimonialsColumn testimonials={col3} duration={22} />
        </div>
      </div>
    </div>
  )
}
