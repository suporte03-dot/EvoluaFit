import { exercises, getExerciseById, getExerciseMuscleGroup, parseRestSeconds, parseSets } from '../data/exercisesData.js'
import { normalizeMuscleGroup } from '../data/exerciseValidationMap.js'

const LEVEL_RANK = { Iniciante: 1, Intermediário: 2, Avançado: 3 }

function normalizeGroup(group) {
  return normalizeMuscleGroup(group || '') || String(group || '').trim()
}

function levelOk(candidateLevel, userLevel) {
  if (!userLevel) return true
  const c = LEVEL_RANK[candidateLevel] || 2
  const u = LEVEL_RANK[userLevel] || 2
  return c <= u + 1
}

function respectsRestrictions(candidate, restrictions = []) {
  if (!restrictions?.length) return true
  const blocked = (candidate.restrictions || []).map((r) => String(r).toLowerCase())
  const user = restrictions.map((r) => String(r).toLowerCase())
  // If candidate lists a restriction the user has, skip it
  return !user.some((r) => blocked.some((b) => b.includes(r) || r.includes(b)))
}

function equipmentScore(candidateEq, preferredEq, availableEquipment = []) {
  const eq = String(candidateEq || '').toLowerCase()
  const pref = String(preferredEq || '').toLowerCase()
  let score = 0
  if (pref && eq && (eq.includes(pref) || pref.includes(eq) || eq === pref)) score += 3
  if (availableEquipment?.length) {
    const match = availableEquipment.some((a) => {
      const al = String(a).toLowerCase()
      return eq.includes(al) || al.includes(eq) || al.includes('completa') || al.includes('academia')
    })
    if (match) score += 2
    else if (eq.includes('peso corporal') || eq.includes('corporal')) score += 1
    else score -= 1
  }
  return score
}

/**
 * Find substitute exercises for the same muscle group.
 * @returns {{ alternatives: object[], emptyMessage: string|null }}
 */
export function findExerciseAlternatives(currentExercise, options = {}) {
  const {
    userLevel = null,
    restrictions = [],
    availableEquipment = [],
    limit = 8,
  } = options

  const currentId = currentExercise?.exerciseId || currentExercise?.id
  const group = normalizeGroup(currentExercise?.muscleGroup || currentExercise?.category)
  const preferredEq = currentExercise?.equipment || ''

  if (!group) {
    return { alternatives: [], emptyMessage: 'Nenhuma alternativa encontrada para este grupo.' }
  }

  const scored = exercises
    .filter((ex) => {
      if (ex.id === currentId) return false
      const g = normalizeGroup(getExerciseMuscleGroup(ex))
      if (g !== group) {
        const muscles = (ex.muscles || []).map(normalizeGroup)
        if (!muscles.includes(group)) return false
      }
      if (!levelOk(ex.level, userLevel)) return false
      if (!respectsRestrictions(ex, restrictions)) return false
      return true
    })
    .map((ex) => {
      let score = equipmentScore(ex.equipment, preferredEq, availableEquipment)
      if (ex.type && currentExercise?.type && ex.type === currentExercise.type) score += 1
      if (ex.level === userLevel) score += 1
      return { ex, score }
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ ex }) => ex)

  if (!scored.length) {
    return { alternatives: [], emptyMessage: 'Nenhuma alternativa encontrada para este grupo.' }
  }

  return { alternatives: scored, emptyMessage: null }
}

/** Map catalog exercise into a workout/session exercise entry, keeping prescription when sensible. */
export function toWorkoutExerciseEntry(catalogExercise, keepFrom = {}) {
  const full = typeof catalogExercise === 'string' ? getExerciseById(catalogExercise) : catalogExercise
  if (!full) return null

  return {
    exerciseId: full.id,
    name: full.name,
    muscleGroup: getExerciseMuscleGroup(full),
    category: getExerciseMuscleGroup(full),
    sets: keepFrom.sets ?? parseSets(full.sets),
    reps: keepFrom.reps ?? full.reps,
    restSeconds: keepFrom.restSeconds ?? parseRestSeconds(full.rest),
    rest: keepFrom.rest ?? full.rest,
    load: keepFrom.load ?? '',
    equipment: full.equipment,
    level: full.level,
    type: full.type,
    note: keepFrom.note || keepFrom.notes || '',
  }
}

