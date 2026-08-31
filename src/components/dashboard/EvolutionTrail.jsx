import { useMemo } from 'react'
import { isCompletedSession } from '../../utils/completedSession'

function toDateKey(value) {
  if (!value) return null
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) return value.slice(0, 10)
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return null
  return d.toISOString().slice(0, 10)
}

function lastNDays(n = 7) {
  const days = []
  const now = new Date()
  now.setHours(12, 0, 0, 0)
  for (let i = n - 1; i >= 0; i -= 1) {
    const d = new Date(now)
    d.setDate(now.getDate() - i)
    days.push({
      key: d.toISOString().slice(0, 10),
      label: d.toLocaleDateString('pt-BR', { weekday: 'narrow' }),
      isToday: i === 0,
    })
  }
  return days
}

function completedKeys(history = [], workouts = []) {
  const keys = new Set()
  history.forEach((h) => {
    if (!isCompletedSession(h)) return
    const k = toDateKey(h.completedAt || h.date)
    if (k) keys.add(k)
  })
  workouts.forEach((w) => {
    const status = String(w.status || '').toLowerCase()
    if (status === 'realizado' || status === 'completed' || status === 'done') {
      const k = toDateKey(w.completedAt || w.date)
      if (k) keys.add(k)
    }
  })
  return keys
}

export function emotionalProgressCopy(metrics = {}) {
  const weekly = metrics.weeklyWorkouts
  const goal = metrics.weeklyGoal
  const streak = metrics.streak
  const pct = metrics.monthlyPerformancePct

  if (pct != null && metrics.progressHasData) {
    const sign = pct > 0 ? '+' : ''
    return `Volume deste mês: ${sign}${pct}% em relação ao mês anterior.`
  }
  if (streak >= 1) {
    return `Sequência atual: ${streak} ${streak === 1 ? 'dia' : 'dias'} com treino concluído.`
  }
  if (goal && weekly != null) {
    return `Nesta semana: ${weekly} de ${goal} treinos concluídos.`
  }
  if (weekly > 0) {
    return `Nesta semana: ${weekly} ${weekly === 1 ? 'treino concluído' : 'treinos concluídos'}.`
  }
  return 'Nenhum treino concluído nesta semana ainda.'
}

export default function EvolutionTrail({ history = [], workouts = [] }) {
  const done = useMemo(() => completedKeys(history, workouts), [history, workouts])
  const days = lastNDays(7)
  const count = days.filter((d) => done.has(d.key)).length

  return (
    <section className="evo-trail" aria-label="Trilha da semana">
      <div className="evo-trail__head">
        <p className="evo-trail__kicker">Sua trilha</p>
        <p className="evo-trail__title">{count} de 7 dias com treino</p>
      </div>
      <ol className="evo-trail__path">
        {days.map((day, i) => {
          const complete = done.has(day.key)
          return (
            <li
              key={day.key}
              className={`evo-trail__node${complete ? ' is-done' : ''}${day.isToday ? ' is-today' : ''}`}
            >
              {i > 0 && <span className="evo-trail__line" aria-hidden="true" />}
              <span className="evo-trail__dot" aria-hidden="true">
                {complete ? '✓' : day.isToday ? '•' : ''}
              </span>
              <span className="evo-trail__label">{day.label}</span>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
