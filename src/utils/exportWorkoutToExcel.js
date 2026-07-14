import * as XLSX from 'xlsx'
import { getExerciseById } from '../data/exercisesData'

const WEEKDAY_LABELS = [
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
  'Domingo',
]

const HEADERS = [
  'Dia',
  'Tipo do treino',
  'Grupo muscular',
  'Exercício',
  'Séries',
  'Repetições',
  'Descanso',
  'Equipamento',
  'Nível',
  'Observações',
  'Cuidados',
]

function dayLabel(dayNumber) {
  const index = Math.max(0, (dayNumber || 1) - 1) % WEEKDAY_LABELS.length
  return WEEKDAY_LABELS[index]
}

function resolveExerciseMeta(exercise, plan) {
  const full = getExerciseById(exercise.exerciseId)
  const observation =
    full?.shortInstruction ||
    full?.executionSteps?.[0] ||
    full?.execution?.[0] ||
    'Movimento controlado'
  const care =
    full?.safetyTips?.[0] ||
    full?.commonMistakes?.[0] ||
    plan.safetyNotes?.[0] ||
    'Evite carga excessiva. Pare em caso de dor.'

  return {
    equipment: full?.equipment || plan.equipment?.join(', ') || '—',
    level: full?.level || plan.level || '—',
    observation,
    care,
  }
}

/**
 * Converte a planilha gerada em linhas tabulares para exportação.
 * @param {object} plan
 */
export function planToExcelRows(plan) {
  if (!plan?.schedule?.length) return []

  const rows = []

  plan.schedule.forEach((day) => {
    const muscleGroups = (day.focus || []).join('/')
    const weekday = dayLabel(day.day)

    day.exercises?.forEach((exercise) => {
      const meta = resolveExerciseMeta(exercise, plan)

      rows.push({
        Dia: `Dia ${day.day} (${weekday})`,
        'Tipo do treino': day.name,
        'Grupo muscular': exercise.muscleGroup || muscleGroups,
        Exercício: exercise.name,
        Séries: exercise.sets ?? '—',
        Repetições: exercise.reps ?? '—',
        Descanso: exercise.restSeconds != null ? `${exercise.restSeconds}s` : '—',
        Equipamento: meta.equipment,
        Nível: meta.level,
        Observações: meta.observation,
        Cuidados: meta.care,
      })
    })
  })

  return rows
}

/**
 * Gera e baixa arquivo .xlsx da planilha atual.
 * @param {object} plan
 * @param {string} [filename]
 */
export function exportWorkoutToExcel(plan, filename = 'evoluafit-planilha-treino.xlsx') {
  const rows = planToExcelRows(plan)
  if (!rows.length) {
    throw new Error('Planilha vazia')
  }

  const worksheet = XLSX.utils.json_to_sheet(rows, { header: HEADERS })
  worksheet['!cols'] = [
    { wch: 16 },
    { wch: 18 },
    { wch: 22 },
    { wch: 28 },
    { wch: 8 },
    { wch: 12 },
    { wch: 10 },
    { wch: 18 },
    { wch: 14 },
    { wch: 36 },
    { wch: 36 },
  ]

  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Planilha de Treino')
  XLSX.writeFile(workbook, filename)
}
