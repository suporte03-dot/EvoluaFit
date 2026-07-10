import { agendaWeekDays, getEventCountByDay } from '../../data/agendaData'

function AgendaTimeline({ activeDay, onDaySelect }) {
  return (
    <div className="agenda-timeline">
      <span className="agenda-timeline__label">Linha do tempo da semana</span>
      <div className="agenda-timeline__scroll">
        {agendaWeekDays.map((day) => {
          const count = getEventCountByDay(day.key)
          const isActive = activeDay === day.key

          return (
            <button
              key={day.key}
              type="button"
              className={`agenda-timeline__day ${isActive ? 'agenda-timeline__day--active' : ''} ${day.isToday ? 'agenda-timeline__day--today' : ''}`}
              onClick={() => onDaySelect(day.key)}
              aria-pressed={isActive}
            >
              <span className="agenda-timeline__weekday">{day.label}</span>
              <span className="agenda-timeline__date">{day.short}</span>
              <span className="agenda-timeline__count">{count}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default AgendaTimeline
