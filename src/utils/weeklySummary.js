import { calculateSessionStats } from './performanceUtils'
import { isCompletedSession } from './completedSession'
import { endOfWeek, formatVolume, startOfWeek } from './progressMetrics'

const STORAGE_KEY = 'evoluafit-weekly-summaries'

function weekKey(start) {
  return start.toISOString().slice(0, 10)
}

function readStore() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeStore(rows) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rows.slice(-16)))
  } catch {
    /* quota */
  }
}

function sessionsInRange(history, summaries, start, end) {
  const cloud = (summaries || []).filter((s) => {
    if (String(s.status || '').toLowerCase() !== 'completed') return false
    const d = new Date(s.completed_at || s.started_at)
    return d >= start && d < end
  })
  if (cloud.length) {
    return cloud.map((s) => ({
      name: s.workout_name || 'Treino',
      volume: Number(s.total_volume) || 0,
      duration: Math.round((Number(s.duration_seconds) || 0) / 60),
      completedAt: s.completed_at || s.started_at,
    }))
  }
  return (history || [])
    .filter((h) => isCompletedSession(h))
    .filter((h) => {
      const d = new Date(h.completedAt || h.date)
      return d >= start && d < end
    })
    .map((h) => {
      const stats = calculateSessionStats(h)
      return {
        name: h.name || 'Treino',
        volume: stats.volume,
        duration: stats.duration,
        completedAt: h.completedAt || h.date,
      }
    })
}

export function buildWeeklySummary({
  history = [],
  summaries = [],
  records = [],
  weekly = {},
  weekStart,
  referenceDate = new Date(),
} = {}) {
  const start = weekStart ? new Date(weekStart) : startOfWeek(referenceDate)
  start.setHours(0, 0, 0, 0)
  const end = new Date(start)
  end.setDate(end.getDate() + 7)
  const sessions = sessionsInRange(history, summaries, start, end)
  const volume = sessions.reduce((sum, s) => sum + (s.volume || 0), 0)
  const duration = sessions.reduce((sum, s) => sum + (s.duration || 0), 0)
  const prs = (records || []).filter((r) => {
    const d = new Date(r.last_performed_at)
    return !Number.isNaN(d.getTime()) && d >= start && d < end
  })
  const goal = weekly.weeklyGoal || null
  const goalPct =
    goal > 0 ? Math.min(100, Math.round((sessions.length / goal) * 100)) : null

  return {
    period_start: weekKey(start),
    period_end: weekKey(end),
    workouts: sessions.length,
    volume: Math.round(volume),
    duration,
    prs: prs.length,
    goal,
    goalPct,
    source: summaries?.length ? 'cloud' : 'local',
  }
}

export function weeklySummaryCopy(summary) {
  if (!summary || summary.workouts <= 0) {
    return {
      title: 'Sua semana EvoluaFit',
      body: 'Ainda não há treinos nesta semana para montar o resumo.',
    }
  }
  const parts = [
    `${summary.workouts} ${summary.workouts === 1 ? 'treino' : 'treinos'}`,
  ]
  if (summary.volume > 0) parts.push(`${formatVolume(summary.volume)} de volume`)
  if (summary.duration > 0) parts.push(`${summary.duration} min`)
  if (summary.prs > 0) {
    parts.push(`${summary.prs} ${summary.prs === 1 ? 'recorde' : 'recordes'}`)
  }
  let goalLine = ''
  if (summary.goal > 0 && summary.goalPct != null) {
    goalLine = ` Meta semanal: ${summary.workouts} de ${summary.goal}.`
  }
  return {
    title: 'Sua semana EvoluaFit',
    body: `Você fez ${parts.join(', ')}.${goalLine}`,
  }
}

/** Persist last closed week once it has ended. */
export function persistClosedWeeklySummary(input = {}) {
  const now = input.referenceDate || new Date()
  const thisStart = startOfWeek(now)
  const lastStart = new Date(thisStart)
  lastStart.setDate(lastStart.getDate() - 7)
  const summary = buildWeeklySummary({ ...input, weekStart: lastStart })
  if (summary.workouts <= 0) return summary

  const rows = readStore()
  if (rows.some((row) => row.period_start === summary.period_start)) {
    return rows.find((row) => row.period_start === summary.period_start) || summary
  }
  writeStore([...rows, { ...summary, saved_at: now.toISOString() }])
  return summary
}

export function getSavedWeeklySummaries() {
  return readStore()
}

export function getDisplayWeeklySummary(input = {}) {
  const live = buildWeeklySummary(input)
  persistClosedWeeklySummary(input)
  return live
}
