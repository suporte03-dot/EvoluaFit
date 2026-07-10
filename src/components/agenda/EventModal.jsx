import { useEffect } from 'react'
import SportImage from '../SportImage'

function EventModal({ event, onClose }) {
  useEffect(() => {
    if (!event) return undefined

    const handleKey = (e) => {
      if (e.key === 'Escape') onClose()
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKey)

    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKey)
    }
  }, [event, onClose])

  if (!event) return null

  return (
    <div className="modal event-modal" role="dialog" aria-modal="true" aria-labelledby="event-modal-title">
      <div className="modal__backdrop" onClick={onClose} aria-hidden="true" />
      <div className="modal__panel event-modal__panel">
        <button
          type="button"
          className="modal__close"
          onClick={onClose}
          aria-label="Fechar detalhes do evento"
        >
          ✕
        </button>

        <div className="event-modal__image-wrap">
          <SportImage
            src={event.image}
            filter={event.filter}
            alt={event.sport}
            className="event-modal__image"
          />
          <div className="event-modal__image-overlay" />
          <span className="event-modal__sport">{event.sport}</span>
        </div>

        <div className="event-modal__body">
          <div className="event-modal__tags">
            <span className="event-modal__tag">{event.tag}</span>
            <span className="event-modal__tag event-modal__tag--phase">{event.phase}</span>
          </div>

          <h2 id="event-modal-title" className="event-modal__title">{event.title}</h2>

          <div className="event-modal__meta">
            <div>
              <strong>Data</strong>
              <span>{event.date} ({event.day})</span>
            </div>
            <div>
              <strong>Horário</strong>
              <span>{event.time}</span>
            </div>
            <div>
              <strong>Local</strong>
              <span>{event.location}</span>
            </div>
          </div>

          <div className="event-modal__details">
            <div className="event-modal__detail">
              <span>Tipo de evento</span>
              <strong>{event.eventType}</strong>
            </div>
            <div className="event-modal__detail">
              <span>Fase</span>
              <strong>{event.phase}</strong>
            </div>
            <div className="event-modal__detail">
              <span>Importância</span>
              <strong>{event.importance}</strong>
            </div>
            <div className="event-modal__detail">
              <span>Status</span>
              <strong>{event.status}</strong>
            </div>
          </div>

          <div className="event-modal__content">
            {event.fullDescription.map((paragraph) => (
              <p key={paragraph.slice(0, 40)} className="event-modal__paragraph">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default EventModal
