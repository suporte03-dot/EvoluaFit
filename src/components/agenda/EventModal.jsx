import { useEffect, useMemo } from 'react'
import SportImage from '../SportImage'
import { enrichAgendaEvent } from '../../utils/agendaDateUtils'

const statusClass = {
  Hoje: 'event-modal__status--today',
  Amanhã: 'event-modal__status--tomorrow',
  'Em breve': 'event-modal__status--soon',
  Encerrado: 'event-modal__status--ended',
}

function EventModal({ event, onClose }) {
  const display = useMemo(() => (event ? enrichAgendaEvent(event) : null), [event])

  useEffect(() => {
    if (!display) return undefined

    const handleKey = (e) => {
      if (e.key === 'Escape') onClose()
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKey)

    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKey)
    }
  }, [display, onClose])

  if (!display) return null

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
            src={display.image}
            filter={display.filter}
            alt={display.sport}
            className="event-modal__image"
          />
          <div className="event-modal__image-overlay" />
          <span className="event-modal__sport">{display.sport}</span>
        </div>

        <div className="event-modal__body">
          <div className="event-modal__tags">
            <span className="event-modal__tag">{display.tag}</span>
            <span className="event-modal__tag event-modal__tag--phase">{display.phase}</span>
          </div>

          <h2 id="event-modal-title" className="event-modal__title">{display.title}</h2>

          <div className="event-modal__meta">
            <div>
              <strong>Data</strong>
              <span>{display.date} ({display.day})</span>
            </div>
            <div>
              <strong>Horário</strong>
              <span>{display.time}</span>
            </div>
            <div>
              <strong>Local</strong>
              <span>{display.location}</span>
            </div>
          </div>

          <div className="event-modal__details">
            <div className="event-modal__detail">
              <span>Tipo de evento</span>
              <strong>{display.eventType}</strong>
            </div>
            <div className="event-modal__detail">
              <span>Fase</span>
              <strong>{display.phase}</strong>
            </div>
            <div className="event-modal__detail">
              <span>Importância</span>
              <strong>{display.importance}</strong>
            </div>
            <div className="event-modal__detail">
              <span>Status</span>
              <strong className={`event-modal__status ${statusClass[display.status] ?? ''}`}>
                {display.status}
              </strong>
            </div>
          </div>

          <div className="event-modal__content">
            {display.fullDescription.map((paragraph) => (
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
