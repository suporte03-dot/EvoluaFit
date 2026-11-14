/**
 * Contexto enviado à IA do Coach — só dados de treino.
 * Lista fechada de campos: nunca e-mail, nome, fotos, medidas corporais, peso, altura ou idade.
 */
import { displayWorkoutName } from '../workoutLabels.js'

const MAX_DAYS = 7
const MAX_EXERCISES_PER_DAY = 12
const MAX_SESSIONS = 5
const MAX_GOALS = 5
const MAX_CATALOG_PER_GROUP = 24

const HOME_EQUIPMENT = ['Peso corporal', 'Halteres', 'Elástico', 'Kettlebell', 'Colchonete']

function str(value, max = 80) {
  return String(value ?? '').trim().slice(0, max)
}

function list(value, max = 8) {
  return (Array.isArray(value) ? value : [])
    .map((v) => str(v, 40))
    .filter(Boolean)
    .slice(0, max)
}

function restOf(ex = {}) {
  const raw = ex.restSeconds ?? ex.rest
  const n = Number(raw)
  return Number.isFinite(n) && n > 0 ? `${n}s` : str(raw, 12)
}

export function compactExercise(ex = {}) {
  const rest = restOf(ex)
  return `${str(ex.name, 60)} ${str(ex.sets, 4)}×${str(ex.reps, 16)}${rest ? ` · ${rest}` : ''}`
}

export function compactPlan(plan) {
  const days = plan?.weeklyPlan || plan?.schedule || []
  if (!days.length) return null
  return {
    titulo: displayWorkoutName(str(plan.title || plan.name, 80)),
    dias: days.slice(0, MAX_DAYS).map((day, index) => ({
      dia: Number(day.day ?? day.dayNumber ?? index + 1),
      nome: displayWorkoutName(str(day.workoutName || day.name, 60)),
      exercicios: (day.exercises || []).slice(0, MAX_EXERCISES_PER_DAY).map(compactExercise),
    })),
  }
}

function sessionStatus(entry = {}) {
  const s = String(entry.status || '').toLowerCase()
  if (['parcial', 'partial'].includes(s)) return 'parcial'
  if (['cancelled', 'canceled', 'cancelado'].includes(s)) return 'cancelado'
  return 'concluído'
}

function compactSessions(history = []) {
  return (Array.isArray(history) ? history : [])
    .filter((h) => sessionStatus(h) !== 'cancelado')
    .slice(0, MAX_SESSIONS)
    .map((h) => ({
      data: str(h.completedAt || h.date, 10),
      nome: displayWorkoutName(str(h.name || h.workoutName, 60)),
      status: sessionStatus(h),
      exercicios: (h.exercises || []).length,
    }))
}

function compactGoals(goals = []) {
  return (Array.isArray(goals) ? goals : []).slice(0, MAX_GOALS).map((g) => ({
    tipo: str(g.type || g.title, 40),
    alvo: str(g.target, 12),
  }))
}

/**
 * @param {{ profile?, generatedPlan?, plans?, history?, goals? }} context
 */
export function buildCoachAIContext(context = {}) {
  const profile = context.profile || {}
  const plan = context.generatedPlan || context.plans?.[0] || null
  return {
    objetivo: str(profile.objective || plan?.goal || plan?.objective, 30) || null,
    nivel: str(profile.level || plan?.level, 20) || null,
    diasPorSemana: Number(profile.daysPerWeek || plan?.daysPerWeek) || null,
    duracaoMin: Number(profile.duration || plan?.minutesPerWorkout || plan?.duration) || null,
    local: str(profile.location || plan?.location, 20) || null,
    equipamento: list(profile.equipment || plan?.equipment),
    restricoes: list(profile.restrictions || plan?.restrictions),
    planilhaAtiva: compactPlan(plan),
    ultimasSessoes: compactSessions(context.history),
    metas: compactGoals(context.goals),
  }
}

/** Nomes permitidos por grupo — a IA só pode citar exercícios daqui. */
export function buildCatalogDigest(catalog = [], { location } = {}) {
  const home = String(location || '').toLowerCase() === 'casa'
  const out = {}
  for (const ex of catalog) {
    if (!ex || ex.hiddenFromLibrary || !ex.name) continue
    if (home && !HOME_EQUIPMENT.includes(ex.equipment)) continue
    const group = ex.category || 'Outros'
    if (!out[group]) out[group] = []
    if (out[group].length < MAX_CATALOG_PER_GROUP) out[group].push(ex.name)
  }
  return out
}
