import { classifyWorkoutDay } from '../../../utils/trainingIdentity'

const WEEKDAYS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']

function mondayOf(ref = new Date()) {
  const d = new Date(ref)
  d.setHours(12, 0, 0, 0)
  const weekday = d.getDay()
  d.setDate(d.getDate() + (weekday === 0 ? -6 : 1 - weekday))
  return d
}

function dateKey(value) {
  const d = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  return d.toISOString().slice(0, 10)
}

function isDone(status) {
  const s = String(status || '').toLowerCase()
  return s === 'realizado' || s === 'completed' || s === 'done'
}

export default function WeekPlanWidget({ generatedPlan, workouts = [], today }) {
  const monday = mondayOf()
  const planDays = generatedPlan?.weeklyPlan || generatedPlan?.schedule || []
  const todayKey = dateKey(new Date())

  const days = WEEKDAYS.map((label, index) => {
    const date = new Date(monday)
    date.setDate(monday.getDate() + index)
    const key = dateKey(date)
    const planDay = planDays[index] || null
    const scheduled = (workouts || []).find((w) => dateKey(w.date) === key && !w.isRest)
    const name = scheduled?.name || planDay?.workoutName || planDay?.name || ''
    const type = name ? classifyWorkoutDay(scheduled || planDay || { name }) : { label: 'Folga', tone: 'rest' }
    const done = isDone(scheduled?.status)
    const isToday = key === todayKey
    const isNext = Boolean(
      today?.workout &&
        (today.workout.id === scheduled?.id || today.workout.name === name) &&
        ['ready', 'partial', 'returning', 'no_workout_today'].includes(today.situation),
    )

    return {
      label,
      key,
      type,
      done,
      isToday,
      isNext,
      rest: !name,
    }
  })

  return (
    <div className="week-plan">
      <p className="week-plan__kicker">Sua semana</p>
      <ol className="week-plan__days" aria-label="Calendário da rotina">
        {days.map((day) => (
          <li
            key={day.key}
            className={`week-plan__day${day.done ? ' is-done' : ''}${day.isToday ? ' is-today' : ''}${
              day.isNext ? ' is-next' : ''
            }${day.rest ? ' is-rest' : ''}`}
          >
            <span className="week-plan__wd">{day.label}</span>
            <strong>{day.type.label}</strong>
            <span className="week-plan__state">
              {day.done ? 'Feito' : day.isNext ? 'Próximo' : day.rest ? 'Folga' : 'Aberto'}
            </span>
          </li>
        ))}
      </ol>
    </div>
  )
}
