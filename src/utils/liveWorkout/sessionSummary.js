import { XP_DELTAS } from '../xpEvents'
import { parseRepRange } from './loadSuggestion.js'

export function xpGainForSession({ isFirstWorkout = false, prCount = 0, weeklyGoalReached = false } = {}) {
  const items = [{ id: 'session', label: 'Treino concluído', delta: XP_DELTAS.session_complete }]
  if (isFirstWorkout) items.push({ id: 'first', label: 'Primeiro treino', delta: XP_DELTAS.first_workout })
  if (prCount > 0) {
    items.push({
      id: 'pr',
      label: prCount === 1 ? 'Recorde pessoal' : `${prCount} recordes pessoais`,
      delta: XP_DELTAS.personal_record * prCount,
    })
  }
  if (weeklyGoalReached) items.push({ id: 'week', label: 'Meta semanal', delta: XP_DELTAS.weekly_goal })
  return { items, total: items.reduce((sum, item) => sum + item.delta, 0) }
}

const SCORE_BANDS = [
  { min: 30, name: 'Construindo ritmo' },
  { min: 50, name: 'Evolução estável' },
  { min: 70, name: 'Boa evolução' },
  { min: 85, name: 'Excelente evolução' },
]

export function nextScoreBand(value) {
  const n = Number(value)
  if (!Number.isFinite(n)) return null
  const next = SCORE_BANDS.find((band) => band.min > n)
  return next ? { name: next.name, remaining: next.min - n } : null
}

function setsVsRange(exercise) {
  const range = parseRepRange(exercise?.reps)
  const done = (exercise?.setSlots || []).filter((s) => s.completed)
  if (!range || !done.length) return null
  const reps = done.map((s) => Number(s.reps) || 0)
  return {
    allTop: reps.every((r) => r >= range.max),
    anyBelow: reps.some((r) => r < range.min),
  }
}

/** Recomendação curta do Coach Evolua baseada só no que aconteceu nesta sessão. */
export function coachRecommendation({ exercises = [], prs = [] } = {}) {
  const evaluated = exercises
    .map((ex) => ({ ex, result: setsVsRange(ex) }))
    .filter((item) => item.result)
  const toIncrease = evaluated.filter((item) => item.result.allTop).map((item) => item.ex.name)
  const struggling = evaluated.filter((item) => item.result.anyBelow).map((item) => item.ex.name)

  if (prs.length) {
    return `Recorde em ${prs[0].exerciseName}. Na próxima sessão, mantenha a carga nova e busque o topo da faixa em todas as séries antes de subir de novo.`
  }
  if (toIncrease.length) {
    return `Você bateu o topo da faixa em ${toIncrease.slice(0, 2).join(' e ')}. Na próxima, suba a carga — a sugestão já vai aparecer pronta.`
  }
  if (struggling.length) {
    return `Em ${struggling[0]} algumas séries ficaram abaixo da faixa. Mantenha a carga e priorize técnica e descanso completo.`
  }
  return 'Treino consistente. Repita as cargas na próxima sessão e tente +1 repetição por série.'
}
