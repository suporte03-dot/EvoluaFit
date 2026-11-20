import assert from 'node:assert/strict'
import { describe, test } from 'node:test'
import {
  describeTimeBudget,
  estimateSessionMinutes,
  fitExerciseCount,
  recommendedMinutesFor,
} from '../src/utils/timeBudget.js'
import {
  generateWorkoutPlan,
  inferMovementRole,
  isWeakSoleExercise,
} from '../src/utils/workoutGenerator.js'

describe('orçamento de tempo', () => {
  test('20 min Força/Avançado cabe ~1 exercício', () => {
    const fit = fitExerciseCount({ minutes: 20, goal: 'forca', level: 'Avançado' })
    assert.ok(fit.exercises <= 2)
    assert.equal(fit.setsPerExercise >= 4, true)
    const budget = describeTimeBudget({
      minutes: 20,
      goal: 'forca',
      level: 'Avançado',
      daysPerWeek: 6,
      splitStyle: 'muscle',
    })
    assert.match(budget.message, /~1 exercício|~2 exercícios/)
    assert.equal(budget.showUseRecommended, true)
    assert.equal(budget.recommendedMinutes, recommendedMinutesFor({ goal: 'forca', level: 'Avançado' }))
  })

  test('estimateSessionMinutes cresce com mais exercícios', () => {
    const one = estimateSessionMinutes({ exercises: 1, setsPerExercise: 4, restSec: 120 })
    const two = estimateSessionMinutes({ exercises: 2, setsPerExercise: 4, restSec: 120 })
    assert.ok(two > one)
  })
})

describe('prioridade do gerador com pouco tempo', () => {
  test('isWeakSoleExercise marca pliometria e unilateral', () => {
    assert.equal(isWeakSoleExercise({ name: 'Agachamento com salto e halteres', category: 'Pernas' }), true)
    assert.equal(isWeakSoleExercise({ name: 'Supino unilateral no cabo', category: 'Peitoral' }), true)
    assert.equal(isWeakSoleExercise({ name: 'Supino reto com barra', category: 'Peitoral' }), false)
    assert.equal(inferMovementRole({ name: 'Agachamento com salto', category: 'Pernas' }), 'leg_plyo')
  })

  test('caso real 20 min: Peito e Pernas não são o único exercício fraco', () => {
    const plan = generateWorkoutPlan({
      goal: 'forca',
      level: 'Avançado',
      daysPerWeek: 6,
      minutesPerWorkout: 20,
      location: 'Academia',
      equipment: ['Academia completa'],
      splitStyle: 'muscle',
    })
    const days = plan.weeklyPlan || []
    const peito = days.find((d) => /peito/i.test(d.workoutName || ''))
    const pernas = days.find((d) => /perna/i.test(d.workoutName || ''))
    assert.ok(peito?.exercises?.length)
    assert.ok(pernas?.exercises?.length)
    if (peito.exercises.length === 1) {
      assert.equal(isWeakSoleExercise(peito.exercises[0]), false)
      assert.ok(!/unilateral|salto|pliom/i.test(peito.exercises[0].name))
    }
    if (pernas.exercises.length === 1) {
      assert.equal(isWeakSoleExercise(pernas.exercises[0]), false)
      assert.ok(!/salto|pliom|unilateral/i.test(pernas.exercises[0].name))
    }
  })
})
