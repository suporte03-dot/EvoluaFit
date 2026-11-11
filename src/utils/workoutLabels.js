export function displayWorkoutName(name = '') {
  return String(name || '')
    .replace(/^Push\b/i, 'Empurrar')
    .replace(/^Pull\b/i, 'Puxar')
    .replace(/^Legs\b/i, 'Pernas')
    .replace(/^Full body\b/i, 'Corpo todo')
    .replace(/^Upper\b/i, 'Superiores')
    .replace(/^Lower\b/i, 'Inferiores')
}

/** Formata descanso numérico como "2 min 25 s"; textos com unidade passam direto. */
export function formatRestLabel(value) {
  if (value == null || value === '' || value === '—') return '—'
  const raw = String(value).trim()
  if (/[a-zà-ú]/i.test(raw) && !/^\d+\s*s$/i.test(raw)) return raw
  const seconds = Number.parseInt(raw, 10)
  if (!Number.isFinite(seconds) || seconds < 0) return raw
  if (seconds < 60) return `${seconds} s`
  const minutes = Math.floor(seconds / 60)
  const rest = seconds % 60
  return rest ? `${minutes} min ${String(rest).padStart(2, '0')} s` : `${minutes} min`
}
