import { useFitness } from '../context/FitnessContext'
import { planToWorkouts } from '../utils/workoutGenerator'

export default function GeneratedPlan({ plan }) {
  const { addPlanWorkouts } = useFitness()

  const handleAddWorkouts = () => {
    const workouts = planToWorkouts(plan)
    addPlanWorkouts(workouts)
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
            <h4>
              Dia {day.day}: {day.name}
            </h4>
            <p className="plan-day__focus">{day.focus.join(' · ')}</p>
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
    </div>
  )
}
