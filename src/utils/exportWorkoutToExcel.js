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
  'Tipo de treino',
  'Objetivo',
  'Nível',
  'Duração estimada',
  'Grupo muscular',
  'Exercício',
  'Séries',
  'Repetições',
  'Descanso',
  'Equipamento',
  'Observação',
  'Cuidados',
]

const COLUMN_WIDTHS = [18, 22, 18, 14, 16, 16, 28, 8, 12, 10, 16, 40, 40]

function dayLabel(dayNumber) {
  const index = Math.max(0, (dayNumber || 1) - 1) % WEEKDAY_LABELS.length
  return WEEKDAY_LABELS[index]
}

function resolveExerciseMeta(exercise, plan) {
  const full = exercise.exerciseId ? getExerciseById(exercise.exerciseId) : null
  const observation =
    exercise.observation ||
    full?.shortInstruction ||
    full?.executionSteps?.[0] ||
    full?.execution?.[0] ||
    'Movimento controlado'
  const care =
    exercise.safetyTip ||
    full?.safetyTips?.[0] ||
    full?.commonMistakes?.[0] ||
    plan.safetyNotes?.[0] ||
    'Evite carga excessiva. Pare em caso de dor.'

  return {
    equipment: exercise.equipment || full?.equipment || plan.equipment?.join(', ') || '—',
    observation,
    care,
  }
}

/**
 * Converte a planilha gerada em linhas tabulares para exportação (TODOS os dias).
 * @param {object} plan
 */
export function planToExcelRows(plan) {
  const days = plan?.weeklyPlan || plan?.schedule || []
  if (!days.length) return []

  const rows = []
  const objective = plan.objectiveLabel || plan.goal || plan.objective || '—'
  const level = plan.level || '—'

  days.forEach((day) => {
    const weekday = dayLabel(day.day)
    const workoutType = day.workoutType || day.name || '—'
    const duration = day.estimatedDuration || day.estimatedMinutes || plan.minutesPerWorkout || plan.duration || '—'

    day.exercises?.forEach((exercise) => {
      const meta = resolveExerciseMeta(exercise, plan)
      const rest = exercise.rest ?? exercise.restSeconds

      rows.push({
        Dia: `Dia ${day.day} (${weekday})`,
        'Tipo de treino': workoutType,
        Objetivo: objective,
        Nível: level,
        'Duração estimada': typeof duration === 'number' ? `${duration} min` : duration,
        'Grupo muscular': exercise.muscleGroup || (day.muscleGroups || day.focus || []).join('/'),
        Exercício: exercise.name,
        Séries: exercise.sets ?? '—',
        Repetições: exercise.reps ?? '—',
        Descanso: rest != null ? `${rest}s` : '—',
        Equipamento: meta.equipment,
        Observação: meta.observation,
        Cuidados: meta.care,
      })
    })
  })

  return rows
}

/**
 * Gera e baixa arquivo .xlsx da planilha atual (todos os dias).
 * @param {object} plan
 * @param {string} [filename]
 */
export async function exportWorkoutToExcel(plan, filename = 'evoluafit-planilha-treino.xlsx') {
  const rows = planToExcelRows(plan)
  if (!rows.length) {
    throw new Error('Planilha vazia')
  }

  const ExcelJS = (await import('exceljs')).default
  const workbook = new ExcelJS.Workbook()
  workbook.creator = 'EvoluaFit'
  const worksheet = workbook.addWorksheet('Planilha de Treino')

  worksheet.columns = HEADERS.map((header, index) => ({
    header,
    key: header,
    width: COLUMN_WIDTHS[index],
  }))

  rows.forEach((row) => {
    worksheet.addRow(HEADERS.map((header) => row[header] ?? ''))
  })

  const buffer = await workbook.xlsx.writeBuffer()
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.rel = 'noopener'
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}
