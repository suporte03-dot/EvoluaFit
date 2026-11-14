/**
 * Resolve tipo/principal de um exercício de treino (entrada de planilha),
 * consultando o catálogo pelo `exerciseId` quando disponível.
 */
import { getExerciseById } from '../../data/exercisesData.js'
import { classifyExercise, normalizeGroup } from './classify.js'

export function catalogFor(ex = {}) {
  const id = ex.exerciseId || ex.id
  return (id && getExerciseById(id)) || null
}

/** @returns {{ kind: string, principal: boolean }} */
export function entryKind(ex = {}) {
  if (ex.kind) return classifyExercise(ex)
  const catalog = catalogFor(ex)
  if (catalog) return classifyExercise(catalog)
  return classifyExercise({
    id: ex.exerciseId || ex.id,
    name: ex.name,
    category: ex.muscleGroup || ex.category,
    type: ex.type,
  })
}

export function entryGroup(ex = {}) {
  return normalizeGroup(ex.muscleGroup || ex.category || catalogFor(ex)?.category || '')
}
