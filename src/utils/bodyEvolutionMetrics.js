import { BODY_MEASURE_LIMITS } from '../data/bodyEvolution'

export function toNumber(value) {
  if (value == null || value === '') return null
  const n = typeof value === 'number' ? value : Number(String(value).replace(',', '.'))
  return Number.isFinite(n) ? n : null
}

export function formatMeasure(value, unit = 'cm', digits = 1) {
  const n = toNumber(value)
  if (n == null) return '—'
  return `${n.toLocaleString('pt-BR', {
    minimumFractionDigits: Number.isInteger(n) ? 0 : digits,
    maximumFractionDigits: digits,
  })} ${unit}`
}

export function formatSignedDelta(value, unit = 'cm') {
  const n = toNumber(value)
  if (n == null || Math.abs(n) < 0.05) return null
  const abs = Math.abs(n).toLocaleString('pt-BR', { maximumFractionDigits: 1 })
  const sign = n > 0 ? '+' : '−'
  return `${sign}${abs} ${unit}`
}

export function validateMeasure(field, value) {
  if (value == null || value === '') return null
  const n = toNumber(value)
  const limits = BODY_MEASURE_LIMITS[field]
  if (n == null || !limits) return 'Revise esta medida para continuar.'
  if (n < limits.min || n > limits.max) return 'Revise esta medida para continuar.'
  return null
}

export function validateMeasureMap(values = {}) {
  const errors = {}
  Object.entries(values).forEach(([key, value]) => {
    if (!BODY_MEASURE_LIMITS[key]) return
    const message = validateMeasure(key, value)
    if (message) errors[key] = message
  })
  return errors
}

export function averagePair(a, b) {
  const left = toNumber(a)
  const right = toNumber(b)
  if (left == null && right == null) return null
  if (left == null) return right
  if (right == null) return left
  return (left + right) / 2
}

export function flattenCheckin(checkin) {
  const m = checkin?.measurements || {}
  return {
    weight: toNumber(checkin?.weight),
    body_fat_percentage: toNumber(checkin?.body_fat_percentage),
    chest: toNumber(m.chest),
    waist: toNumber(m.waist),
    hips: toNumber(m.hips),
    right_arm: toNumber(m.right_arm),
    left_arm: toNumber(m.left_arm),
    right_thigh: toNumber(m.right_thigh),
    left_thigh: toNumber(m.left_thigh),
    right_calf: toNumber(m.right_calf),
    left_calf: toNumber(m.left_calf),
    arm: averagePair(m.right_arm, m.left_arm),
    thigh: averagePair(m.right_thigh, m.left_thigh),
    calf: averagePair(m.right_calf, m.left_calf),
  }
}

export function diffMeasures(from, to) {
  const keys = [
    'weight',
    'waist',
    'chest',
    'hips',
    'arm',
    'thigh',
    'calf',
    'body_fat_percentage',
  ]
  const out = {}
  keys.forEach((key) => {
    const a = toNumber(from?.[key])
    const b = toNumber(to?.[key])
    out[key] = a == null || b == null ? null : b - a
  })
  return out
}

export function regionProgress(first, latest) {
  const d = diffMeasures(first, latest)
  const rows = [
    { id: 'arm', label: 'Braços', value: d.arm, unit: 'cm' },
    { id: 'waist', label: 'Cintura', value: d.waist, unit: 'cm' },
    { id: 'thigh', label: 'Coxa', value: d.thigh, unit: 'cm' },
    { id: 'chest', label: 'Peitoral', value: d.chest, unit: 'cm' },
    { id: 'hips', label: 'Quadril', value: d.hips, unit: 'cm' },
    { id: 'calf', label: 'Panturrilha', value: d.calf, unit: 'cm' },
    { id: 'weight', label: 'Peso', value: d.weight, unit: 'kg' },
  ]
  return rows
    .filter((row) => row.value != null && Math.abs(row.value) >= 0.05)
    .sort((a, b) => Math.abs(b.value) - Math.abs(a.value))
}

export function timelineCaption(checkin, index, total, previous) {
  if (index === 0) return 'Primeiro registro'
  if (index === total - 1) return 'Atual'
  const now = flattenCheckin(checkin)
  const before = previous ? flattenCheckin(previous) : null
  if (!before) return 'Novo registro'
  const d = diffMeasures(before, now)
  const parts = [
    d.waist != null ? `${formatSignedDelta(d.waist)} cintura` : null,
    d.arm != null ? `${formatSignedDelta(d.arm)} braço` : null,
    d.weight != null ? `${formatSignedDelta(d.weight, 'kg')} peso` : null,
  ].filter(Boolean)
  if (checkin.photos?.length && !parts.length) return 'Nova foto'
  return parts[0] || (checkin.notes ? 'Observação registrada' : 'Novo registro')
}

export function daysBetween(fromIso, toDate = new Date()) {
  if (!fromIso) return null
  const from = new Date(fromIso)
  if (Number.isNaN(from.getTime())) return null
  return Math.floor((toDate.getTime() - from.getTime()) / 86400000)
}

function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n))
}

function factorFromRange(value, min, max, low = 0.86, high = 1.16) {
  const n = toNumber(value)
  if (n == null) return 1
  const t = clamp((n - min) / (max - min || 1), 0, 1)
  return low + t * (high - low)
}

export function avatarFactorsFromMeasures(measures = {}, heightCm) {
  return {
    height: factorFromRange(heightCm, 150, 195, 0.92, 1.08),
    shoulders: factorFromRange(measures.chest, 80, 130, 0.88, 1.14),
    chest: factorFromRange(measures.chest, 80, 130, 0.88, 1.14),
    waist: factorFromRange(measures.waist, 62, 110, 0.82, 1.18),
    hips: factorFromRange(measures.hips, 80, 120, 0.88, 1.14),
    arms: factorFromRange(measures.arm, 24, 44, 0.86, 1.16),
    thighs: factorFromRange(measures.thigh, 42, 72, 0.88, 1.14),
    calves: factorFromRange(measures.calf, 28, 46, 0.9, 1.12),
  }
}

export function measuresFromGoals(current, goals = {}) {
  const arm = toNumber(goals.target_arm) ?? current.arm
  const thigh = toNumber(goals.target_thigh) ?? current.thigh
  return {
    ...current,
    weight: toNumber(goals.target_weight) ?? current.weight,
    waist: toNumber(goals.target_waist) ?? current.waist,
    chest: toNumber(goals.target_chest) ?? current.chest,
    hips: toNumber(goals.target_hips) ?? current.hips,
    arm,
    thigh,
    right_arm: arm,
    left_arm: arm,
    right_thigh: thigh,
    left_thigh: thigh,
  }
}

export function todayInputValue(date = new Date()) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}
