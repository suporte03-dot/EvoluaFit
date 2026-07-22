import { scrollToSection } from '../../utils/scrollToSection'
import {
  formatDashboardValue,
  metricAvailability,
  metricEmptyCopy,
  metricHint,
} from '../../utils/dashboardMetrics'
import { IconBolt, IconCalendar, IconChart, IconChevron, IconFlame } from './icons'

const INDICATORS = [
  {
    key: 'weeklyWorkouts',
    label: 'Treinos na semana',
    section: 'calendario',
    Icon: IconCalendar,
    progress: true,
  },
  {
    key: 'streak',
    label: 'Sequência',
    section: 'desempenho',
    Icon: IconFlame,
  },
  {
    key: 'nextWorkout',
    label: 'Próximo treino',
    section: 'calendario',
    Icon: IconBolt,
    linkLabel: 'Abrir agenda',
  },
  {
    key: 'monthlyPerformancePct',
    label: 'Evolução mensal',
    section: 'desempenho',
    Icon: IconChart,
    linkLabel: 'Ver gráficos',
  },
]

function weeklyProgressPct(metrics) {
  const done = metrics.weeklyWorkouts ?? 0
  const goal = metrics.weeklyGoal
  if (!goal || goal <= 0) return null
  return Math.min(100, Math.round((done / goal) * 100))
}

function weeklyDisplay(metrics) {
  const goal = metrics.weeklyGoal
  if (goal != null && goal > 0) {
    return `${metrics.weeklyWorkouts ?? 0}/${goal}`
  }
  if (metricAvailability('weeklyWorkouts', metrics)) {
    return formatDashboardValue('weeklyWorkouts', metrics)
  }
  return metricEmptyCopy('weeklyWorkouts').value
}

export function IndicatorCard({ card, metrics }) {
  const ready =
    card.key === 'weeklyWorkouts'
      ? metrics.weeklyGoal != null || metricAvailability(card.key, metrics)
      : metricAvailability(card.key, metrics)

  const value =
    card.key === 'weeklyWorkouts'
      ? weeklyDisplay(metrics)
      : ready
        ? formatDashboardValue(card.key, metrics)
        : metricEmptyCopy(card.key).value

  const hint = ready ? metricHint(card.key, metrics) : metricEmptyCopy(card.key).hint
  const pct = card.progress ? weeklyProgressPct(metrics) : null
  const Icon = card.Icon

  return (
    <button
      type="button"
      className={`dash-indicator${ready ? '' : ' is-empty'}`}
      onClick={() => scrollToSection(card.section)}
      aria-label={`${card.label}: ${value || 'sem dados'}`}
    >
      <span className="dash-indicator__top">
        <span className="dash-indicator__icon" aria-hidden="true">
          <Icon size={18} />
        </span>
        <span className="dash-indicator__label">{card.label}</span>
      </span>
      <span className="dash-indicator__value">{value}</span>
      {pct != null && (
        <span className="dash-indicator__bar" aria-hidden="true">
          <span className="dash-indicator__bar-fill" style={{ width: `${pct}%` }} />
        </span>
      )}
      <span className="dash-indicator__hint">{hint}</span>
      {card.linkLabel && (
        <span className="dash-indicator__link">
          {card.linkLabel}
          <IconChevron size={14} />
        </span>
      )}
    </button>
  )
}

export default function IndicatorsSection({ metrics }) {
  return (
    <section id="dash-indicadores" className="dash-indicators" aria-labelledby="dash-indicadores-title">
      <div className="dash-section-head dash-section-head--row">
        <h2 id="dash-indicadores-title" className="dash-section-head__eyebrow dash-section-head__eyebrow--lg">
          <IconChart size={16} />
          Indicadores
        </h2>
        <button
          type="button"
          className="dash-section-head__link"
          onClick={() => scrollToSection('desempenho')}
        >
          Ver todos
          <IconChevron size={16} />
        </button>
      </div>
      <div className="dash-indicators__grid">
        {INDICATORS.map((card) => (
          <IndicatorCard key={card.key} card={card} metrics={metrics} />
        ))}
      </div>
    </section>
  )
}
