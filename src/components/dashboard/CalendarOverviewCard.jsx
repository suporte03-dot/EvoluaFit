import { useMemo, useState } from 'react'
import { scrollToSection } from '../../utils/scrollToSection'
import { IconCalendar, IconChevron } from './icons'

const WEEKDAYS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']
const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

function toKey(value) {
  if (!value) return null
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) return value.slice(0, 10)
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return null
  return d.toISOString().slice(0, 10)
}

function isEval(w) {
  const t = String(w?.type || w?.category || w?.name || '').toLowerCase()
  return t.includes('avalia') || t.includes('assessment') || t.includes('check')
}

function dayStatus(workouts, key) {
  const dayItems = (workouts || []).filter((w) => toKey(w.date) === key || toKey(w.completedAt) === key)
  if (!dayItems.length) return null
  if (dayItems.some(isEval)) return 'eval'
  if (dayItems.some((w) => String(w.status).toLowerCase() === 'realizado' || String(w.status).toLowerCase() === 'completed')) {
    return 'done'
  }
  if (dayItems.some((w) => w.isRest)) return 'rest'
  return 'planned'
}

export default function CalendarOverviewCard({ workouts = [] }) {
  const today = new Date()
  const [cursor, setCursor] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1))

  const cells = useMemo(() => {
    const year = cursor.getFullYear()
    const month = cursor.getMonth()
    const firstDow = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const out = []
    for (let i = 0; i < firstDow; i++) out.push(null)
    for (let d = 1; d <= daysInMonth; d++) {
      const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
      out.push({ day: d, key, status: dayStatus(workouts, key) })
    }
    return out
  }, [cursor, workouts])

  const todayKey = toKey(today)
  const scheduledCount = (workouts || []).filter((w) => w && !w.isRest).length

  return (
    <article className="dash-module dash-module--blue dash-module--split">
      <div className="dash-module__body">
        <div className="dash-module__copy">
          <p className="dash-module__eyebrow">
            <IconCalendar size={14} />
            Calendário
          </p>
          <h3 className="dash-module__title">Calendário</h3>
          <p className="dash-module__desc">
            {scheduledCount > 0
              ? 'Veja treinos, descanso e avaliações no mês — datas reais da sua planilha.'
              : 'Organize treinos, descanso e avaliações no mês. As datas vêm da sua planilha.'}
          </p>
          <button
            type="button"
            className="dash-module__btn dash-module__btn--outline"
            onClick={() => scrollToSection('calendario')}
          >
            Ver calendário
            <IconChevron size={16} />
          </button>
        </div>

        <div className="dash-module__visual dash-module__visual--cal">
          <div className="dash-mini-cal">
            <div className="dash-mini-cal__toolbar">
              <button
                type="button"
                className="dash-mini-cal__nav"
                aria-label="Mês anterior"
                onClick={() => setCursor((c) => new Date(c.getFullYear(), c.getMonth() - 1, 1))}
              >
                ‹
              </button>
              <strong>
                {MONTHS[cursor.getMonth()]} {cursor.getFullYear()}
              </strong>
              <button
                type="button"
                className="dash-mini-cal__nav"
                aria-label="Próximo mês"
                onClick={() => setCursor((c) => new Date(c.getFullYear(), c.getMonth() + 1, 1))}
              >
                ›
              </button>
            </div>

            <div className="dash-mini-cal__weekdays" aria-hidden="true">
              {WEEKDAYS.map((d, i) => (
                <span key={`${d}-${i}`}>{d}</span>
              ))}
            </div>

            <div className="dash-mini-cal__grid" role="grid" aria-label="Mini calendário">
              {cells.map((cell, i) =>
                cell ? (
                  <button
                    key={cell.key}
                    type="button"
                    className={`dash-mini-cal__day${cell.key === todayKey ? ' is-today' : ''}${
                      cell.status ? ` is-${cell.status}` : ''
                    }`}
                    onClick={() => scrollToSection('calendario')}
                    aria-label={`Dia ${cell.day}${cell.status ? `, ${cell.status}` : ''}`}
                  >
                    {cell.day}
                  </button>
                ) : (
                  <span key={`e-${i}`} className="dash-mini-cal__empty" />
                ),
              )}
            </div>

            <ul className="dash-mini-cal__legend" aria-label="Legenda">
              <li>
                <span className="dash-dot dash-dot--treino" /> Treino
              </li>
              <li>
                <span className="dash-dot dash-dot--descanso" /> Descanso
              </li>
              <li>
                <span className="dash-dot dash-dot--eval" /> Avaliação
              </li>
            </ul>
          </div>
        </div>
      </div>
    </article>
  )
}
