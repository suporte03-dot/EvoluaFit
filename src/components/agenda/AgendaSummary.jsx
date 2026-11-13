import { useMemo } from 'react'
import { getAgendaSummary } from '../../data/agendaData'

const SUMMARY_ACTIONS = {
  today: 'onTodayClick',
  week: 'onWeekClick',
  sports: 'onSportsClick',
  highlight: 'onHighlightClick',
}

function AgendaSummary({
  onTodayClick,
  onWeekClick,
  onSportsClick,
  onHighlightClick,
}) {
  const agendaSummary = useMemo(() => getAgendaSummary(), [])
  const handlers = {
    onTodayClick,
    onWeekClick,
    onSportsClick,
    onHighlightClick,
  }

  return (
    <div className="agenda-summary">
      {agendaSummary.map((item) => {
        const handlerKey = SUMMARY_ACTIONS[item.id]
        const onActivate = handlers[handlerKey]

        return (
          <article
            key={item.id}
            className="agenda-summary__card card card--clickable"
            role="button"
            tabIndex={0}
            onClick={() => onActivate?.()}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                onActivate?.()
              }
            }}
          >
            <span className="agenda-summary__icon" aria-hidden="true">{item.icon}</span>
            <div className="agenda-summary__body">
              <span className={`agenda-summary__value ${item.isText ? 'agenda-summary__value--text' : ''}`}>
                {item.value}
              </span>
              <span className="agenda-summary__label">{item.label}</span>
            </div>
          </article>
        )
      })}
    </div>
  )
}

export default AgendaSummary
