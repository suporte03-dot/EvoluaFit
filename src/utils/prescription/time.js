/**
 * Tempo estimado de sessão e corte para caber na duração escolhida.
 * Tempo = 5 min de aquecimento + Σ por série (≈40 s de execução + descanso).
 */
import { KINDS } from './classify.js'
import { DURATION_TOLERANCE, WARMUP_MINUTES, WORK_SECONDS_PER_SET } from './rules.js'
import { entryKind } from './entry.js'

/** @returns {{ lo: number, hi: number, unit: 'reps'|'s'|'min' } | null} */
export function parseRepRange(value) {
  if (value == null) return null
  const text = String(value).toLowerCase()
  const nums = (text.match(/\d+(?:[.,]\d+)?/g) || []).map((n) => Number(n.replace(',', '.')))
  if (!nums.length) return null
  const lo = nums[0]
  const hi = nums.length > 1 ? nums[1] : nums[0]
  let unit = 'reps'
  if (/\bmin/.test(text)) unit = 'min'
  else if (/\d\s*s\b|seg|segundo/.test(text)) unit = 's'
  return { lo: Math.min(lo, hi), hi: Math.max(lo, hi), unit }
}

export function parseRestValue(ex = {}) {
  const raw = ex.restSeconds ?? ex.rest
  const n = Number(raw)
  if (Number.isFinite(n) && n >= 0 && raw !== '' && raw !== null) return n
  const nums = String(raw ?? '').match(/\d+/g)
  if (!nums?.length) return 60
  const value = Math.max(...nums.map(Number))
  return /min/i.test(String(raw)) ? value * 60 : value
}

export function parseSetCount(value) {
  const n = Number(value)
  if (Number.isFinite(n) && n > 0) return Math.round(n)
  const nums = String(value ?? '').match(/\d+/g)
  return nums?.length ? Math.max(...nums.map(Number)) : 3
}

function workSecondsFor(ex) {
  const parsed = parseRepRange(ex.reps)
  if (parsed?.unit === 'min') return parsed.hi * 60
  if (parsed?.unit === 's') return parsed.hi
  return WORK_SECONDS_PER_SET
}

export function estimateExerciseSeconds(ex) {
  const sets = parseSetCount(ex.sets)
  return sets * (workSecondsFor(ex) + parseRestValue(ex))
}

/** Minutos estimados de um treino (objeto com `exercises` ou lista de exercícios). */
export function estimateWorkoutMinutes(workoutOrExercises) {
  const list = Array.isArray(workoutOrExercises) ? workoutOrExercises : workoutOrExercises?.exercises || []
  if (!list.length) return 0
  const seconds = list.reduce((sum, ex) => sum + estimateExerciseSeconds(ex), 0)
  return WARMUP_MINUTES + Math.round(seconds / 60)
}

export function durationLimit(minutes) {
  return Math.floor(Number(minutes) * (1 + DURATION_TOLERANCE))
}

/** Índice do composto principal da sessão: o primeiro composto (nunca é cortado). */
export function mainExerciseIndex(exercises) {
  const compound = exercises.findIndex((ex) => entryKind(ex).kind === KINDS.composto)
  return compound >= 0 ? compound : 0
}

const TRIM_SET_KINDS = new Set([KINDS.isolado, KINDS.panturrilha, KINDS.core])
const REMOVE_ORDER = [
  [KINDS.isolado],
  [KINDS.panturrilha, KINDS.core, KINDS.mobilidade, KINDS.cardio],
  [KINDS.composto],
]

/**
 * Corta séries de isolados, depois exercícios acessórios, até caber em
 * `minutes` + 10%. Nunca remove o composto principal.
 * @returns {{ exercises: object[], changes: object[], minutes: number }}
 */
export function fitToDuration(workoutOrExercises, minutes) {
  const source = Array.isArray(workoutOrExercises) ? workoutOrExercises : workoutOrExercises?.exercises || []
  let list = source.map((ex) => ({ ...ex }))
  const changes = []
  if (!list.length || !(Number(minutes) > 0)) {
    return { exercises: list, changes, minutes: estimateWorkoutMinutes(list) }
  }
  const limit = durationLimit(minutes)
  let mainId = list[mainExerciseIndex(list)]

  for (let guard = 0; guard < 200 && estimateWorkoutMinutes(list) > limit; guard += 1) {
    const mainIdx = list.indexOf(mainId)

    let idx = -1
    for (let i = list.length - 1; i >= 0; i -= 1) {
      if (i === mainIdx) continue
      if (TRIM_SET_KINDS.has(entryKind(list[i]).kind) && parseSetCount(list[i].sets) > 2) {
        idx = i
        break
      }
    }
    if (idx >= 0) {
      const from = parseSetCount(list[idx].sets)
      list[idx] = { ...list[idx], sets: from - 1 }
      changes.push({
        type: 'sets',
        exerciseId: list[idx].exerciseId,
        name: list[idx].name,
        from,
        to: from - 1,
        reason: 'Série de isolado cortada para caber na duração escolhida.',
      })
      continue
    }

    const heavyIdx = list.findIndex((ex) => entryKind(ex).kind === KINDS.composto && parseSetCount(ex.sets) > 4)
    if (heavyIdx >= 0) {
      const from = parseSetCount(list[heavyIdx].sets)
      const updated = { ...list[heavyIdx], sets: 4 }
      if (list[heavyIdx] === mainId) mainId = updated
      list[heavyIdx] = updated
      changes.push({
        type: 'sets',
        exerciseId: updated.exerciseId,
        name: updated.name,
        from,
        to: 4,
        reason: 'Composto ajustado para 4 séries para caber na duração escolhida.',
      })
      continue
    }

    let removeIdx = -1
    if (list.length > 1) {
      for (const kinds of REMOVE_ORDER) {
        for (let i = list.length - 1; i >= 0; i -= 1) {
          if (i === mainIdx) continue
          if (kinds.includes(entryKind(list[i]).kind)) {
            removeIdx = i
            break
          }
        }
        if (removeIdx >= 0) break
      }
    }
    if (removeIdx >= 0) {
      const [removed] = list.splice(removeIdx, 1)
      changes.push({
        type: 'remove',
        exerciseId: removed.exerciseId,
        name: removed.name,
        from: removed.name,
        to: null,
        reason: 'Exercício acessório removido para caber na duração escolhida.',
      })
      continue
    }

    const mainSets = parseSetCount(mainId.sets)
    if (mainSets > 3) {
      const updated = { ...mainId, sets: mainSets - 1 }
      list[mainIdx] = updated
      mainId = updated
      changes.push({
        type: 'sets',
        exerciseId: updated.exerciseId,
        name: updated.name,
        from: mainSets,
        to: mainSets - 1,
        reason: 'Uma série do composto principal saiu para caber na duração escolhida.',
      })
      continue
    }
    break
  }

  return { exercises: list, changes, minutes: estimateWorkoutMinutes(list) }
}
