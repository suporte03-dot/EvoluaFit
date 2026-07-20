import { useMemo, useState } from 'react'
import { useFitness } from '../context/FitnessContext'
import { generateWorkoutPlan, planToWorkouts } from '../utils/workoutGenerator'
import { exportWorkoutToExcel } from '../utils/exportWorkoutToExcel'
import SectionTitle from './SectionTitle'
import GeneratedPlan from './GeneratedPlan'
import PremiumSelect from './PremiumSelect'

const objectives = [
  { value: 'saude', label: 'Saúde geral' },
  { value: 'hipertrofia', label: 'Hipertrofia' },
  { value: 'forca', label: 'Força' },
  { value: 'condicionamento', label: 'Condicionamento' },
  { value: 'emagrecimento', label: 'Emagrecimento saudável' },
  { value: 'mobilidade', label: 'Mobilidade' },
]

const levels = ['Iniciante', 'Intermediário', 'Avançado']
const locations = ['Academia', 'Casa', 'Parque']
const equipmentOptions = [
  { id: 'Academia completa', icon: '🏋️' },
  { id: 'Halteres', icon: '💪' },
  { id: 'Barra', icon: '➖' },
  { id: 'Elástico', icon: '🪢' },
  { id: 'Peso corporal', icon: '🧍' },
]
const restrictionOptions = [
  { id: 'Joelho', icon: '🦵' },
  { id: 'Lombar', icon: '🦴' },
  { id: 'Ombro', icon: '🦾' },
]

const NONE_RESTRICTION = 'Sem restrições'

const STEPS = [
  { id: 1, title: 'Objetivo e nível', desc: 'Para onde quer evoluir e seu ponto de partida.' },
  { id: 2, title: 'Dias e tempo', desc: 'Frequência e duração de cada sessão.' },
  { id: 3, title: 'Local e equipamentos', desc: 'Onde treina e o que tem disponível.' },
  { id: 4, title: 'Cuidados e restrições', desc: 'Informações para um plano mais seguro.' },
  { id: 5, title: 'Resumo e gerar', desc: 'Confira e gere sua planilha.' },
]

