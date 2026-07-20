import { useMemo } from 'react'
import { useFitness } from '../context/FitnessContext'
import {
  getDashboardMetrics,
  formatDashboardValue,
  metricAvailability,
  metricHint,
  metricEmptyCopy,
} from '../utils/dashboardMetrics'
import { scrollToSection } from '../utils/scrollToSection'
import EmptyState from './EmptyState'

/** Início: 3–4 hero metrics with links — detail lives in Desempenho / Calendário */
const HERO_METRICS = [
  {
    key: 'weeklyWorkouts',
    label: 'Treinos na semana',
    icon: '📅',
    section: 'calendario',
    linkLabel: 'Ver calendário',
  },
  {
    key: 'streak',
    label: 'Sequência',
    icon: '🔥',
    section: 'desempenho',
    linkLabel: 'Ver desempenho',
  },
  {
    key: 'nextWorkout',
    label: 'Próximo treino',
    icon: '⚡',
    section: 'calendario',
    linkLabel: 'Abrir agenda',
  },
  {
    key: 'monthlyPerformancePct',
    label: 'Evolução mensal',
    icon: '📈',
    section: 'desempenho',
    linkLabel: 'Ver gráficos',
  },
]

function MetricCard({ card, metrics }) {
  const ready = metricAvailability(card.key, metrics)
  const value = ready ? formatDashboardValue(card.key, metrics) : metricEmptyCopy(card.key).value
  const hint = ready ? metricHint(card.key, metrics) : metricEmptyCopy(card.key).hint

  return (
    <button
      type="button"
      className={`dash-metric glass-card${ready ? '' : ' dash-metric--empty'}`}
      onClick={() => scrollToSection(card.section)}
      aria-label={`${card.label}: ${value || 'sem dados'}. ${card.linkLabel}`}
    >
      <span className="dash-metric__icon" aria-hidden="true">
        {card.icon}
      </span>
      <div className="dash-metric__body">
        <span className="dash-metric__label">{card.label}</span>
        <span className="dash-metric__value">{value}</span>
        <span className="dash-metric__hint">{hint}</span>
        <span className="dash-metric__link">{card.linkLabel} →</span>
      </div>
    </button>
  )
}

export default function Dashboard() {
  const { profile, workouts, history, goals, performance } = useFitness()

  const metrics = useMemo(
    () => getDashboardMetrics({ profile, workouts, history, goals, performance }),
    [profile, workouts, history, goals, performance],
  )

  return (
    <section className={`dashboard${metrics.hasData ? '' : ' dashboard--empty'}`} aria-label="Indicadores do início">
      <div className="container">
        {!metrics.hasData && !metrics.hasSchedule ? (
          <EmptyState
            className="empty-state--premium dashboard-empty-premium"
            icon="📊"
            title="Seus indicadores aparecem aqui"
            description="Complete ou agende o primeiro treino para ver frequência, sequência e evolução — sem números inventados."
            ctaLabel="Criar planilha"
            ctaSection="planilha"
            secondaryCtaLabel="Ver meus treinos"
            secondaryCtaSection="treinos"
          />
        ) : (
          <div className="dash-metric-grid">
            {HERO_METRICS.map((card) => (
              <MetricCard key={card.key} card={card} metrics={metrics} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
