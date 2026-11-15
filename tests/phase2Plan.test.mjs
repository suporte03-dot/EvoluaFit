import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  PROFESSIONAL_ADVICE,
  adjustDayWorkout,
  adjustForReadiness,
  adjustForTime,
  loadsRegion,
} from '../src/utils/dayAdjust.js'
import { planElasticWeek, sameFocus } from '../src/utils/elasticWeek.js'
import { applyReorganizedWeek } from '../src/utils/adaptiveWeek.js'
import { adaptWorkoutForCheck } from '../src/utils/preWorkoutAdapt.js'
import {
  KINDS,
  entryKind,
  estimateWorkoutMinutes,
  mainExerciseIndex,
} from '../src/utils/prescription/index.js'

const legDay = () => ({
  id: 'w-legs',
  name: 'Pernas',
  estimatedMinutes: 60,
  exercises: [
    { exerciseId: 'agachamento', name: 'Agachamento livre', muscleGroup: 'Pernas', sets: 4, reps: '8-10', rest: 120 },
    { exerciseId: 'leg-press', name: 'Leg press 45°', muscleGroup: 'Pernas', sets: 3, reps: '10-12', rest: 90 },
    { exerciseId: 'stiff', name: 'Stiff com halteres', muscleGroup: 'Pernas', sets: 3, reps: '10-12', rest: 90 },
    { exerciseId: 'cadeira-extensora', name: 'Cadeira extensora', muscleGroup: 'Pernas', sets: 3, reps: '12-15', rest: 60 },
    { exerciseId: 'crucifixo', name: 'Crucifixo', muscleGroup: 'Peitoral', sets: 3, reps: '12-15', rest: 60 },
    { exerciseId: 'panturrilha', name: 'Panturrilha em pé', muscleGroup: 'Panturrilha', sets: 4, reps: '12-15', rest: 45 },
  ],
})

test('time chips: 30 min keeps the main compound and fits in 33 min', () => {
  const workout = legDay()
  const main = workout.exercises[mainExerciseIndex(workout.exercises)]
  const result = adjustForTime(workout, 30)
  assert.ok(result.minutes <= 33, `${result.minutes} min`)
  assert.ok(estimateWorkoutMinutes(result.workout) <= 33)
  assert.ok(result.workout.exercises.some((ex) => ex.exerciseId === main.exerciseId))
  assert.equal(entryKind(main).kind, KINDS.composto)
  assert.ok(result.changes.length > 0)
  assert.match(result.summary, /para caber em 30 min/)
  assert.equal(result.workout.estimatedMinutes, 60, 'estimatedMinutes salvo não muda')
  assert.equal(workout.exercises.length, 6, 'treino original intacto')
})

test("time chips: 'tempo normal' returns the original workout", () => {
  const workout = legDay()
  const cut = adjustForTime(workout, 20)
  const restored = adjustForTime(cut.workout.sessionTimeTarget ? workout : cut.workout, null)
  assert.deepEqual(restored.workout.exercises, workout.exercises)
  assert.equal(restored.changes.length, 0)
  assert.equal(restored.workout.sessionTimeTarget, undefined)
})

test('readiness: low readiness removes 1 set (min 2) and keeps reps', () => {
  const workout = legDay()
  const result = adjustForReadiness(workout, { sleep: 'ruim', energy: 'baixa' })
  assert.equal(result.level, 'low')
  result.workout.exercises.forEach((ex, i) => {
    const before = workout.exercises[i]
    assert.equal(ex.reps, before.reps)
    const kind = entryKind(before).kind
    if (kind === KINDS.composto || kind === KINDS.isolado) {
      assert.equal(ex.sets, Math.max(2, before.sets - 1), ex.name)
      assert.ok(ex.sets >= 2)
    }
  })
  assert.ok(result.note)
  assert.equal(result.workout.estimatedMinutes, 60)
})

test('readiness: knee pain removes/replaces knee-loading exercises with advice', () => {
  const workout = legDay()
  const result = adjustForReadiness(workout, { sleep: 'ok', energy: 'ok', pain: true, painRegion: 'joelho' })
  assert.equal(result.professionalAdvice, PROFESSIONAL_ADVICE)
  assert.ok(result.changes.some((c) => c.type === 'replace' || c.type === 'remove'))
  for (const ex of result.workout.exercises) {
    assert.equal(loadsRegion(ex, 'joelho'), false, `${ex.name} ainda carrega o joelho`)
  }
  assert.ok(result.workout.exercises.some((ex) => ex.exerciseId === 'stiff'))
})

test('readiness: high readiness leaves the workout unchanged', () => {
  const workout = legDay()
  const result = adjustForReadiness(workout, { sleep: 'bom', energy: 'alta', pain: false })
  assert.equal(result.level, 'high')
  assert.equal(result.workout, workout)
  assert.equal(result.changes.length, 0)
})

