import { useState } from 'react'
import { useFitness } from '../context/FitnessContext'
import SectionTitle from './SectionTitle'
import EmptyState from './EmptyState'
import StartWorkoutModal from './StartWorkoutModal'

const statusClass = {
  Pendente: 'status--pending',
  Realizado: 'status--done',
  Parcial: 'status--partial',
  Pulado: 'status--skipped',
}

export default function MyWorkouts() {
  const { workouts, setActiveWorkout, updateWorkout, deleteWorkout, duplicateWorkout, showToast } = useFitness()
  const [editingId, setEditingId] = useState(null)
  const [editName, setEditName] = useState('')

  const startEdit = (workout) => {
    setEditingId(workout.id)
    setEditName(workout.name)
  }

  const saveEdit = (id) => {
    updateWorkout(id, { name: editName })
    setEditingId(null)
  }

  const markDone = (workout) => {
    updateWorkout(workout.id, {
      status: 'Realizado',
      completedAt: new Date().toISOString(),
    })
    showToast('Treino marcado como realizado!')
  }

  return (
    <section id="treinos" className="section">
      <div className="container">
        <SectionTitle
          tag="Treinos"
          title="Meus treinos"
          subtitle="Gerencie sua rotina, inicie sessões e acompanhe o status de cada treino."
        />

        {workouts.length === 0 ? (
          <EmptyState
            icon="🏋️"
            title="Nenhum treino cadastrado"
            description="Gere uma planilha personalizada ou adicione exercícios da biblioteca."
            ctaLabel="Criar planilha"
            ctaSection="planilha"
          />
        ) : (
          <div className="workout-list">
            {workouts.map((workout) => (
              <article key={workout.id} className="workout-card glass-card">
                <div className="workout-card__top">
                  {editingId === workout.id ? (
                    <div className="workout-card__edit">
                      <input value={editName} onChange={(e) => setEditName(e.target.value)} />
                      <button type="button" className="btn btn--sm btn--primary" onClick={() => saveEdit(workout.id)}>
                        Salvar
                      </button>
                    </div>
                  ) : (
                    <h3 className="workout-card__name">{workout.name}</h3>
                  )}
                  <span className={`status-badge ${statusClass[workout.status] || ''}`}>{workout.status}</span>
                </div>

                <div className="workout-card__meta">
                  <span>
                    {new Date(workout.date + 'T12:00:00').toLocaleDateString('pt-BR', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'short',
                    })}
                  </span>
                  <span>{workout.exercises?.length || 0} exercícios</span>
                  <span>{workout.estimatedMinutes || 45} min</span>
                </div>

                <div className="workout-card__muscles">
                  {workout.muscleGroups?.map((g) => (
                    <span key={g} className="muscle-tag">
                      {g}
                    </span>
                  ))}
                </div>

                <div className="workout-card__actions">
                  <button
                    type="button"
                    className="btn btn--primary btn--sm"
                    onClick={() => setActiveWorkout(workout)}
                    disabled={workout.status === 'Realizado'}
                  >
                    Iniciar
                  </button>
                  <button type="button" className="btn btn--ghost btn--sm" onClick={() => startEdit(workout)}>
                    Editar
                  </button>
                  <button type="button" className="btn btn--ghost btn--sm" onClick={() => duplicateWorkout(workout.id)}>
                    Duplicar
                  </button>
                  {workout.status !== 'Realizado' && (
                    <button type="button" className="btn btn--ghost btn--sm" onClick={() => markDone(workout)}>
                      Marcar realizado
                    </button>
                  )}
                  <button
                    type="button"
                    className="btn btn--danger btn--sm"
                    onClick={() => deleteWorkout(workout.id)}
                  >
                    Excluir
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
      <StartWorkoutModal />
    </section>
  )
}
