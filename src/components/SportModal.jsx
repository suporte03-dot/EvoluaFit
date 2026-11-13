import { useEffect } from 'react'
import SportImage from './SportImage'
import { allNews, curiosities } from '../data/siteData'
import { getAgendaEvents } from '../data/agendaData'
import { enrichAgendaEvent } from '../utils/agendaDateUtils'
import { scrollToSection } from '../utils/scrollToSection'

function getRelatedNews(categoryId) {
  if (categoryId === 'futebol') {
    return allNews
      .filter((n) => n.filter === 'futebol' || n.filter === 'brasileirao')
      .slice(0, 3)
  }
  return allNews
    .filter((n) => n.filter === categoryId)
    .slice(0, 3)
}

function getUpcomingEvents(categoryId) {
  const filter = categoryId === 'brasileirao' ? 'futebol' : categoryId
  return getAgendaEvents()
    .filter((event) => event.filter === filter && event.status !== 'Encerrado')
    .slice(0, 3)
    .map(enrichAgendaEvent)
}

function getCuriosity(category) {
  return (
    curiosities.find((c) => c.sport.toLowerCase().includes(category.name.split(' ')[0].toLowerCase())) ??
    curiosities.find((c) => category.name.includes(c.sport)) ??
    curiosities[0]
  )
}

function SportModal({ category, onClose, onReadNews, onViewEvent }) {
  useEffect(() => {
    if (!category) return undefined

    const handleKey = (e) => {
      if (e.key === 'Escape') onClose()
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKey)

    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKey)
    }
  }, [category, onClose])

  if (!category) return null

  const relatedNews = getRelatedNews(category.id)
  const upcomingEvents = getUpcomingEvents(category.id)
  const curiosity = getCuriosity(category)

  return (
    <div className="modal sport-modal" role="dialog" aria-modal="true" aria-labelledby="sport-modal-title">
      <div className="modal__backdrop" onClick={onClose} aria-hidden="true" />
      <div className="modal__panel sport-modal__panel">
        <button type="button" className="modal__close" onClick={onClose} aria-label="Fechar modalidade">
          ✕
        </button>

        <div className="sport-modal__hero">
          <SportImage src={category.image} filter={category.id} alt={category.name} className="sport-modal__img" />
          <div className="sport-modal__hero-overlay" />
          <span className="sport-modal__icon" aria-hidden="true">{category.icon}</span>
          <h2 id="sport-modal-title" className="sport-modal__title">{category.name}</h2>
        </div>

        <div className="sport-modal__body">
          <p className="sport-modal__description">{category.description}</p>

          {(category.id === 'futebol' || category.id === 'brasileirao') && (
            <section className="sport-modal__section">
              <h3>Brasileirão Série A</h3>
              <button
                type="button"
                className="sport-modal__link-btn sport-modal__standings-link"
                onClick={() => {
                  onClose()
                  scrollToSection('brasileirao')
                }}
              >
                Ver classificação, jogos e artilharia →
              </button>
            </section>
          )}

          {(category.id === 'futebol' || category.id === 'brasileirao') && (
            <section className="sport-modal__section">
              <h3>{category.id === 'brasileirao' ? 'Outros campeonatos' : 'Classificações'}</h3>
              <button
                type="button"
                className="sport-modal__link-btn sport-modal__standings-link"
                onClick={() => {
                  onClose()
                  scrollToSection('tabelas')
                }}
              >
                {category.id === 'brasileirao'
                  ? 'Ver tabelas de outras competições →'
                  : 'Ver tabelas e campeonatos de futebol →'}
              </button>
            </section>
          )}

          <section className="sport-modal__section">
            <h3>Notícias relacionadas</h3>
            {relatedNews.length === 0 ? (
              <p className="empty-state empty-state--compact">
                Nenhuma notícia recente para esta modalidade.
              </p>
            ) : (
              <ul className="sport-modal__list">
                {relatedNews.map((news) => (
                  <li key={news.id}>
                    <button type="button" className="sport-modal__link-btn" onClick={() => onReadNews?.(news)}>
                      {news.title}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="sport-modal__section">
            <h3>Próximos eventos</h3>
            {upcomingEvents.length === 0 ? (
              <p className="empty-state empty-state--compact">
                Nenhum evento programado no momento.
              </p>
            ) : (
              <ul className="sport-modal__list">
                {upcomingEvents.map((event) => (
                  <li key={event.id}>
                    <button type="button" className="sport-modal__link-btn" onClick={() => onViewEvent?.(event)}>
                      {event.title} — {event.date} às {event.time}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {curiosity && (
            <section className="sport-modal__section sport-modal__curiosity">
              <h3>Curiosidade</h3>
              <p className="sport-modal__curiosity-q">{curiosity.question}</p>
              <p className="sport-modal__curiosity-a">{curiosity.answer}</p>
            </section>
          )}
        </div>
      </div>
    </div>
  )
}

export default SportModal
