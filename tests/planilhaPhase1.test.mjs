import assert from 'node:assert/strict'
import { describe, test } from 'node:test'
import {
  displayPlanWeekday,
  planWeekdayLong,
  planWeekdayShort,
} from '../src/utils/planWeekday.js'
import { generateWorkoutPlan, planToWorkouts } from '../src/utils/workoutGenerator.js'
import { findExercisesByMuscleGroup } from '../src/utils/exerciseSubstitution.js'
import { enrichWorkoutDetail } from '../src/data/workoutTemplates.js'

describe('weekday único do plano', () => {
  test('Dia 1 = Segunda nas duas formas de rótulo', () => {
    assert.equal(planWeekdayLong(1), 'Segunda-feira')
    assert.equal(planWeekdayShort(1), 'Seg')
    assert.equal(planWeekdayShort(4), 'Qui')
  })

  test('planToWorkouts usa ordinal Seg mesmo se a data civil for sexta', () => {
    const plan = {
      id: 'p1',
      startDate: '2026-11-20',
      minutesPerWorkout: 20,
      weeklyPlan: [
        {
          day: 1,
          workoutName: 'Peito',
          workoutType: 'Peito',
          muscleGroups: ['Peitoral'],
          exercises: [
            { exerciseId: 'x', name: 'Supino', muscleGroup: 'Peitoral', sets: 4, reps: '5', restSeconds: 120 },
          ],
        },
        {
          day: 2,
          workoutName: 'Costas',
          workoutType: 'Costas',
          muscleGroups: ['Costas'],
          exercises: [{ name: 'Puxada', muscleGroup: 'Costas', sets: 4, reps: '6', restSeconds: 120 }],
        },
      ],
    }
    const workouts = planToWorkouts(plan, new Date('2026-11-20T12:00:00'))
    assert.equal(workouts[0].dayLabel, 'Seg')
    assert.equal(workouts[1].dayLabel, 'Ter')
    assert.equal(displayPlanWeekday(workouts[0], { short: true }), 'Seg')
    assert.equal(planWeekdayLong(workouts[0].dayNumber), 'Segunda-feira')
  })
})

describe('classificação Peito / Braços', () => {
  test('gerador marca Braços como Braços, não Empurrar', () => {
    const plan = generateWorkoutPlan({
      goal: 'forca',
      level: 'Avançado',
      daysPerWeek: 6,
      minutesPerWorkout: 20,
      location: 'Academia',
      equipment: ['Academia completa'],
      splitStyle: 'muscle',
    })
    const arms = (plan.weeklyPlan || []).find((d) => /bra/i.test(d.workoutName || d.name || ''))
    assert.ok(arms, 'esperava dia Braços no split muscle 6x')
    assert.match(String(arms.workoutType), /bra/i)
    assert.ok(!/empurr/i.test(String(arms.workoutType)))
  })

  test('Peito no detalhe não vira Corpo inteiro', () => {
    const detail = enrichWorkoutDetail({
      name: 'Peito',
      workoutType: 'Peito',
      muscleGroups: ['Peitoral'],
      exercises: [{ name: 'Supino', muscleGroup: 'Peitoral', sets: 4, reps: '5' }],
    })
    assert.ok(!/corpo inteiro/i.test(String(detail.type)))
    assert.match(String(detail.type), /peito/i)
    assert.ok(!(detail.benefits || []).some((b) => /corpo inteiro/i.test(b)))
  })

  test('Braços no detalhe não vira Empurrar', () => {
    const detail = enrichWorkoutDetail({
      name: 'Braços',
      workoutType: 'Braços',
      muscleGroups: ['Bíceps', 'Tríceps'],
      exercises: [
        { name: 'Rosca', muscleGroup: 'Bíceps', sets: 3, reps: '10' },
        { name: 'Tríceps pulley', muscleGroup: 'Tríceps', sets: 3, reps: '10' },
      ],
    })
    assert.ok(!/empurrar/i.test(String(detail.type)))
    assert.match(String(detail.type), /bra/i)
  })
})

describe('filtro por grupo primário', () => {
  test('Peitoral: pullover de costas não entra como primário', () => {
    const { alternatives, secondaryAlternatives } = findExercisesByMuscleGroup('Peitoral', {
      limit: 80,
      secondaryLimit: 80,
    })
    const primaryNames = alternatives.map((ex) => ex.name)
    assert.ok(!primaryNames.some((n) => /pullover/i.test(n)))
    const secondaryPullover = (secondaryAlternatives || []).filter((ex) => /pullover/i.test(ex.name))
    for (const ex of secondaryPullover) {
      assert.notEqual(String(ex.category || '').toLowerCase(), 'peitoral')
    }
  })
})
