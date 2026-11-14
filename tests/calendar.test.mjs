import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import {
  STATUS_LABEL,
  formatDateKey,
  getCalendarSummary,
  getCurrentMonthDays,
  mergeSessionsIntoCalendar,
  statusLabel,
} from '../src/utils/calendarUtils.js'
import { buildWeekPlanDays, localDateKey, weekSummaryLine } from '../src/utils/weekPlan.js'

// Semana seg 09/11/2026 → dom 15/11/2026; referência: quinta 12/11 às 14h (meio da semana).
const REF = new Date(2026, 10, 12, 14, 0, 0)

function sixWorkoutWeek() {
  return [
    { id: 'w1', date: '2026-11-09', name: 'Push A', status: 'Realizado' },
    { id: 'w2', date: '2026-11-10', name: 'Pull A', status: 'Realizado' },
    { id: 'w3', date: '2026-11-11', name: 'Legs A', status: 'Pendente' },
    { id: 'w4', date: '2026-11-12', name: 'Pull B', status: 'Pendente' },
    { id: 'w5', date: '2026-11-13', name: 'Push B', status: 'Planejado' },
    { id: 'w6', date: '2026-11-14', name: 'Full Body A', status: 'Planejado' },
    { id: 'r1', date: '2026-11-15', name: 'Descanso', status: 'Descanso', isRest: true },
  ]
}

describe('calendário — contadores do mês', () => {
  test('semana de 6 treinos: contadores batem com os dias marcados', () => {
    const workouts = sixWorkoutWeek()
    const summary = getCalendarSummary(workouts, REF)

    assert.equal(summary.planned, 6)
    assert.equal(summary.completed, 2)
    assert.equal(summary.missed, 1)
    assert.equal(summary.pending, 3)
    assert.equal(summary.rest, 1)
    assert.equal(summary.planned, summary.completed + summary.pending + summary.missed)

    const cells = getCurrentMonthDays(2026, 10, workouts, REF).filter(Boolean)
    const marked = cells.filter((c) => c.status)
    const byStatus = (s) => marked.filter((c) => c.status === s).length
    assert.equal(byStatus('completed'), summary.completed)
    assert.equal(byStatus('missed'), summary.missed)
    assert.equal(byStatus('pending') + byStatus('planned'), summary.pending)
    assert.equal(byStatus('rest'), summary.rest)
    assert.equal(marked.length, summary.planned + summary.rest)
  })

  test('usa o mês exibido (monthDate) em vez do mês atual', () => {
    const workouts = sixWorkoutWeek()
    const december = getCalendarSummary(workouts, REF, { monthDate: new Date(2026, 11, 1) })
    assert.equal(december.planned, 0)
    assert.equal(december.hasMonthActivity, false)

    const october = getCalendarSummary(
      [...workouts, { id: 'o1', date: '2026-10-20', name: 'Push A', status: 'Pendente' }],
      REF,
      { monthDate: new Date(2026, 9, 1) },
    )
    assert.equal(october.planned, 1)
    assert.equal(october.missed, 1)
  })

  test('parcial conta como realizado', () => {
    const summary = getCalendarSummary(
      [{ id: 'p', date: '2026-11-10', name: 'Push A', status: 'Parcial' }],
      REF,
    )
    assert.equal(summary.completed, 1)
    assert.equal(summary.partial, 1)
    assert.equal(summary.planned, 1)
  })
})

describe('calendário — rótulos e datas', () => {
  test("status 'missed' usa 'Não realizado', nunca 'Atrasado'", () => {
    assert.equal(STATUS_LABEL.missed, 'Não realizado')
    assert.equal(statusLabel('missed'), 'Não realizado')
    assert.ok(!Object.values(STATUS_LABEL).includes('Atrasado'))
  })

  test('chave de data é local (23h30 continua no mesmo dia)', () => {
    const late = new Date(2026, 10, 12, 23, 30)
    assert.equal(formatDateKey(late), '2026-11-12')
    assert.equal(localDateKey(late), '2026-11-12')
  })

  test('sessão concluída tarde da noite marca o dia local', () => {
    const completedAt = new Date(2026, 10, 11, 22, 45).toISOString()
    const merged = mergeSessionsIntoCalendar(sixWorkoutWeek(), [
      { id: 's1', name: 'Legs A', status: 'completed', completedAt },
    ])
    const wed = merged.find((w) => w.date === '2026-11-11')
    assert.equal(wed.status, 'Realizado')
    const summary = getCalendarSummary(merged, REF)
    assert.equal(summary.completed, 3)
    assert.equal(summary.missed, 0)
  })
})

describe('Sua semana (Hoje)', () => {
  test("dia passado não feito vira 'Não realizado' e resumo conta os dias restantes", () => {
    const now = new Date(2026, 10, 12, 22, 30)
    const days = buildWeekPlanDays({ workouts: sixWorkoutWeek(), now })
    assert.equal(days.length, 7)
    assert.ok(days.every((d) => d.state !== 'Atrasado'))

    const wed = days.find((d) => d.key === '2026-11-11')
    assert.equal(wed.missed, true)
    assert.equal(wed.state, 'Não realizado')

    const thu = days.find((d) => d.isToday)
    assert.equal(thu.key, '2026-11-12')
    assert.equal(thu.name, 'Puxar B')

    const summary = weekSummaryLine(days)
    assert.equal(summary.remaining, 3)
    assert.equal(summary.text, 'Faltam 3 dias de treino nesta semana.')
    assert.equal(summary.today, 'Puxar B')
  })

  test('dias antes do início do plano não contam como não realizados', () => {
    const days = buildWeekPlanDays({
      workouts: sixWorkoutWeek(),
      generatedPlan: { startDate: '2026-11-12', weeklyPlan: [] },
      now: REF,
    })
    assert.equal(days.filter((d) => d.missed).length, 0)
  })

  test('sem treino agendado no passado não usa o índice da planilha para marcar falta', () => {
    const weeklyPlan = Array.from({ length: 7 }, (_, i) => ({ name: `Push ${i}` }))
    const days = buildWeekPlanDays({ workouts: [], generatedPlan: { weeklyPlan }, now: REF })
    assert.equal(days.filter((d) => d.missed).length, 0)
    const mon = days.find((d) => d.key === '2026-11-09')
    assert.equal(mon.rest, true)
  })

  test('sessão concluída no histórico conta como feito', () => {
    const history = [{ id: 'h1', name: 'Legs A', status: 'completed', completedAt: new Date(2026, 10, 11, 21, 30).toISOString() }]
    const days = buildWeekPlanDays({ workouts: sixWorkoutWeek(), history, now: REF })
    const wed = days.find((d) => d.key === '2026-11-11')
    assert.equal(wed.done, true)
    assert.equal(wed.missed, false)
  })

  test('hoje sem treino mostra descanso e singular para 1 dia', () => {
    const days = buildWeekPlanDays({
      workouts: [{ id: 'x', date: '2026-11-14', name: 'Push A', status: 'Planejado' }],
      now: REF,
    })
    const summary = weekSummaryLine(days)
    assert.equal(summary.text, 'Falta 1 dia de treino nesta semana.')
    assert.equal(summary.today, 'descanso')
  })
})