test('pre-workout check keeps the stored estimatedMinutes', () => {
  const workout = legDay()
  const adapted = adaptWorkoutForCheck(workout, { sleep: 'poor', energy: 'low', pain: false, minutes: 30 })
  assert.equal(adapted.estimatedMinutes, 60)
  assert.ok(adapted.sessionMinutes <= 33)
  const combined = adjustDayWorkout(workout, { sleep: 'ok', energy: 'ok', minutes: 30 })
  assert.match(combined.summary, /30 min/)
})

const ex = (exerciseId, name, muscleGroup) => ({ exerciseId, name, muscleGroup, sets: 3, reps: '8-12', rest: 90 })
const legsA = (id, date, status = 'Pendente') => ({
  id,
  name: 'Pernas A',
  date,
  status,
  exercises: [ex('agachamento', 'Agachamento livre', 'Pernas'), ex('leg-press', 'Leg press 45°', 'Pernas')],
})
const chest = (id, date, status = 'Pendente') => ({
  id,
  name: 'Peito',
  date,
  status,
  exercises: [ex('supino-reto', 'Supino reto com barra', 'Peitoral'), ex('crucifixo', 'Crucifixo', 'Peitoral')],
})
const legsB = (id, date, status = 'Pendente') => ({
  id,
  name: 'Pernas B',
  date,
  status,
  exercises: [ex('stiff', 'Stiff com halteres', 'Pernas'), ex('cadeira-flexora', 'Mesa flexora', 'Pernas')],
})
const back = (id, date, status = 'Pendente') => ({
  id,
  name: 'Costas',
  date,
  status,
  exercises: [ex('remada-curvada', 'Remada curvada', 'Costas'), ex('puxada-frontal', 'Puxada frontal', 'Costas')],
})

test('elastic week: missed Mon/Tue with 4 pending on Wednesday', () => {
  // Semana de 2026-11-09 (seg) a 2026-11-15 (dom); hoje = quarta 11.
  const now = new Date('2026-11-11T10:00:00')
  const done = { ...back('done-sun-prev', '2026-11-14', 'Realizado'), name: 'Ombros', exercises: [ex('desenvolvimento-militar-barra', 'Desenvolvimento militar', 'Ombros'), ex('elevacao-lateral', 'Elevação lateral', 'Ombros')] }
  const workouts = [
    legsA('a', '2026-11-09'),
    chest('b', '2026-11-10'),
    legsB('c', '2026-11-12'),
    back('d', '2026-11-13'),
    done,
  ]
  const plan = planElasticWeek({ workouts, now })
  assert.equal(plan.missedCount, 2)
  assert.equal(plan.pendingCount, 4)
  assert.ok(plan.needed)
  assert.equal(plan.dropped.length, 0)
  assert.ok(plan.moves.every((m) => m.id !== done.id), 'concluído não se move')

  const applied = applyReorganizedWeek(workouts, plan)
  const doneAfter = applied.find((w) => w.id === done.id)
  assert.equal(doneAfter.date, '2026-11-14')

  const pending = applied.filter((w) => w.status === 'Pendente')
  const dates = pending.map((w) => w.date)
  assert.equal(new Set(dates).size, dates.length, 'no máximo 1 treino por dia')
  assert.ok(dates.every((d) => d >= '2026-11-11' && d <= '2026-11-15'), dates.join(','))
  assert.ok(!dates.includes('2026-11-14'), 'não usa o dia do treino feito')

  const byDate = new Map(applied.map((w) => [w.date, w]))
  for (let day = 11; day < 15; day += 1) {
    const a = byDate.get(`2026-11-${day}`)
    const b = byDate.get(`2026-11-${day + 1}`)
    if (a && b) assert.equal(sameFocus(a, b), false, `${a.name} e ${b.name} em dias seguidos`)
  }
  assert.equal(plan.conflicts, 0)
  assert.equal(plan.days.length, 7)
})

test('elastic week: not enough days drops the least important missed workout', () => {
  const now = new Date('2026-11-14T10:00:00') // sábado: restam sáb e dom
  const arms = {
    id: 'arms',
    name: 'Braços',
    date: '2026-11-11',
    status: 'Pendente',
    exercises: [ex('rosca-direta', 'Rosca direta', 'Bíceps'), ex('triceps-corda', 'Tríceps corda', 'Tríceps')],
  }
  const workouts = [legsA('a', '2026-11-09'), chest('b', '2026-11-10'), arms]
  const plan = planElasticWeek({ workouts, now })
  assert.equal(plan.moves.length, 2)
  assert.deepEqual(plan.dropped.map((d) => d.id), ['arms'])
  const dates = plan.moves.map((m) => m.toDate)
  assert.equal(new Set(dates).size, 2)
})

test('elastic week: nothing to do when the week is on track', () => {
  const now = new Date('2026-11-11T10:00:00')
  const workouts = [legsA('a', '2026-11-09', 'Realizado'), chest('b', '2026-11-11'), back('d', '2026-11-13')]
  const plan = planElasticWeek({ workouts, now })
  assert.equal(plan.needed, false)
  assert.equal(plan.moves.length, 0)
})
