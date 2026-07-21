import { useState, useMemo } from 'react'
import { useFitness } from '../context/FitnessContext'
import SectionTitle from './SectionTitle'
import WorkoutHistory from './WorkoutHistory'
import EmptyState from './EmptyState'
import { scrollToSection } from '../utils/scrollToSection'

const TABS = [
  { id: 'resumo', label: 'Resumo' },
  { id: 'frequencia', label: 'Frequência' },
  { id: 'grupos', label: 'Grupos musculares' },
  { id: 'historico', label: 'Histórico' },
]

/** Lightweight SVG sparkline / bar chart — no chart library */
function VolumeBars({ points, emptyLabel }) {
  if (!points?.length) {
    return <p className="empty-text">{emptyLabel}</p>
  }
  const max = Math.max(...points.map((p) => p.value), 1)
  return (
    <div className="spark-bars" role="img" aria-label="Gráfico de volume">
      {points.map((p) => (
        <div key={p.label} className="spark-bars__col">
          <div className="spark-bars__track">
            <div
              className="spark-bars__fill"
              style={{ height: `${Math.max((p.value / max) * 100, p.value > 0 ? 4 : 0)}%` }}
              title={`${p.label}: ${Math.round(p.value)}`}
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
    <svg className="trend-line" viewBox={`0 0 ${w} ${h}`} role="img" aria-label="Tendência de carga">
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
        return <circle key={p.label} cx={x} cy={y} r="3.5" fill="var(--color-secondary)" />
      })}
    </svg>
  )
}

