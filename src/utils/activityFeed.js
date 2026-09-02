import { isCompletedSession } from './completedSession'

const REACTION_KEY = 'evoluafit-feed-reactions'
export const FEED_REACTION = 'evoluiu'

function readReactions() {
  try {
    const raw = localStorage.getItem(REACTION_KEY)
    const parsed = raw ? JSON.parse(raw) : {}
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

function writeReactions(map) {
  try {
    localStorage.setItem(REACTION_KEY, JSON.stringify(map))
  } catch {
    /* quota */
  }
}

export function toggleFeedReaction(itemId) {
  const map = readReactions()
  if (map[itemId] === FEED_REACTION) {
    delete map[itemId]
  } else {
    map[itemId] = FEED_REACTION
  }
  writeReactions(map)
  return map
}

export function getFeedReactions() {
  return readReactions()
}

function formatWhen(value) {
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
}

export function buildActivityFeed({
  history = [],
  workouts = [],
  records = [],
  streak = null,
  limit = 8,
} = {}) {
  const items = []

  ;(history || []).forEach((h) => {
    if (!isCompletedSession(h)) return
    items.push({
      id: `session-${h.id || h.completedAt}`,
      type: 'workout',
      title: h.name || 'Treino concluído',
      detail: 'Sessão registrada',
      at: h.completedAt || h.date,
    })
  })

  ;(workouts || []).forEach((w) => {
    const s = String(w.status || '').toLowerCase()
    if (!(s === 'realizado' || s === 'completed' || s === 'done')) return
    items.push({
      id: `workout-${w.id}`,
      type: 'workout',
      title: w.name || 'Treino concluído',
      detail: 'Sessão registrada',
      at: w.completedAt || w.date,
    })
  })

  ;(records || []).forEach((r) => {
    if (!r.last_performed_at || !(r.record_weight > 0)) return
    items.push({
      id: `pr-${r.exercise_key}`,
      type: 'pr',
      title: `Recorde: ${r.exercise_name || 'exercício'}`,
      detail: `${r.record_weight} kg`,
      at: r.last_performed_at,
    })
  })

  if (streak > 0) {
    items.push({
      id: `streak-${streak}`,
      type: 'streak',
      title: `${streak} ${streak === 1 ? 'dia' : 'dias'} evoluindo`,
      detail: 'Sequência atual',
      at: new Date().toISOString(),
    })
  }

  const seen = new Set()
  return items
    .filter((item) => item.at)
    .sort((a, b) => new Date(b.at) - new Date(a.at))
    .filter((item) => {
      if (seen.has(item.id)) return false
      seen.add(item.id)
      return true
    })
    .slice(0, limit)
    .map((item) => ({ ...item, dateLabel: formatWhen(item.at) }))
}
