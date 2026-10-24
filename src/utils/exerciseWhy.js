import { displayMovementRole } from './trainingIdentity'

function groupOf(exercise) {
  return exercise?.muscleGroup || exercise?.category || ''
}

export function musclesFromExercises(exercises = []) {
  const seen = new Set()
  const list = []
  for (const exercise of exercises || []) {
    const groups = [groupOf(exercise), ...(exercise?.muscles || [])].filter(Boolean)
    for (const group of groups) {
      const key = String(group)
      if (seen.has(key)) continue
      seen.add(key)
      list.push(key)
    }
  }
  return list
}

export function whyExerciseInWorkout(exercise, workout) {
  const group = groupOf(exercise)
  const role = displayMovementRole(exercise?.movementRoleLabel || exercise?.movementType)
  const day = workout?.name || workout?.workoutType || 'treino'

  if (role && group) {
    return `Está neste ${day} porque é ${String(role).toLowerCase()} de ${group}.`
  }
  if (group) {
    return `Trabalha ${group}, o foco deste treino.`
  }
  return 'Compõe o volume planejado para este dia da rotina.'
}
