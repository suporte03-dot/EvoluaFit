import { useMemo, useState } from 'react'
import {
  BODY_GOAL_TYPES,
  BODY_MEASURE_FIELDS,
  BODY_PHOTO_TIPS,
  BODY_PHOTO_TYPES,
} from '../../data/bodyEvolution'
import { todayInputValue, validateMeasureMap } from '../../utils/bodyEvolutionMetrics'
import BodyPhotoUploader from './BodyPhotoUploader'

const EMPTY_PHOTOS = { front: { file: null, preview: null }, side: { file: null, preview: null }, back: { file: null, preview: null } }

export default function BodyCheckInForm({
  initial = {},
  prefill = {},
  saving = false,
  photoError = '',
  onCancel,
  onSubmit,
  showGoalType = false,
}) {
  const [step, setStep] = useState(0)
  const [photos, setPhotos] = useState(EMPTY_PHOTOS)
  const [date, setDate] = useState(initial.checkin_date || todayInputValue())
  const [notes, setNotes] = useState('')
  const [goalType, setGoalType] = useState(prefill.goal_type || 'track')
  const [values, setValues] = useState({
    height: prefill.height || '',
    weight: prefill.weight || '',
    waist: '',
    chest: '',
    right_arm: '',
    left_arm: '',
    hips: '',
    right_thigh: '',
    left_thigh: '',
    right_calf: '',
    left_calf: '',
    body_fat_percentage: '',
  })
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')

  const measureFields = useMemo(
    () => BODY_MEASURE_FIELDS.filter((field) => field.group !== 'profile' || field.id === 'height'),
    [],
  )

  const updatePhoto = (id, next) => {
    setPhotos((prev) => ({ ...prev, [id]: next }))
  }

  const goMeasures = () => {
    if (!photos.front.file) {
      setFormError('A foto frontal é obrigatória.')
      return
    }
    setFormError('')
    setStep(1)
  }

  const submit = async (event) => {
    event.preventDefault()
    const nextErrors = validateMeasureMap(values)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) {
      setFormError('Revise esta medida para continuar.')
      return
    }
    if (!photos.front.file) {
      setFormError('A foto frontal é obrigatória.')
      setStep(0)
      return
    }

    await onSubmit({
      checkin_date: date,
      weight: values.weight,
      body_fat_percentage: values.body_fat_percentage,
      height: values.height,
      notes,
      goal_type: showGoalType ? goalType : undefined,
      completeOnboarding: true,
      measurements: {
        waist: values.waist,
        chest: values.chest,
        right_arm: values.right_arm,
        left_arm: values.left_arm,
        hips: values.hips,
        right_thigh: values.right_thigh,
        left_thigh: values.left_thigh,
        right_calf: values.right_calf,
        left_calf: values.left_calf,
      },
      photos: {
        front: photos.front.file,
        side: photos.side.file,
        back: photos.back.file,
      },
    })
  }

  return (
    <form className="body-checkin" onSubmit={submit} noValidate>
      <ol className="body-checkin__steps" aria-label="Etapas do registro">
        <li className={step === 0 ? 'is-active' : ''}>Fotos</li>
        <li className={step === 1 ? 'is-active' : ''}>Medidas</li>
      </ol>

      {step === 0 ? (
        <div className="body-checkin__panel">
          <h2>Registre seu corpo</h2>
          <ul className="body-checkin__tips">
            {BODY_PHOTO_TIPS.map((tip) => (
              <li key={tip}>{tip}</li>
            ))}
          </ul>
          <div className="body-checkin__photos">
            {BODY_PHOTO_TYPES.map((type) => (
              <BodyPhotoUploader
                key={type.id}
                label={type.label}
                hint={type.hint}
                required={type.required}
                value={photos[type.id]}
                onChange={(next) => updatePhoto(type.id, next)}
                disabled={saving}
                error={type.id === 'front' && photoError ? photoError : ''}
              />
            ))}
          </div>
          <div className="body-checkin__nav">
            {onCancel ? (
              <button type="button" className="btn btn--ghost" onClick={onCancel} disabled={saving}>
                Cancelar
              </button>
            ) : null}
            <button type="button" className="btn btn--primary" onClick={goMeasures} disabled={saving}>
              Continuar
            </button>
          </div>
        </div>
      ) : (
        <div className="body-checkin__panel">
          <h2>Adicione suas medidas</h2>
          <p className="body-checkin__hint">Você pode salvar mesmo com informações parciais.</p>
          <label className="form-field">
            <span>Data do registro</span>
            <input type="date" value={date} onChange={(event) => setDate(event.target.value)} required />
          </label>
          <div className="body-checkin__grid">
            {measureFields.map((field) => (
              <label key={field.id} className="form-field">
                <span>
                  {field.label} ({field.unit})
                </span>
                <input
                  inputMode="decimal"
                  value={values[field.id]}
                  onChange={(event) => setValues((prev) => ({ ...prev, [field.id]: event.target.value }))}
                  aria-invalid={Boolean(errors[field.id])}
                />
                {errors[field.id] ? <em>{errors[field.id]}</em> : null}
              </label>
            ))}
          </div>
          {showGoalType ? (
            <label className="form-field">
              <span>Qual transformação você quer acompanhar?</span>
              <select value={goalType} onChange={(event) => setGoalType(event.target.value)}>
                {BODY_GOAL_TYPES.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
          <label className="form-field">
            <span>Observação (opcional)</span>
            <input value={notes} onChange={(event) => setNotes(event.target.value)} maxLength={280} />
          </label>
          {formError ? (
            <p className="body-form-error" role="alert">
              {formError}
            </p>
          ) : null}
          {photoError ? (
            <p className="body-form-error" role="alert">
              {photoError}
            </p>
          ) : null}
          <div className="body-checkin__nav">
            <button type="button" className="btn btn--ghost" onClick={() => setStep(0)} disabled={saving}>
              Voltar
            </button>
            <button type="submit" className="btn btn--primary" disabled={saving}>
              {saving ? 'Salvando...' : 'Salvar registro'}
            </button>
          </div>
        </div>
      )}
    </form>
  )
}
