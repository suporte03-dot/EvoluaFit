/**
 * "Aparelho ocupado": troca o exercício atual só nesta sessão.
 * A planilha salva não muda; o rascunho da sessão guarda `swappedFrom` para o histórico.
 */
import { alternativesFor } from '../prescription/index.js'

const HOME_EQUIPMENT = ['Peso corporal', 'Halteres', 'Elástico', 'Colchonete', 'Kettlebell']
const FULL_GYM = new Set(['Academia completa', 'Academia', 'Todos'])

/**
 * Equipamentos do catálogo liberados pelo perfil. [] = sem filtro (academia completa).
 * @param {string[]} equipment — profile.equipment
 * @param {string} [location] — profile.location ('Academia' | 'Casa' | 'Parque')
 */
export function resolveAllowedEquipment(equipment = [], location = 'Academia') {
  const list = (equipment || []).filter(Boolean)
  const atHome = location === 'Casa' || location === 'Parque'
  if (!list.length) return atHome ? [...HOME_EQUIPMENT] : []
  if (list.some((eq) => FULL_GYM.has(eq))) return atHome ? [...HOME_EQUIPMENT] : []
  const allowed = new Set(list)
  allowed.add('Peso corporal')
  if (allowed.has('Barra') || allowed.has('Halteres')) allowed.add('Peso livre')
  return [...allowed]
}

/** Alternativas do mesmo grupo e tipo, sem repetir o exercício original nem os já presentes no treino. */
export function findSwapAlternatives(exercise, { equipment, location, sessionExercises = [], limit = 8 } = {}) {
  if (!exercise) return []
  const exclude = [
    exercise.swappedFrom?.exerciseId,
    ...sessionExercises.map((ex) => ex?.exerciseId || ex?.id),
  ].filter(Boolean)
  const source = { ...exercise, id: exercise.exerciseId || exercise.id }
  return alternativesFor(source, {
    equipment: resolveAllowedEquipment(equipment, location),
    limit,
    exclude,
  })
}

/** Objetivo/nível da planilha do treino (ou do perfil). null = manter a prescrição atual. */
export function resolvePrescriptionContext({ workout, plans = [], generatedPlan, profile } = {}) {
  const plan =
    (workout?.planId != null && (plans || []).find((p) => String(p?.id) === String(workout.planId))) ||
    generatedPlan ||
    null
  const goal = plan?.goal || plan?.objective || profile?.objective || null
  const level = plan?.level || profile?.level || null
  if (!goal && !level) return null
  return { goal, level }
}

/**
 * Entrada de treino para o exercício substituto.
 * Sem séries feitas: séries/reps/descanso do motor (ou os atuais, sem contexto).
 * Com séries feitas: só as séries restantes, para manter o volume do dia.
 */
export function buildSwapEntry(current, alternative, prescription = null) {
  const slots = current?.setSlots || []
  const done = slots.filter((s) => s.completed).length
  const total = slots.length || Number(current?.sets) || 3
  const sets = done > 0 ? Math.max(1, total - done) : prescription?.sets || total
  const restSeconds = prescription?.restSeconds ?? current?.liveRestSeconds ?? current?.restSeconds ?? null
  return {
    exerciseId: alternative.id,
    id: alternative.id,
    name: alternative.name,
    category: alternative.category,
    muscleGroup: alternative.category || current?.muscleGroup,
    equipment: alternative.equipment,
    sets,
    reps: prescription?.reps || current?.reps,
    rest: restSeconds != null ? `${restSeconds}s` : current?.rest,
    restSeconds,
    strength: current?.strength,
    swappedFrom: current?.swappedFrom || { exerciseId: current?.exerciseId || current?.id || null, name: current?.name || '' },
  }
}

/**
 * Aplica a troca na lista da sessão.
 * Sem séries feitas: substitui no lugar. Com séries feitas: o atual fica só com as séries concluídas
 * e o substituto entra no fim (não desloca a ordem das séries já salvas na nuvem).
 * @returns {{ exercises: object[], index: number }}
 */
export function applySwap(exercises = [], index, replacement) {
  const current = exercises[index]
  if (!current || !replacement) return { exercises, index }
  const done = (current.setSlots || []).filter((s) => s.completed)
  if (!done.length) {
    return { exercises: exercises.map((ex, i) => (i === index ? replacement : ex)), index }
  }
  const truncated = {
    ...current,
    sets: done.length,
    targetSets: done.length,
    setSlots: done,
    setsLog: done,
    completedSets: done.length,
    status: 'done',
    swappedTo: replacement.name,
  }
  return {
    exercises: [...exercises.map((ex, i) => (i === index ? truncated : ex)), replacement],
    index: exercises.length,
  }
}
