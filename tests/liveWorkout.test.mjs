import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import {
  FIRST_RECORD_MESSAGE,
  isLowerBodyExercise,
  normalizeBeginnerReps,
  parseRepRange,
  suggestLoad,
} from '../src/utils/liveWorkout/loadSuggestion.js'
import { bestLoadBySession, findRecord, isPersonalRecord, recordGainPct } from '../src/utils/liveWorkout/prDetection.js'
import { formatClock, formatVolumeKg, sessionVolume, volumeByMuscle } from '../src/utils/liveWorkout/volume.js'
import { extendRest, isRestDone, remainingSeconds, restProgress, startRest } from '../src/utils/liveWorkout/restTimer.js'
import { buildWeekStrip, challengeForWeeklyGoal, resolveWeeklyGoal } from '../src/utils/weeklyGoal.js'

describe('sugestão de carga', () => {
  const range = parseRepRange('8-12')

  test('lê faixas em formatos diferentes', () => {
    assert.deepEqual(parseRepRange('8-12'), { min: 8, max: 12 })
    assert.deepEqual(parseRepRange('10 a 15'), { min: 10, max: 15 })
    assert.deepEqual(parseRepRange('12'), { min: 12, max: 12 })
    assert.equal(parseRepRange('30-45s'), null)
    assert.equal(parseRepRange('8-12 min'), null)
  })

  test('sem histórico: primeiro registro cria a referência', () => {
    const s = suggestLoad({ lastSets: [], repRange: range })
    assert.equal(s.kind, 'first')
    assert.equal(s.message, FIRST_RECORD_MESSAGE)
  })

  test('todas no topo da faixa em inferiores: +2,5 kg', () => {
    const s = suggestLoad({
      lastSets: [{ weight: 60, reps: 12 }, { weight: 60, reps: 12 }, { weight: 60, reps: 13 }],
      repRange: range,
      lowerBody: true,
    })
    assert.equal(s.kind, 'increase')
    assert.equal(s.loadKg, 62.5)
    assert.equal(s.deltaKg, 2.5)
  })

  test('todas no topo da faixa em superiores: incremento configurável entre 1 e 2 kg', () => {
    const sets = [{ weight: 20, reps: 12 }, { weight: 20, reps: 12 }]
    assert.equal(suggestLoad({ lastSets: sets, repRange: range, upperIncrementKg: 1 }).loadKg, 21)
    assert.equal(suggestLoad({ lastSets: sets, repRange: range, upperIncrementKg: 2 }).loadKg, 22)
    assert.equal(suggestLoad({ lastSets: sets, repRange: range, upperIncrementKg: 5 }).deltaKg, 2)
  })

  test('alguma série abaixo do mínimo: manter carga', () => {
    const s = suggestLoad({
      lastSets: [{ weight: 40, reps: 12 }, { weight: 40, reps: 7 }],
      repRange: range,
      lowerBody: true,
    })
    assert.equal(s.kind, 'keep')
    assert.equal(s.loadKg, 40)
  })

  test('dentro da faixa: mantém a carga e busca repetições', () => {
    const s = suggestLoad({ lastSets: [{ weight: 30, reps: 10 }, { weight: 30, reps: 12 }], repRange: range })
    assert.equal(s.kind, 'hold')
    assert.equal(s.loadKg, 30)
  })

  test('classifica membros inferiores', () => {
    assert.equal(isLowerBodyExercise({ muscleGroup: 'Pernas' }), true)
    assert.equal(isLowerBodyExercise({ category: 'Glúteos' }), true)
    assert.equal(isLowerBodyExercise({ muscleGroup: 'Peitoral' }), false)
  })

  test('iniciante não recebe faixa de força, exceto exercício marcado como força', () => {
    assert.equal(normalizeBeginnerReps('4-6', { level: 'Iniciante' }), '8-12')
    assert.equal(normalizeBeginnerReps('6-8', { level: 'Iniciante' }), '8-12')
    assert.equal(normalizeBeginnerReps('10-12', { level: 'Iniciante' }), '10-12')
    assert.equal(normalizeBeginnerReps('4-6', { level: 'Iniciante', strength: true }), '4-6')
    assert.equal(normalizeBeginnerReps('4-6', { level: 'Avançado' }), '4-6')
  })
})

