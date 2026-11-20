import assert from 'node:assert/strict'
import { describe, test } from 'node:test'
import { generateWorkoutPlan } from '../src/utils/workoutGenerator.js'
import { findExercisesByMuscleGroup } from '../src/utils/exerciseSubstitution.js'
import {
  applyCompleteSuggestions,
  moveExercise,
  planCompleteDay,
  removeExerciseAt,
  updateExerciseFields,
} from '../src/utils/completeWorkout.js'
import { checkWeeklyVolume } from '../src/utils/prescription/volume.js'

describe('completar treino e edições', () => {
  test('planCompleteDay sugere exercícios quando volume está baixo', () => {
    const plan = generateWorkoutPlan({
      goal: 'forca',
      level: 'Avançado',
      daysPerWeek: 6,
      minutesPerWorkout: 20,
      location: 'Academia',
      equipment: ['Academia completa'],
      splitStyle: 'muscle',
    })
    const peito = (plan.weeklyPlan || []).find((d) => /peito/i.test(d.workoutName || ''))
    assert.ok(peito)
    const workout = {
      name: peito.workoutName,
      muscleGroups: peito.muscleGroups,
      exercises: peito.exercises,
      workoutType: peito.workoutType,
    }
    const preview = planCompleteDay(workout, plan, { level: 'Avançado', goal: 'forca' })
    const volume = checkWeeklyVolume(plan, 'Avançado')
    const peitoBelow = volume.below.some((b) => /peitoral|peito/i.test(b.group))
    if (peitoBelow || preview.deficit > 0) {
      assert.ok(preview.suggestions.length >= 1)
      assert.ok(preview.minutesAfter >= preview.minutesBefore)
      const applied = applyCompleteSuggestions(workout, preview.suggestions)
      assert.ok(applied.exercises.length > workout.exercises.length)
    } else {
      assert.equal(preview.deficit, 0)
    }
  })

  test('reordenar, remover e editar campos', () => {
    const list = [
      { name: 'A', sets: 3, reps: '8', restSeconds: 90 },
      { name: 'B', sets: 3, reps: '10', restSeconds: 60 },
      { name: 'C', sets: 2, reps: '12', restSeconds: 45 },
    ]
    assert.deepEqual(
      moveExercise(list, 0, 1).map((ex) => ex.name),
      ['B', 'A', 'C'],
    )
    assert.deepEqual(
      removeExerciseAt(list, 1).map((ex) => ex.name),
      ['A', 'C'],
    )
    const edited = updateExerciseFields(list, 0, { sets: 5, reps: '5' })
    assert.equal(edited[0].sets, 5)
    assert.equal(edited[0].reps, '5')
    assert.equal(edited[1].name, 'B')
  })
})

describe('seletor — primário e ordenação', () => {
  test('filtro Peitoral não lista pullover como primário', () => {
    const { alternatives } = findExercisesByMuscleGroup('Peitoral', { limit: 50 })
    assert.ok(!alternatives.some((ex) => /pullover/i.test(ex.name)))
  })
})
