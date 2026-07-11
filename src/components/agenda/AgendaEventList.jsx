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
      {events.map((event) => (
        <article
          key={event.id}
          className={`agenda-event card card--clickable ${event.status === 'Hoje' ? 'agenda-event--today' : ''}`}
          onClick={() => onDetails(event)}
          onKeyDown={(e) => e.key === 'Enter' && onDetails(event)}
          role="button"
          tabIndex={0}
        >
          <div className="agenda-event__date">
            <strong>{event.date}</strong>
            <span>{event.day}</span>
          </div>

          <div className="agenda-event__time">
            <span className="agenda-event__clock">{event.time}</span>
          </div>

          <div className="agenda-event__main">
            <span className="agenda-event__sport">{event.sport}</span>
            <h3 className="agenda-event__title">{event.title}</h3>
            <p className="agenda-event__location">{event.location}</p>
          </div>

          <div className="agenda-event__actions">
            <span className={`agenda-event__status ${statusClass[event.status]}`}>
              {event.status}
            </span>
            <button
              type="button"
              className="agenda-event__btn"
              onClick={(e) => {
                e.stopPropagation()
                onDetails(event)
              }}
            >
              Ver detalhes
            </button>
          </div>
        </article>
      ))}
    </div>
  )
}

export default AgendaEventList
