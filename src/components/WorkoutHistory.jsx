import { useMemo, useState } from 'react'
import { useFitness } from '../context/FitnessContext'
import { useWorkoutSession } from '../context/WorkoutSessionContext'
import Modal from './Modal'
import EmptyState from './EmptyState'

export default function WorkoutHistory({ embedded = false }) {
  const { history: localHistory } = useFitness()
  const { sessionHistory, loadingSession, refreshSession, sessionError } = useWorkoutSession()
  const [selected, setSelected] = useState(null)

  const history = useMemo(() => {
    if (sessionHistory?.length) return sessionHistory
    return localHistory || []
  }, [sessionHistory, localHistory])

  const empty = (
    <EmptyState
      icon="📋"
      title="Nenhum treino registrado"
      description="Finalize uma sessão para ver seu histórico aqui."
      ctaLabel="Ver meus treinos"
      ctaSection="treinos"
    />
  )

  const content = (
    <>
      {!embedded && <h3 className="subsection-title">Histórico de treinos</h3>}

      {loadingSession ? <p className="history-loading">Carregando histórico...</p> : null}

      {sessionError ? (
        <div className="history-error">
          <p>{sessionError}</p>
          <button type="button" className="btn btn--ghost btn--sm" onClick={() => refreshSession()}>
            Tentar novamente
          </button>
        </div>
      ) : null}

      {!history.length && !loadingSession ? (
        empty
      ) : (
        <div className="history-list">
          {history.map((session) => (
            <button
              key={session.id}
              type="button"
              className="history-item glass-card"
              onClick={() => setSelected(session)}
            >
              <div>
                <strong>{session.name}</strong>
                <span>
                  {new Date(session.completedAt).toLocaleDateString('pt-BR', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                  })}
                </span>
              </div>
              <div className="history-item__meta">
                <span>
                  {session.durationMinutes != null
                    ? `${session.durationMinutes} min`
                    : session.durationSeconds != null
                      ? `${Math.round(session.durationSeconds / 60)} min`
                      : '—'}
                </span>
                <span>{session.exerciseCount || session.exercises?.length || 0} exercícios</span>
                {session.setCount != null ? <span>{session.setCount} séries</span> : null}
                {session.perceivedEffort ? <span>RPE {session.perceivedEffort}</span> : null}
                {session.status ? <span>{session.status}</span> : null}
                {session.partial ? <span>Parcial</span> : null}
                {session.noSession ? <span>Sem cargas</span> : null}
              </div>
            </button>
          ))}
        </div>
      )}

      <Modal isOpen={Boolean(selected)} onClose={() => setSelected(null)} title={selected?.name || 'Detalhes'}>
        {selected && (
          <div className="history-detail">
            <p>
              Realizado em {new Date(selected.completedAt).toLocaleString('pt-BR')}
              {selected.durationMinutes != null ? ` · ${selected.durationMinutes} minutos` : ''}
              {selected.perceivedEffort ? ` · esforço ${selected.perceivedEffort}/10` : ''}
              {selected.partial ? ' · parcial' : ''}
              {selected.noSession ? ' · sem sessão de cargas' : ''}
              {selected.status ? ` · ${selected.status}` : ''}
            </p>
            {selected.notes ? <p className="history-detail__notes">{selected.notes}</p> : null}
            <ul>
              {selected.exercises?.map((ex, i) => (
                <li key={i}>
                  <strong>{ex.name}</strong>
                  <span>
                    {ex.completedSets || ex.setsLog?.length || ex.sets || 0} séries
                    {ex.reps ? ` · ${ex.reps} reps` : ''}
                    {ex.load ? ` · ${ex.load}` : ''}
                  </span>
                  {Array.isArray(ex.setsLog) && ex.setsLog.length > 0 ? (
                    <ul className="history-detail__sets">
                      {ex.setsLog.map((set, si) => (
                        <li key={si}>
                          Série {set.setNumber || si + 1}: {set.reps || '—'} reps
                          {set.weight || set.load ? ` · ${set.weight || set.load}` : ''}
                          {set.rpe ? ` · RPE ${set.rpe}` : ''}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>
        )}
      </Modal>
    </>
  )

  if (embedded) return <div className="workout-history--embedded">{content}</div>

  return (
    <section className="section">
      <div className="container">{content}</div>
    </section>
  )
}