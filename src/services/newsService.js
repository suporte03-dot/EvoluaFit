import { allNews as staticNews } from '../data/siteData'

const RSS_URL = import.meta.env.VITE_NEWS_RSS_URL || ''

let newsCache = staticNews.map(normalizeArticle)
let lastUpdatedAt = new Date()

function normalizeArticle(article) {
  return {
    ...article,
    source: article.source ?? 'Arena 360',
    fullContent: Array.isArray(article.fullContent) ? article.fullContent : [article.excerpt],
  }
}

export function getCachedNews() {
  return [...newsCache]
}

export function getHeadline() {
  return newsCache[0] ?? staticNews[0]
}

export function getSecondaryHeadlines() {
  return newsCache.slice(1, 3)
}

export function getGridNews() {
  return newsCache.slice(1)
}

export function getLastUpdatedAt() {
  return lastUpdatedAt
}

export function formatUpdateLabel(date = lastUpdatedAt) {
  const now = new Date()
  if (now - date < 60_000) return 'Atualizado agora'
  const hh = String(date.getHours()).padStart(2, '0')
  const mm = String(date.getMinutes()).padStart(2, '0')
  return `Última atualização: hoje às ${hh}:${mm}`
}

async function tryFetchExternalNews() {
  if (!RSS_URL) return null

  try {
    const response = await fetch(RSS_URL, { signal: AbortSignal.timeout(6000) })
    if (!response.ok) return null
    const data = await response.json()
    if (!Array.isArray(data?.items) || data.items.length === 0) return null

    return data.items.slice(0, 12).map((item, index) =>
      normalizeArticle({
        id: 1000 + index,
        title: item.title ?? 'Sem título',
        excerpt: item.excerpt ?? item.description ?? '',
        fullContent: [item.content ?? item.description ?? item.excerpt ?? ''],
        category: item.category ?? 'Esporte',
        filter: item.filter ?? 'futebol',
        date: item.date ?? 'Hoje',
        readTime: item.readTime ?? '3 min',
        image: item.image,
        source: item.source ?? 'Feed externo',
      }),
    )
  } catch {
    return null
  }
}

function simulateRefresh() {
  const rotated = [...staticNews]
  const [first, ...rest] = rotated
  const refreshed = [...rest, { ...first, date: '11 Jul 2026', source: 'Arena 360 — Atualizado' }]
  return refreshed.map(normalizeArticle)
}

export async function refreshNews() {
  const external = await tryFetchExternalNews()
  newsCache = external ?? simulateRefresh()
  lastUpdatedAt = new Date()
  return getCachedNews()
}
