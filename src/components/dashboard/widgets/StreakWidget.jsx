import { useMemo } from 'react'
import { isCompletedSession } from '../../../utils/completedSession'
import { metricAvailability } from '../../../utils/dashboardMetrics'
import { IconFlame } from '../icons'

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
    const k = String(h.completedAt || h.date || '').slice(0, 10)
    if (k) keys.add(k)
  })
  workouts.forEach((w) => {
    const s = String(w.status || '').toLowerCase()
    if (s !== 'realizado' && s !== 'completed' && s !== 'done') return
    const k = String(w.completedAt || w.date || '').slice(0, 10)
    if (k) keys.add(k)
  })
  return keys
}

export default function StreakWidget({ metrics, history, workouts }) {
  const ready = metricAvailability('streak', metrics)
  const days = ready ? metrics.streak : 0
  const week = lastNDays(7)
  const done = useMemo(() => completedKeys(history, workouts), [history, workouts])

  return (
    <div className="streak-sig">
      <p className="streak-sig__kicker">Sequência</p>
      <p className="streak-sig__title">
        <IconFlame size={16} />
        {ready ? `${days} ${days === 1 ? 'dia' : 'dias'} evoluindo` : 'Comece a sequência'}
      </p>
      <ol className="streak-sig__week" aria-label="Dias da semana">
        {week.map((day, index) => {
          const on = done.has(day.key)
          return (
            <li
              key={day.key}
              className={`${on ? 'is-on' : ''} ${day.isToday ? 'is-today' : ''}`.trim()}
              style={{ '--bar': on ? `${0.42 + (index % 3) * 0.18}` : '0.22' }}
            >
              <i aria-hidden="true" />
              <span>{day.label}</span>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
