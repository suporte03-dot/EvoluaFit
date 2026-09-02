import { isCompletedSession } from './completedSession'

export const DEFAULT_CHALLENGE = {
  id: '12-in-4',
  title: '12 treinos em 4 semanas',
  target: 12,
  windowDays: 28,
}

function completedAt(entry) {
  return new Date(entry.completedAt || entry.completed_at || entry.date)
}

export function getChallengeProgress({
  history = [],
  workouts = [],
  challenge = DEFAULT_CHALLENGE,
  referenceDate = new Date(),
} = {}) {
  const end = new Date(referenceDate)
  const start = new Date(end)
  start.setDate(start.getDate() - challenge.windowDays)
  start.setHours(0, 0, 0, 0)

  const fromHistory = (history || []).filter((h) => {
    if (!isCompletedSession(h)) return false
    const d = completedAt(h)
    return d >= start && d <= end
  })
  const ids = new Set(fromHistory.map((h) => h.workoutId).filter(Boolean))
  const fromWorkouts = (workouts || []).filter((w) => {
    const s = String(w.status || '').toLowerCase()
    if (!(s === 'realizado' || s === 'completed' || s === 'done')) return false
    if (w.id && ids.has(w.id)) return false
    const d = completedAt(w)
    return d >= start && d <= end
  })

  const current = fromHistory.length + fromWorkouts.length
  const pct = Math.min(100, Math.round((current / challenge.target) * 100))
  return {
    ...challenge,
    current,
    pct,
    remaining: Math.max(0, challenge.target - current),
    sentence:
      current >= challenge.target
        ? `Desafio concluído: ${current} treinos nas últimas ${challenge.windowDays / 7} semanas.`
        : `${current} de ${challenge.target} treinos nas últimas ${challenge.windowDays / 7} semanas.`,
  }
}
