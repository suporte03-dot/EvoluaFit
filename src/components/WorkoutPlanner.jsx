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
  { value: 'emagrecimento', label: 'Emagrecimento' },
  { value: 'condicionamento', label: 'Condicionamento' },
  { value: 'forca', label: 'Força' },
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

  const handleGenerate = (e) => {
    e.preventDefault()
    if (!form.equipment.length) {
      showToast('Selecione ao menos um equipamento.', 'info')
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
    addPlanWorkouts(planToWorkouts(plan))
  }

  const daysPct = ((form.daysPerWeek - 2) / (7 - 2)) * 100
  const durationPct = ((form.duration - 20) / (90 - 20)) * 100

  return (
    <section id="planilha" className="section section--alt planner-section">
      <div className="container">
        <SectionTitle
          tag="Planilha"
          title="Monte sua planilha ideal"
          subtitle="Configure seu objetivo, rotina e equipamentos para gerar um plano equilibrado."
        />

        <div className="planner-layout">
          <form className="planner-config" onSubmit={handleGenerate}>
            <div className="planner-step">
              <div className="planner-step__head">
                <span className="planner-step__icon" aria-hidden="true">
                  🎯
                </span>
                <div>
                  <p className="planner-step__title">Etapa 1 — Objetivo e nível</p>
                  <p className="planner-step__desc">Defina para onde quer evoluir e o seu ponto de partida.</p>
                </div>
              </div>
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
            </div>

            <div className="planner-step">
              <div className="planner-step__head">
                <span className="planner-step__icon" aria-hidden="true">
                  📅
                </span>
                <div>
                  <p className="planner-step__title">Etapa 2 — Rotina</p>
                  <p className="planner-step__desc">Frequência, tempo disponível e local de treino.</p>
                </div>
              </div>
              <div className="planner-step__grid planner-step__grid--sliders">
                <label className="planner-field planner-field--slider">
                  <span className="planner-field__row">
                    Dias por semana
                    <strong className="planner-badge">{form.daysPerWeek} dias</strong>
                  </span>
                  <input
                    type="range"
                    min="2"
                    max="7"
                    value={form.daysPerWeek}
                    onChange={(e) => update('daysPerWeek', Number(e.target.value))}
                    style={{ '--range-pct': `${daysPct}%` }}
                  />
                  <span className="planner-scale">
                    <em>2</em>
                    <em>7</em>
                  </span>
                </label>

                <label className="planner-field planner-field--slider">
                  <span className="planner-field__row">
                    Tempo por treino
                    <strong className="planner-badge">{form.duration} min</strong>
                  </span>
                  <input
                    type="range"
                    min="20"
                    max="90"
                    step="5"
                    value={form.duration}
                    onChange={(e) => update('duration', Number(e.target.value))}
                    style={{ '--range-pct': `${durationPct}%` }}
                  />
                  <span className="planner-scale">
                    <em>20 min</em>
                    <em>90 min</em>
                  </span>
                </label>

                <label className="planner-field">
                  <PremiumSelect
                    label="Local"
                    value={form.location}
                    options={locations}
                    onChange={(value) => update('location', value)}
                  />
                </label>
              </div>
            </div>

            <div className="planner-step">
              <div className="planner-step__head">
                <span className="planner-step__icon" aria-hidden="true">
                  🧰
                </span>
                <div>
                  <p className="planner-step__title">Etapa 3 — Equipamentos</p>
                  <p className="planner-step__desc">Selecione o que você tem disponível no treino.</p>
                </div>
              </div>
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
            </div>

            <div className="planner-step">
              <div className="planner-step__head">
                <span className="planner-step__icon planner-step__icon--care" aria-hidden="true">
                  🛡️
                </span>
                <div>
                  <p className="planner-step__title">Etapa 4 — Cuidados</p>
                  <p className="planner-step__desc">Informe restrições para um plano mais seguro.</p>
                </div>
              </div>
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
            </div>

            <div className="planner-alert" role="note">
              <span className="planner-alert__icon" aria-hidden="true">
                ⚠
              </span>
              <p>
                Plano demonstrativo. Ajuste com um profissional de educação física conforme sua condição,
                objetivo e limitações. Respeite seus limites e interrompa em caso de dor.
              </p>
            </div>

            <div className="planner-actions">
              <button type="submit" className="btn btn--primary btn--lg planner-btn--generate">
                Gerar planilha
              </button>
              {plan && (
                <>
                  <button type="button" className="btn btn--lg planner-btn--excel" onClick={handleDownloadExcel}>
                    Baixar Excel
                  </button>
                  <button type="button" className="btn btn--lg planner-btn--save" onClick={handleSaveToMyPlan}>
                    Salvar na minha planilha
                  </button>
                </>
              )}
            </div>
          </form>

          <aside className="planner-preview" aria-live="polite">
            <div className="planner-preview__card">
              <p className="planner-preview__eyebrow">Prévia</p>
              <h3 className="planner-preview__title">Resumo do plano</h3>
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
                  <strong>{form.daysPerWeek}x por semana</strong>
                </li>
                <li>
                  <span>Duração</span>
                  <strong>{form.duration} min</strong>
                </li>
                <li>
                  <span>Local</span>
                  <strong>{form.location}</strong>
                </li>
                <li>
                  <span>Equipamentos</span>
                  <strong>{form.equipment.length ? form.equipment.join(', ') : '—'}</strong>
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
              <p className="planner-preview__hint">
                O plano gerado equilibra grupos musculares e inclui descanso quando necessário.
              </p>
            </div>
          </aside>
        </div>

        {plan && <GeneratedPlan plan={plan} onDownloadExcel={handleDownloadExcel} onSaveToPlan={handleSaveToMyPlan} />}
      </div>
    </section>
  )
}
