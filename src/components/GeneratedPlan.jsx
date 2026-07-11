import { useState } from 'react'
import { useFitness } from '../context/FitnessContext'
import { planToWorkouts } from '../utils/workoutGenerator'
import WorkoutDetailModal from './WorkoutDetailModal'

export default function GeneratedPlan({ plan }) {
  const { addPlanWorkouts } = useFitness()
  const [detailWorkout, setDetailWorkout] = useState(null)

  const handleAddWorkouts = () => {
    const workouts = planToWorkouts(plan)
    addPlanWorkouts(workouts)
  }

  const openDayDetail = (day) => {
    const workouts = planToWorkouts(plan)
    const workout = workouts.find((w) => w.name === day.name && w.muscleGroups?.join() === day.focus?.join())
      || {
        id: `preview-${plan.id}-${day.day}`,
        name: day.name,
        date: new Date().toISOString().split('T')[0],
        muscleGroups: day.focus,
        exercises: day.exercises,
        status: 'Pendente',
        estimatedMinutes: day.estimatedMinutes,
      }
    setDetailWorkout(workout)
  }

  return (
    <div className="generated-plan glass-card">
      <div className="generated-plan__header">
        <div>
          <h3 className="generated-plan__title">Sua planilha — {plan.objectiveLabel}</h3>
          <p className="generated-plan__meta">
            {plan.level} · {plan.daysPerWeek}x/semana · {plan.duration} min · {plan.location}
          </p>
        </div>
        <button type="button" className="btn btn--primary" onClick={handleAddWorkouts}>
          Adicionar treinos à lista
        </button>
      </div>

      <div className="generated-plan__days">
        {plan.schedule.map((day) => (
          <div key={day.day} className="plan-day">
            <div className="plan-day__header">
              <div>
                <h4>
                  Dia {day.day}: {day.name}
                </h4>
                <p className="plan-day__focus">{day.focus.join(' · ')}</p>
              </div>
              <button type="button" className="btn btn--ghost btn--sm" onClick={() => openDayDetail(day)}>
                Ver treino
              </button>
            </div>
            <ul className="plan-day__exercises">
              {day.exercises.map((ex) => (
                <li key={ex.exerciseId}>
                  <strong>{ex.name}</strong>
                  <span>
                    {ex.sets}x {ex.reps} · descanso {ex.restSeconds}s
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {plan.safetyNotes?.length > 0 && (
        <div className="safety-box">
          <strong>Notas de segurança</strong>
          <ul>
            {plan.safetyNotes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </div>
      )}

      <p className="safety-note">{plan.disclaimer}</p>

      <WorkoutDetailModal
        workout={detailWorkout}
        isOpen={Boolean(detailWorkout)}
        onClose={() => setDetailWorkout(null)}
      />
    </div>
  )
}
