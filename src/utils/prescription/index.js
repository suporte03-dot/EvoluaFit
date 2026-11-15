/**
 * Motor de prescrição EvoluaFit — fonte única de regras.
 * Usado pelo gerador de planilhas, pelo Coach e por edições manuais.
 */
import { exercises as catalog } from '../../data/exercisesData.js'
import { classifyExercise, normalizeGroup } from './classify.js'
import { catalogFor } from './entry.js'
import {
  isLowerBodyExercise,
  parseRepRange as parseLiveRepRange,
  suggestLoad,
} from '../liveWorkout/loadSuggestion.js'

export * from './classify.js'
export * from './rules.js'
export * from './time.js'
export * from './prescribe.js'
export * from './volume.js'
export * from './validate.js'
export { entryKind, entryGroup, catalogFor } from './entry.js'

/**
 * Alternativas do mesmo grupo e tipo, filtradas pelo equipamento disponível.
 * Base para "aparelho ocupado" (fase 2).
 */
export function alternativesFor(exercise, { equipment = [], limit = 5, exclude = [] } = {}) {
  const source = catalogFor(exercise) || exercise
  if (!source) return []
  const group = normalizeGroup(source.category || source.muscleGroup)
  const { kind } = classifyExercise(source)
  const skip = new Set([source.id, ...exclude])
  const allowed = new Set(equipment)
  return catalog
    .filter(
      (ex) =>
        !ex.hiddenFromLibrary &&
        !skip.has(ex.id) &&
        normalizeGroup(ex.category) === group &&
        classifyExercise(ex).kind === kind &&
        (!allowed.size || allowed.has(ex.equipment)),
    )
    .slice(0, limit)
}

/**
 * Próxima carga sugerida a partir das séries da última sessão do exercício.
 * Regras em utils/liveWorkout/loadSuggestion.js (fonte única).
 * @param {object} exercise
 * @param {{ lastSets?: {weight:number, reps:number}[], reps?: string, upperIncrementKg?: number }} opts
 */
export function suggestNextLoad(exercise = {}, { lastSets = [], reps, upperIncrementKg } = {}) {
  const source = catalogFor(exercise) || exercise
  return suggestLoad({
    lastSets,
    repRange: parseLiveRepRange(reps ?? exercise.reps),
    lowerBody: isLowerBodyExercise({ ...source, ...exercise }),
    compound: classifyExercise(source).kind === 'composto',
    upperIncrementKg,
  })
}
