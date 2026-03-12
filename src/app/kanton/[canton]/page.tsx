import type { Metadata } from 'next'
import { cantonSlugs, getCantonBySlug } from '@/lib/swiss-data'
import { BreadcrumbJsonLd } from '@/components/JsonLd'
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

  const title = `Steuererklärung ${data.name.de} | Petertil Tax`
  const description = `Professionelle Steuererklärung im Kanton ${data.name.de} — persönlich, digital und zum Fixpreis ab CHF 89. Frist: ${data.deadline}. Jetzt starten.`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://petertiltax.ch/kanton/${slug}`,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  }
}

export default async function CantonPage({
  params,
}: {
  params: Promise<{ canton: string }>
}) {
  const { canton: slug } = await params
  const data = getCantonBySlug(slug)
  const cantonName = data?.name.de ?? slug

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', href: '/' },
          { name: 'Kantone', href: '/kanton' },
          { name: cantonName, href: `/kanton/${slug}` },
        ]}
      />
      <CantonPageClient slug={slug} />
    </>
  )
}
