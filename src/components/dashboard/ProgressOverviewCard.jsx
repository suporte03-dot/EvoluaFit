import { useMemo } from 'react'
import { scrollToSection } from '../../utils/scrollToSection'
import { EvolutionChartVisual, IconChevron } from './icons'
import {
  formatDashboardValue,
  metricAvailability,
} from '../../utils/dashboardMetrics'

export default function ProgressOverviewCard({
  metrics,
  weeklyFrequency = [],
}) {
  const hasData = Boolean(metrics?.progressHasData)
  const monthReady = metricAvailability('monthlyPerformancePct', metrics)
  const monthPct = monthReady ? metrics.monthlyPerformancePct : null

  const chartSeries = useMemo(() => {
    if (!hasData || !weeklyFrequency.length) return []
    const values = weeklyFrequency.map((p) => Number(p.value) || 0)
    const max = Math.max(...values, 1)
    return values.map((v) => 0.12 + (v / max) * 0.88)
  }, [weeklyFrequency, hasData])

  return (
    <article className="dash-module dash-module--purple">
      <div className="dash-module__body">
        <div className="dash-module__copy">
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
          {hasData && chartSeries.length ? (
            <>
              <EvolutionChartVisual series={chartSeries} className="dash-visual-evo" />
              {monthReady && monthPct != null ? (
                <p className="dash-evo-badge">
                  {formatDashboardValue('monthlyPerformancePct', metrics)}
                  <span>Volume vs. mês anterior</span>
                </p>
              ) : (
                <p className="dash-evo-badge dash-evo-badge--soft">
                  <span>
                    {metrics.monthlyComparisonLabel ||
                      'Ainda não há dados suficientes para comparar este período.'}
                  </span>
                </p>
              )}
            </>
          ) : (
            <div className="dash-module__empty-visual">
              <p>Sem dados suficientes ainda. Conclua treinos para ver a curva.</p>
            </div>
          )}
        </div>
      </div>
    </article>
  )
}