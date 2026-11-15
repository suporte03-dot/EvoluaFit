/**
 * Retrospectiva mensal: estatísticas puras + cartão em canvas para compartilhar.
 */
import { isCompletedSession } from './completedSession.js'

function parseNum(value) {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0
  const n = parseFloat(String(value ?? '').replace(',', '.').replace(/[^\d.-]/g, ''))
  return Number.isFinite(n) ? n : 0
}

function historySessionStats(entry) {
  let volumeKg = 0
  let sets = 0
  for (const ex of entry?.exercises || entry?.sessionExercises || []) {
    const setCount = Array.isArray(ex.setSlots)
      ? ex.setSlots.filter((s) => s?.completed || s?.done).length || ex.setSlots.length
      : parseNum(ex.completedSets ?? ex.sets)
    const reps = parseNum(ex.reps) || 1
    const load = parseNum(ex.load ?? ex.weight)
    sets += setCount
    volumeKg += setCount * reps * (load || 0)
  }
  return {
    volumeKg,
    sets,
    durationMinutes: parseNum(entry?.durationMinutes) || Math.round(parseNum(entry?.duration_seconds) / 60),
  }
}

const MONTHS_PT = [
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

function inMonth(dateValue, year, month) {
  const d = new Date(dateValue)
  if (Number.isNaN(d.getTime())) return false
  return d.getFullYear() === year && d.getMonth() === month
}

function sessionDate(entry) {
  return entry?.completedAt || entry?.completed_at || entry?.date || entry?.started_at
}

/**
 * @returns {{
 *   year: number,
 *   month: number,
 *   monthLabel: string,
 *   sessions: number,
 *   volumeKg: number,
 *   durationMinutes: number,
 *   sets: number,
 *   topGroups: string[],
 *   prCount: number,
 *   headline: string,
 * }}
 */
export function buildMonthlyRecap({
  history = [],
  summaries = [],
  referenceDate = new Date(),
} = {}) {
  const ref = referenceDate instanceof Date ? referenceDate : new Date(referenceDate)
  const year = ref.getFullYear()
  const month = ref.getMonth()
  const monthLabel = `${MONTHS_PT[month]} de ${year}`

  const fromSummaries = (summaries || []).filter((s) => {
    if (String(s.status || '').toLowerCase() !== 'completed') return false
    return inMonth(s.completed_at || s.started_at, year, month)
  })

  let sessions = 0
  let volumeKg = 0
  let durationMinutes = 0
  let sets = 0
  const groupCounts = {}
  let prCount = 0

  if (fromSummaries.length) {
    sessions = fromSummaries.length
    for (const s of fromSummaries) {
      volumeKg += Number(s.total_volume) || 0
      durationMinutes += Math.round((Number(s.duration_seconds) || 0) / 60)
      sets += Number(s.total_sets) || 0
    }
  }

  const monthHistory = (history || []).filter(
    (h) => isCompletedSession(h) && inMonth(sessionDate(h), year, month),
  )

  if (!fromSummaries.length) {
    sessions = monthHistory.length
    for (const h of monthHistory) {
      const stats = historySessionStats(h)
      volumeKg += stats.volumeKg
      durationMinutes += stats.durationMinutes
      sets += stats.sets
    }
  }

  for (const h of monthHistory) {
    for (const ex of h.exercises || h.sessionExercises || []) {
      const g = ex.muscleGroup || ex.category
      if (g) groupCounts[g] = (groupCounts[g] || 0) + 1
      if (ex.isPR || ex.personalRecord) prCount += 1
      for (const slot of ex.setSlots || []) {
        if (slot?.isPR || slot?.personalRecord) prCount += 1
      }
    }
  }

  const topGroups = Object.entries(groupCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([name]) => name)

  const headline =
    sessions > 0
      ? `${sessions} treino${sessions === 1 ? '' : 's'} em ${monthLabel}`
      : `Ainda sem treinos em ${monthLabel}`

  return {
    year,
    month,
    monthLabel,
    sessions,
    volumeKg: Math.round(volumeKg),
    durationMinutes,
    sets: Math.round(sets),
    topGroups,
    prCount,
    headline,
  }
}

export function monthlyRecapShareMessage(recap) {
  if (!recap?.sessions) {
    return `Minha retrospectiva EvoluaFit de ${recap?.monthLabel || 'este mês'} ainda está vazia. Vamos treinar? evoluafit.tec.br`
  }
  const muscles = recap.topGroups?.length ? ` Foco: ${recap.topGroups.join(', ')}.` : ''
  const prs = recap.prCount > 0 ? ` ${recap.prCount} PR.` : ''
  return (
    `Minha retrospectiva de ${recap.monthLabel} no EvoluaFit: ` +
    `${recap.sessions} treinos · ${recap.volumeKg.toLocaleString('pt-BR')} kg · ` +
    `${recap.durationMinutes} min.${muscles}${prs} evoluafit.tec.br`
  )
}

/**
 * Desenha cartão 1080×1350 no canvas (PNG).
 * @returns {HTMLCanvasElement | null}
 */
export function drawMonthlyRecapCanvas(recap, { displayName = '' } = {}) {
  if (typeof document === 'undefined') return null
  const canvas = document.createElement('canvas')
  canvas.width = 1080
  canvas.height = 1350
  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  const grad = ctx.createLinearGradient(0, 0, 1080, 1350)
  grad.addColorStop(0, '#0A1120')
  grad.addColorStop(0.55, '#121A2E')
  grad.addColorStop(1, '#1A1040')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, 1080, 1350)

  ctx.fillStyle = 'rgba(117, 82, 255, 0.18)'
  ctx.beginPath()
  ctx.arc(900, 180, 220, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = '#A78BFA'
  ctx.font = '700 36px Outfit, Figtree, sans-serif'
  ctx.fillText('EvoluaFit', 72, 110)

  ctx.fillStyle = '#EEF2F9'
  ctx.font = '700 64px Outfit, Figtree, sans-serif'
  ctx.fillText('Retrospectiva', 72, 200)
  ctx.font = '500 40px Figtree, sans-serif'
  ctx.fillStyle = '#94A3B8'
  ctx.fillText(recap.monthLabel || '', 72, 260)

  if (displayName) {
    ctx.fillStyle = '#CBD5E1'
    ctx.font = '500 28px Figtree, sans-serif'
    ctx.fillText(displayName, 72, 320)
  }

  const cards = [
    { label: 'Treinos', value: String(recap.sessions || 0) },
    { label: 'Volume', value: `${(recap.volumeKg || 0).toLocaleString('pt-BR')} kg` },
    { label: 'Tempo', value: `${recap.durationMinutes || 0} min` },
    { label: 'Séries', value: String(recap.sets || 0) },
  ]

  cards.forEach((card, i) => {
    const col = i % 2
    const row = Math.floor(i / 2)
    const x = 72 + col * 480
    const y = 380 + row * 220
    ctx.fillStyle = 'rgba(17, 26, 46, 0.92)'
    roundRect(ctx, x, y, 440, 180, 24)
    ctx.fill()
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.2)'
    ctx.lineWidth = 2
    ctx.stroke()
    ctx.fillStyle = '#94A3B8'
    ctx.font = '600 28px Figtree, sans-serif'
    ctx.fillText(card.label, x + 36, y + 60)
    ctx.fillStyle = '#EEF2F9'
    ctx.font = '700 52px Outfit, Figtree, sans-serif'
    ctx.fillText(card.value, x + 36, y + 130)
  })

  ctx.fillStyle = '#CBD5E1'
  ctx.font = '500 30px Figtree, sans-serif'
  const focus = recap.topGroups?.length
    ? `Grupos em destaque: ${recap.topGroups.join(', ')}`
    : 'Continue treinando para preencher o mapa.'
  wrapText(ctx, focus, 72, 880, 936, 40)

  if (recap.prCount > 0) {
    ctx.fillStyle = '#FBBF24'
    ctx.font = '700 32px Figtree, sans-serif'
    ctx.fillText(`${recap.prCount} recorde${recap.prCount === 1 ? '' : 's'} pessoal(is)`, 72, 1000)
  }

  ctx.fillStyle = '#7552FF'
  ctx.font = '700 34px Outfit, Figtree, sans-serif'
  ctx.fillText('evoluafit.tec.br', 72, 1260)

  return canvas
}

export async function monthlyRecapToBlob(recap, options) {
  const canvas = drawMonthlyRecapCanvas(recap, options)
  if (!canvas) return null
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), 'image/png')
  })
}

function roundRect(ctx, x, y, w, h, r) {
  const radius = Math.min(r, w / 2, h / 2)
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.arcTo(x + w, y, x + w, y + h, radius)
  ctx.arcTo(x + w, y + h, x, y + h, radius)
  ctx.arcTo(x, y + h, x, y, radius)
  ctx.arcTo(x, y, x + w, y, radius)
  ctx.closePath()
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = String(text || '').split(' ')
  let line = ''
  let cy = y
  for (const word of words) {
    const test = line ? `${line} ${word}` : word
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, cy)
      line = word
      cy += lineHeight
    } else {
      line = test
    }
  }
  if (line) ctx.fillText(line, x, cy)
}