describe('detecção de recorde pessoal', () => {
  const history = [
    { weight: 50, reps: 10, date: '2026-09-01' },
    { weight: 55, reps: 8, date: '2026-09-15' },
    { weight: 55, reps: 6, date: '2026-09-15' },
  ]

  test('recorde é a maior carga (desempate por reps)', () => {
    assert.deepEqual(findRecord(history), { weight: 55, reps: 8, date: '2026-09-15' })
  })

  test('maior carga com reps ≥ ao recorde anterior é PR', () => {
    const record = findRecord(history)
    assert.equal(isPersonalRecord({ weight: 57.5, reps: 8 }, record), true)
    assert.equal(isPersonalRecord({ weight: 57.5, reps: 9 }, record), true)
  })

  test('carga maior com menos reps, ou mesma carga, não é PR', () => {
    const record = findRecord(history)
    assert.equal(isPersonalRecord({ weight: 57.5, reps: 7 }, record), false)
    assert.equal(isPersonalRecord({ weight: 55, reps: 12 }, record), false)
  })

  test('sem histórico não há recorde', () => {
    assert.equal(isPersonalRecord({ weight: 100, reps: 10 }, findRecord([])), false)
  })

  test('ganho percentual e série por sessão', () => {
    assert.equal(recordGainPct({ weight: 50 }, { weight: 55 }), 10)
    assert.deepEqual(bestLoadBySession(history), [
      { date: '2026-09-01', weight: 50 },
      { date: '2026-09-15', weight: 55 },
    ])
  })
})

describe('cálculo de volume', () => {
  const exercises = [
    {
      muscleGroup: 'Peitoral',
      setSlots: [
        { completed: true, weight: '40', reps: '10' },
        { completed: true, weight: '40', reps: '8' },
        { completed: false, weight: '40', reps: '' },
      ],
    },
    {
      muscleGroup: 'Tríceps',
      setSlots: [{ completed: true, weight: '20,5', reps: '12' }],
    },
  ]

  test('soma carga × reps apenas de séries concluídas', () => {
    assert.equal(sessionVolume(exercises), 40 * 10 + 40 * 8 + 20.5 * 12)
  })

  test('divide o volume por grupo muscular', () => {
    const groups = volumeByMuscle(exercises)
    assert.equal(groups[0].group, 'Peitoral')
    assert.equal(groups[0].pct + groups[1].pct, 100)
  })

  test('formata no padrão brasileiro', () => {
    assert.equal(formatVolumeKg(4820), '4.820 kg')
    assert.equal(formatClock(65), '01:05')
    assert.equal(formatClock(3725), '1:02:05')
  })
})

describe('descanso por timestamp', () => {
  const t0 = 1_000_000

  test('restante vem do horário de término, não de um contador', () => {
    const rest = startRest(90, t0)
    assert.equal(remainingSeconds(rest, t0), 90)
    assert.equal(remainingSeconds(rest, t0 + 30_000), 60)
    assert.equal(remainingSeconds(rest, t0 + 89_100), 1)
  })

  test('continua correto após a aba ficar em segundo plano', () => {
    const rest = startRest(60, t0)
    assert.equal(remainingSeconds(rest, t0 + 5 * 60_000), 0)
    assert.equal(isRestDone(rest, t0 + 5 * 60_000), true)
  })

  test('+15 s estende o término', () => {
    const rest = extendRest(startRest(60, t0), 15, t0 + 10_000)
    assert.equal(remainingSeconds(rest, t0 + 10_000), 65)
  })

  test('progresso do anel vai de 0 a 1', () => {
    const rest = startRest(100, t0)
    assert.equal(restProgress(rest, t0), 0)
    assert.equal(restProgress(rest, t0 + 50_000), 0.5)
    assert.equal(restProgress(rest, t0 + 200_000), 1)
  })
})

describe('meta semanal unificada', () => {
  test('meta do usuário → plano → perfil', () => {
    assert.equal(resolveWeeklyGoal({ goals: [{ type: 'weekly_workouts', target: 4 }], generatedPlan: { daysPerWeek: 6 } }), 4)
    assert.equal(resolveWeeklyGoal({ generatedPlan: { daysPerWeek: 3 }, profile: { daysPerWeek: 5 } }), 3)
    assert.equal(resolveWeeklyGoal({ profile: { daysPerWeek: 5 } }), 5)
    assert.equal(resolveWeeklyGoal({}), null)
  })

  test('desafio de 4 semanas = meta × 4', () => {
    assert.equal(challengeForWeeklyGoal(3).target, 12)
    assert.equal(challengeForWeeklyGoal(6).target, 24)
    assert.equal(challengeForWeeklyGoal(null).target, 12)
  })

  test('faixa D S T Q Q S S marca os dias treinados', () => {
    const strip = buildWeekStrip(['2026-10-20T10:00:00'], new Date('2026-10-22T12:00:00'))
    assert.deepEqual(strip.map((d) => d.letter), ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'])
    assert.equal(strip[2].trained, true)
    assert.equal(strip[4].isToday, true)
  })
})
