import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  buildBodyVolumeMap,
  bodyVolumeSummary,
  weeklySetsFromHistory,
} from '../src/utils/bodyVolumeMap.js'
import {
  buildMonthlyRecap,
  monthlyRecapShareMessage,
} from '../src/utils/monthlyRecap.js'
import {
  reminderWorkoutMessage,
  whatsappSetLogMessage,
  completedWorkoutShareMessage,
} from '../src/utils/shareWorkout.js'

const WED = new Date(2026, 10, 11, 12, 0, 0) // Wed Nov 11 2026 (week Sun–Sat)

describe('mapa do corpo — volume semanal', () => {
  it('soma séries concluídas por músculo na semana', () => {
    const history = [
      {
        status: 'completed',
        completedAt: '2026-11-10T18:00:00',
        exercises: [
          {
            name: 'Supino',
            muscleGroup: 'Peitoral',
            setSlots: [
              { completed: true, weight: 60, reps: 8 },
              { completed: true, weight: 60, reps: 8 },
              { completed: true, weight: 60, reps: 8 },
            ],
          },
          {
            name: 'Remada',
            muscleGroup: 'Costas',
            setSlots: [
              { completed: true, weight: 50, reps: 10 },
              { completed: true, weight: 50, reps: 10 },
            ],
          },
        ],
      },
    ]
    const sets = weeklySetsFromHistory(history, WED)
    assert.equal(sets.Peitoral, 3)
    assert.equal(sets.Costas, 2)
  })

  it('classifica abaixo / ok / acima da faixa do nível', () => {
    const history = [
      {
        status: 'completed',
        completedAt: '2026-11-09T10:00:00',
        exercises: [
          {
            muscleGroup: 'Peitoral',
            setSlots: Array.from({ length: 4 }, () => ({ completed: true })),
          },
          {
            muscleGroup: 'Costas',
            setSlots: Array.from({ length: 12 }, () => ({ completed: true })),
          },
          {
            muscleGroup: 'Ombros',
            setSlots: Array.from({ length: 22 }, () => ({ completed: true })),
          },
        ],
      },
    ]
    const map = buildBodyVolumeMap({ history, level: 'Intermediário', referenceDate: WED })
    assert.equal(map.source, 'history')
    assert.equal(map.range[0], 10)
    assert.equal(map.range[1], 16)
    const by = Object.fromEntries(map.rows.map((r) => [r.group, r.status]))
    assert.equal(by.Peitoral, 'below')
    assert.equal(by.Costas, 'ok')
    assert.equal(by.Ombros, 'above')
    assert.match(bodyVolumeSummary(map), /faixa|acima|abaixo/i)
  })

  it('cai no plano quando não há histórico na semana', () => {
    const plan = {
      weeklyPlan: [
        {
          exercises: [
            { name: 'Agachamento', category: 'Pernas', sets: 4, kind: 'composto' },
            { name: 'Leg press', category: 'Pernas', sets: 3, kind: 'composto' },
          ],
        },
      ],
    }
    const map = buildBodyVolumeMap({ history: [], plan, level: 'Iniciante', referenceDate: WED })
    assert.equal(map.source, 'plan')
    assert.ok((map.byGroup.Pernas || 0) >= 6)
  })
})

describe('retrospectiva mensal', () => {
  it('agrega treinos do mês a partir do histórico', () => {
    const history = [
      {
        status: 'completed',
        completedAt: '2026-11-03T12:00:00',
        durationMinutes: 40,
        exercises: [
          {
            name: 'Supino',
            muscleGroup: 'Peitoral',
            completedSets: 3,
            sets: 3,
            reps: '8',
            load: 60,
            isPR: true,
          },
        ],
      },
      {
        status: 'completed',
        completedAt: '2026-10-20T12:00:00',
        durationMinutes: 30,
        exercises: [{ name: 'Agachamento', muscleGroup: 'Pernas', completedSets: 4, sets: 4, reps: '5', load: 100 }],
      },
    ]
    const recap = buildMonthlyRecap({ history, referenceDate: WED })
    assert.equal(recap.month, 10)
    assert.equal(recap.sessions, 1)
    assert.ok(recap.volumeKg > 0)
    assert.equal(recap.prCount, 1)
    assert.match(recap.monthLabel, /novembro/i)
    assert.match(monthlyRecapShareMessage(recap), /EvoluaFit/)
  })

  it('mensagem vazia quando não há treinos no mês', () => {
    const recap = buildMonthlyRecap({ history: [], referenceDate: WED })
    assert.equal(recap.sessions, 0)
    assert.match(monthlyRecapShareMessage(recap), /vazia|Vamos treinar/i)
  })
})

describe('WhatsApp — lembrete e registro', () => {
  it('monta lembrete com nome em português', () => {
    const msg = reminderWorkoutMessage({ name: 'Push A' }, 'hoje')
    assert.match(msg, /Lembrete EvoluaFit/)
    assert.match(msg, /Empurrar A|Push A/)
    assert.match(msg, /evoluafit\.tec\.br\/app/)
  })

  it('monta registro de série e conclusão', () => {
    assert.match(whatsappSetLogMessage({ exerciseName: 'Supino', reps: 10, weightKg: 40 }), /10 reps × 40 kg/)
    assert.match(
      completedWorkoutShareMessage({ name: 'Legs B', durationMinutes: 45, exerciseCount: 6, muscleGroups: ['Pernas'] }),
      /Concluí/,
    )
  })
})
