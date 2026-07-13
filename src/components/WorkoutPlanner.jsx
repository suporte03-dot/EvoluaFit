import { useState } from 'react'
import { useFitness } from '../context/FitnessContext'
import { generateWorkoutPlan, planToWorkouts } from '../utils/workoutGenerator'
import { exportWorkoutToExcel } from '../utils/exportWorkoutToExcel'
import SectionTitle from './SectionTitle'
import GeneratedPlan from './GeneratedPlan'

const objectives = [
  { value: 'saude', label: 'Saúde geral' },
  { value: 'hipertrofia', label: 'Hipertrofia' },
  { value: 'emagrecimento', label: 'Emagrecimento' },
  { value: 'condicionamento', label: 'Condicionamento' },
  { value: 'forca', label: 'Força' },
]

const levels = ['Iniciante', 'Intermediário', 'Avançado']
const locations = ['Academia', 'Casa', 'Parque']
const equipmentOptions = ['Academia completa', 'Halteres', 'Barra', 'Elástico', 'Peso corporal']
const restrictionOptions = ['Joelho', 'Lombar', 'Ombro']

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

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }))

  const toggleArray = (key, value) => {
    setForm((prev) => {
      const arr = prev[key]
      return {
        ...prev,
        [key]: arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value],
      }
    })
  }

  const handleGenerate = (e) => {
    e.preventDefault()
    const generated = generateWorkoutPlan(form)
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

  return (
    <section id="planilha" className="section section--alt">
      <div className="container">
        <SectionTitle
          tag="Planilha"
          title="Monte sua planilha ideal"
          subtitle="Responda algumas perguntas e gere um plano adaptado ao seu perfil e restrições."
        />

        <form className="planner-form glass-card" onSubmit={handleGenerate}>
          <div className="form-grid">
            <label className="form-field">
              <span>Objetivo</span>
              <select value={form.objective} onChange={(e) => update('objective', e.target.value)}>
                {objectives.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="form-field">
              <span>Nível</span>
              <select value={form.level} onChange={(e) => update('level', e.target.value)}>
                {levels.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </label>

            <label className="form-field">
              <span>Dias por semana</span>
              <input
                type="range"
                min="2"
                max="6"
                value={form.daysPerWeek}
                onChange={(e) => update('daysPerWeek', Number(e.target.value))}
              />
              <strong>{form.daysPerWeek} dias</strong>
            </label>

            <label className="form-field">
              <span>Tempo por treino (min)</span>
              <input
                type="range"
                min="20"
                max="90"
                step="5"
                value={form.duration}
                onChange={(e) => update('duration', Number(e.target.value))}
              />
              <strong>{form.duration} min</strong>
            </label>

            <label className="form-field">
              <span>Local</span>
              <select value={form.location} onChange={(e) => update('location', e.target.value)}>
                {locations.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <fieldset className="form-fieldset">
            <legend>Equipamentos disponíveis</legend>
            <div className="chip-group">
              {equipmentOptions.map((eq) => (
                <button
                  key={eq}
                  type="button"
                  className={`chip ${form.equipment.includes(eq) ? 'chip--active' : ''}`}
                  onClick={() => toggleArray('equipment', eq)}
                >
                  {eq}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset className="form-fieldset">
            <legend>Restrições / cuidados</legend>
            <div className="chip-group">
              {restrictionOptions.map((r) => (
                <button
                  key={r}
                  type="button"
                  className={`chip chip--warn ${form.restrictions.includes(r) ? 'chip--active' : ''}`}
                  onClick={() => toggleArray('restrictions', r)}
                >
                  {r}
                </button>
              ))}
            </div>
          </fieldset>

          <p className="safety-note">
            Plano demonstrativo. Ajuste com um profissional de educação física antes de iniciar qualquer
            rotina.
          </p>

          <div className="planner-actions">
            <button type="submit" className="btn btn--primary btn--lg">
              Gerar planilha
            </button>
            {plan && (
              <>
                <button type="button" className="btn btn--ghost btn--lg" onClick={handleDownloadExcel}>
                  Baixar Excel
                </button>
                <button type="button" className="btn btn--ghost btn--lg" onClick={handleSaveToMyPlan}>
                  Salvar na minha planilha
                </button>
              </>
            )}
          </div>
        </form>

        {plan && <GeneratedPlan plan={plan} onDownloadExcel={handleDownloadExcel} onSaveToPlan={handleSaveToMyPlan} />}
      </div>
    </section>
  )
}
