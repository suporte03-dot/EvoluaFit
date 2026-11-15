/**
 * Interpreta frases ditas durante a série ("10 repetições com 40 quilos", "8 com 22,5",
 * "40 kg 10", "fiz 12") em { reps, load }. Campos não reconhecidos ficam null.
 */

const UNITS = {
  zero: 0,
  um: 1,
  uma: 1,
  dois: 2,
  duas: 2,
  tres: 3,
  quatro: 4,
  cinco: 5,
  seis: 6,
  sete: 7,
  oito: 8,
  nove: 9,
  dez: 10,
  onze: 11,
  doze: 12,
  treze: 13,
  catorze: 14,
  quatorze: 14,
  quinze: 15,
  dezesseis: 16,
  dezasseis: 16,
  dezessete: 17,
  dezoito: 18,
  dezenove: 19,
  vinte: 20,
  trinta: 30,
  quarenta: 40,
  cinquenta: 50,
  sessenta: 60,
  setenta: 70,
  oitenta: 80,
  noventa: 90,
  cem: 100,
  cento: 100,
  duzentos: 200,
  duzentas: 200,
  trezentos: 300,
  trezentas: 300,
  quatrocentos: 400,
  quatrocentas: 400,
}

const LOAD_UNITS = new Set(['kg', 'kgs', 'k', 'quilo', 'quilos', 'kilo', 'kilos', 'quilograma', 'quilogramas', 'kilograma', 'kilogramas'])
const REP_UNITS = new Set(['rep', 'reps', 'repeticao', 'repeticoes', 'vez', 'vezes'])
const SET_WORDS = new Set(['serie', 'series'])
const LOAD_MARKERS = new Set(['com', 'usando'])
const REP_MARKERS = new Set(['fiz', 'fazendo', 'foram', 'fizemos'])
const HALF = new Set(['meio', 'meia'])
const DECIMAL_SEP = new Set(['virgula', 'ponto'])

export const MAX_REPS = 100
export const MAX_LOAD_KG = 500

function fold(text) {
  return String(text || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

function tokenize(text) {
  return fold(text).match(/\d+(?:[.,]\d+)?|[a-z]+/g) || []
}

function digitValue(token) {
  return /^\d/.test(token) ? parseFloat(token.replace(',', '.')) : null
}

function wordValue(token) {
  return Object.prototype.hasOwnProperty.call(UNITS, token) ? UNITS[token] : null
}

function tokenValue(token) {
  return digitValue(token) ?? wordValue(token)
}

/** Menor casa decimal ocupada: 120 → 10, 200 → 100, 22 → 1. */
function openPlace(value) {
  if (value >= 100 && value % 100 === 0) return 100
  if (value >= 20 && value % 10 === 0) return 10
  return 1
}

/** Junta números por extenso ("vinte e dois e meio" → 22.5, "22 vírgula 5" → 22.5). */
function mergeNumbers(tokens) {
  const out = []
  for (let i = 0; i < tokens.length; i += 1) {
    const start = tokenValue(tokens[i])
    if (start == null) {
      out.push({ word: tokens[i] })
      continue
    }
    let value = start
    let decimal = !Number.isInteger(value)
    while (i + 1 < tokens.length) {
      const next = tokens[i + 1]
      const after = tokens[i + 2]
      if (next === 'e' && HALF.has(after) && !decimal) {
        value += 0.5
        decimal = true
        i += 2
        continue
      }
      if (next === 'e' && wordValue(after) != null && !decimal && wordValue(after) < openPlace(value)) {
        value += wordValue(after)
        i += 2
        continue
      }
      if (DECIMAL_SEP.has(next) && after != null && /^\d+$/.test(after) && !decimal) {
        value = parseFloat(`${Math.trunc(value)}.${after}`)
        decimal = true
        i += 2
        continue
      }
      if (DECIMAL_SEP.has(next) && wordValue(after) != null && wordValue(after) < 10 && !decimal) {
        value = parseFloat(`${Math.trunc(value)}.${wordValue(after)}`)
        decimal = true
        i += 2
        continue
      }
      break
    }
    out.push({ num: value })
  }
  return out
}

function validReps(value) {
  return Number.isInteger(value) && value >= 1 && value <= MAX_REPS ? value : null
}

function validLoad(value) {
  return Number.isFinite(value) && value >= 0 && value <= MAX_LOAD_KG ? Math.round(value * 100) / 100 : null
}

/**
 * @param {string} transcript
 * @returns {{ reps: number|null, load: number|null } | null}
 */
export function parseVoiceSet(transcript) {
  const items = mergeNumbers(tokenize(transcript))
  let reps = null
  let load = null
  const loose = []

  items.forEach((item, idx) => {
    if (item.num == null) return
    const next = items[idx + 1]?.word
    const prev = items
      .slice(0, idx)
      .reverse()
      .find((it) => it.word)?.word
    if (next && LOAD_UNITS.has(next)) {
      if (load == null) load = item.num
      return
    }
    if (next && REP_UNITS.has(next)) {
      if (reps == null && Number.isInteger(item.num)) reps = item.num
      return
    }
    if (next && SET_WORDS.has(next)) return
    loose.push({ value: item.num, prev })
  })

  const rest = []
  loose.forEach((n) => {
    if (n.prev && LOAD_MARKERS.has(n.prev) && load == null) load = n.value
    else if (n.prev && REP_MARKERS.has(n.prev) && reps == null && Number.isInteger(n.value)) reps = n.value
    else rest.push(n.value)
  })

  if (reps == null && load == null && rest.length >= 2) {
    let [a, b] = rest
    if (!Number.isInteger(a) && Number.isInteger(b)) [a, b] = [b, a]
    else if (Number.isInteger(a) && Number.isInteger(b) && a > 30 && b <= 30) [a, b] = [b, a]
    reps = a
    load = b
  } else if (rest.length) {
    for (const value of rest) {
      if (load != null && reps == null && Number.isInteger(value)) reps = value
      else if (reps != null && load == null) load = value
      else if (reps == null && load == null) {
        if (Number.isInteger(value)) reps = value
        else load = value
      }
    }
  }

  const result = { reps: reps == null ? null : validReps(reps), load: load == null ? null : validLoad(load) }
  if (result.reps == null && result.load == null) return null
  return result
}

/** Primeira alternativa do reconhecimento que vira uma série válida. */
export function parseVoiceAlternatives(transcripts = []) {
  for (const text of transcripts) {
    const parsed = parseVoiceSet(text)
    if (parsed) return { ...parsed, transcript: text }
  }
  return null
}
