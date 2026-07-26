import { useMemo } from 'react'
import { useProgress } from '../context/ProgressContext'
import SectionTitle from './SectionTitle'
import EmptyState from './EmptyState'
import { scrollToSection } from '../utils/scrollToSection'
import {
  formatDatePt,
  formatDurationSeconds,
  formatVolume,
} from '../utils/progressMetrics'

function VolumeBars({ points, emptyLabel, valueFormatter }) {
  if (!points?.length) {
    return <p className="empty-text">{emptyLabel}</p>
  }
  const max = Math.max(...points.map((p) => p.value), 1)
  const format = valueFormatter || ((v) => String(Math.round(v)))
  return (
    <div className="spark-bars" role="img" aria-label="Gráfico de barras">
      {points.map((p) => (
        <div key={p.label + String(p.value)} className="spark-bars__col">
          <div className="spark-bars__track">
            <div
              className="spark-bars__fill"
              style={{ height: `${Math.max((p.value / max) * 100, p.value > 0 ? 4 : 0)}%` }}
              title={`${p.label}: ${format(p.value)}`}
            />
          </div>
          <span className="spark-bars__label">{p.label}</span>
        </div>
      ))}
    </div>
  )
}

function TrendLine({ points, emptyLabel }) {
  if (!points?.length) {
    return <p className="empty-text">{emptyLabel}</p>
  }
  const max = Math.max(...points.map((p) => p.value), 1)
  const min = 0
  const w = 320
  const h = 96
  const pad = 8
  const coords = points.map((p, i) => {
    const x = pad + (i / Math.max(points.length - 1, 1)) * (w - pad * 2)
    const y = h - pad - ((p.value - min) / (max - min || 1)) * (h - pad * 2)
    return `${x},${y}`
  })
  const poly = coords.join(' ')
  return (
    <svg className="trend-line" viewBox={`0 0 ${w} ${h}`} role="img" aria-label="Tendência">
      <polyline
        fill="none"
        stroke="var(--color-primary)"
        strokeWidth="2.5"
        strokeLinejoin="round"
        strokeLinecap="round"
        points={poly}
      />
      {points.map((p, i) => {
        const [x, y] = coords[i].split(',')
        return <circle key={p.label + i} cx={x} cy={y} r="3.5" fill="var(--color-secondary)" />
      })}
    </svg>
  )
}

function SummaryCard({ label, value, hint }) {
  return (
    <div className="perf-stat glass-card perf-stat--neutral evo-summary-card">
      <span className="perf-stat__label">{label}</span>
      <span className="perf-stat__value">{value}</span>
      {hint ? <span className="perf-stat__hint">{hint}</span> : null}
    </div>
  )
}

