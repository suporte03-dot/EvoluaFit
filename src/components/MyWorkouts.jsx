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
            subtitle="Gerencie sua rotina, inicie sessões e acompanhe o status de cada treino."
          />

          {workouts.length === 0 ? (
            <EmptyState
              className="empty-state--premium"
              icon="🏋️"
              title="Nenhum treino cadastrado"
              description="Monte sua planilha personalizada ou peça uma sugestão ao Coach IA para começar."
              ctaLabel="Criar planilha"
              ctaSection="planilha"
              secondaryCtaLabel="Falar com Coach IA"
              secondaryCtaSection="coach-ia"
            />
          ) : (
            <div className="workout-list">
              {workouts.map((workout, index) => (
                <CollapsibleWorkoutCard
                  key={workout.id}
                  workout={workout}
                  index={index}
                  editingId={editingId}
                  editName={editName}
                  onEditNameChange={setEditName}
                  onStartEdit={startEdit}
                  onSaveEdit={saveEdit}
                  onStart={startWorkout}
                  onView={setDetailWorkout}
                  onDuplicate={duplicateWorkout}
                  onMarkDone={markDone}
                  onDelete={deleteWorkout}
                />
              ))}
            </div>
          )}
        </div>
      </div>
      <WorkoutDetailModal
        workout={detailWorkout}
        isOpen={Boolean(detailWorkout)}
        onClose={() => setDetailWorkout(null)}
      />
    </section>
  )
}
