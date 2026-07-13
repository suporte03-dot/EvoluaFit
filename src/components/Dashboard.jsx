import { useMemo } from 'react'
import { useFitness } from '../context/FitnessContext'
import { getDashboardMetrics, formatDashboardValue } from '../utils/dashboardMetrics'
import { scrollToSection } from '../utils/scrollToSection'
import EmptyState from './EmptyState'

const METRIC_CARDS = [
  { key: 'weeklyWorkouts', label: 'Treinos na semana', icon: '📆' },
  { key: 'monthlyWorkouts', label: 'Treinos no mês', icon: '📅' },
  { key: 'streak', label: 'Sequência', icon: '🔥' },
  { key: 'totalVolume', label: 'Volume total', icon: '💪' },
  { key: 'avgDuration', label: 'Tempo médio', icon: '⏱️' },
  { key: 'nextWorkout', label: 'Próximo treino', icon: '🎯' },
  { key: 'topMuscleGroup', label: 'Grupo mais treinado', icon: '🏋️' },
  { key: 'restDays', label: 'Dias de descanso (7d)', icon: '😴' },
  { key: 'monthlyPerformancePct', label: 'Desempenho mensal', icon: '📈' },
  { key: 'activeGoals', label: 'Metas ativas', icon: '🎯' },
]

export default function Dashboard() {
  const { profile, workouts, history, goals, performance } = useFitness()

  const metrics = useMemo(
    () => getDashboardMetrics({ profile, workouts, history, goals, performance }),
    [profile, workouts, history, goals, performance],
  )

  if (!metrics.hasData) {
    return (
      <section className="dashboard">
        <div className="container">
          <EmptyState
            icon="📊"
            title="Indicadores aguardando dados"
            description="Registre seu primeiro treino para ativar os indicadores."
            ctaLabel="Ver meus treinos"
            ctaSection="treinos"
          />
        </div>
      </section>
    )
  }

  return (
    <section className="dashboard">
      <div className="container">
        <div className="dashboard__grid">
          {METRIC_CARDS.map((card) => (
            <div key={card.key} className="dashboard-card glass-card">
              <span className="dashboard-card__icon" aria-hidden="true">
                {card.icon}
              </span>
              <div>
                <span className="dashboard-card__label">{card.label}</span>
                <span className="dashboard-card__value">{formatDashboardValue(card.key, metrics)}</span>
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
