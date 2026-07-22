/** Small helpers for the SaaS home dashboard — real data only. */

export function greetingParts(date = new Date()) {
  const hour = date.getHours()
  if (hour < 12) return { hello: 'Boa manhã', emoji: '☀️' }
  if (hour < 18) return { hello: 'Boa tarde', emoji: '🌤️' }
  return { hello: 'Boa noite', emoji: '🌙' }
}

/** Derive XP from completed sessions when no XP system exists. */
export function deriveXpProgress({ history = [], workouts = [] } = {}) {
  const completedFromWorkouts = (workouts || []).filter((w) => {
    const s = String(w.status || '').toLowerCase()
    return s === 'realizado' || s === 'completed' || s === 'done'
  }).length
  const sessions = Math.max(history?.length || 0, completedFromWorkouts)
  const xp = sessions * 40
  const levelFloor = Math.floor(xp / 200) + 1
  const intoLevel = xp % 200
  const pct = Math.min(100, Math.round((intoLevel / 200) * 100))
  return {
    xp,
    levelNumber: levelFloor,
    intoLevel,
    nextLevelAt: 200,
    pct,
  }
}

/** Last N days: 1 if any session completed that day, else 0 — for sparkline. */
export function weeklyActivitySeries(history = [], workouts = [], days = 7) {
  const keys = []
  const now = new Date()
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now)
    d.setHours(0, 0, 0, 0)
    d.setDate(d.getDate() - i)
    keys.push(d.toISOString().slice(0, 10))
  }

  const done = new Set()
  ;(history || []).forEach((h) => {
    const k = String(h.completedAt || h.date || '').slice(0, 10)
    if (k) done.add(k)
  })
  ;(workouts || []).forEach((w) => {
    const s = String(w.status || '').toLowerCase()
    if (s !== 'realizado' && s !== 'completed' && s !== 'done') return
    const k = String(w.completedAt || w.date || '').slice(0, 10)
    if (k) done.add(k)
  })

  return keys.map((k) => (done.has(k) ? 1 : 0))
}

export function initialsFromName(name = 'Atleta') {
  const parts = String(name).trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return 'A'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
}
