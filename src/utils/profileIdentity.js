import { objectiveLabels } from '../data/workoutTemplates'

const CLOUD_GOAL_BY_CODE = {
  saude: 'Saúde geral',
  forca: 'Ganho de força',
  hipertrofia: 'Hipertrofia',
  condicionamento: 'Condicionamento',
  emagrecimento: 'Emagrecimento',
  mobilidade: 'Mobilidade',
}

const CODE_BY_LABEL = {
  'saúde geral': 'saude',
  'saude geral': 'saude',
  'ganho de força': 'forca',
  'ganho de forca': 'forca',
  força: 'forca',
  forca: 'forca',
  hipertrofia: 'hipertrofia',
  condicionamento: 'condicionamento',
  emagrecimento: 'emagrecimento',
  'emagrecimento saudável': 'emagrecimento',
  'emagrecimento saudavel': 'emagrecimento',
  mobilidade: 'mobilidade',
}

export function cloudGoalToCode(goal) {
  if (!goal) return ''
  if (objectiveLabels[goal]) return goal
  const normalized = String(goal).trim().toLowerCase()
  return CODE_BY_LABEL[normalized] || ''
}

export function codeToCloudGoal(code) {
  return CLOUD_GOAL_BY_CODE[code] || ''
}

export function displayGoalLabel({ cloudGoal, objective } = {}) {
  const code = cloudGoalToCode(cloudGoal) || (objectiveLabels[objective] ? objective : '')
  if (code && objectiveLabels[code]) return objectiveLabels[code]
  if (cloudGoal) return String(cloudGoal)
  return ''
}

export function resolveDaysPerWeek({ profile, generatedPlan, plans } = {}) {
  const planDays = Number(generatedPlan?.daysPerWeek || plans?.[0]?.daysPerWeek || 0)
  const profileDays = Number(profile?.daysPerWeek || 0)
  if (planDays > 0) return planDays
  if (profileDays > 0) return profileDays
  return 0
}

export function frequencyLabel(days) {
  const n = Number(days) || 0
  if (n <= 0) return ''
  return `${n}×/semana`
}