export function replaceExerciseInList(exercisesList, index, catalogExercise, keepPrescription = true) {
  const current = exercisesList[index]
  if (!current) return exercisesList
  const keep = keepPrescription
    ? {
        sets: current.sets,
        reps: current.reps,
        restSeconds: current.restSeconds,
        rest: current.rest,
        load: current.load,
        notes: current.notes,
        note: current.note,
      }
    : {}
  const next = toWorkoutExerciseEntry(catalogExercise, keep)
  if (!next) return exercisesList
  return exercisesList.map((ex, i) => (i === index ? { ...ex, ...next, setsLog: [], completedSets: 0 } : ex))
}

function scoreCatalogExercise(ex, userLevel, availableEquipment) {
  let score = equipmentScore(ex.equipment, '', availableEquipment)
  if (ex.level === userLevel) score += 1
  return score
}

/**
 * Lista exercícios do catálogo do mesmo grupo muscular (para adicionar ao treino).
 * Primários = grupo PRINCIPAL (`category` / `getExerciseMuscleGroup`).
 * Secundários = grupo aparece em `muscles` depois do primeiro → seção à parte.
 */
export function findExercisesByMuscleGroup(muscleGroup, options = {}) {
  const {
    userLevel = null,
    restrictions = [],
    availableEquipment = [],
    excludeIds = [],
    limit = 12,
    secondaryLimit = 8,
  } = options

  const group = normalizeGroup(muscleGroup)
  if (!group) {
    return {
      alternatives: [],
      secondaryAlternatives: [],
      emptyMessage: 'Selecione um grupo muscular.',
    }
  }

  const excluded = new Set((excludeIds || []).filter(Boolean))
  const primary = []
  const secondary = []

  for (const ex of exercises) {
    if (excluded.has(ex.id)) continue
    if (!levelOk(ex.level, userLevel)) continue
    if (!respectsRestrictions(ex, restrictions)) continue

    const primaryGroup = normalizeGroup(getExerciseMuscleGroup(ex))
    const muscles = (ex.muscles || []).map(normalizeGroup).filter(Boolean)
    const score = scoreCatalogExercise(ex, userLevel, availableEquipment)

    if (primaryGroup === group) {
      primary.push({ ex, score })
      continue
    }
    // Secundário: aparece em muscles, mas NÃO é o grupo principal
    if (muscles.slice(1).includes(group) || (muscles.includes(group) && primaryGroup !== group)) {
      secondary.push({ ex, score })
    }
  }

  primary.sort((a, b) => b.score - a.score)
  secondary.sort((a, b) => b.score - a.score)

  const alternatives = primary.slice(0, limit).map(({ ex }) => ex)
  const secondaryAlternatives = secondary.slice(0, secondaryLimit).map(({ ex }) => ex)

  if (!alternatives.length && !secondaryAlternatives.length) {
    return {
      alternatives: [],
      secondaryAlternatives: [],
      emptyMessage: 'Nenhum exercício encontrado para este grupo.',
    }
  }

  return { alternatives, secondaryAlternatives, emptyMessage: null }
}

/** Adiciona exercício do catálogo ao final da lista do treino. */
export function appendExerciseToList(exercisesList, catalogExercise, defaults = {}) {
  const entry = toWorkoutExerciseEntry(catalogExercise, {
    sets: defaults.sets ?? 3,
    reps: defaults.reps ?? catalogExercise?.reps ?? '8-12',
    restSeconds: defaults.restSeconds,
    rest: defaults.rest,
    load: '',
  })
  if (!entry) return exercisesList
  return [...(exercisesList || []), { ...entry, setsLog: [], completedSets: 0 }]
}
