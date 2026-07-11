import { useFitness } from '../context/FitnessContext'
import { scrollToSection } from '../utils/scrollToSection'

export default function Dashboard() {
  const { performance } = useFitness()

  const topMuscle = performance.muscleVolume[0]?.group || '—'
  const nextDate = performance.nextWorkout?.date
    ? new Date(performance.nextWorkout.date + 'T12:00:00').toLocaleDateString('pt-BR', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
      })
    : '—'

  const cards = [
    { label: 'Treinos no mês', value: performance.monthlyWorkouts, icon: '📅' },
    { label: 'Sequência', value: `${performance.streak} dias`, icon: '🔥' },
    { label: 'Volume total', value: Math.round(performance.totalVolume).toLocaleString('pt-BR'), icon: '💪' },
    { label: 'Tempo médio', value: `${performance.averageDuration || 45} min`, icon: '⏱️' },
    { label: 'Próximo treino', value: nextDate, icon: '🎯' },
    { label: 'Grupo mais treinado', value: topMuscle, icon: '🏋️' },
    { label: 'Dias de descanso', value: performance.restDays, icon: '😴' },
  ]

  return (
    <section className="dashboard">
      <div className="container">
        <div className="dashboard__grid">
          {cards.map((card) => (
            <div key={card.label} className="dashboard-card glass-card">
              <span className="dashboard-card__icon" aria-hidden="true">
                {card.icon}
              </span>
              <div>
                <span className="dashboard-card__label">{card.label}</span>
                <span className="dashboard-card__value">{card.value}</span>
              </div>
            </div>
          ))}
        </div>
        <button type="button" className="dashboard__cta btn btn--ghost" onClick={() => scrollToSection('calendario')}>
          Ver calendário completo →
        </button>
      </div>
    </section>
  )
}
