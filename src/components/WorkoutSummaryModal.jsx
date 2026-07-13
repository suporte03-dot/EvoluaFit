import { calculateSessionStats } from '../utils/performanceUtils'
import Modal from './Modal'

export default function WorkoutSummaryModal({ isOpen, onClose, onConfirm, sessionData, workoutName }) {
  if (!isOpen || !sessionData) return null

  const stats = calculateSessionStats(sessionData)
  const saving = false

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Resumo do treino" size="md">
      <div className="workout-summary">
        <h3 className="workout-summary__name">{workoutName}</h3>

        <div className="workout-summary__stats">
          <div className="workout-summary__stat">
            <span>Duração</span>
            <strong>{sessionData.durationMinutes} min</strong>
          </div>
          <div className="workout-summary__stat">
            <span>Exercícios</span>
            <strong>{stats.exerciseCount}</strong>
          </div>
          <div className="workout-summary__stat">
            <span>Séries</span>
            <strong>{stats.totalSets}</strong>
          </div>
          <div className="workout-summary__stat">
            <span>Volume</span>
            <strong>{Math.round(stats.volume).toLocaleString('pt-BR')}</strong>
          </div>
        </div>

        {sessionData.exercises?.length > 0 && (
          <ul className="workout-summary__exercises">
            {sessionData.exercises.map((ex) => (
              <li key={ex.exerciseId || ex.name}>
                <strong>{ex.name}</strong>
                <span>
                  {ex.completedSets} séries · {ex.load || '—'} · {ex.reps} reps
                </span>
              </li>
            ))}
          </ul>
        )}

        {sessionData.notes && (
          <div className="workout-summary__notes">
            <span>Observações</span>
            <p>{sessionData.notes}</p>
          </div>
        )}

        <p className="safety-note">
          Ótimo trabalho! Hidrate-se, alongue-se e respeite o tempo de recuperação muscular.
        </p>

        <div className="workout-summary__actions">
          <button type="button" className="btn btn--ghost" onClick={onClose} disabled={saving}>
            Voltar
          </button>
          <button type="button" className="btn btn--primary btn--lg" onClick={onConfirm} disabled={saving}>
            Salvar treino
          </button>
        </div>
      </div>
    </Modal>
  )
}
