import type { Metadata } from 'next'
import { cantonSlugs, getCantonBySlug } from '@/lib/swiss-data'
import CantonPageClient from './CantonPageClient'

export function generateStaticParams() {
  return Object.values(cantonSlugs).map((slug) => ({ canton: slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ canton: string }>
}): Promise<Metadata> {
  const { canton: slug } = await params
  const data = getCantonBySlug(slug)
  if (!data) return { title: 'Kanton nicht gefunden' }

  return {
    title: `Steuererklärung ${data.name.de} | Petertil Tax`,
    description: `Professionelle Steuererklärung im Kanton ${data.name.de} — persönlich, digital und zum Fixpreis ab CHF 149. Frist: ${data.deadline}. Jetzt starten.`,
  }
}

export default async function CantonPage({
  params,
}: {
  params: Promise<{ canton: string }>
}) {
  const { canton: slug } = await params
  return <CantonPageClient slug={slug} />
}
