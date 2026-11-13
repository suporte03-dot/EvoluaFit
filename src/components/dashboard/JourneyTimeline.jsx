import { useMemo } from 'react'
import { buildJourneyMilestones } from '../../utils/journeyMilestones'
import EmptyState from '../ui/EmptyState'
import { scrollToSection } from '../../utils/scrollToSection'

export default function JourneyTimeline({ history = [], workouts = [], goals = [], streak = null }) {
  const events = useMemo(
    () => buildJourneyMilestones({ history, workouts, goals, streak }),
    [history, workouts, goals, streak],
  )

  if (!events.length) {
    return (
      <section className="journey" aria-label="Sua jornada">
        <header className="journey__head">
          <p className="journey__kicker">Sua jornada</p>
          <h3 className="journey__title">A timeline aparece com o primeiro treino</h3>
        </header>
        <EmptyState
          title="Sua evolução aparecerá aqui."
          description="Complete seu primeiro treino para começar a construir o histórico."
          actionLabel="Criar meu primeiro treino"
          onAction={() => scrollToSection('planilha')}
        />
      </section>
    )
  }

  return (
    <section className="journey" aria-label="Sua jornada">
      <header className="journey__head">
        <p className="journey__kicker">Sua jornada</p>
        <h3 className="journey__title">Marcos reais da sua evolução</h3>
      </header>
      <ol className="journey__list">
        {events.map((event, index) => (
          <li key={event.id} className={`journey__item journey__item--${event.tone || 'neutral'}`}>
            <div className="journey__rail" aria-hidden="true">
              <span className="journey__dot" />
              {index < events.length - 1 ? <span className="journey__line" /> : null}
            </div>
            <div className="journey__content">
              <time className="journey__date">{event.dateLabel}</time>
              <p className="journey__event-title">{event.title}</p>
              {event.detail ? <p className="journey__detail">{event.detail}</p> : null}
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}
