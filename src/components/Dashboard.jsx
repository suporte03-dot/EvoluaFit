import { useMemo, useState } from 'react'
import { useFitness } from '../context/FitnessContext'
import { getDashboardMetrics, formatDashboardValue } from '../utils/dashboardMetrics'
import { scrollToSection } from '../utils/scrollToSection'

const PRIMARY_CARDS = [
  { key: 'nextWorkout', label: 'Próximo treino', icon: '⚡', tone: 'orange' },
  { key: 'weeklyWorkouts', label: 'Treinos na semana', icon: '📅', tone: 'cyan' },
  { key: 'monthlyPerformancePct', label: 'Desempenho mensal', icon: '📈', tone: 'green' },
  { key: 'streak', label: 'Sequência', icon: '🔥', tone: 'orange' },
]

const SECONDARY_CARDS = [
  { key: 'totalVolume', label: 'Volume total', icon: '🏋️', tone: 'blue' },
  { key: 'avgDuration', label: 'Tempo médio', icon: '⏱️', tone: 'cyan' },
  { key: 'topMuscleGroup', label: 'Grupo mais treinado', icon: '💪', tone: 'purple' },
  { key: 'restDays', label: 'Dias de descanso', icon: '🌙', tone: 'gray' },
  { key: 'activeGoals', label: 'Metas ativas', icon: '🎯', tone: 'green' },
]

function MetricCard({ card, metrics }) {
  return (
    <div className={`dashboard-card glass-card dashboard-card--${card.tone}`}>
      <span className="dashboard-card__icon" aria-hidden="true">
        {card.icon}
      </span>
      <div className="dashboard-card__body">
        <span className="dashboard-card__label">{card.label}</span>
        <span className="dashboard-card__value">{formatDashboardValue(card.key, metrics)}</span>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { profile, workouts, history, goals, performance } = useFitness()
  const [panelOpen, setPanelOpen] = useState(false)

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
          <>
            <div className="dashboard-primary">
              {PRIMARY_CARDS.map((card) => (
                <MetricCard key={card.key} card={card} metrics={metrics} />
              ))}
            </div>

            <div className="dashboard-panel">
              <button
                type="button"
                className={`dashboard-panel__toggle${panelOpen ? ' is-open' : ''}`}
                onClick={() => setPanelOpen((o) => !o)}
                aria-expanded={panelOpen}
              >
                <span>{panelOpen ? 'Ocultar painel completo' : 'Ver painel completo'}</span>
                <span className="dashboard-panel__chevron" aria-hidden="true">
                  {panelOpen ? '▲' : '▼'}
                </span>
              </button>

              {panelOpen && (
                <div className="dashboard-secondary" id="dashboard-full-panel">
                  {SECONDARY_CARDS.map((card) => (
                    <MetricCard key={card.key} card={card} metrics={metrics} />
                  ))}
                </div>
              )}
            </div>
          </>
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
            <span className="dashboard-calendar-cta__desc">Rotina mensal com status de cada dia</span>
          </span>
          <span className="dashboard-calendar-cta__arrow" aria-hidden="true">
            →
          </span>
        </button>
      </div>
    </section>
  )
}
