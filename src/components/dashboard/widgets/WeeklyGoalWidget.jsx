import { weeklyProgressSentence } from '../../../utils/todayWorkout'

export default function WeeklyGoalWidget({ weekly }) {
  const goal = weekly?.weeklyGoal > 0 ? weekly.weeklyGoal : null
  const done = weekly?.completedCount || 0
  const pct = goal ? Math.min(100, Math.round((done / goal) * 100)) : 0

  return (
    <div className="focus-widget-body">
      <p className="hoje-card__kicker">Hoje</p>
      <h3 className="hoje-card__title">Meta semanal</h3>
      <p className="hoje-card__body">{weeklyProgressSentence(weekly)}</p>
      {goal ? (
        <div
          className="hoje-xp"
          role="progressbar"
          aria-valuenow={done}
          aria-valuemin={0}
          aria-valuemax={goal}
          aria-label={`${done} de ${goal} treinos`}
        >
          <span style={{ width: `${pct}%` }} />
        </div>
      ) : (
        <p className="hoje-card__note">Defina a frequência da planilha para acompanhar a meta.</p>
      )}
    </div>
  )
}
