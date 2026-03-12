import { MetadataRoute } from 'next'
import { cantonSlugs } from '@/lib/swiss-data'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://petertiltax.ch'
  const lastModified = new Date()

  const staticPages: { path: string; priority: number }[] = [
    { path: '/', priority: 1.0 },
    { path: '/pricing', priority: 0.9 },
    { path: '/about', priority: 0.7 },
    { path: '/faq', priority: 0.7 },
    { path: '/tax-calculator', priority: 0.8 },
    { path: '/steuervergleich', priority: 0.8 },
    { path: '/abzugsrechner', priority: 0.8 },
    { path: '/3a-rechner', priority: 0.8 },
    { path: '/quellensteuer', priority: 0.8 },
    { path: '/steuertipps', priority: 0.7 },
    { path: '/checkliste', priority: 0.7 },
    { path: '/steuerkarte', priority: 0.7 },
    { path: '/deadlines', priority: 0.7 },
    { path: '/kanton', priority: 0.7 },
    { path: '/impressum', priority: 0.3 },
    { path: '/privacy', priority: 0.3 },
    { path: '/agb', priority: 0.3 },
  ]

  const cantonPages = Object.values(cantonSlugs).map((slug) => ({
    path: `/kanton/${slug}`,
    priority: 0.6,
  }))

  return [...staticPages, ...cantonPages].map(({ path, priority }) => ({
    url: `${baseUrl}${path}`,
    lastModified,
    changeFrequency: 'monthly' as const,
    priority,
  }))
}
