import { useMemo, useState } from 'react'
import { useFitness } from '../context/FitnessContext'
import { scrollToSection } from '../utils/scrollToSection'
import WorkoutDetailModal from './WorkoutDetailModal'

const suggestions = {
  push: { title: 'Dia de Push', desc: 'Foque em peito, ombros e tríceps com cargas moderadas.', muscles: ['Peito', 'Ombros', 'Tríceps'] },
  pull: { title: 'Dia de Pull', desc: 'Trabalhe costas e bíceps com amplitude controlada.', muscles: ['Costas', 'Bíceps'] },
  legs: { title: 'Dia de Pernas', desc: 'Priorize quadríceps, posterior e glúteos com aquecimento adequado.', muscles: ['Quadríceps', 'Posterior', 'Glúteos'] },
  rest: { title: 'Dia de descanso ativo', desc: 'Caminhada leve, alongamento ou mobilidade. Seu corpo precisa recuperar.', muscles: [] },
}

export default function TodaySuggestion() {
  const { workouts, history, performance } = useFitness()
  const [detailWorkout, setDetailWorkout] = useState(null)

  const suggestion = useMemo(() => {
    const lastSession = history[0]
    const lastMuscles = lastSession?.exercises?.map((e) => e.muscleGroup).filter(Boolean) || []
    const hasLegs = lastMuscles.some((m) => ['Quadríceps', 'Posterior', 'Glúteos'].includes(m))
    const hasPush = lastMuscles.some((m) => ['Peito', 'Ombros', 'Tríceps'].includes(m))
    const hasPull = lastMuscles.some((m) => ['Costas', 'Bíceps'].includes(m))

    const daysSinceLast =
      lastSession?.completedAt
        ? Math.floor((Date.now() - new Date(lastSession.completedAt)) / (1000 * 60 * 60 * 24))
        : 7

    if (daysSinceLast < 1) return suggestions.rest
    if (hasLegs) return suggestions.push
    if (hasPush) return suggestions.pull
    if (hasPull) return suggestions.legs

    const next = performance.nextWorkout
    if (next) {
      return {
        title: `Próximo: ${next.name}`,
        desc: `Treino agendado para ${new Date(next.date + 'T12:00:00').toLocaleDateString('pt-BR')}. Aqueça bem antes de começar.`,
        muscles: next.muscleGroups || [],
      }
    }

    return suggestions.push
  }, [history, performance.nextWorkout])

  const matchingWorkout = workouts.find(
    (w) =>
      w.status === 'Pendente' &&
      suggestion.muscles.some((m) => w.muscleGroups?.includes(m)),
  )

  const handleCta = () => {
    if (matchingWorkout) {
      setDetailWorkout(matchingWorkout)
    } else {
      scrollToSection('planilha')
    }
  }

  return (
    <section className="today-suggestion">
      <div className="container">
        <div className="suggestion-card glass-card">
          <div className="suggestion-card__icon" aria-hidden="true">
            💡
          </div>
          <div className="suggestion-card__content">
            <span className="suggestion-card__label">Sugestão de hoje</span>
            <h3>{suggestion.title}</h3>
            <p>{suggestion.desc}</p>
            {suggestion.muscles.length > 0 && (
              <div className="suggestion-card__muscles">
                {suggestion.muscles.map((m) => (
                  <span key={m} className="muscle-tag">
                    {m}
                  </span>
                ))}
              </div>
            )}
          </div>
          <button type="button" className="btn btn--primary" onClick={handleCta}>
            {matchingWorkout ? 'Ver treino' : 'Criar planilha'}
          </button>
        </div>
      </div>

      <WorkoutDetailModal
        workout={detailWorkout}
        isOpen={Boolean(detailWorkout)}
        onClose={() => setDetailWorkout(null)}
      />
    </section>
  )
}
