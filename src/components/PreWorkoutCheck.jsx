import { useMemo, useState } from 'react'
import { adaptWorkoutForCheck } from '../utils/preWorkoutAdapt.js'
import {
  PAIN_REGIONS,
  TIME_OPTIONS,
  adjustDayWorkout,
} from '../utils/dayAdjust.js'

export { adaptWorkoutForCheck }

const SLEEP = [
  { id: 'poor', label: 'Ruim' },
  { id: 'ok', label: 'Ok' },
  { id: 'good', label: 'Bom' },
]

const ENERGY = [
  { id: 'low', label: 'Baixa' },
  { id: 'ok', label: 'Ok' },
  { id: 'high', label: 'Alta' },
]

const PAIN = [
  { id: 'none', label: 'Nenhuma' },
  { id: 'leve', label: 'Leve' },
  { id: 'region', label: 'Em alguma região' },
]

export default function PreWorkoutCheck({ workout, onConfirm, onSkip, profile }) {
  const [sleep, setSleep] = useState('ok')
  const [energy, setEnergy] = useState('ok')
  const [painMode, setPainMode] = useState('none')
  const [painRegion, setPainRegion] = useState('')
  const [minutes, setMinutes] = useState(
    () => (Number(workout?.sessionTimeTarget) > 0 ? Number(workout.sessionTimeTarget) : null),
  )

  const check = useMemo(
    () => ({
      sleep,
      energy,
      pain: painMode !== 'none',
      painGroup: painMode === 'region' ? painRegion : painMode === 'leve' ? 'leve' : '',
      painRegion: painMode === 'region' ? painRegion : painMode === 'leve' ? 'leve' : '',
      minutes: minutes || undefined,
    }),
    [sleep, energy, painMode, painRegion, minutes],
  )

  const preview = useMemo(
    () =>
      adjustDayWorkout(workout, check, {
        level: profile?.level,
        goal: profile?.goal || profile?.objetivo,
      }),
    [workout, check, profile],
  )

  const canConfirm = painMode !== 'region' || Boolean(painRegion)

  const submit = (skip) => {
    if (skip) {
      onSkip?.()
      return
    }
    if (!canConfirm) return
    onConfirm?.(check)
  }

  return (
    <div className="pre-workout">
      <p className="pre-workout__kicker">Antes de começar</p>
      <h3 className="pre-workout__title">Como você está hoje?</h3>
      <p className="pre-workout__lead">
        Três respostas rápidas. O ajuste vale só para esta sessão — a planilha fica como está.
      </p>

      <fieldset className="pre-workout__set">
        <legend>Sono</legend>
        <div className="pre-workout__pills" role="group" aria-label="Sono">
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
        <legend>Energia</legend>
        <div className="pre-workout__pills" role="group" aria-label="Energia">
          {ENERGY.map((item) => (
            <button
              key={item.id}
              type="button"
              className={energy === item.id ? 'is-active' : ''}
              onClick={() => setEnergy(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className="pre-workout__set">
        <legend>Dor</legend>
        <div className="pre-workout__pills" role="group" aria-label="Dor">
          {PAIN.map((item) => (
            <button
              key={item.id}
              type="button"
              className={painMode === item.id ? 'is-active' : ''}
              onClick={() => {
                setPainMode(item.id)
                if (item.id !== 'region') setPainRegion('')
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
        {painMode === 'region' ? (
          <div className="pre-workout__pills" role="group" aria-label="Região com dor">
            {PAIN_REGIONS.map((item) => (
              <button
                key={item.id}
                type="button"
                className={painRegion === item.id ? 'is-active' : ''}
                onClick={() => setPainRegion(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>
        ) : null}
      </fieldset>

      <fieldset className="pre-workout__set">
        <legend>Tempo disponível</legend>
        <div className="pre-workout__pills" role="group" aria-label="Tempo disponível">
          {TIME_OPTIONS.map((value) => (
            <button
              key={value}
              type="button"
              className={minutes === value ? 'is-active' : ''}
              onClick={() => setMinutes(value)}
            >
              {value} min
            </button>
          ))}
          <button
            type="button"
            className={minutes == null ? 'is-active' : ''}
            onClick={() => setMinutes(null)}
          >
            Tempo normal
          </button>
        </div>
      </fieldset>

      {preview.summary || preview.messages?.length || preview.professionalAdvice ? (
        <div className="pre-workout__preview" role="status">
          {preview.summary ? <p>{preview.summary}</p> : null}
          {(preview.messages || []).map((msg) => (
            <p key={msg}>{msg}</p>
          ))}
          {preview.note ? <p>{preview.note}</p> : null}
          {preview.professionalAdvice ? <p className="pre-workout__advice">{preview.professionalAdvice}</p> : null}
        </div>
      ) : null}

      <div className="pre-workout__actions">
        <button
          type="button"
          className="btn btn--primary"
          disabled={!canConfirm}
          onClick={() => submit(false)}
        >
          Ajustar e começar
        </button>
        <button type="button" className="btn btn--ghost" onClick={() => submit(true)}>
          Começar sem ajustar
        </button>
      </div>
    </div>
  )
}
