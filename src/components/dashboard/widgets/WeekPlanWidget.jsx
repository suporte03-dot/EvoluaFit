import { classifyWorkoutDay } from '../../../utils/trainingIdentity'
import { buildWeekPlanDays, weekSummaryLine } from '../../../utils/weekPlan'

export default function WeekPlanWidget({ generatedPlan, workouts = [], history = [], today }) {
  const days = buildWeekPlanDays({ generatedPlan, workouts, history, today }).map((day) => ({
    ...day,
    type: day.name ? classifyWorkoutDay(day.item || { name: day.name }) : { label: 'Folga', tone: 'rest' },
  }))
  const summary = weekSummaryLine(days)

  return (
    <div className="week-plan">
      <p className="week-plan__kicker">Sua semana</p>
      <p className="week-plan__summary">
        {summary.text} Hoje: <strong>{summary.today}</strong>
      </p>
      <ol className="week-plan__days" aria-label="Calendário da rotina">
        {days.map((day) => (
          <li
            key={day.key}
            className={`week-plan__day${day.done ? ' is-done' : ''}${day.isToday ? ' is-today' : ''}${
              day.isNext ? ' is-next' : ''
            }${day.missed ? ' is-missed' : ''}${day.rest ? ' is-rest' : ''}`}
          >
            <span className="week-plan__wd">{day.label}</span>
            <strong>{day.type.label}</strong>
            <span className="week-plan__state">{day.state}</span>
          </li>
        ))}
      </ol>
    </div>
  )
}
