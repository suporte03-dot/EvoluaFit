/**
 * Regras de prescrição — fonte única para gerador, Coach e edições manuais.
 * Descansos sempre em degraus de 15 s.
 */
import { KINDS } from './classify.js'

export const RULES_VERSION = 2

export const REST_STEP = 15
export const WARMUP_MINUTES = 5
export const WORK_SECONDS_PER_SET = 40
export const DURATION_TOLERANCE = 0.1

export const LEVELS = ['Iniciante', 'Intermediário', 'Avançado']

export function normalizeLevel(level) {
  return LEVELS.includes(level) ? level : 'Intermediário'
}

export function normalizeGoal(raw) {
  const key = String(raw || 'saude')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
  if (key.includes('hipertrof')) return 'hipertrofia'
  if (key.includes('forca')) return 'forca'
  if (key.includes('condicion')) return 'condicionamento'
  if (key.includes('emagrec') || key.includes('perda')) return 'emagrecimento'
  if (key.includes('mobil')) return 'mobilidade'
  return 'saude'
}

/** Faixas de repetições aceitas [mín, máx] e a faixa prescrita. */
const REP_TABLE = {
  forca: { composto: [4, 6], principal: [3, 6], isolado: [8, 12], panturrilha: [8, 12] },
  hipertrofia: { composto: [6, 10], principal: [6, 10], isolado: [10, 15], panturrilha: [10, 15] },
  saude: { composto: [8, 12], principal: [8, 12], isolado: [12, 15], panturrilha: [12, 15] },
  condicionamento: { composto: [8, 12], principal: [8, 12], isolado: [12, 15], panturrilha: [12, 15] },
  emagrecimento: { composto: [8, 12], principal: [8, 12], isolado: [12, 15], panturrilha: [12, 15] },
  mobilidade: { composto: [8, 12], principal: [8, 12], isolado: [12, 15], panturrilha: [12, 15] },
}

export const CALF_REP_LIMITS = [8, 15]
export const CORE_SECONDS = [20, 45]
export const CORE_REPS = [10, 15]

/** Descanso prescrito (s) e faixa aceita [mín, máx] por tipo × objetivo. */
const REST_TABLE = {
  forca: {
    principal: { value: 180, range: [120, 180] },
    composto: { value: 150, range: [120, 180] },
    isolado: { value: 90, range: [60, 90] },
  },
  hipertrofia: {
    principal: { value: 120, range: [90, 120] },
    composto: { value: 90, range: [90, 120] },
    isolado: { value: 75, range: [60, 90] },
  },
  saude: {
    principal: { value: 90, range: [60, 120] },
    composto: { value: 90, range: [60, 120] },
    isolado: { value: 60, range: [60, 90] },
  },
  condicionamento: {
    principal: { value: 75, range: [45, 90] },
    composto: { value: 60, range: [45, 90] },
    isolado: { value: 60, range: [60, 90] },
  },
  emagrecimento: {
    principal: { value: 75, range: [45, 90] },
    composto: { value: 60, range: [45, 90] },
    isolado: { value: 60, range: [60, 90] },
  },
  mobilidade: {
    principal: { value: 90, range: [60, 120] },
    composto: { value: 90, range: [60, 120] },
    isolado: { value: 60, range: [60, 90] },
  },
}

const OTHER_REST = {
  core: { value: 45, range: [30, 45] },
  panturrilha: { value: 60, range: [45, 90] },
  mobilidade: { value: 30, range: [15, 60] },
  cardio: { value: 60, range: [0, 120] },
}

/** Volume semanal (séries) por músculo e nível. */
export const WEEKLY_VOLUME = {
  Iniciante: [6, 10],
  Intermediário: [10, 16],
  Avançado: [12, 20],
}

/** Grupos conferidos contra a faixa semanal (acima da faixa). */
export const VOLUME_GROUPS = ['Peitoral', 'Costas', 'Ombros', 'Pernas', 'Glúteos', 'Bíceps', 'Tríceps']

/** Grandes grupos: também conferidos abaixo da faixa. */
export const MAJOR_GROUPS = ['Peitoral', 'Costas', 'Ombros', 'Pernas', 'Glúteos']

export function repRange(kind, principal, goal) {
  const g = REP_TABLE[normalizeGoal(goal)] || REP_TABLE.saude
  if (kind === KINDS.panturrilha) return g.panturrilha
  if (kind === KINDS.isolado) return g.isolado
  if (kind === KINDS.composto) return principal ? g.principal : g.composto
  return null
}

export function restRule(kind, principal, goal) {
  if (OTHER_REST[kind]) return OTHER_REST[kind]
  const g = REST_TABLE[normalizeGoal(goal)] || REST_TABLE.saude
  if (kind === KINDS.isolado) return g.isolado
  return principal ? g.principal : g.composto
}

/** Séries aceitas [mín, máx] por tipo × nível. */
export function setsRange(kind, principal, level) {
  const lvl = normalizeLevel(level)
  if (kind === KINDS.cardio) return [1, 2]
  if (kind === KINDS.mobilidade) return [1, 3]
  if (kind === KINDS.composto && principal && lvl === 'Avançado') return [2, 5]
  return [2, 4]
}

/** Séries padrão na geração. */
export function defaultSets(kind, principal, level, goal) {
  const lvl = normalizeLevel(level)
  const g = normalizeGoal(goal)
  if (kind === KINDS.cardio) return 1
  if (kind === KINDS.mobilidade) return 2
  if (kind === KINDS.core) return lvl === 'Iniciante' ? 2 : 3
  if (kind === KINDS.panturrilha) return lvl === 'Iniciante' ? 2 : 3
  if (kind === KINDS.isolado) return lvl === 'Iniciante' ? 2 : 3
  if (lvl === 'Iniciante') return 3
  if (lvl === 'Intermediário') return principal ? 4 : 3
  if (principal && (g === 'forca' || g === 'hipertrofia')) return 5
  return 4
}

export function roundRest(seconds) {
  const n = Math.max(0, Number(seconds) || 0)
  return Math.round(n / REST_STEP) * REST_STEP
}

export function formatRepRange([lo, hi]) {
  return `${lo}-${hi}`
}
