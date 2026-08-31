import { useState } from 'react'
import { useFitness } from '../context/FitnessContext'
import SectionTitle from './SectionTitle'
import EmptyState from './EmptyState'
import WorkoutDetailModal from './WorkoutDetailModal'
import CollapsibleWorkoutCard from './CollapsibleWorkoutCard'

export default function MyWorkouts() {
  const { workouts, startWorkout, updateWorkout, deleteWorkout, duplicateWorkout, showToast } = useFitness()
  const [editingId, setEditingId] = useState(null)
  const [editName, setEditName] = useState('')
  const [detailWorkout, setDetailWorkout] = useState(null)
  const [openId, setOpenId] = useState(null)
  const [isTreinosOpen, setIsTreinosOpen] = useState(false)

  const toggleOpen = (id) => {
    setOpenId((current) => (current === id ? null : id))
  }

  const startEdit = (workout, e) => {
    e?.stopPropagation()
    setEditingId(workout.id)
    setEditName(workout.name)
  }

  const saveEdit = (id, e) => {
    e?.stopPropagation()
    updateWorkout(id, { name: editName })
    setEditingId(null)
  }

  const markDone = (workout, e) => {
    e?.stopPropagation()
    updateWorkout(workout.id, {
      status: 'Realizado',
      completedAt: new Date().toISOString(),
    })
    showToast('Treino marcado como realizado!')
  }

  return (
    <section id="treinos" className="section section--workouts">
      <div className="container">
        <div className="workouts-panel">
          <SectionTitle
            tag="Treinos"
            title="Meus treinos"
            subtitle={
              <>
                <span className="copy-desktop">
                  Gerencie sua rotina, inicie sessões e acompanhe o status de cada treino.
                </span>
                <span className="copy-mobile">Organize e acompanhe seus treinos.</span>
              </>
            }
          />

          {workouts.length === 0 ? (
            <EmptyState
              className="empty-state--premium"
              title="Nenhum treino na planilha"
              description="Monte sua planilha para ver os treinos da semana aqui."
              ctaLabel="Criar planilha"
              ctaSection="planilha"
              secondaryCtaLabel="Falar com o Coach"
              secondaryCtaSection="coach-ia"
            />
          ) : (
            <>
              <button
                type="button"
                className={`disclose-toggle${isTreinosOpen ? ' is-open' : ''}`}
                onClick={() => setIsTreinosOpen((o) => !o)}
                aria-expanded={isTreinosOpen}
                aria-controls="meus-treinos-panel"
              >
                <span>{isTreinosOpen ? 'Ocultar meus treinos' : 'Ver meus treinos'}</span>
                <span className="disclose-toggle__chevron" aria-hidden="true">
                  ▼
                </span>
              </button>

              <div
                id="meus-treinos-panel"
                className={`disclose-panel${isTreinosOpen ? ' is-open' : ''}`}
                aria-hidden={!isTreinosOpen}
              >
                <div className="disclose-panel__inner">
                  <div className="workout-list">
                    {workouts.map((workout, index) => (
                      <CollapsibleWorkoutCard
                        key={workout.id}
                        workout={workout}
                        index={index}
                        isOpen={openId === workout.id}
                        onToggle={toggleOpen}
                        editingId={editingId}
                        editName={editName}
                        onEditNameChange={setEditName}
                        onSaveEdit={saveEdit}
                        onStartWorkout={startWorkout}
                        onViewWorkout={setDetailWorkout}
                        onEdit={startEdit}
                        onDuplicate={duplicateWorkout}
                        onComplete={markDone}
                        onDelete={deleteWorkout}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      <WorkoutDetailModal
        workout={detailWorkout ? workouts.find((w) => w.id === detailWorkout.id) || detailWorkout : null}
        isOpen={Boolean(detailWorkout)}
        onClose={() => setDetailWorkout(null)}
      />
    </section>
  )
}
