export default function WorkoutProgressBar({ percent = 0, completedSets = 0, totalSets = 0, currentExercise = '' }) {
  const safePercent = Math.max(0, Math.min(100, percent || 0))

  return (
    <div className="workout-progress-bar" role="status" aria-live="polite">
      <div className="workout-progress-bar__top">
        <span className="workout-progress-bar__label">
          Progresso · {completedSets}/{totalSets} séries
        </span>
        <strong className="workout-progress-bar__pct">{safePercent}%</strong>
      </div>
      <div className="progress-bar workout-progress-bar__track" aria-hidden="true">
        <div className="progress-bar__fill" style={{ width: `${safePercent}%` }} />
      </div>
      {currentExercise && (
        <p className="workout-progress-bar__current">Exercício atual: {currentExercise}</p>
      )}
    </div>
  )
}
