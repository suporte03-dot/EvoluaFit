import { isCompletedSession } from '../../utils/completedSession'
import { initialsFromDisplayName } from '../../utils/displayName'
import { deriveXpEvents } from '../../utils/xpEvents'

export function greetingParts(date = new Date()) {
  const hour = date.getHours()
  if (hour < 12) return { hello: 'Bom dia', emoji: '☀️' }
  if (hour < 18) return { hello: 'Boa tarde', emoji: '🌤️' }
  return { hello: 'Boa noite', emoji: '🌙' }
}

export { initialsFromDisplayName as initialsFromName }

/** Product XP from real session events — separate from profiles.level (experiência de treino). */
export function deriveXpProgress({ history = [], workouts = [], weekly = {}, streak = null } = {}) {
  return deriveXpEvents({ history, workouts, weekly, streak })
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
    if (!isCompletedSession(h)) return
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
