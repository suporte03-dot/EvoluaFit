import { weeklyActivitySeries } from '../dashboardUtils'
import { metricAvailability } from '../../../utils/dashboardMetrics'
import { IconFlame } from '../icons'

function Sparkline({ series }) {
  const w = 148
  const h = 36
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
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h} aria-hidden="true">
      <defs>
        <linearGradient id="streakSpark" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7657ff" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#7657ff" stopOpacity="0" />
        </linearGradient>
      </defs>
      {hasActivity && <path d={area} fill="url(#streakSpark)" />}
      <polyline
        fill="none"
        stroke="#7657ff"
        strokeWidth="2.2"
        strokeLinejoin="round"
        strokeLinecap="round"
        points={line}
        opacity={hasActivity ? 1 : 0.35}
      />
    </svg>
  )
}

export default function StreakWidget({ metrics, history, workouts }) {
  const ready = metricAvailability('streak', metrics)
  const days = ready ? metrics.streak : null
  const series = weeklyActivitySeries(history, workouts, 7)

  return (
    <div className="focus-widget-body">
      <p className="hoje-card__kicker">Hoje</p>
      <h3 className="hoje-card__title">
        {ready ? `${days} ${days === 1 ? 'dia' : 'dias'} evoluindo` : 'Sequência'}
      </h3>
      <p className="hoje-card__body">
        {ready
          ? 'Dias com treino concluído. Sem punição — o importante é voltar.'
          : 'Complete um treino hoje para registrar o primeiro dia.'}
      </p>
      <Sparkline series={series} />
    </div>
  )
}
