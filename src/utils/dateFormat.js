/**
 * Unified date formatting for EvoluaFit UI.
 * Short (cards/lists): "sáb, 11 jul"
 * Long (details/modals): "11 de julho de 2026"
 */

const WEEKDAYS_SHORT = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb']
const MONTHS_SHORT = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']
const MONTHS_LONG = [
  'janeiro',
  'fevereiro',
  'março',
  'abril',
  'maio',
  'junho',
  'julho',
  'agosto',
  'setembro',
  'outubro',
  'novembro',
  'dezembro',
]

function toDate(input) {
  if (!input) return null
  if (input instanceof Date) {
    return Number.isNaN(input.getTime()) ? null : input
  }
  if (typeof input === 'string') {
    const iso = /^\d{4}-\d{2}-\d{2}$/.test(input) ? `${input}T12:00:00` : input
    const d = new Date(iso)
    return Number.isNaN(d.getTime()) ? null : d
  }
  return null
}

/** Card / list hierarchy — e.g. "sáb, 11 jul" */
export function formatDateShort(input) {
  const d = toDate(input)
  if (!d) return '—'
  return `${WEEKDAYS_SHORT[d.getDay()]}, ${d.getDate()} ${MONTHS_SHORT[d.getMonth()]}`
}

/** Detail / modal hierarchy — e.g. "11 de julho de 2026" */
export function formatDateLong(input) {
  const d = toDate(input)
  if (!d) return '—'
  return `${d.getDate()} de ${MONTHS_LONG[d.getMonth()]} de ${d.getFullYear()}`
}

export function formatMonthYear(year, month) {
  return `${MONTHS_LONG[month]} de ${year}`
}
