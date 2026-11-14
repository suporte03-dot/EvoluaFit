import assert from 'node:assert/strict'
import { test } from 'node:test'
import { exercises } from '../src/data/exercisesData.js'
import { generateWorkoutPlan, planToWorkouts } from '../src/utils/workoutGenerator.js'
import { displayWorkoutName, displayWorkoutType } from '../src/utils/workoutLabels.js'
import {
  KINDS,
  checkWeeklyVolume,
  entryKind,
  estimateWorkoutMinutes,
  fitToDuration,
  parseRepRange,
  validatePlan,
  validateWorkout,
} from '../src/utils/prescription/index.js'

const RUNS = 15

function allExercises(plan) {
  return plan.weeklyPlan.flatMap((day) => day.exercises)
}

test('every visible catalog exercise has a kind', () => {
  const valid = new Set(Object.values(KINDS))
  const missing = exercises.filter((ex) => !ex.hiddenFromLibrary && !valid.has(ex.kind))
  assert.equal(missing.length, 0, missing.map((ex) => ex.id).join(', '))
})

test('Avançado + Força + 6x + 30 min fits in 33 min every day', () => {
  for (let i = 0; i < RUNS; i += 1) {
    const plan = generateWorkoutPlan({ goal: 'forca', level: 'Avançado', daysPerWeek: 6, duration: 30 })
    for (const day of plan.weeklyPlan) {
      assert.ok(estimateWorkoutMinutes(day.exercises) <= 33, `${day.workoutName}: ${estimateWorkoutMinutes(day.exercises)} min`)
      assert.ok(day.exercises.some((ex) => entryKind(ex).kind === KINDS.composto), `${day.workoutName} sem composto`)
    }
  }
})

test('no isolation exercise ever gets fewer than 8 reps', () => {
  const goals = ['forca', 'hipertrofia', 'saude', 'condicionamento', 'emagrecimento']
  const levels = ['Iniciante', 'Intermediário', 'Avançado']
  for (const goal of goals) {
    for (const level of levels) {
      const plan = generateWorkoutPlan({ goal, level, daysPerWeek: 5, duration: 60 })
      for (const ex of allExercises(plan)) {
        if (entryKind(ex).kind !== KINDS.isolado) continue
        const reps = parseRepRange(ex.reps)
        assert.ok(reps && reps.lo >= 8, `${goal}/${level} ${ex.name}: ${ex.reps}`)
      }
    }
  }
})

test('weekly volume stays inside the level range when time allows', () => {
  const scenarios = [
    { goal: 'hipertrofia', level: 'Intermediário', daysPerWeek: 4, duration: 60 },
    { goal: 'hipertrofia', level: 'Avançado', daysPerWeek: 6, duration: 75 },
    { goal: 'hipertrofia', level: 'Avançado', daysPerWeek: 5, duration: 75 },
  ]
  for (const input of scenarios) {
    for (let i = 0; i < RUNS; i += 1) {
      const plan = generateWorkoutPlan(input)
      const { below, above } = checkWeeklyVolume(plan, input.level)
      assert.deepEqual(below, [], `${JSON.stringify(input)} abaixo: ${JSON.stringify(below)}`)
      assert.deepEqual(above, [], `${JSON.stringify(input)} acima: ${JSON.stringify(above)}`)
    }
  }
})

test('generated plans pass validation with zero corrections', () => {
  for (const goal of ['forca', 'hipertrofia', 'saude']) {
    for (const days of [3, 4, 6]) {
      const plan = generateWorkoutPlan({ goal, level: 'Intermediário', daysPerWeek: days, duration: 45 })
      const result = validatePlan(plan)
      assert.equal(result.valid, true, JSON.stringify(result.corrections.slice(0, 2)))
    }
  }
})

