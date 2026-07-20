import { useState } from 'react'
import { useFitness } from '../context/FitnessContext'
import SectionTitle from './SectionTitle'

export default function Goals() {
  const { goals, updateGoals, performance } = useFitness()
  const [expandedId, setExpandedId] = useState(null)

  const syncedGoals = goals.map((goal) => {
    if (goal.type === 'weekly_workouts') {
      return { ...goal, current: performance.weeklyWorkouts }
    }
    return goal
  })

  const handleProgress = (id, delta) => {
    const updated = syncedGoals.map((g) => {
      if (g.id !== id) return g
      const next = Math.max(0, Math.min(g.target, g.current + delta))
      return { ...g, current: next }
    })
    updateGoals(updated)
  }

  const activeCount = syncedGoals.filter((g) => g.current < g.target).length

  return (
    <section id="metas" className="section">
      <div className="container">
        <SectionTitle
          tag="Metas"
          title="Metas saudáveis"
          subtitle="Objetivos realistas de consistência e bem-estar."
        />

        <div className="goals-summary glass-card">
          <div>
            <span className="goals-summary__label">Resumo</span>
            <strong className="goals-summary__value">
              {activeCount} {activeCount === 1 ? 'meta ativa' : 'metas ativas'}
            </strong>
          </div>
          <p className="goals-summary__hint">Toque em uma meta para ver detalhes e ajustar.</p>
        </div>

        <div className="goals-grid goals-grid--collapsible">
          {syncedGoals.map((goal) => {
            const pct = Math.min((goal.current / goal.target) * 100, 100)
            const isOpen = expandedId === goal.id
            return (
              <div
                key={goal.id}
                className={`goal-card glass-card${isOpen ? ' is-expanded' : ''}`}
              >
                <button
                  type="button"
                  className="goal-card__summary"
                  onClick={() => setExpandedId(isOpen ? null : goal.id)}
                  aria-expanded={isOpen}
                >
                  <div className="goal-card__header">
                    <h3>{goal.title}</h3>
                    {goal.healthy && <span className="healthy-badge">Saudável</span>}
                  </div>
                  <div className="goal-card__progress">
                    <div className="progress-bar progress-bar--lg">
                      <div className="progress-bar__fill" style={{ width: `${pct}%` }} />
                    </div>
                    <span>
                      {goal.current} / {goal.target} {goal.unit}
                    </span>
                  </div>
                  <span className="goal-card__chevron" aria-hidden="true">
                    {isOpen ? '▲' : '▼'}
                  </span>
                </button>

                {isOpen && (
                  <div className="goal-card__details">
                    {goal.type !== 'weekly_workouts' ? (
                      <div className="goal-card__actions">
                        <button
                          type="button"
                          className="btn btn--ghost btn--sm"
                          onClick={() => handleProgress(goal.id, -1)}
                        >
                          −
                        </button>
                        <button
                          type="button"
                          className="btn btn--ghost btn--sm"
                          onClick={() => handleProgress(goal.id, 1)}
                        >
                          +
                        </button>
                      </div>
                    ) : (
                      <p className="goal-card__auto">Atualizada automaticamente pelos treinos da semana.</p>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <p className="safety-note">
          Metas extremas de composição corporal ou volume de treino não são promovidas nesta plataforma.
          Consulte um profissional para objetivos personalizados.
        </p>
      </div>
    </section>
  )
}
