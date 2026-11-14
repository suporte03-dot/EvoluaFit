import { useMemo, useState } from 'react'
import { validatePlan } from '../utils/prescription/validate.js'
import { displayWorkoutName, formatRestLabel } from '../utils/trainingIdentity'

const FIELD_LABEL = {
  reps: 'repetições',
  rest: 'descanso',
  sets: 'séries',
  exercise: 'exercício',
  muscleGroups: 'etiquetas',
}

function formatValue(field, value) {
  if (value == null || value === '') return '—'
  if (field === 'rest') return formatRestLabel(value)
  return String(value)
}

function describe(correction) {
  if (correction.field === 'exercise') return `${correction.name}: sai da sessão`
  const label = FIELD_LABEL[correction.field] || correction.field
  const subject = correction.name || 'Treino'
  return `${subject} — ${label}: ${formatValue(correction.field, correction.from)} → ${formatValue(correction.field, correction.to)}`
}

/**
 * Aviso discreto quando a planilha salva viola as regras atuais.
 * Nada muda sem o clique em "Atualizar planilha".
 */
export default function PlanUpgradeNotice({ plan, onApply }) {
  const [open, setOpen] = useState(false)
  const result = useMemo(() => (plan ? validatePlan(plan) : null), [plan])

  if (!result || result.valid) return null

  const days = result.days.filter((day) => day.corrections.length)

  return (
    <div className="planner-sync plan-upgrade" role="status">
      <div className="plan-upgrade__head">
        <p className="planner-sync__msg">Sua planilha pode ser otimizada com as novas regras.</p>
        <div className="plan-upgrade__actions">
          <button type="button" className="btn btn--ghost btn--sm" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
            {open ? 'Ocultar mudanças' : 'Ver o que muda'}
          </button>
          <button type="button" className="btn btn--primary btn--sm" onClick={() => onApply(result.plan)}>
            Atualizar planilha
          </button>
        </div>
      </div>

      {open ? (
        <div className="plan-upgrade__preview">
          {days.map((day) => (
            <section key={day.workout.day ?? day.workout.workoutName} className="plan-upgrade__day">
              <p className="plan-upgrade__day-title">
                <strong>{displayWorkoutName(day.workout.workoutName || day.workout.name || 'Treino')}</strong>
                <span>
                  {day.minutesBefore} min → {day.minutesAfter} min
                </span>
              </p>
              <ul>
                {day.corrections.map((c, index) => (
                  <li key={`${c.exerciseId || c.field}-${c.field}-${index}`}>
                    <span>{describe(c)}</span>
                    <em>{c.reason}</em>
                  </li>
                ))}
              </ul>
            </section>
          ))}
          {result.warnings.length ? (
            <ul className="plan-upgrade__warnings">
              {result.warnings.map((warning) => (
                <li key={warning}>{warning}</li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
