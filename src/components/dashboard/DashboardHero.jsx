import { greetingParts, weeklyActivitySeries } from './dashboardUtils'
import { IconChevron, IconFlame } from './icons'
import { scrollToSection } from '../../utils/scrollToSection'
import {
  metricAvailability,
  metricEmptyCopy,
} from '../../utils/dashboardMetrics'

function Sparkline({ series }) {
  const w = 140
  const h = 40
  const max = Math.max(1, ...series)
  const step = series.length > 1 ? w / (series.length - 1) : w
  const pts = series.map((v, i) => {
    const x = i * step
    const y = h - (v / max) * (h - 8) - 4
    return [x, y]
  })
  const line = pts.map(([x, y]) => `${x},${y}`).join(' ')
  const area = `M ${pts[0][0]},${h} ${pts.map(([x, y]) => `L ${x},${y}`).join(' ')} L ${pts[pts.length - 1][0]},${h} Z`
  const hasActivity = series.some((v) => v > 0)

  return (
    <svg
      className="dash-hero__spark"
      viewBox={`0 0 ${w} ${h}`}
      width="100%"
      height={h}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="sparkFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
        </linearGradient>
      </defs>
      {hasActivity && <path d={area} fill="url(#sparkFill)" opacity="0.9" />}
      <polyline
        fill="none"
        stroke="#60A5FA"
        strokeWidth="2.2"
        strokeLinejoin="round"
        strokeLinecap="round"
        points={line}
        opacity={hasActivity ? 1 : 0.35}
      />
      {pts.map(([x, y], i) => (
        <circle
          key={i}
          cx={x}
          cy={y}
          r={series[i] > 0 ? 2.6 : 1.5}
          fill="#93C5FD"
          opacity={series[i] > 0 ? 1 : 0.35}
        />
      ))}
    </svg>
  )
}

export default function DashboardHero({ profile, metrics, history, workouts }) {
  const { hello } = greetingParts()
  const name = profile?.name || metrics?.profileName || 'Atleta'
  const streakReady = metricAvailability('streak', metrics)
  const streakDays = streakReady ? metrics.streak : null
  const series = weeklyActivitySeries(history, workouts, 7)

  return (
    <header className="dash-hero">
      <div className="dash-hero__bg" aria-hidden="true" />
      <div className="dash-hero__copy">
        <h1 className="dash-hero__title">
          {hello}, {name}! <span aria-hidden="true">👊</span>
        </h1>
        <p className="dash-hero__subtitle">
          Fluxo simples para organizar sua rotina com equilíbrio
        </p>
        <button
          type="button"
          className="dash-hero__more"
          onClick={() => scrollToSection('desempenho')}
        >
          Ver mais detalhes
          <IconChevron size={16} />
        </button>
      </div>

      <article
        className={`dash-hero__streak${streakReady ? '' : ' is-empty'}`}
        aria-label="Sequência de treinos"
      >
        <div className="dash-hero__streak-top">
          <span className="dash-hero__streak-icon" aria-hidden="true">
            <IconFlame size={20} />
          </span>
          <div>
            <p className="dash-hero__streak-value">
              {streakReady
                ? `${streakDays} ${streakDays === 1 ? 'DIA' : 'DIAS'} EM SEQUÊNCIA`
                : 'SEM SEQUÊNCIA'}
            </p>
            <p className="dash-hero__streak-hint">
              {streakReady ? 'Você está no ritmo!' : metricEmptyCopy('streak').hint}
            </p>
          </div>
        </div>
        <Sparkline series={series} />
      </article>
    </header>
  )
}