test('rest is always a multiple of 15 s and sets stay 2-4 (5 only advanced main compounds)', () => {
  for (const level of ['Iniciante', 'Intermediário', 'Avançado']) {
    const plan = generateWorkoutPlan({ goal: 'forca', level, daysPerWeek: 4, duration: 75 })
    for (const ex of allExercises(plan)) {
      assert.equal(Number(ex.restSeconds) % 15, 0, `${ex.name}: ${ex.restSeconds}`)
      const { kind, principal } = entryKind(ex)
      if (kind === KINDS.cardio || kind === KINDS.mobilidade) continue
      const max = kind === KINDS.composto && principal && level === 'Avançado' ? 5 : 4
      assert.ok(ex.sets >= 2 && ex.sets <= max, `${level} ${ex.name}: ${ex.sets}`)
    }
  }
})

test('fitToDuration never removes the main compound', () => {
  const workout = [
    { exerciseId: 'agachamento', name: 'Agachamento livre', sets: 5, reps: '3-6', restSeconds: 180 },
    { exerciseId: 'leg-press', name: 'Leg press', sets: 4, reps: '4-6', restSeconds: 150 },
    { exerciseId: 'cadeira-extensora', name: 'Cadeira extensora', sets: 4, reps: '8-12', restSeconds: 90 },
    { exerciseId: 'panturrilha', name: 'Panturrilha', sets: 4, reps: '8-12', restSeconds: 60 },
  ]
  const result = fitToDuration(workout, 20)
  assert.equal(result.exercises[0].exerciseId, 'agachamento')
  assert.ok(result.changes.length > 0)
})

test('tags only show groups present in the workout', () => {
  const plan = generateWorkoutPlan({ goal: 'hipertrofia', level: 'Avançado', daysPerWeek: 6, duration: 30 })
  for (const day of plan.weeklyPlan) {
    const hasMobility = day.exercises.some((ex) => entryKind(ex).kind === KINDS.mobilidade)
    assert.equal(day.muscleGroups.includes('Mobilidade'), hasMobility, day.workoutName)
  }
})

test('validateWorkout fixes a legacy workout and explains why', () => {
  const legacy = {
    workoutName: 'Pull B',
    muscleGroups: ['Costas', 'Bíceps', 'Mobilidade'],
    exercises: [
      { exerciseId: 'remada-curvada', name: 'Remada curvada', sets: 4, reps: '4-6', restSeconds: 145 },
      { exerciseId: 'rosca-zottman', name: 'Rosca Zottman', sets: 5, reps: '4-6', restSeconds: 145 },
    ],
  }
  const result = validateWorkout(legacy, { goal: 'forca', level: 'Avançado' })
  assert.equal(result.valid, false)
  const zottman = result.workout.exercises.find((ex) => ex.exerciseId === 'rosca-zottman')
  assert.equal(zottman.reps, '8-12')
  assert.equal(zottman.sets, 4)
  assert.equal(zottman.restSeconds % 15, 0)
  assert.ok(result.corrections.every((c) => typeof c.reason === 'string' && c.reason.length > 0))
  assert.ok(!result.workout.muscleGroups.includes('Mobilidade'))
  assert.equal(legacy.exercises[1].reps, '4-6', 'input must not be mutated')
})

test('new plans start today and keep that weekday pattern', () => {
  const plan = generateWorkoutPlan({ goal: 'saude', level: 'Intermediário', daysPerWeek: 3, duration: 45 })
  const workouts = planToWorkouts(plan)
  assert.equal(workouts[0].date, plan.startDate)
})

test('workout names and types are always shown in Portuguese', () => {
  assert.equal(displayWorkoutName('Pull B'), 'Puxar B')
  assert.equal(displayWorkoutName('Push — peito e tríceps'), 'Empurrar — peito e tríceps')
  assert.equal(displayWorkoutName('Full Body A'), 'Corpo inteiro A')
  assert.equal(displayWorkoutType('Legs (leve)'), 'Pernas (leve)')
  assert.equal(displayWorkoutType('Upper'), 'Superiores')
  assert.equal(displayWorkoutName('Puxar B'), 'Puxar B')
})