export default function PerformanceDashboard() {
  const {
    loadingProgress,
    progressError,
    periodStats,
    weeklyFrequency,
    monthlyVolume,
    weeklyGoal,
    records,
    exerciseKey,
    setExerciseKey,
    exerciseOptions,
    exerciseSeries,
    loadingExercise,
    exerciseError,
    selectedRecord,
    refreshProgress,
  } = useProgress()

  const hasData = Boolean(periodStats?.hasData)

  const loadPoints = useMemo(
    () =>
      (exerciseSeries || []).map((row, i) => ({
        label: formatDatePt(row.started_at || row.completed_at).slice(0, 5) || `S${i + 1}`,
        value: Number(row.max_weight) || 0,
      })),
    [exerciseSeries],
  )

  const sessionVolumePoints = useMemo(
    () =>
      (exerciseSeries || []).map((row, i) => ({
        label: formatDatePt(row.started_at || row.completed_at).slice(0, 5) || `S${i + 1}`,
        value: Number(row.session_volume) || 0,
      })),
    [exerciseSeries],
  )

  const exerciseStats = useMemo(() => {
    if (!exerciseSeries?.length && !selectedRecord) return null
    const maxWeight = selectedRecord?.record_weight ?? Math.max(0, ...exerciseSeries.map((r) => Number(r.max_weight) || 0))
    const maxReps =
      selectedRecord?.record_repetitions ??
      Math.max(0, ...exerciseSeries.map((r) => Number(r.max_repetitions) || 0))
    const bestSet =
      selectedRecord?.record_set_volume ??
      Math.max(0, ...exerciseSeries.map((r) => Number(r.best_set_volume) || 0))
    const sessions = selectedRecord?.sessions_count ?? exerciseSeries.length
    return { maxWeight, maxReps, bestSet, sessions }
  }, [exerciseSeries, selectedRecord])

  if (loadingProgress) {
    return (
      <section id="desempenho" className="section section--alt">
        <div className="container">
          <SectionTitle
            tag="Evolução"
            title="Sua evolução"
            subtitle="Métricas reais a partir dos treinos concluídos."
          />
          <div className="evo-state" role="status" aria-live="polite">
            <span className="section-lazy-fallback__pulse" aria-hidden="true" />
            <p>Carregando sua evolução...</p>
          </div>
        </div>
      </section>
    )
  }

  if (progressError && !hasData) {
    return (
      <section id="desempenho" className="section section--alt">
        <div className="container">
          <SectionTitle
            tag="Evolução"
            title="Sua evolução"
            subtitle="Métricas reais a partir dos treinos concluídos."
          />
          <EmptyState
            className="empty-state--premium"
            icon="⚠️"
            title="Não foi possível carregar a evolução"
            description={progressError}
          >
            <button type="button" className="btn btn--primary" onClick={() => refreshProgress()}>
              Tentar novamente
            </button>
          </EmptyState>
        </div>
      </section>
    )
  }

  if (!hasData) {
    return (
      <section id="desempenho" className="section section--alt">
        <div className="container">
          <SectionTitle
            tag="Evolução"
            title="Sua evolução"
            subtitle="Métricas reais a partir dos treinos concluídos."
          />
          <EmptyState
            className="empty-state--premium"
            icon="📈"
            title="Ainda sem histórico"
            description="Conclua seu primeiro treino para começar a acompanhar sua evolução."
            ctaLabel="Ver meus treinos"
            ctaSection="treinos"
          />
        </div>
      </section>
    )
  }

  return (
    <section id="desempenho" className="section section--alt">
      <div className="container">
        <SectionTitle
          tag="Evolução"
          title="Sua evolução"
          subtitle="Resumo, frequência, volume e recordes com base nas suas sessões."
        />

        {progressError ? (
          <p className="evo-inline-error" role="status">
            {progressError}
          </p>
        ) : null}

        <div className="evo-toolbar">
          <p className="evo-toolbar__meta">
            {periodStats.weekSessions} treino{periodStats.weekSessions === 1 ? '' : 's'} nesta semana
            {weeklyGoal ? ` · meta ${weeklyGoal}` : ''}
            {' · '}
            sequência {periodStats.currentStreak} · recorde {periodStats.longestStreak}
          </p>
          <button type="button" className="btn btn--outline btn--sm" onClick={() => refreshProgress()}>
            Atualizar
          </button>
        </div>

        <div className="evo-block">
          <h3 className="evo-block__title">Resumo do período</h3>
          <p className="evo-block__subtitle">Métricas do mês atual com base em sessões concluídas.</p>
          <div className="evo-summary-grid">
            <SummaryCard
              label="Treinos concluídos"
              value={String(periodStats.monthSessions)}
              hint="Neste mês"
            />
            <SummaryCard
              label="Tempo treinado"
              value={formatDurationSeconds(periodStats.monthDurationSeconds)}
              hint="Soma das sessões do mês"
            />
            <SummaryCard
              label="Volume total"
              value={formatVolume(periodStats.monthVolume)}
              hint="Carga × reps no mês"
            />
            <SummaryCard
              label="Séries concluídas"
              value={formatVolume(periodStats.monthSets)}
              hint="Séries registradas no mês"
            />
          </div>
          <div className="evo-comparison glass-card">
            <strong>Comparação mensal</strong>
            <p>
              {periodStats.monthlyComparisonPct != null
                ? `Volume ${periodStats.monthlyComparisonLabel} em relação ao mês anterior.`
                : periodStats.monthlyComparisonLabel}
            </p>
            <p className="evo-comparison__extra">
              Média de duração:{' '}
              {periodStats.averageDurationSeconds != null
                ? formatDurationSeconds(periodStats.averageDurationSeconds)
                : '—'}
              {' · '}
              Esforço percebido:{' '}
              {periodStats.averagePerceivedEffort != null
                ? periodStats.averagePerceivedEffort
                : '—'}
            </p>
          </div>
        </div>

        <div className="evo-charts-grid">
          <div className="evo-block chart-card glass-card">
            <h3 className="evo-block__title">Frequência</h3>
            <p className="evo-block__subtitle">Sessões concluídas nas últimas 8 semanas.</p>
            <VolumeBars
              points={weeklyFrequency}
              emptyLabel="Sem sessões no período."
              valueFormatter={(v) => `${v} sessão${v === 1 ? '' : 'ões'}`}
            />
          </div>

          <div className="evo-block chart-card glass-card">
            <h3 className="evo-block__title">Volume mensal</h3>
            <p className="evo-block__subtitle">Volume total por mês.</p>
            <VolumeBars
              points={monthlyVolume}
              emptyLabel="Sem volume registrado."
              valueFormatter={(v) => formatVolume(v)}
            />
          </div>
        </div>

        <div className="evo-block">
          <div className="evo-block__head">
            <div>
              <h3 className="evo-block__title">Evolução por exercício</h3>
              <p className="evo-block__subtitle">Selecione um exercício para ver carga e volume.</p>
            </div>
            {exerciseOptions.length > 0 ? (
              <label className="evo-select">
                <span className="sr-only">Exercício</span>
                <select
                  value={exerciseKey}
                  onChange={(e) => setExerciseKey(e.target.value)}
                >
                  {exerciseOptions.map((opt) => (
                    <option key={opt.key} value={opt.key}>
                      {opt.name}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}
          </div>

          {!exerciseOptions.length ? (
            <p className="empty-text">
              Registre séries com carga nos treinos para acompanhar exercícios.
            </p>
          ) : loadingExercise ? (
            <p className="evo-state evo-state--inline" role="status">
              Carregando exercício...
            </p>
          ) : exerciseError ? (
            <p className="evo-inline-error">{exerciseError}</p>
          ) : (
            <>
              <div className="evo-exercise-stats">
                <SummaryCard label="Maior carga" value={formatVolume(exerciseStats?.maxWeight)} hint="kg" />
                <SummaryCard
                  label="Maior repetição"
                  value={formatVolume(exerciseStats?.maxReps)}
                  hint="em uma série"
                />
                <SummaryCard
                  label="Melhor volume de série"
                  value={formatVolume(exerciseStats?.bestSet)}
                  hint="carga × reps"
                />
                <SummaryCard
                  label="Sessões"
                  value={String(exerciseStats?.sessions ?? 0)}
                  hint="com este exercício"
                />
              </div>
              <div className="evo-charts-grid">
                <div className="chart-card glass-card">
                  <h4>Evolução da carga</h4>
                  <TrendLine
                    points={loadPoints}
                    emptyLabel="Sem histórico de carga para este exercício."
                  />
                </div>
                <div className="chart-card glass-card">
                  <h4>Volume por sessão</h4>
                  <VolumeBars
                    points={sessionVolumePoints}
                    emptyLabel="Sem volume por sessão."
                    valueFormatter={(v) => formatVolume(v)}
                  />
                </div>
              </div>
            </>
          )}
        </div>

        <div className="evo-block">
          <h3 className="evo-block__title">Recordes pessoais</h3>
          <p className="evo-block__subtitle">Maiores marcas registradas por exercício.</p>
          {!records.length ? (
            <p className="empty-text">Ainda não há recordes pessoais registrados.</p>
          ) : (
            <ul className="evo-pr-list">
              {records.map((r) => (
                <li key={r.exercise_key} className="evo-pr-item glass-card">
                  <div className="evo-pr-item__main">
                    <strong>{r.exercise_name || r.exercise_key}</strong>
                    <span>Última execução: {formatDatePt(r.last_performed_at)}</span>
                  </div>
                  <div className="evo-pr-item__stats">
                    <span>
                      Carga <b>{formatVolume(r.record_weight)}</b>
                    </span>
                    <span>
                      Reps <b>{formatVolume(r.record_repetitions)}</b>
                    </span>
                    <span>
                      Volume <b>{formatVolume(r.record_set_volume)}</b>
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="evo-footer-actions">
          <button type="button" className="btn btn--primary" onClick={() => scrollToSection('treinos')}>
            Ver meus treinos
          </button>
        </div>
      </div>
    </section>
  )
}