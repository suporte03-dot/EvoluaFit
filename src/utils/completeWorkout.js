/**
 * Sugestões para completar volume de um dia / da semana sem reescrever a planilha inteira.
 */
import { exercises, getExerciseMuscleGroup } from '../data/exercisesData.js'
import { normalizeMuscleGroup } from '../data/exerciseValidationMap.js'
import {
  WEEKLY_VOLUME,
  normalizeLevel,
  defaultSets,
  restRule,
  formatRepRange,
  repRange,
} from './prescription/rules.js'
import { KINDS, classifyExercise } from './prescription/classify.js'
import { checkWeeklyVolume, weeklySetsByGroup } from './prescription/volume.js'
import { estimateWorkoutMinutes } from './prescription/time.js'
import { toWorkoutExerciseEntry } from './exerciseSubstitution.js'
import { isWeakSoleExercise, inferMovementRole } from './workoutGenerator.js'

function norm(g) {
  return normalizeMuscleGroup(g || '') || String(g || '').trim()
}

function exerciseIdsInWorkout(workout) {
  return new Set(
    (workout?.exercises || []).map((ex) => ex.exerciseId || ex.id).filter(Boolean),
  )
}

function scoreCandidate(ex, { level, equipment = [] }) {
  let score = 0
  const { kind, principal } = classifyExercise(ex)
  if (kind === KINDS.composto) score += principal ? 6 : 4
  if (kind === KINDS.isolado) score += 2
  if (!isWeakSoleExercise(ex)) score += 3
  if (ex.level === level) score += 2
  const eq = String(ex.equipment || '').toLowerCase()
  if (equipment.some((a) => /completa|academia/i.test(a))) score += 1
  else if (equipment.some((a) => eq.includes(String(a).toLowerCase()))) score += 2
  const role = inferMovementRole(ex)
  if (/flat|squat|press|vertical|horizontal|hinge/.test(role)) score += 2
  return score
}

/**
 * Candidatos do grupo alvo que ainda não estão no treino.
 */
export function candidatesToCompleteDay(workout, options = {}) {
  const {
    group = null,
    level = 'Intermediário',
    equipment = ['Academia completa'],
    restrictions = [],
    limit = 8,
  } = options
  const targetGroup = norm(group || workout?.muscleGroups?.[0] || '')
  if (!targetGroup) return []

  const used = exerciseIdsInWorkout(workout)
  const blocked = (restrictions || []).map((r) => String(r).toLowerCase())

  return exercises
    .filter((ex) => {
      if (ex.hiddenFromLibrary || used.has(ex.id)) return false
      if (norm(getExerciseMuscleGroup(ex)) !== targetGroup) return false
      const bans = (ex.restrictions || []).map((r) => String(r).toLowerCase())
      if (blocked.some((r) => bans.some((b) => b.includes(r) || r.includes(b)))) return false
      return true
    })
    .map((ex) => ({ ex, score: scoreCandidate(ex, { level, equipment }) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ ex }) => ex)
}

function toEntry(catalogEx, { level, goal }) {
  const { kind, principal } = classifyExercise(catalogEx)
  const sets = defaultSets(kind, principal, level, goal)
  const range = repRange(kind, principal, goal)
  const reps = range ? formatRepRange(range) : catalogEx.reps || '8-12'
  const rest = restRule(kind, principal, goal)?.value ?? 90
  return toWorkoutExerciseEntry(catalogEx, {
    sets,
    reps,
    restSeconds: rest,
    rest,
  })
}

/**
 * Prévia para completar um dia até a faixa mínima semanal do grupo (dividida pelos dias do grupo).
 * @returns {{ suggestions: object[], previewExercises: object[], minutesBefore: number, minutesAfter: number, group: string, deficit: number }}
 */
export function planCompleteDay(workout, plan, options = {}) {
  const level = normalizeLevel(options.level || plan?.level || 'Intermediário')
  const goal = options.goal || plan?.objective || plan?.goal || 'saude'
  const range = WEEKLY_VOLUME[level]
  const group = norm(options.group || workout?.muscleGroups?.[0] || '')
  const volume = checkWeeklyVolume(plan, level)
  const effective = volume.effective[group] || 0
  const min = range[0]
  const deficit = Math.max(0, min - effective)

  const minutesBefore = estimateWorkoutMinutes(workout?.exercises || [])
  if (!group || deficit <= 0) {
    return {
      suggestions: [],
      previewExercises: [...(workout?.exercises || [])],
      minutesBefore,
      minutesAfter: minutesBefore,
      group,
      deficit: 0,
      range,
    }
  }

  const candidates = candidatesToCompleteDay(workout, {
    group,
    level,
    equipment: options.equipment || plan?.equipment || [],
    restrictions: options.restrictions || plan?.restrictions || [],
    limit: 12,
  })

  const suggestions = []
  let remaining = deficit
  for (const ex of candidates) {
    if (remaining <= 0) break
    const entry = toEntry(ex, { level, goal })
    const sets = Number(entry.sets) || 3
    suggestions.push({ catalog: ex, entry, sets })
    remaining -= sets
  }

  const previewExercises = [
    ...(workout?.exercises || []).map((ex) => ({ ...ex })),
    ...suggestions.map((s) => s.entry),
  ]
  return {
    suggestions,
    previewExercises,
    minutesBefore,
    minutesAfter: estimateWorkoutMinutes(previewExercises),
    group,
    deficit,
    range,
  }
}

/**
 * Aplica sugestões selecionadas (índices ou todos).
 */
export function applyCompleteSuggestions(workout, suggestions, selectedIndexes = null) {
  const picks =
    selectedIndexes == null
      ? suggestions
      : suggestions.filter((_, i) => selectedIndexes.includes(i))
  return {
    ...workout,
    exercises: [
      ...(workout?.exercises || []).map((ex) => ({ ...ex })),
      ...picks.map((s) => ({ ...s.entry })),
    ],
  }
}

/** Move exercício no array (reordenar). */
export function moveExercise(exercises, fromIndex, delta) {
  const list = [...(exercises || [])]
  const to = fromIndex + delta
  if (fromIndex < 0 || to < 0 || to >= list.length) return list
  const [item] = list.splice(fromIndex, 1)
  list.splice(to, 0, item)
  return list
}

export function removeExerciseAt(exercises, index) {
  return (exercises || []).filter((_, i) => i !== index)
}

export function updateExerciseFields(exercises, index, patch) {
  return (exercises || []).map((ex, i) => (i === index ? { ...ex, ...patch } : ex))
}

/** Tempo recomendado para regenerar e sair da faixa baixa (mesmo split). */
export function suggestedDurationBump(currentMinutes, level) {
  const min = WEEKLY_VOLUME[normalizeLevel(level)]?.[0] || 12
  const cur = Number(currentMinutes) || 20
  // Heurística: ~4 séries extras pedem ~10–15 min
  const bump = min >= 16 ? 25 : 15
  return Math.min(90, Math.max(cur + bump, recommendedFloor(level)))
}

function recommendedFloor(level) {
  const l = normalizeLevel(level)
  if (l === 'Avançado') return 45
  if (l === 'Intermediário') return 40
  return 35
}

export function weeklyDirectSets(plan) {
  return weeklySetsByGroup(plan, { effective: false })
}
