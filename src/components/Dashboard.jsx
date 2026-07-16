import { useMemo } from 'react'
import { useFitness } from '../context/FitnessContext'
import { getDashboardMetrics, formatDashboardValue } from '../utils/dashboardMetrics'
import { scrollToSection } from '../utils/scrollToSection'

const DASHBOARD_BLOCKS = [
  {
    id: 'rotina',
    title: 'Rotina',
    tone: 'cyan',
    cards: [
      { key: 'nextWorkout', label: 'Próximo treino', icon: '⚡', tone: 'orange' },
      { key: 'weeklyWorkouts', label: 'Treinos na semana', icon: '📅', tone: 'cyan' },
      { key: 'streak', label: 'Sequência', icon: '🔥', tone: 'orange' },
      { key: 'restDays', label: 'Descanso (7d)', icon: '🌙', tone: 'gray' },
    ],
  },
  {
    id: 'desempenho',
    title: 'Desempenho',
    tone: 'blue',
    cards: [
      { key: 'monthlyWorkouts', label: 'Treinos no mês', icon: '📆', tone: 'green' },
      { key: 'monthlyPerformancePct', label: 'Evolução mensal', icon: '📈', tone: 'blue' },
      { key: 'totalVolume', label: 'Volume total', icon: '🏋️', tone: 'blue' },
      { key: 'avgDuration', label: 'Tempo médio', icon: '⏱️', tone: 'cyan' },
    ],
  },
  {
    id: 'foco',
    title: 'Foco',
    tone: 'purple',
    cards: [
      { key: 'topMuscleGroup', label: 'Grupo mais treinado', icon: '💪', tone: 'purple' },
      { key: 'activeGoals', label: 'Metas ativas', icon: '🎯', tone: 'green' },
    ],
  },
]

export default function Dashboard() {
  const { profile, workouts, history, goals, performance } = useFitness()

  const metrics = useMemo(
    () => getDashboardMetrics({ profile, workouts, history, goals, performance }),
    [profile, workouts, history, goals, performance],
  )

  return (
    <section className={`dashboard${metrics.hasData ? '' : ' dashboard--empty'}`}>
      <div className="container">
        {!metrics.hasData ? (
          <div className="dashboard-empty glass-card">
            <span className="dashboard-empty__icon" aria-hidden="true">
              📊
            </span>
            <div className="dashboard-empty__content">
              <h2 className="dashboard-empty__title">Indicadores aguardando dados</h2>
              <p className="dashboard-empty__desc">
                Registre seu primeiro treino para ativar seus indicadores.
              </p>
              <div className="dashboard-empty__actions">
                <button type="button" className="btn btn--primary" onClick={() => scrollToSection('treinos')}>
                  Ver meus treinos
                </button>
                <button type="button" className="btn btn--ghost" onClick={() => scrollToSection('planilha')}>
                  Criar planilha
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="dashboard__blocks">
            {DASHBOARD_BLOCKS.map((block) => (
              <div key={block.id} className={`dashboard-block dashboard-block--${block.tone}`}>
                <h2 className="dashboard-block__title">{block.title}</h2>
                <div className="dashboard-block__grid">
                  {block.cards.map((card) => (
                    <div
                      key={card.key}
                      className={`dashboard-card glass-card dashboard-card--${card.tone}`}
                    >
                      <span className="dashboard-card__icon" aria-hidden="true">
                        {card.icon}
                      </span>
                      <div className="dashboard-card__body">
                        <span className="dashboard-card__label">{card.label}</span>
                        <span className="dashboard-card__value">
                          {formatDashboardValue(card.key, metrics)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        <button
          type="button"
          className="dashboard-calendar-cta glass-card"
          onClick={() => scrollToSection('calendario')}
        >
          <span className="dashboard-calendar-cta__icon" aria-hidden="true">
            🗓️
          </span>
          <span className="dashboard-calendar-cta__body">
            <span className="dashboard-calendar-cta__title">Ver calendário completo</span>
            <span className="dashboard-calendar-cta__desc">
              Visualize sua rotina mensal com status de cada dia
            </span>
          </span>
          <span className="dashboard-calendar-cta__arrow" aria-hidden="true">
            →
          </span>
        </button>
      </div>
    </section>
  )
}
