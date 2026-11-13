import { useEffect, useMemo, useState } from 'react'
import { BODY_GOAL_FIELDS, BODY_GOAL_TYPES, BODY_PROJECTION_DISCLAIMER } from '../../data/bodyEvolution'
import {
  avatarFactorsFromMeasures,
  formatMeasure,
  measuresFromGoals,
  toNumber,
  validateMeasure,
} from '../../utils/bodyEvolutionMetrics'
import BodyAvatar2D from './BodyAvatar2D'

const SOURCE_LIMITS = {
  target_weight: 'weight',
  target_waist: 'waist',
  target_chest: 'chest',
  target_arm: 'right_arm',
  target_hips: 'hips',
  target_thigh: 'right_thigh',
}

export default function BodyGoalPanel({
  current,
  height,
  goals,
  saving,
  onSave,
}) {
  const [draft, setDraft] = useState({
    goal_type: goals?.goal_type || 'track',
    target_weight: goals?.target_weight ?? '',
    target_waist: goals?.target_waist ?? '',
    target_chest: goals?.target_chest ?? '',
    target_arm: goals?.target_arm ?? '',
    target_hips: goals?.target_hips ?? '',
    target_thigh: goals?.target_thigh ?? '',
  })
  const [showProjection, setShowProjection] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    setDraft((prev) => ({
      ...prev,
      goal_type: goals?.goal_type || prev.goal_type,
      target_weight: goals?.target_weight ?? prev.target_weight,
      target_waist: goals?.target_waist ?? prev.target_waist,
      target_chest: goals?.target_chest ?? prev.target_chest,
      target_arm: goals?.target_arm ?? prev.target_arm,
      target_hips: goals?.target_hips ?? prev.target_hips,
      target_thigh: goals?.target_thigh ?? prev.target_thigh,
    }))
  }, [goals])

  const currentFactors = useMemo(
    () => avatarFactorsFromMeasures(current || {}, height),
    [current, height],
  )
  const targetMeasures = useMemo(() => measuresFromGoals(current || {}, draft), [current, draft])
  const targetFactors = useMemo(
    () => avatarFactorsFromMeasures(targetMeasures, height),
    [height, targetMeasures],
  )

  const update = (key, value) => {
    const mapped = SOURCE_LIMITS[key]
    const message = mapped ? validateMeasure(mapped, value) : null
    setError(message || '')
    setDraft((prev) => ({ ...prev, [key]: value }))
  }

  const save = async () => {
    if (error) return
    await onSave(draft)
  }

  return (
    <section className="body-goal" aria-labelledby="body-goal-title">
      <h2 id="body-goal-title">Onde você quer chegar?</h2>
      <p className="body-goal__note">Simulação visual de objetivo. Metas são opcionais.</p>

      <label className="form-field">
        <span>Qual transformação você quer acompanhar?</span>
        <select
          value={draft.goal_type}
          onChange={(event) => setDraft((prev) => ({ ...prev, goal_type: event.target.value }))}
        >
          {BODY_GOAL_TYPES.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <div className="body-goal__sliders">
        {BODY_GOAL_FIELDS.map((field) => {
          const currentValue = current?.[field.source]
          return (
            <label key={field.id} className="form-field">
              <span>
                {field.label} · atual {formatMeasure(currentValue, field.unit)}
              </span>
              <input
                type="range"
                min={Math.max(1, Math.round((toNumber(currentValue) || 50) * 0.8))}
                max={Math.round((toNumber(currentValue) || 50) * 1.2) || 100}
                step="0.5"
                value={draft[field.id] === '' ? currentValue || 0 : draft[field.id]}
                onChange={(event) => update(field.id, event.target.value)}
                disabled={currentValue == null}
              />
              <input
                inputMode="decimal"
                value={draft[field.id]}
                onChange={(event) => update(field.id, event.target.value)}
                placeholder="Meta"
              />
            </label>
          )
        })}
      </div>

      {error ? (
        <p className="body-form-error" role="alert">
          {error}
        </p>
      ) : null}

      <ul className="body-goal__compare">
        {BODY_GOAL_FIELDS.map((field) => (
          <li key={field.id}>
            <span>{field.label}</span>
            <strong>
              {formatMeasure(current?.[field.source], field.unit)} →{' '}
              {formatMeasure(draft[field.id], field.unit)}
            </strong>
          </li>
        ))}
      </ul>

      <button type="button" className="btn btn--primary" onClick={() => setShowProjection(true)}>
        Visualizar minha meta
      </button>
      <button type="button" className="btn btn--ghost" onClick={save} disabled={saving || Boolean(error)}>
        {saving ? 'Salvando...' : 'Salvar metas'}
      </button>

      {showProjection ? (
        <div className="body-goal__projection">
          <p className="body-evo-kicker">Representação estimada com base nas informações fornecidas.</p>
          <div className="body-goal__avatars">
            <BodyAvatar2D factors={currentFactors} label="Atual" tone="now" />
            <BodyAvatar2D
              factors={targetFactors}
              label="Meta visual estimada"
              caption="Simulação visual de objetivo"
              tone="goal"
            />
          </div>
          <p className="body-goal__disclaimer">{BODY_PROJECTION_DISCLAIMER}</p>
        </div>
      ) : null}
    </section>
  )
}
