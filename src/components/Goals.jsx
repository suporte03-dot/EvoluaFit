import { useFitness } from '../context/FitnessContext'
import SectionTitle from './SectionTitle'

export default function Goals() {
  const { goals, updateGoals, performance } = useFitness()

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

  return (
    <section id="metas" className="section">
      <div className="container">
        <SectionTitle
          tag="Metas"
          title="Metas saudáveis"
          subtitle="Defina objetivos realistas focados em bem-estar, consistência e recuperação."
        />

        <div className="goals-grid">
          {syncedGoals.map((goal) => {
            const pct = Math.min((goal.current / goal.target) * 100, 100)
            return (
              <div key={goal.id} className="goal-card glass-card">
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
                {goal.type !== 'weekly_workouts' && (
                  <div className="goal-card__actions">
                    <button type="button" className="btn btn--ghost btn--sm" onClick={() => handleProgress(goal.id, -1)}>
                      −
                    </button>
                    <button type="button" className="btn btn--ghost btn--sm" onClick={() => handleProgress(goal.id, 1)}>
                      +
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <p className="safety-note">
          Metas extremas de composição corporal ou volume de treino não são promovidas nesta plataforma. Consulte um
          profissional para objetivos personalizados.
        </p>
      </div>
    </section>
  )
}
