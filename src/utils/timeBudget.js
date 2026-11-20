/**
 * Orçamento de tempo puro — usado pelo aviso da Etapa 2 e pelo gerador.
 * Tempo ≈ aquecimento + séries × (execução + descanso).
 */
import {
  WARMUP_MINUTES,
  WORK_SECONDS_PER_SET,
  DURATION_TOLERANCE,
  normalizeGoal,
  normalizeLevel,
  defaultSets,
  restRule,
} from './prescription/rules.js'
import { KINDS } from './prescription/classify.js'

/** Minutos recomendados por objetivo × nível (para “Usar recomendado”). */
export const RECOMMENDED_MINUTES = {
  forca: { Iniciante: 45, Intermediário: 50, Avançado: 60 },
  hipertrofia: { Iniciante: 40, Intermediário: 45, Avançado: 55 },
  saude: { Iniciante: 30, Intermediário: 40, Avançado: 45 },
  condicionamento: { Iniciante: 30, Intermediário: 40, Avançado: 45 },
  emagrecimento: { Iniciante: 30, Intermediário: 40, Avançado: 45 },
  mobilidade: { Iniciante: 25, Intermediário: 30, Avançado: 35 },
}

export function recommendedMinutesFor({ goal, level } = {}) {
  const g = normalizeGoal(goal)
  const l = normalizeLevel(level)
  return RECOMMENDED_MINUTES[g]?.[l] || RECOMMENDED_MINUTES.saude.Intermediário
}

/** Segundos de uma sessão com N exercícios × sets (composto principal). */
export function estimateSessionSeconds({
  exercises = 1,
  setsPerExercise = 4,
  workSeconds = WORK_SECONDS_PER_SET,
  restSec = 120,
  warmupMinutes = WARMUP_MINUTES,
} = {}) {
  const n = Math.max(0, Number(exercises) || 0)
  const sets = Math.max(1, Number(setsPerExercise) || 1)
  const work = Number(workSeconds) > 0 ? Number(workSeconds) : WORK_SECONDS_PER_SET
  const rest = Number(restSec) >= 0 ? Number(restSec) : 90
  const warmup = Math.max(0, Number(warmupMinutes) || 0) * 60
  return warmup + n * sets * (work + rest)
}

export function estimateSessionMinutes(opts) {
  return Math.round(estimateSessionSeconds(opts) / 60)
}

export function durationLimitMinutes(minutes) {
  return Math.floor(Number(minutes) * (1 + DURATION_TOLERANCE))
}

/**
 * Quantos exercícios cabem no tempo, com séries típicas de força/hipertrofia.
 * @returns {{ exercises: number, setsPerExercise: number, estimatedMinutes: number, limitMinutes: number }}
 */
export function fitExerciseCount({
  minutes = 45,
  goal = 'saude',
  level = 'Intermediário',
  kind = KINDS.composto,
} = {}) {
  const g = normalizeGoal(goal)
  const l = normalizeLevel(level)
  const setsPerExercise = defaultSets(kind, true, l, g)
  const restSec = restRule(kind, true, g)
  const limitMinutes = durationLimitMinutes(minutes)
  const limitSeconds = limitMinutes * 60

  let exercises = 0
  for (let n = 1; n <= 12; n += 1) {
    const seconds = estimateSessionSeconds({
      exercises: n,
      setsPerExercise,
      restSec,
    })
    if (seconds / 60 > limitMinutes && n > 1) break
    if (seconds > limitSeconds && n > 1) break
    exercises = n
    if (seconds / 60 > limitMinutes) break
  }
  if (exercises < 1) exercises = 1

  return {
    exercises,
    setsPerExercise,
    estimatedMinutes: estimateSessionMinutes({
      exercises,
      setsPerExercise,
      restSec,
    }),
    limitMinutes,
    restSec,
  }
}

/**
 * Texto do aviso ao vivo da Etapa 2 + minutos recomendados.
 */
export function describeTimeBudget({
  minutes,
  goal,
  level,
  daysPerWeek,
  splitStyle,
} = {}) {
  const fit = fitExerciseCount({ minutes, goal, level })
  const recommended = recommendedMinutesFor({ goal, level })
  const goalLabel =
    normalizeGoal(goal) === 'forca'
      ? 'Força'
      : normalizeGoal(goal) === 'hipertrofia'
        ? 'Hipertrofia'
        : 'seu objetivo'
  const levelLabel = normalizeLevel(level)
  const tight = Number(minutes) < recommended - 5
  const plural = fit.exercises === 1 ? 'exercício' : 'exercícios'
  const setsLabel = `${fit.setsPerExercise} séries`
  let message = `Com essas escolhas cabe ~${fit.exercises} ${plural} por dia (${setsLabel}).`
  if (tight) {
    message += ` Recomendado para ${goalLabel}/${levelLabel}: ${recommended} min.`
  }
  if (daysPerWeek && splitStyle === 'muscle' && fit.exercises <= 1) {
    message += ' Em divisão por grupo, volume semanal fica baixo com pouco tempo.'
  }
  return {
    ...fit,
    recommendedMinutes: recommended,
    tight,
    message,
    showUseRecommended: tight,
  }
}