export default function PerformanceDashboard() {
  const { performance, history, workouts } = useFitness()
  const [tab, setTab] = useState('resumo')
  const [extrasOpen, setExtrasOpen] = useState(false)

  const hasData = Boolean(history?.length || workouts?.some((w) => w.status === 'Realizado'))

  const maxMuscle = Math.max(...(performance.muscleVolume?.map((m) => m.volume) || [0]), 1)

  const loadPoints = useMemo(
    () =>
      (performance.loadEvolution || []).map((week, i) => ({
        label: `S${i + 1}`,
        value: week.totalLoad || 0,
      })),
    [performance.loadEvolution],
  )

  const musclePoints = useMemo(
    () =>
      (performance.muscleVolume || []).slice(0, 6).map((m) => ({
        label: m.group.slice(0, 4),
        value: m.volume,
      })),
    [performance.muscleVolume],
  )

  const primaryStats = [
    {
      label: 'Treinos semanais',
      value: hasData ? performance.weeklyWorkouts : null,
      hint: 'Concluídos nesta semana',
      max: 7,
    },
    {
      label: 'Sequência atual',
      value: hasData && performance.streak > 0 ? performance.streak : null,
      hint: 'Dias consecutivos com treino',
      max: 30,
    },
  ]

  const extraStats = [
    {
      label: 'Treinos mensais',
      value: hasData ? performance.monthlyWorkouts : null,
      hint: 'Concluídos neste mês',
      max: 20,
    },
    {
      label: 'Tempo médio',
      value: hasData && performance.averageDuration > 0 ? performance.averageDuration : null,
      hint: 'Média das sessões registradas',
      max: 90,
      suffix: ' min',
    },
  ]

  const renderStat = (s) => (
    <div key={s.label} className="perf-stat glass-card perf-stat--neutral">
      <span className="perf-stat__label">{s.label}</span>
      <span className="perf-stat__value">
        {s.value !== null ? (
          <>
            {s.value}
            {s.suffix || ''}
          </>
        ) : (
          '—'
        )}
      </span>
      <span className="perf-stat__hint">{s.value !== null ? s.hint : 'Sem dados ainda'}</span>
      {s.value !== null && (
        <div className="bar-chart">
          <div
            className="bar-chart__fill bar-chart__fill--green"
            style={{ width: `${Math.min((s.value / s.max) * 100, 100)}%` }}
          />
        </div>
      )}
    </div>
  )

  return (
    <section id="desempenho" className="section section--alt">
      <div className="container">
        <SectionTitle
          tag="Desempenho"
          title="Seu desempenho"
          subtitle="Gráficos e detalhamento — o Início mostra só o essencial."
        />

        {!hasData ? (
          <EmptyState
            className="empty-state--premium"
            icon="📈"
            title="Ainda sem histórico de desempenho"
            description="Complete treinos e registre cargas para ver frequência, volume e evolução. Nada aqui é inventado."
            ctaLabel="Ir para treinos"
            ctaSection="treinos"
            secondaryCtaLabel="Criar planilha"
            secondaryCtaSection="planilha"
          />
        ) : (
          <>
            <div className="perf-tabs" role="tablist" aria-label="Abas de desempenho">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  role="tab"
                  aria-selected={tab === t.id}
                  className={`perf-tab${tab === t.id ? ' is-active' : ''}`}
                  onClick={() => setTab(t.id)}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {tab === 'resumo' && (
              <div className="perf-panel" role="tabpanel">
                <div className="perf-stats">
                  {primaryStats.map(renderStat)}
                  {extraStats.map((s) => (
                    <div key={s.label} className="perf-stat-slot perf-stat-slot--desktop">
                      {renderStat(s)}
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  className={`disclose-toggle perf-extras-toggle${extrasOpen ? ' is-open' : ''}`}
                  onClick={() => setExtrasOpen((o) => !o)}
                  aria-expanded={extrasOpen}
                >
                  <span>{extrasOpen ? 'Ocultar métricas' : 'Mais métricas'}</span>
                  <span aria-hidden="true">{extrasOpen ? '▲' : '▼'}</span>
                </button>
                {extrasOpen && (
                  <div className="perf-stats perf-stats--mobile-extras">
                    {extraStats.map(renderStat)}
                  </div>
                )}
                <div className="chart-card glass-card">
                  <h3>Tendência de carga (semanas recentes)</h3>
                  <TrendLine
                    points={loadPoints}
                    emptyLabel="Registre cargas nos treinos para ver a tendência."
                  />
                </div>
              </div>
            )}

            {tab === 'frequencia' && (
              <div className="perf-panel" role="tabpanel">
                <div className="chart-card glass-card">
                  <h3>Evolução de carga por semana</h3>
                  {loadPoints.length === 0 ? (
                    <EmptyState
                      icon="📊"
                      title="Sem dados de carga"
                      description="Ao concluir treinos com peso registrado, a evolução aparece aqui."
                    >
                      <button type="button" className="btn btn--primary" onClick={() => scrollToSection('treinos')}>
                        Ir para treinos
                      </button>
                    </EmptyState>
                  ) : (
                    <div className="bar-chart-list">
                      {performance.loadEvolution.map((week) => {
                        const maxLoad = Math.max(...performance.loadEvolution.map((w) => w.totalLoad), 1)
                        return (
                          <div key={week.week} className="bar-chart-row">
                            <span className="bar-chart-row__label">{week.week}</span>
                            <div className="bar-chart">
                              <div
                                className="bar-chart__fill bar-chart__fill--orange"
                                style={{ width: `${(week.totalLoad / maxLoad) * 100}%` }}
                              />
                            </div>
                            <span className="bar-chart-row__value">{Math.round(week.totalLoad)} kg</span>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {tab === 'grupos' && (
              <div className="perf-panel" role="tabpanel">
                <div className="chart-card glass-card">
                  <h3>Volume por grupo muscular</h3>
                  {performance.muscleVolume.length === 0 ? (
                    <EmptyState
                      icon="💪"
                      title="Sem volume por grupo"
                      description="Complete sessões com exercícios da biblioteca para preencher este gráfico."
                    />
                  ) : (
                    <>
                      <VolumeBars
                        points={musclePoints}
                        emptyLabel="Complete treinos para ver estatísticas."
                      />
                      <div className="bar-chart-list" style={{ marginTop: '1.25rem' }}>
                        {performance.muscleVolume.slice(0, 8).map((item) => (
                          <div key={item.group} className="bar-chart-row">
                            <span className="bar-chart-row__label">{item.group}</span>
                            <div className="bar-chart">
                              <div
                                className="bar-chart__fill bar-chart__fill--blue"
                                style={{ width: `${(item.volume / maxMuscle) * 100}%` }}
                              />
                            </div>
                            <span className="bar-chart-row__value">{Math.round(item.volume)}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {tab === 'historico' && (
              <div className="perf-panel perf-panel--history" role="tabpanel">
                <WorkoutHistory embedded />
              </div>
            )}
          </>
        )}
      </div>
    </section>
  )
}
