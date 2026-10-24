import { useState } from 'react'

const SLEEP = [
  { id: 'good', label: 'Dormi bem' },
  { id: 'ok', label: 'Mais ou menos' },
  { id: 'poor', label: 'Dormi pouco' },
]

const TIME = [
  { id: 30, label: '30 min' },
  { id: 45, label: '45 min' },
  { id: 60, label: '60 min' },
]

export function adaptWorkoutForCheck(workout, check) {
  if (!workout) return workout
  const exercises = [...(workout.exercises || [])]
  let next = exercises
  const minutes = Number(check?.minutes) || workout.estimatedMinutes || 45

  if (minutes <= 30 && next.length > 5) {
    next = next.slice(0, 5)
  } else if (minutes <= 45 && next.length > 7) {
    next = next.slice(0, 7)
  }

  if (check?.pain && check.painGroup) {
    const group = String(check.painGroup).toLowerCase()
    const filtered = next.filter((ex) => {
      const hay = `${ex.muscleGroup || ''} ${ex.category || ''} ${ex.name || ''}`.toLowerCase()
      return !hay.includes(group)
    })
    if (filtered.length >= 3) next = filtered
  }

  return {
    ...workout,
    exercises: next,
    estimatedMinutes: minutes,
    preWorkoutCheck: check,
  }
}

export default function PreWorkoutCheck({ workout, onConfirm, onSkip }) {
  const [sleep, setSleep] = useState('ok')
  const [pain, setPain] = useState(false)
  const [painGroup, setPainGroup] = useState('')
  const [minutes, setMinutes] = useState(workout?.estimatedMinutes > 50 ? 60 : 45)

  const submit = (skip) => {
    if (skip) {
      onSkip?.()
      return
    }
    onConfirm?.({ sleep, pain, painGroup: pain ? painGroup : '', minutes })
  }

  return (
    <div className="pre-workout">
      <p className="pre-workout__kicker">Antes de começar</p>
      <h3 className="pre-workout__title">Como você está hoje?</h3>
      <p className="pre-workout__lead">
        Três respostas rápidas. O treino encaixa no tempo e evita grupo com dor.
      </p>

      <fieldset className="pre-workout__set">
        <legend>Sono</legend>
        <div className="pre-workout__pills">
          {SLEEP.map((item) => (
            <button
              key={item.id}
              type="button"
              className={sleep === item.id ? 'is-active' : ''}
              onClick={() => setSleep(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className="pre-workout__set">
        <legend>Dor agora</legend>
        <div className="pre-workout__pills">
          <button type="button" className={!pain ? 'is-active' : ''} onClick={() => setPain(false)}>
            Sem dor
          </button>
          <button type="button" className={pain ? 'is-active' : ''} onClick={() => setPain(true)}>
            Tenho dor
          </button>
        </div>
        {pain ? (
          <label className="form-field">
            <span>Onde</span>
            <input
              value={painGroup}
              onChange={(e) => setPainGroup(e.target.value)}
              placeholder="ex: ombro, joelho, lombar"
            />
          </label>
        ) : null}
      </fieldset>

      <fieldset className="pre-workout__set">
        <legend>Tempo disponível</legend>
        <div className="pre-workout__pills">
          {TIME.map((item) => (
            <button
              key={item.id}
              type="button"
              className={minutes === item.id ? 'is-active' : ''}
              onClick={() => setMinutes(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="pre-workout__actions">
        <button type="button" className="btn btn--primary" onClick={() => submit(false)}>
          Ajustar e começar
        </button>
        <button type="button" className="btn btn--ghost" onClick={() => submit(true)}>
          Começar sem ajustar
        </button>
      </div>
    </div>
  )
}
