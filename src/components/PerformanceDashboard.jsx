import { useFitness } from '../context/FitnessContext'
import SectionTitle from './SectionTitle'

export default function PerformanceDashboard() {
  const { performance } = useFitness()
  const maxMuscle = Math.max(...performance.muscleVolume.map((m) => m.volume), 1)
  const maxLoad = Math.max(...performance.loadEvolution.map((w) => w.totalLoad), 1)

  const stats = [
    { label: 'Treinos semanais', value: performance.weeklyWorkouts, max: 7 },
    { label: 'Treinos mensais', value: performance.monthlyWorkouts, max: 20 },
    { label: 'Sequência atual', value: performance.streak, max: 30 },
    { label: 'Tempo médio', value: performance.averageDuration, max: 90, suffix: ' min' },
  ]

  return (
    <section id="desempenho" className="section section--alt">
      <div className="container">
        <SectionTitle
          tag="Desempenho"
          title="Seu desempenho"
          subtitle="Acompanhe frequência, volume e evolução de carga ao longo do tempo."
        />

        <div className="perf-stats">
          {stats.map((s) => (
            <div key={s.label} className="perf-stat glass-card">
              <span className="perf-stat__label">{s.label}</span>
              <span className="perf-stat__value">
                {s.value}
                {s.suffix || ''}
              </span>
              <div className="bar-chart">
                <div
                  className="bar-chart__fill bar-chart__fill--green"
                  style={{ width: `${Math.min((s.value / s.max) * 100, 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="perf-charts">
          <div className="chart-card glass-card">
            <h3>Volume por grupo muscular</h3>
            {performance.muscleVolume.length === 0 ? (
              <p className="empty-text">Complete treinos para ver estatísticas.</p>
            ) : (
              <div className="bar-chart-list">
                {performance.muscleVolume.slice(0, 6).map((item) => (
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
            )}
          </div>

          <div className="chart-card glass-card">
            <h3>Evolução de carga</h3>
            {performance.loadEvolution.length === 0 ? (
              <p className="empty-text">Registre cargas nos treinos para acompanhar evolução.</p>
            ) : (
              <div className="bar-chart-list">
                {performance.loadEvolution.map((week) => (
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
                ))}
              </div>
            )}
          </div>
        </div>

        <p className="safety-note">
          Progresso saudável é gradual. Evite aumentos bruscos de carga e priorize recuperação adequada.
        </p>
      </div>
    </section>
  )
}
