import { useMemo } from 'react'
import { scrollToSection } from '../../utils/scrollToSection'
import { EvolutionChartVisual, IconChevron, IconTrend } from './icons'
import { weeklyActivitySeries } from './dashboardUtils'
import {
  formatDashboardValue,
  metricAvailability,
} from '../../utils/dashboardMetrics'

export default function ProgressOverviewCard({ metrics, history = [], workouts = [] }) {
  const series = useMemo(() => weeklyActivitySeries(history, workouts, 7), [history, workouts])
  const hasActivity = series.some((v) => v > 0)
  const monthReady = metricAvailability('monthlyPerformancePct', metrics)
  const monthPct = monthReady ? metrics.monthlyPerformancePct : null
  const hasData = hasActivity || metrics?.hasData

  const chartSeries = useMemo(() => {
    if (!hasData) return []
    // Soften binary activity into a readable curve for the area chart
    return series.map((v, i, arr) => {
      const prev = arr[i - 1] ?? v
      const next = arr[i + 1] ?? v
      return 0.15 + (prev + v * 2 + next) / 4 * 0.85
    })
  }, [series, hasData])

  return (
    <article className="dash-module dash-module--purple dash-module--split">
      <div className="dash-module__body">
        <div className="dash-module__copy">
          <p className="dash-module__eyebrow">
            <IconTrend size={14} />
            Evolução
          </p>
          <h3 className="dash-module__title">Evolução</h3>
          <p className="dash-module__desc">
            {hasData
              ? 'Frequência e volume da sua rotina — gráficos com dados reais.'
              : 'Complete treinos para liberar gráficos de frequência e volume.'}
          </p>
          <button
            type="button"
            className="dash-module__btn dash-module__btn--outline"
            onClick={() => scrollToSection('desempenho')}
          >
            Ver gráficos
            <IconChevron size={16} />
          </button>
        </div>

        <div className="dash-module__visual dash-module__visual--evo">
          {hasData ? (
            <>
              <EvolutionChartVisual series={chartSeries} className="dash-visual-evo" />
              {monthReady && monthPct != null ? (
                <p className="dash-evo-badge">
                  {formatDashboardValue('monthlyPerformancePct', metrics)}
                  <span> vs. mês anterior</span>
                </p>
              ) : null}
            </>
          ) : (
            <div className="dash-module__empty-visual">
              <EvolutionChartVisual
                series={[0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2]}
                className="dash-visual-evo is-muted"
              />
              <p>Sem dados suficientes ainda</p>
            </div>
          )}
        </div>
      </div>
    </article>
  )
}
