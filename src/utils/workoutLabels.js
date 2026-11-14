const NAME_REPLACEMENTS = [
  [/\bFull[\s-]?body\b(?!-)/gi, 'Corpo inteiro'],
  [/\bCorpo todo\b/gi, 'Corpo inteiro'],
  [/\bPush\b(?!-)/gi, 'Empurrar'],
  [/\bPull\b(?!-)/gi, 'Puxar'],
  [/\bLegs\b(?!-)/gi, 'Pernas'],
  [/\bUpper\b(?!-)/gi, 'Superiores'],
  [/\bLower\b(?!-)/gi, 'Inferiores'],
]

/** Nome de treino sempre em português (traduz nomes antigos salvos em inglês). */
export function displayWorkoutName(name = '') {
  let out = String(name || '')
  for (const [pattern, replacement] of NAME_REPLACEMENTS) out = out.replace(pattern, replacement)
  return out
}

/** Tipo de treino em português ("Pull" → "Puxar", "Legs (leve)" → "Pernas (leve)"). */
export function displayWorkoutType(type = '') {
  return displayWorkoutName(type)
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
