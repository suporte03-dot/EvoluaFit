/**
 * Compact weekly strip under hero — real data only (no fake suggestions).
 * Heavy "what to train" UX lives on the home today card + Coach.
 */
import { useMemo } from 'react'
import { useFitness } from '../context/FitnessContext'
import { scrollToSection } from '../utils/scrollToSection'
import { getWeeklyProgress, weeklyProgressSentence } from '../utils/todayWorkout'

export default function TodaySuggestion() {
  const { workouts, history, profile, goals, performance } = useFitness()

  const weekly = useMemo(
    () => getWeeklyProgress({ workouts, history, profile, goals }),
    [workouts, history, profile, goals],
  )

  const next = performance?.nextWorkout
  const streak = performance?.streak || 0

  return (
    <section className="today-suggestion today-suggestion--compact" aria-label="Resumo da semana">
      <div className="container">
        <div className="week-strip glass-card">
          <div className="week-strip__main">
            <p className="week-strip__sentence">{weeklyProgressSentence(weekly)}</p>
            <p className="week-strip__hint">
              {streak > 0
                ? `Sequência atual: ${streak} ${streak === 1 ? 'dia' : 'dias'}.`
                : next
                  ? `Próximo agendado: ${next.name}.`
                  : 'Acompanhe a rotina no calendário e no Coach.'}
            </p>
          </div>
          <div className="week-strip__actions">
            <button type="button" className="btn btn--ghost btn--sm" onClick={() => scrollToSection('calendario')}>
              Calendário
            </button>
            <button type="button" className="btn btn--ghost btn--sm" onClick={() => scrollToSection('coach-ia')}>
              Coach IA
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
