import { useMemo } from 'react'
import SportImage from '../SportImage'
import { enrichAgendaEvent } from '../../utils/agendaDateUtils'

function AgendaFeatured({ event, onDetails }) {
  const display = useMemo(() => (event ? enrichAgendaEvent(event) : null), [event])

  if (!display) return null

  return (
    <article
      className="agenda-featured card card--clickable"
      role="button"
      tabIndex={0}
      onClick={() => onDetails(display)}
      onKeyDown={(eventKey) => eventKey.key === 'Enter' && onDetails(display)}
    >
      <div className="agenda-featured__visual">
        <SportImage
          src={display.image}
          filter={display.filter}
          alt={display.sport}
          className="agenda-featured__img"
        />
        <div className="agenda-featured__overlay" />
        <span className="agenda-featured__badge">Evento em Destaque</span>
      </div>
      <div className="agenda-featured__body">
        <div className="agenda-featured__meta">
          <span className="agenda-featured__sport">{display.sport}</span>
          <span className="agenda-featured__tag">{display.tag}</span>
        </div>
        <h3 className="agenda-featured__title">{display.title}</h3>
        <p className="agenda-featured__summary">{display.description}</p>
        <div className="agenda-featured__info">
          <span>{display.date} · {display.day}</span>
          <span>{display.time}</span>
          <span>{display.location}</span>
        </div>
        <button
          type="button"
          className="btn btn--primary"
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
}

export default AgendaFeatured