export default function WorkoutPlanner() {
  const { profile, savePlan, addPlanWorkouts, showToast } = useFitness()
  const [form, setForm] = useState({
    objective: profile.objective || 'saude',
    level: profile.level || 'Iniciante',
    daysPerWeek: profile.daysPerWeek || 3,
    duration: profile.duration || 45,
    location: profile.location || 'Academia',
    equipment: profile.equipment || ['Academia completa'],
    restrictions: profile.restrictions || [],
  })
  const [plan, setPlan] = useState(null)
  const [noRestrictions, setNoRestrictions] = useState(!(profile.restrictions || []).length)
  const [step, setStep] = useState(1)

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }))

  const toggleEquipment = (value) => {
    setForm((prev) => {
      const arr = prev.equipment
      return {
        ...prev,
        equipment: arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value],
      }
    })
  }

  const toggleRestriction = (value) => {
    setNoRestrictions(false)
    setForm((prev) => {
      const arr = prev.restrictions
      return {
        ...prev,
        restrictions: arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value],
      }
    })
  }

  const selectNoRestrictions = () => {
    setNoRestrictions(true)
    setForm((prev) => ({ ...prev, restrictions: [] }))
  }

  const objectiveLabel = useMemo(
    () => objectives.find((o) => o.value === form.objective)?.label || form.objective,
    [form.objective],
  )

  const canGoNext = () => {
    if (step === 3 && !form.equipment.length) return false
    return true
  }

  const goNext = () => {
    if (step === 3 && !form.equipment.length) {
      showToast('Selecione ao menos um equipamento.', 'info')
      return
    }
    setStep((s) => Math.min(5, s + 1))
  }

  const goBack = () => setStep((s) => Math.max(1, s - 1))

  const handleGenerate = (e) => {
    e.preventDefault()
    if (!form.equipment.length) {
      showToast('Selecione ao menos um equipamento.', 'info')
      setStep(3)
      return
    }
    const generated = generateWorkoutPlan({
      ...form,
      restrictions: noRestrictions ? [] : form.restrictions,
    })
    setPlan(generated)
    savePlan(generated)
  }

  const handleDownloadExcel = () => {
    if (!plan) {
      showToast('Gere uma planilha antes de baixar o Excel.', 'info')
      return
    }
    try {
      exportWorkoutToExcel(plan)
      showToast('Planilha exportada para Excel!')
    } catch {
      showToast('Não foi possível exportar a planilha.', 'error')
    }
  }

  const handleSaveToMyPlan = () => {
    if (!plan) {
      showToast('Gere uma planilha antes de salvar.', 'info')
      return
    }
    const workouts = planToWorkouts(plan)
    if (!workouts.length) {
      showToast('Nenhum dia para salvar nesta planilha.', 'info')
      return
    }
    addPlanWorkouts(workouts)
  }

  const currentStep = STEPS.find((s) => s.id === step) || STEPS[0]

  const stepField = (key, value) => {
    if (step < 5) {
      // Fields fill as user progresses; show — until visited
      const visited = { objective: 1, level: 1, daysPerWeek: 2, duration: 2, location: 3, equipment: 3, restrictions: 4 }
      if (step < (visited[key] || 5)) return '—'
    }
    return value
  }

  const bumpDays = (delta) => {
    update('daysPerWeek', Math.min(7, Math.max(2, form.daysPerWeek + delta)))
  }
  const bumpDuration = (delta) => {
    update('duration', Math.min(90, Math.max(20, form.duration + delta)))
  }

  const summaryPanel = (
    <aside className="planner-preview" aria-live="polite">
      <div className="planner-preview__card">
        <p className="planner-preview__eyebrow">Prévia</p>
        <h3 className="planner-preview__title">Resumo do plano</h3>
        <div className="planner-preview__progress-label">
          Etapa {step} de {STEPS.length}
        </div>
        <div className="planner-preview__progress-bar" role="progressbar" aria-valuenow={step} aria-valuemin={1} aria-valuemax={5}>
          <div className="planner-preview__progress-fill" style={{ width: `${(step / STEPS.length) * 100}%` }} />
        </div>
        <ul className="planner-preview__list">
          <li>
            <span>Objetivo</span>
            <strong>{stepField('objective', objectiveLabel)}</strong>
          </li>
          <li>
            <span>Nível</span>
            <strong>{stepField('level', form.level)}</strong>
          </li>
          <li>
            <span>Frequência</span>
            <strong>{stepField('daysPerWeek', `${form.daysPerWeek}x por semana`)}</strong>
          </li>
          <li>
            <span>Duração</span>
            <strong>{stepField('duration', `${form.duration} min`)}</strong>
          </li>
          <li>
            <span>Local</span>
            <strong>{stepField('location', form.location)}</strong>
          </li>
          <li>
            <span>Equipamentos</span>
            <strong>
              {stepField('equipment', form.equipment.length ? form.equipment.join(', ') : '—')}
            </strong>
          </li>
          <li>
            <span>Cuidados</span>
            <strong>
              {stepField(
                'restrictions',
                noRestrictions || !form.restrictions.length
                  ? NONE_RESTRICTION
                  : form.restrictions.join(', '),
              )}
            </strong>
          </li>
        </ul>
        <p className="planner-preview__hint">
          O plano gerado equilibra grupos musculares e inclui descanso quando necessário.
        </p>
      </div>
    </aside>
  )

  return (
    <section id="planilha" className="section section--alt planner-section">
      <div className="container">
        <SectionTitle
          tag="Planilha"
          title="Monte sua planilha ideal"
          subtitle="Siga as etapas e gere um plano equilibrado para a sua rotina."
        />

        <div className="planner-wizard-progress" aria-label={`Etapa ${step} de ${STEPS.length}`}>
          <div className="planner-wizard-progress__meta">
            <strong>Etapa {step} de {STEPS.length}</strong>
            <span>{currentStep.title}</span>
          </div>
          <div className="planner-wizard-progress__bar" role="progressbar" aria-valuenow={step} aria-valuemin={1} aria-valuemax={5}>
            <div className="planner-wizard-progress__fill" style={{ width: `${(step / STEPS.length) * 100}%` }} />
          </div>
          <div className="planner-wizard-dots">
            {STEPS.map((s) => (
              <button
                key={s.id}
                type="button"
                className={`planner-wizard-dot${step === s.id ? ' is-active' : ''}${step > s.id ? ' is-done' : ''}`}
                onClick={() => setStep(s.id)}
                aria-current={step === s.id ? 'step' : undefined}
                title={s.title}
              >
                <span>{s.id}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="planner-layout planner-layout--wizard">
          <form className="planner-config" onSubmit={handleGenerate}>
            <div className="planner-step planner-step--active">
              <div className="planner-step__head">
                <span className="planner-step__icon" aria-hidden="true">
                  {step === 1 && '🎯'}
                  {step === 2 && '📅'}
                  {step === 3 && '🧰'}
                  {step === 4 && '🛡️'}
                  {step === 5 && '✓'}
                </span>
                <div>
                  <p className="planner-step__title">
                    Etapa {step} — {currentStep.title}
                  </p>
                  <p className="planner-step__desc">{currentStep.desc}</p>
                </div>
              </div>

              {step === 1 && (
                <div className="planner-step__grid">
                  <label className="planner-field">
                    <PremiumSelect
                      label="Objetivo"
                      value={form.objective}
                      options={objectives}
                      onChange={(value) => update('objective', value)}
                    />
                  </label>
                  <label className="planner-field">
                    <PremiumSelect
                      label="Nível"
                      value={form.level}
                      options={levels}
                      onChange={(value) => update('level', value)}
                    />
                  </label>
                </div>
              )}

              {step === 2 && (
                <div className="planner-step__grid planner-step__grid--steppers">
                  <div className="planner-field planner-field--stepper">
                    <span className="planner-field__row">
                      Dias por semana
                      <strong className="planner-badge">{form.daysPerWeek} dias</strong>
                    </span>
                    <div className="planner-stepper">
                      <button type="button" className="planner-stepper__btn" onClick={() => bumpDays(-1)} aria-label="Menos um dia" disabled={form.daysPerWeek <= 2}>
                        −
                      </button>
                      <span className="planner-stepper__value">{form.daysPerWeek}</span>
                      <button type="button" className="planner-stepper__btn" onClick={() => bumpDays(1)} aria-label="Mais um dia" disabled={form.daysPerWeek >= 7}>
                        +
                      </button>
                    </div>
                    <span className="planner-scale">
                      <em>2</em>
                      <em>7</em>
                    </span>
                  </div>

                  <div className="planner-field planner-field--stepper">
                    <span className="planner-field__row">
                      Tempo por treino
                      <strong className="planner-badge">{form.duration} min</strong>
                    </span>
                    <div className="planner-stepper">
                      <button type="button" className="planner-stepper__btn" onClick={() => bumpDuration(-5)} aria-label="Menos 5 minutos" disabled={form.duration <= 20}>
                        −
                      </button>
                      <span className="planner-stepper__value">{form.duration}</span>
                      <button type="button" className="planner-stepper__btn" onClick={() => bumpDuration(5)} aria-label="Mais 5 minutos" disabled={form.duration >= 90}>
                        +
                      </button>
                    </div>
                    <span className="planner-scale">
                      <em>20 min</em>
                      <em>90 min</em>
                    </span>
                  </div>
                </div>
              )}

              {step === 3 && (
                <>
                  <label className="planner-field" style={{ marginBottom: '1rem' }}>
                    <PremiumSelect
                      label="Local"
                      value={form.location}
                      options={locations}
                      onChange={(value) => update('location', value)}
                    />
                  </label>
                  <div className="planner-chips">
                    {equipmentOptions.map((eq) => (
                      <button
                        key={eq.id}
                        type="button"
                        className={`planner-chip${form.equipment.includes(eq.id) ? ' is-active' : ''}`}
                        onClick={() => toggleEquipment(eq.id)}
                      >
                        <span aria-hidden="true">{eq.icon}</span>
                        {eq.id}
                      </button>
                    ))}
                  </div>
                </>
              )}

              {step === 4 && (
                <div className="planner-chips">
                  {restrictionOptions.map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      className={`planner-chip planner-chip--care${!noRestrictions && form.restrictions.includes(r.id) ? ' is-active' : ''}`}
                      onClick={() => toggleRestriction(r.id)}
                    >
                      <span aria-hidden="true">{r.icon}</span>
                      {r.id}
                    </button>
                  ))}
                  <button
                    type="button"
                    className={`planner-chip planner-chip--safe${noRestrictions ? ' is-active' : ''}`}
                    onClick={selectNoRestrictions}
                  >
                    <span aria-hidden="true">✓</span>
                    {NONE_RESTRICTION}
                  </button>
                </div>
              )}

              {step === 5 && (
                <>
                  <div className="planner-summary-inline glass-card">
                    <ul className="planner-preview__list">
                      <li>
                        <span>Objetivo</span>
                        <strong>{objectiveLabel}</strong>
                      </li>
                      <li>
                        <span>Nível</span>
                        <strong>{form.level}</strong>
                      </li>
                      <li>
                        <span>Frequência</span>
                        <strong>{form.daysPerWeek}x · {form.duration} min</strong>
                      </li>
                      <li>
                        <span>Local</span>
                        <strong>{form.location}</strong>
                      </li>
                      <li>
                        <span>Equipamentos</span>
                        <strong>{form.equipment.join(', ') || '—'}</strong>
                      </li>
                      <li>
                        <span>Cuidados</span>
                        <strong>
                          {noRestrictions || !form.restrictions.length
                            ? NONE_RESTRICTION
                            : form.restrictions.join(', ')}
                        </strong>
                      </li>
                    </ul>
                  </div>
                </>
              )}
            </div>

            <div className="planner-wizard-nav">
              {step > 1 && (
                <button type="button" className="btn btn--ghost" onClick={goBack}>
                  Voltar
                </button>
              )}
              {step < 5 ? (
                <button
                  type="button"
                  className="btn btn--primary"
                  onClick={goNext}
                  disabled={!canGoNext()}
                >
                  Continuar
                </button>
              ) : (
                <button type="submit" className="btn btn--primary btn--lg planner-btn--generate">
                  Gerar planilha
                </button>
              )}
            </div>

            {plan && step === 5 && (
              <div className="planner-actions planner-actions--hierarchy">
                <button type="button" className="btn btn--primary btn--lg planner-btn--save" onClick={handleSaveToMyPlan}>
                  Salvar na minha planilha
                </button>
                <button type="button" className="btn btn--outline btn--lg planner-btn--excel" onClick={handleDownloadExcel}>
                  Exportar Excel
                </button>
                <button
                  type="button"
                  className="btn btn--ghost"
                  onClick={() => {
                    document.getElementById('calendario')?.scrollIntoView({ behavior: 'smooth' })
                  }}
                >
                  Ir ao calendário
                </button>
              </div>
            )}
          </form>

          {summaryPanel}
        </div>

        {plan && (
          <GeneratedPlan plan={plan} onDownloadExcel={handleDownloadExcel} onSaveToPlan={handleSaveToMyPlan} />
        )}
      </div>
    </section>
  )
}
