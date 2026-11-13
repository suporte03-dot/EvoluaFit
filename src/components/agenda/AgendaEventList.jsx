import { enrichAgendaEvent } from '../../utils/agendaDateUtils'

const statusClass = {
  Hoje: 'agenda-event__status--today',
  Amanhã: 'agenda-event__status--tomorrow',
  'Em breve': 'agenda-event__status--soon',
  Encerrado: 'agenda-event__status--ended',
}

function AgendaEventList({ events, onDetails }) {
  if (events.length === 0) {
    return (
      <div className="agenda-event-list__empty empty-state">
        <span className="empty-state__icon" aria-hidden="true">📅</span>
        <h3>Nenhum evento encontrado</h3>
        <p>Não há eventos para os filtros selecionados. Tente outro período ou modalidade.</p>
      </div>
    )
  }

  return (
    <div className="agenda-event-list">
      {events.map((event) => {
        const display = enrichAgendaEvent(event)

        return (
          <article
            key={event.id}
            className={`agenda-event card card--clickable ${display.status === 'Hoje' ? 'agenda-event--today' : ''}`}
            onClick={() => onDetails(display)}
            onKeyDown={(e) => e.key === 'Enter' && onDetails(display)}
            role="button"
            tabIndex={0}
          >
            <div className="agenda-event__date">
              <strong>{display.date}</strong>
              <span>{display.day}</span>
            </div>

            <div className="agenda-event__time">
              <span className="agenda-event__clock">{display.time}</span>
            </div>

            <div className="agenda-event__main">
              <span className="agenda-event__sport">{display.sport}</span>
              <h3 className="agenda-event__title">{display.title}</h3>
              <p className="agenda-event__location">{display.location}</p>
            </div>

            <div className="agenda-event__actions">
              <span className={`agenda-event__status ${statusClass[display.status]}`}>
                {display.status}
              </span>
              <button
                type="button"
                className="agenda-event__btn"
                onClick={(e) => {
                  e.stopPropagation()
                  onDetails(display)
                }}
              >
                Ver detalhes
              </button>
            </div>
          </article>
        )
      })}
    </div>
  )
}

export default AgendaEventList
