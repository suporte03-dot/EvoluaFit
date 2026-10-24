/** Accent-insensitive + light fuzzy search (no extra dependency). */

export function foldText(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

function levenshtein(a, b) {
  if (a === b) return 0
  if (!a) return b.length
  if (!b) return a.length
  if (Math.abs(a.length - b.length) > 3) return 99
  const rows = Array.from({ length: b.length + 1 }, (_, i) => i)
  for (let i = 1; i <= a.length; i += 1) {
    let prev = i - 1
    rows[0] = i
    for (let j = 1; j <= b.length; j += 1) {
      const tmp = rows[j]
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      rows[j] = Math.min(rows[j] + 1, rows[j - 1] + 1, prev + cost)
      prev = tmp
    }
  }
  return rows[b.length]
}

export function searchScore(query, ...fields) {
  const q = foldText(query)
  if (!q) return 0
  const hay = foldText(fields.filter(Boolean).join(' '))
  if (!hay) return 0
  if (hay === q) return 100
  const words = hay.split(' ').filter(Boolean)
  if (hay.startsWith(q) || words.some((word) => word.startsWith(q))) return 92
  if (hay.includes(q)) return 78
  const qWords = q.split(' ').filter(Boolean)
  let tokenHits = 0
  for (const token of qWords) {
    if (words.some((word) => word.includes(token) || token.includes(word))) {
      tokenHits += 1
      continue
    }
    if (token.length >= 4 && words.some((word) => levenshtein(token, word) <= 1)) {
      tokenHits += 0.7
    }
  }
  if (tokenHits <= 0) return 0
  return Math.round(40 + (tokenHits / qWords.length) * 35)
}

export function rankBySearch(items, query, getFields) {
  const q = foldText(query)
  if (!q) return items
  return items
    .map((item) => ({
      item,
      score: searchScore(q, ...(getFields(item) || [])),
    }))
    .filter((row) => row.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((row) => row.item)
}
