import { useMemo, useState } from 'react'
import { useFitness } from '../context/FitnessContext'
import SectionTitle from './SectionTitle'
import Modal from './Modal'

const statusBadgeClass = {
  pendente: 'status--pending',
  realizado: 'status--done',
  parcial: 'status--partial',
  pulado: 'status--skipped',
}
const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
const WEEKDAYS_FULL = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']
const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

export default function TrainingCalendar() {
  const { workouts } = useFitness()
  const [current, setCurrent] = useState(() => new Date())
  const [selectedDay, setSelectedDay] = useState(null)

  const year = current.getFullYear()
  const month = current.getMonth()

  const calendar = useMemo(() => {
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const cells = []

    for (let i = 0; i < firstDay; i++) cells.push(null)
    for (let d = 1; d <= daysInMonth; d++) cells.push(d)
    return cells
  }, [year, month])

  const workoutsByDate = useMemo(() => {
    const map = {}
    workouts.forEach((w) => {
      const key = w.date
      if (!map[key]) map[key] = []
      map[key].push(w)
    })
    return map
  }, [workouts])

  const getDateKey = (day) => {
    const m = String(month + 1).padStart(2, '0')
    const d = String(day).padStart(2, '0')
    return `${year}-${m}-${d}`
  }

  const monthDays = useMemo(() => {
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const today = new Date()
    const result = []

    for (let d = 1; d <= daysInMonth; d++) {
      const key = getDateKey(d)
      const items = workoutsByDate[key] || []
      const weekday = new Date(year, month, d).getDay()
      const isToday =
        d === today.getDate() &&
        month === today.getMonth() &&
        year === today.getFullYear()

      result.push({
        day: d,
        key,
        weekday,
        items,
        status: items[0]?.status?.toLowerCase() || '',
        isToday,
        isRest: items.length === 0,
      })
    }
    return result
  }, [year, month, workoutsByDate])

  const prevMonth = () => setCurrent(new Date(year, month - 1, 1))
  const nextMonth = () => setCurrent(new Date(year, month + 1, 1))

  const dayWorkouts = selectedDay ? workoutsByDate[getDateKey(selectedDay)] || [] : []

  const openDay = (day) => setSelectedDay(day)

  return (
    <section id="calendario" className="section">
      <div className="container">
        <SectionTitle tag="Calendário" title="Calendário de treinos" subtitle="Visualize sua rotina mensal com codificação por status." />

        <div className="calendar-nav glass-card">
          <button type="button" className="btn btn--ghost btn--sm" onClick={prevMonth} aria-label="Mês anterior">
            ←
          </button>
          <h3>
            {MONTHS[month]} {year}
          </h3>
          <button type="button" className="btn btn--ghost btn--sm" onClick={nextMonth} aria-label="Próximo mês">
            →
          </button>
        </div>

        {/* Desktop / tablet grid view */}
        <div className="calendar glass-card calendar--desktop">
          <div className="calendar__header">
            <button type="button" className="btn btn--ghost btn--sm" onClick={prevMonth} aria-label="Mês anterior">
              ←
            </button>
            <h3>
              {MONTHS[month]} {year}
            </h3>
            <button type="button" className="btn btn--ghost btn--sm" onClick={nextMonth} aria-label="Próximo mês">
              →
            </button>
          </div>

          <div className="calendar__weekdays">
            {WEEKDAYS.map((d) => (
              <span key={d}>{d}</span>
            ))}
          </div>

          <div className="calendar__grid">
            {calendar.map((day, i) => {
              if (!day) return <div key={`empty-${i}`} className="calendar__day calendar__day--empty" />

              const key = getDateKey(day)
              const dayItems = workoutsByDate[key] || []
              const status = dayItems[0]?.status?.toLowerCase() || ''
              const isToday =
                day === new Date().getDate() &&
                month === new Date().getMonth() &&
                year === new Date().getFullYear()

              return (
                <button
                  key={day}
                  type="button"
                  className={`calendar__day ${dayItems.length ? `calendar__day--${status}` : ''} ${isToday ? 'calendar__day--today' : ''}`}
                  onClick={() => openDay(day)}
                >
                  <span>{day}</span>
                  {dayItems.length > 0 && <span className="calendar__dot" />}
                </button>
              )
            })}
          </div>

          <div className="calendar__legend">
            <span><i className="dot dot--pendente" /> Pendente</span>
            <span><i className="dot dot--realizado" /> Realizado</span>
            <span><i className="dot dot--parcial" /> Parcial</span>
            <span><i className="dot dot--pulado" /> Pulado</span>
          </div>
        </div>

        {/* Mobile list-by-day view */}
        <div className="calendar-list glass-card">
          {monthDays.map((entry) => (
            <button
              key={entry.key}
              type="button"
              className={`calendar-list__item ${entry.isToday ? 'calendar-list__item--today' : ''} ${entry.items.length ? `calendar-list__item--${entry.status}` : 'calendar-list__item--rest'}`}
              onClick={() => openDay(entry.day)}
            >
              <div className="calendar-list__date">
                <span className="calendar-list__day-num">{entry.day}</span>
                <span className="calendar-list__weekday">{WEEKDAYS_FULL[entry.weekday]}</span>
              </div>
              <div className="calendar-list__info">
                {entry.isRest ? (
                  <span className="calendar-list__status calendar-list__status--rest">Descanso</span>
                ) : (
                  <>
                    <span className="calendar-list__workout">{entry.items[0].name}</span>
                    <span className={`calendar-list__status status-badge ${statusBadgeClass[entry.status] || 'status--pending'}`}>
                      {entry.items[0].status}
                    </span>
                  </>
                )}
                {entry.items.length > 1 && (
                  <span className="calendar-list__more">+{entry.items.length - 1} treino(s)</span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      <Modal
        isOpen={Boolean(selectedDay)}
        onClose={() => setSelectedDay(null)}
        title={selectedDay ? `${selectedDay}/${month + 1}/${year}` : ''}
      >
        {dayWorkouts.length === 0 ? (
          <p>Dia de descanso ou sem treinos agendados.</p>
        ) : (
          <ul className="day-detail-list">
            {dayWorkouts.map((w) => (
              <li key={w.id}>
                <strong>{w.name}</strong>
                <span className={`status-badge status--${w.status.toLowerCase()}`}>{w.status}</span>
                <p>{w.exercises?.length} exercícios · {w.estimatedMinutes} min</p>
              </li>
            ))}
          </ul>
        )}
      </Modal>
    </section>
  )
}
