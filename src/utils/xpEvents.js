import { isCompletedSession } from './completedSession'

export const XP_LEVELS = [
  { min: 0, name: 'Começando', nextAt: 200 },
  { min: 200, name: 'Em ritmo', nextAt: 400 },
  { min: 400, name: 'Consistente', nextAt: 800 },
  { min: 800, name: 'Em evolução', nextAt: 1400 },
  { min: 1400, name: 'Alta performance', nextAt: null },
]

export const XP_DELTAS = {
  first_workout: 20,
  session_complete: 40,
  weekly_goal: 50,
  streak_day: 5,
}

export function resolveXpLevel(xp) {
  const total = Math.max(0, Number(xp) || 0)
  let current = XP_LEVELS[0]
  for (const level of XP_LEVELS) {
    if (total >= level.min) current = level
  }
  const next = XP_LEVELS.find((level) => level.min > current.min) || null
  const spanStart = current.min
  const spanEnd = next?.min ?? current.min + 200
  const intoLevel = total - spanStart
  const nextLevelAt = spanEnd - spanStart
  const pct = next
    ? Math.min(100, Math.round((intoLevel / nextLevelAt) * 100))
    : 100
  return {
    xp: total,
    levelName: current.name,
    levelNumber: XP_LEVELS.indexOf(current) + 1,
    intoLevel,
    nextLevelAt,
    pct,
    nextName: next?.name || null,
  }
}

function completedSessions(history = [], workouts = []) {
  const fromHistory = (history || []).filter((h) => isCompletedSession(h))
  const historyIds = new Set(fromHistory.map((h) => h.workoutId).filter(Boolean))
  const fromWorkouts = (workouts || []).filter((w) => {
    const s = String(w.status || '').toLowerCase()
    if (!(s === 'realizado' || s === 'completed' || s === 'done')) return false
    if (w.id && historyIds.has(w.id)) return false
    return true
  })
  return [
    ...fromHistory.map((h) => ({
      id: h.id || h.workoutId || h.completedAt,
      at: h.completedAt || h.date,
      source: 'history',
    })),
    ...fromWorkouts.map((w) => ({
      id: w.id,
      at: w.completedAt || w.date,
      source: 'workout',
    })),
  ].sort((a, b) => new Date(a.at || 0) - new Date(b.at || 0))
}

/**
 * Derive XP events from real sessions/goals. Not a live ledger until xp_events syncs.
 */
export function deriveXpEvents({
  history = [],
  workouts = [],
  weekly = {},
  streak = null,
} = {}) {
  const sessions = completedSessions(history, workouts)
  const events = []

  sessions.forEach((session, index) => {
    if (index === 0) {
      events.push({
        id: `first-${session.id}`,
        type: 'first_workout',
        delta: XP_DELTAS.first_workout,
        source_id: session.id,
        at: session.at,
      })
    }
    events.push({
      id: `session-${session.id}`,
      type: 'session_complete',
      delta: XP_DELTAS.session_complete,
      source_id: session.id,
      at: session.at,
    })
  })

  if (weekly.weeklyGoal > 0 && weekly.completedCount >= weekly.weeklyGoal) {
    events.push({
      id: `weekly-goal-${new Date().toISOString().slice(0, 10)}`,
      type: 'weekly_goal',
      delta: XP_DELTAS.weekly_goal,
      source_id: 'weekly_goal',
      at: new Date().toISOString(),
    })
  }

  if (streak > 0) {
    events.push({
      id: `streak-${streak}`,
      type: 'streak_day',
      delta: XP_DELTAS.streak_day * Math.min(streak, 14),
      source_id: 'streak',
      at: new Date().toISOString(),
    })
  }

  const xp = events.reduce((sum, event) => sum + event.delta, 0)
  return {
    events,
    ...resolveXpLevel(xp),
  }
}
