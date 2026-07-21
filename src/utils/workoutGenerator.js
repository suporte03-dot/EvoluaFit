import { exercises, parseSets, parseRestSeconds, getExerciseById } from '../data/exercisesData'
import {
  getSplitTemplate,
  levelConfig,
  objectiveLabels,
  PROFESSIONAL_DISCLAIMER,
} from '../data/workoutTemplates'

/** Cotas base por tipo de treino (ajustadas por nível/tempo em buildDayQuotas) */
const DAY_QUOTAS = {
  Push: { Peitoral: 2, Ombros: 1, Tríceps: 1 },
  Pull: { Costas: 2, Bíceps: 1, Trapézio: 1 },
  Legs: { Pernas: 2, Glúteos: 1, Panturrilha: 1 },
  FullBody: {
    Peitoral: 1,
    Costas: 1,
    Pernas: 1,
    Glúteos: 1,
    Ombros: 1,
    Abdômen: 1,
  },
  Superiores: { Peitoral: 2, Costas: 2, Ombros: 1, Bíceps: 1, Tríceps: 1 },
  Inferiores: { Pernas: 2, Glúteos: 2, Panturrilha: 1, Abdômen: 1 },
  Core: { Abdômen: 3, Lombar: 2 },
  Cardio: { Cardio: 4 },
  Mobilidade: { Mobilidade: 3, Alongamento: 2 },
  HybridRecovery: { Abdômen: 2, Cardio: 2, Mobilidade: 2, Alongamento: 1 },
  LegsLight: { Pernas: 2, Glúteos: 1, Panturrilha: 1, Mobilidade: 1, Abdômen: 1 },
}

/** Grupos obrigatórios mínimos por tipo (evita Push só de tríceps, etc.) */
const REQUIRED_GROUPS = {
  Push: ['Peitoral', 'Ombros', 'Tríceps'],
  Pull: ['Costas', 'Bíceps'],
  Legs: ['Pernas', 'Glúteos'],
  Superiores: ['Peitoral', 'Costas'],
  Inferiores: ['Pernas', 'Glúteos'],
}

/** Tabela tempo → contagem de exercícios (depois limitada pelo nível) */
const TIME_EXERCISE_TABLE = {
  Iniciante: [
    [30, 3],
    [45, 4],
    [60, 5],
    [75, 5],
    [90, 6],
  ],
  Intermediário: [
    [30, 4],
    [45, 5],
    [60, 7],
    [75, 7],
    [90, 8],
  ],
  Avançado: [
    [30, 5],
    [45, 7],
    [60, 8],
    [75, 9],
    [90, 9],
  ],
}

const LEVEL_CAPS = {
  Iniciante: { min: 3, max: 6 },
  Intermediário: { min: 4, max: 8 },
  Avançado: { min: 4, max: 10 },
}

/**
 * Metas de volume (séries totais) por grupo — Push avançado profissional.
 * Cotas de exercícios: Peito 4 · Ombros 3 · Tríceps 2–3
 */
const ADVANCED_PUSH_VOLUME = {
  Peitoral: { min: 14, max: 16 },
  Ombros: { min: 10, max: 12 },
  Tríceps: { min: 9, max: 10 },
}

/** Ordem preferencial de ângulos/papéis por grupo (diversidade no Push) */
const ROLE_PRIORITY = {
  Peitoral: ['chest_upper', 'chest_flat', 'chest_lower', 'chest_isolation'],
  Ombros: ['shoulder_press', 'shoulder_lateral', 'shoulder_rear', 'shoulder_front', 'shoulder_other'],
  Tríceps: ['tri_long', 'tri_pushdown', 'tri_other'],
}

/** Aliases → categoria oficial do catálogo */
const CATEGORY_ALIASES = {
  Peito: 'Peitoral',
  Peitoral: 'Peitoral',
  Costas: 'Costas',
  Ombros: 'Ombros',
  Bíceps: 'Bíceps',
  Tríceps: 'Tríceps',
  Antebraço: 'Antebraço',
  Trapézio: 'Trapézio',
  Lombar: 'Lombar',
  Abdômen: 'Abdômen',
  Oblíquos: 'Abdômen',
  Core: 'Abdômen',
  Quadríceps: 'Pernas',
  Posterior: 'Pernas',
  Pernas: 'Pernas',
  Glúteos: 'Glúteos',
  Panturrilha: 'Panturrilha',
  Cardio: 'Cardio',
  Cardiovascular: 'Cardio',
  Mobilidade: 'Mobilidade',
  Alongamento: 'Alongamento',
  Funcional: 'Funcional',
  'Corpo inteiro': 'Funcional',
}

const HOME_EQUIPMENT = new Set(['Peso corporal', 'Halteres', 'Elástico', 'Colchonete', 'Kettlebell'])

const EQUIPMENT_ALIASES = {
  'Academia completa': 'gym_full',
  Academia: 'gym_full',
  Todos: 'all',
  Barra: 'Barra',
  Halteres: 'Halteres',
  'Peso corporal': 'Peso corporal',
  Elástico: 'Elástico',
  Casa: 'home',
  Máquina: 'Máquina',
  Cabo: 'Cabo',
  Colchonete: 'Colchonete',
  Kettlebell: 'Kettlebell',
  'Peso livre': 'Peso livre',
}

function normalizeCategory(label) {
  return CATEGORY_ALIASES[label] || label
}

function normalizeFocus(focus = []) {
  return [...new Set(focus.map(normalizeCategory))]
}

function normalizeGoal(raw) {
  const key = String(raw || 'saude')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
  if (key.includes('hipertrof')) return 'hipertrofia'
  if (key.includes('forca')) return 'forca'
  if (key.includes('condicion')) return 'condicionamento'
  if (key.includes('emagrec') || key.includes('perda')) return 'emagrecimento'
  if (key.includes('mobil')) return 'mobilidade'
  if (key.includes('saude') || key.includes('geral')) return 'saude'
  return objectiveLabels[raw] ? raw : 'saude'
}

function normalizeRestrictions(restrictions = []) {
  const out = []
  ;(restrictions || []).forEach((r) => {
    const key = String(r)
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
    if (key.includes('joelho')) out.push('joelho')
    if (key.includes('lombar') || (key.includes('costas') && !key.includes('ombro'))) out.push('lombar')
    if (key.includes('ombro')) out.push('ombro')
  })
  return [...new Set(out)]
}

function inferDayType(name = '', focus = []) {
  const n = String(name).toLowerCase()
  if (/descanso|recuper|ativo/.test(n) && /mobil|cardio|along/.test(n)) return 'HybridRecovery'
  if (/descanso|recuper/.test(n)) return 'Mobilidade'
  if (/core.*cardio|cardio.*mobil|core \+ cardio|core \+/.test(n)) return 'HybridRecovery'
  if (/legs.*leve|perna.*leve|legs light/.test(n)) return 'LegsLight'
  if (/push/.test(n)) return 'Push'
  if (/pull/.test(n)) return 'Pull'
  if (/legs|perna/.test(n)) return 'Legs'
  if (/superior/.test(n)) return 'Superiores'
  if (/inferior/.test(n)) return 'Inferiores'
  if (/core|abd/.test(n) && !/cardio/.test(n)) return 'Core'
  if (/cardio/.test(n) && !/mobil|core/.test(n)) return 'Cardio'
  if (/mobil|along/.test(n)) return 'Mobilidade'
  if (/full|corpo/.test(n)) return 'FullBody'

  const f = normalizeFocus(focus)
  if (f.includes('Cardio') && f.every((c) => ['Cardio', 'Mobilidade', 'Alongamento', 'Abdômen'].includes(c))) {
    return 'HybridRecovery'
  }
  if (f.every((c) => ['Mobilidade', 'Alongamento'].includes(c))) return 'Mobilidade'
  if (f.includes('Peitoral') && (f.includes('Tríceps') || f.includes('Ombros'))) return 'Push'
  if (f.includes('Costas') && f.includes('Bíceps')) return 'Pull'
  if (f.includes('Pernas') || f.includes('Glúteos')) return 'Legs'
  return 'FullBody'
}

function isRecoveryDay(dayType, name = '') {
  return (
    ['Core', 'Cardio', 'Mobilidade', 'HybridRecovery', 'LegsLight'].includes(dayType) ||
    /descanso|recuper|mobilidade|leve/.test(String(name).toLowerCase())
  )
}

function matchesEquipment(exercise, availableEquipment = [], location = 'Academia') {
  if (!availableEquipment.length) return true

  const tokens = availableEquipment.map((eq) => EQUIPMENT_ALIASES[eq] || eq)
  if (tokens.includes('all') || tokens.includes('gym_full')) {
    if (location === 'Casa' || location === 'Parque') {
      return (
        HOME_EQUIPMENT.has(exercise.equipment) ||
        ['Cardio', 'Mobilidade', 'Alongamento'].includes(exercise.category)
      )
    }
    return true
  }

  if (tokens.includes('home') || location === 'Casa' || location === 'Parque') {
    const allowed = new Set(
      tokens.filter((t) => HOME_EQUIPMENT.has(t)).length
        ? tokens.filter((t) => typeof t === 'string' && t !== 'home')
        : [...HOME_EQUIPMENT],
    )
    if (tokens.includes('Halteres')) allowed.add('Halteres')
    if (tokens.includes('Elástico')) allowed.add('Elástico')
    if (tokens.includes('Peso corporal')) allowed.add('Peso corporal')
    return (
      allowed.has(exercise.equipment) ||
      ['Cardio', 'Mobilidade', 'Alongamento'].includes(normalizeCategory(exercise.category))
    )
  }

  return availableEquipment.some((eq) => {
    if (eq === 'Academia completa') return true
    if (eq === exercise.equipment) return true
    if (eq === 'Barra' && ['Barra', 'Peso livre'].includes(exercise.equipment)) return true
    if (eq === 'Halteres' && ['Halteres', 'Peso livre'].includes(exercise.equipment)) return true
    if (eq === 'Peso corporal' && exercise.equipment === 'Peso corporal') return true
    return false
  })
}

function matchesLevel(exercise, level) {
  const levels = ['Iniciante', 'Intermediário', 'Avançado']
  const userIdx = levels.indexOf(level)
  const exIdx = levels.indexOf(exercise.level)
  if (userIdx < 0 || exIdx < 0) return true
  if (userIdx === 0) return exIdx <= 1
  return exIdx <= userIdx
}

function isRestricted(exercise, restrictions) {
  if (!restrictions.length || !exercise.restrictions?.length) return false
  return exercise.restrictions.some((r) => restrictions.includes(r))
}

function shuffle(list) {
  const arr = [...list]
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

function preferSimple(pool, level) {
  if (level !== 'Iniciante') return pool
  return [...pool].sort((a, b) => {
    const score = (ex) => {
      let s = 0
      if (ex.level === 'Iniciante') s += 3
      if (ex.level === 'Intermediário') s += 1
      if (['Peso corporal', 'Máquina', 'Halteres'].includes(ex.equipment)) s += 1
      return s
    }
    return score(b) - score(a)
  })
}

function normalizeText(value = '') {
  return String(value)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

/**
 * Infere ângulo/papel do movimento a partir do nome, músculos e tags.
 * Usa movement_type / movementType do catálogo quando existir.
 */
export function inferMovementRole(exercise) {
  if (!exercise) return 'general'
  const explicit = exercise.movement_type || exercise.movementType || exercise.movementRole
  if (explicit) return String(explicit)

  const cat = normalizeCategory(exercise.category || exercise.muscleGroup)
  const hay = normalizeText(
    [exercise.name, ...(exercise.muscles || []), ...(exercise.tags || []), exercise.equipment || ''].join(' '),
  )

  if (cat === 'Peitoral') {
    if (/inclin/.test(hay)) return 'chest_upper'
    if (/declin|paralela|mergulho|dip/.test(hay)) return 'chest_lower'
    if (/crucifix|peck|crossover|voador|fly|pullover|isol/.test(hay)) return 'chest_isolation'
    if (/maquina|smith|pec deck/.test(hay) && /supino|press|peito/.test(hay)) return 'chest_isolation'
    if (/reto|horizontal|supino|press|banco/.test(hay)) return 'chest_flat'
    return 'chest_flat'
  }

  if (cat === 'Ombros') {
    if (/posterior|invertid|face.?pull|crucifix.*invers|remada alta/.test(hay)) return 'shoulder_rear'
    if (/lateral|elevacao lateral/.test(hay)) return 'shoulder_lateral'
    if (/frontal|elevacao frontal/.test(hay)) return 'shoulder_front'
    if (/desenvolvimento|overhead|militar|arnold|press/.test(hay)) return 'shoulder_press'
    return 'shoulder_other'
  }

  if (cat === 'Tríceps') {
    if (
      /franc|overhead|testa|skull|coice|sobre a cabeca|atras da cabeca|extensao.*cabeca|halter.*cabeca/.test(
        hay,
      )
    ) {
      return 'tri_long'
    }
    if (/pulley|polia|push.?down|corda|barra.?[vw]|kickback|cabo/.test(hay)) return 'tri_pushdown'
    return 'tri_other'
  }

  return 'general'
}

function roleLabel(role) {
  const map = {
    chest_upper: 'Superior/inclinado',
    chest_flat: 'Reto/geral',
    chest_lower: 'Inferior/alongamento',
    chest_isolation: 'Isolador/máquina',
    shoulder_press: 'Desenvolvimento',
    shoulder_lateral: 'Elevação lateral',
    shoulder_rear: 'Posterior',
    shoulder_front: 'Elevação frontal',
    shoulder_other: 'Ombros',
    tri_long: 'Cabeça longa',
    tri_pushdown: 'Pushdown/corda',
    tri_other: 'Tríceps',
  }
  return map[role] || role
}

/**
 * Resume volume (séries) por grupo muscular — UI Push/Pull/Legs.
 * Ex.: "Peito: 16 séries | Ombro: 10 séries | Tríceps: 9 séries"
 */
export function summarizeDayVolume(exercises = [], dayTypeOrName = '') {
  const totals = {}
  for (const ex of exercises) {
    const g = normalizeCategory(ex.muscleGroup || ex.category)
    const sets = Number(ex.sets) || 0
    if (!g || !sets) continue
    totals[g] = (totals[g] || 0) + sets
  }

  const hay = normalizeText(dayTypeOrName)
  let order = Object.keys(totals)
  if (/push|peito|ombro|triceps/.test(hay) || (totals.Peitoral && totals.Tríceps)) {
    order = ['Peitoral', 'Ombros', 'Tríceps'].filter((g) => totals[g])
  } else if (/pull|costas|biceps/.test(hay) || totals.Costas) {
    order = ['Costas', 'Bíceps', 'Trapézio', 'Lombar'].filter((g) => totals[g])
  } else if (/legs|perna|glute/.test(hay) || totals.Pernas || totals.Glúteos) {
    order = ['Pernas', 'Glúteos', 'Panturrilha', 'Abdômen'].filter((g) => totals[g])
  }

  const short = {
    Peitoral: 'Peito',
    Ombros: 'Ombro',
    Tríceps: 'Tríceps',
    Costas: 'Costas',
    Bíceps: 'Bíceps',
    Trapézio: 'Trapézio',
    Lombar: 'Lombar',
    Pernas: 'Pernas',
    Glúteos: 'Glúteos',
    Panturrilha: 'Panturrilha',
    Abdômen: 'Abdômen',
  }

  const parts = order.map((g) => ({
    group: g,
    label: short[g] || g,
    sets: totals[g],
  }))

  if (!parts.length) {
    const fallback = Object.entries(totals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([g, sets]) => ({ group: g, label: short[g] || g, sets }))
    return {
      parts: fallback,
      text: fallback.map((p) => `${p.label}: ${p.sets} séries`).join(' | '),
    }
  }

  return {
    parts,
    text: parts.map((p) => `${p.label}: ${p.sets} séries`).join(' | '),
  }
}

function buildPool(options) {
  const { level, equipment, restrictions, location } = options
  let pool = exercises.filter(
    (ex) =>
      matchesEquipment(ex, equipment, location) &&
      matchesLevel(ex, level) &&
      !isRestricted(ex, restrictions),
  )

  if (location === 'Casa' || location === 'Parque') {
    pool = pool.filter(
      (ex) =>
        HOME_EQUIPMENT.has(ex.equipment) ||
        ['Cardio', 'Mobilidade', 'Alongamento', 'Funcional'].includes(normalizeCategory(ex.category)),
    )
  }

  return preferSimple(pool, level)
}

/**
 * Cotas por nível × tempo × tipo de dia.
 * Push avançado: 4 peito + 3 ombros + 2–3 tríceps (pode passar do antigo teto de 9).
 */
function buildLevelQuotas(dayType, level, maxExercises, minutes, restrictions = []) {
  const advanced = level === 'Avançado'
  const intermediate = level === 'Intermediário'
  const noLombar = restrictions.includes('lombar')

  if (dayType === 'Push') {
    if (advanced && minutes >= 75) {
      // 75–90: 4 peito, 3 ombros, 2–3 tríceps ≈ 9–10
      return {
        Peitoral: 4,
        Ombros: 3,
        Tríceps: maxExercises >= 10 ? 3 : 2,
      }
    }
    if (advanced && minutes >= 60) {
      return { Peitoral: 4, Ombros: 3, Tríceps: 2 }
    }
    if (advanced && minutes >= 45) {
      return { Peitoral: 3, Ombros: 2, Tríceps: 2 }
    }
    if (advanced) {
      return { Peitoral: 2, Ombros: 2, Tríceps: 1 }
    }
    if (intermediate) {
      // Intermediário: 3 peito, 2 ombros, 2 tríceps
      return {
        Peitoral: 3,
        Ombros: 2,
        Tríceps: maxExercises >= 7 ? 2 : 1,
      }
    }
    // Iniciante: 2 peito, 1–2 ombros, 1 tríceps
    return {
      Peitoral: 2,
      Ombros: maxExercises >= 5 || minutes >= 45 ? 2 : 1,
      Tríceps: 1,
    }
  }

  if (dayType === 'Pull') {
    if (advanced && minutes >= 90) {
      return {
        Costas: 4,
        Bíceps: 2,
        Trapézio: 1,
        ...(noLombar ? {} : { Lombar: 1 }),
      }
    }
    if (advanced && maxExercises >= 7) {
      return {
        Costas: 3,
        Bíceps: 2,
        Trapézio: 1,
        ...(noLombar ? {} : { Lombar: 1 }),
      }
    }
    if (intermediate) {
      return { Costas: 3, Bíceps: 2, Trapézio: 1 }
    }
    return { Costas: 2, Bíceps: 1, Trapézio: 1 }
  }

  if (dayType === 'Legs' || dayType === 'LegsLight') {
    if (advanced && minutes >= 90) {
      return {
        Pernas: 3,
        Glúteos: 2,
        Panturrilha: maxExercises >= 8 ? 2 : 1,
        Abdômen: 1,
        ...(maxExercises >= 10 ? { Mobilidade: 1 } : {}),
      }
    }
    if (advanced && maxExercises >= 7) {
      return { Pernas: 3, Glúteos: 2, Panturrilha: 1, Abdômen: 1 }
    }
    if (intermediate) {
      return { Pernas: 2, Glúteos: 2, Panturrilha: 1, Abdômen: 1 }
    }
    return { Pernas: 2, Glúteos: 1, Panturrilha: 1 }
  }

  return { ...(DAY_QUOTAS[dayType] || {}) }
}

function expandFocusForQuotas(dayType, focusGroups, level, restrictions = []) {
  const groups = [...focusGroups]
  const add = (g) => {
    if (!groups.includes(g)) groups.push(g)
  }

  if (dayType === 'Push') {
    ;['Peitoral', 'Ombros', 'Tríceps'].forEach(add)
    // Não forçar Mobilidade no Push — prioriza cotas musculares profissionais
  }
  if (dayType === 'Pull') {
    ;['Costas', 'Bíceps', 'Trapézio'].forEach(add)
    if (level === 'Avançado' && !restrictions.includes('lombar')) add('Lombar')
  }
  if (dayType === 'Legs' || dayType === 'LegsLight') {
    ;['Pernas', 'Glúteos', 'Panturrilha'].forEach(add)
    if (level === 'Avançado' || level === 'Intermediário') {
      add('Abdômen')
      if (level === 'Avançado') add('Mobilidade')
    }
  }
  return groups
}

function buildScopedQuotas(dayType, focusGroups, maxExercises, minutes = 45, level = 'Intermediário', restrictions = []) {
  const effectiveFocus = expandFocusForQuotas(dayType, focusGroups, level, restrictions)
  const base = buildLevelQuotas(dayType, level, maxExercises, minutes, restrictions)
  const fallbackBase =
    Object.keys(base).length > 0
      ? base
      : Object.fromEntries(
          effectiveFocus.map((g) => [g, Math.max(1, Math.ceil(maxExercises / Math.max(effectiveFocus.length, 1)))]),
        )

  const scopedQuotas = {}
  for (const [group, quota] of Object.entries(fallbackBase)) {
    if (effectiveFocus.includes(group) || effectiveFocus.length === 0) {
      scopedQuotas[group] = quota
    }
  }

  const defaultShare = Math.max(1, Math.ceil(maxExercises / Math.max(effectiveFocus.length, 1)))
  for (const group of effectiveFocus) {
    if (!scopedQuotas[group]) scopedQuotas[group] = defaultShare
  }

  if (!Object.keys(scopedQuotas).length) {
    for (const group of effectiveFocus) scopedQuotas[group] = 2
  }

  // Garante pelo menos 1 em cada grupo obrigatório
  for (const group of REQUIRED_GROUPS[dayType] || []) {
    if (scopedQuotas[group] == null || scopedQuotas[group] < 1) scopedQuotas[group] = 1
  }

  return scopedQuotas
}

/** Grupos com poucos itens no catálogo — podem repetir entre dias A/B */
const SCARCE_GROUPS = new Set(['Panturrilha', 'Trapézio', 'Lombar', 'Alongamento'])

/**
 * Escolhe candidatos priorizando papéis/ângulos ainda não cobertos no grupo.
 */
function pickDiverseCandidate(candidates, group, usedRoles) {
  const priority = ROLE_PRIORITY[group] || []
  if (!priority.length || !candidates.length) return candidates[0] || null

  for (const role of priority) {
    if (usedRoles.has(role)) continue
    const match = candidates.find((ex) => inferMovementRole(ex) === role)
    if (match) return match
  }

  // Sem papel novo: evita repetir o mesmo papel se houver alternativa
  const unused = candidates.find((ex) => !usedRoles.has(inferMovementRole(ex)))
  return unused || candidates[0]
}

function pickByQuotas(pool, quotas, maxExercises, usedIds, allowReuse = false, requiredGroups = []) {
  const selected = []
  const counts = Object.fromEntries(Object.keys(quotas).map((k) => [k, 0]))
  const usedRolesByGroup = Object.fromEntries(Object.keys(quotas).map((k) => [k, new Set()]))

  const tryAdd = (ex, group) => {
    if (selected.length >= maxExercises) return false
    if (selected.find((s) => s.id === ex.id)) return false
    if (!allowReuse && usedIds.has(ex.id) && !SCARCE_GROUPS.has(group)) return false
    selected.push(ex)
    counts[group] = (counts[group] || 0) + 1
    usedIds.add(ex.id)
    const roles = usedRolesByGroup[group] || (usedRolesByGroup[group] = new Set())
    roles.add(inferMovementRole(ex))
    return true
  }

  const candidatesFor = (group, ignoreUsed = false) =>
    shuffle(
      pool.filter(
        (ex) =>
          normalizeCategory(ex.category) === group &&
          (ignoreUsed || allowReuse || !usedIds.has(ex.id) || SCARCE_GROUPS.has(group)) &&
          !selected.find((s) => s.id === ex.id),
      ),
    )

  // 1) Garantir 1 de cada grupo obrigatório (com diversidade de papel)
  for (const group of requiredGroups) {
    if (selected.length >= maxExercises) break
    if ((counts[group] || 0) >= 1) continue
    const candidates = candidatesFor(group)
    const pick = pickDiverseCandidate(candidates, group, usedRolesByGroup[group] || new Set())
    if (pick) tryAdd(pick, group)
  }

  // 2) Preencher cotas na ordem definida, diversificando ângulos/papéis
  for (const group of Object.keys(quotas)) {
    const quota = quotas[group]
    while ((counts[group] || 0) < quota && selected.length < maxExercises) {
      let candidates = candidatesFor(group)
      if (!candidates.length) candidates = candidatesFor(group, true)
      if (!candidates.length) break
      const pick = pickDiverseCandidate(candidates, group, usedRolesByGroup[group] || new Set())
      if (!pick || !tryAdd(pick, group)) break
    }
  }

  return selected
}

function fillRemaining(pool, selected, focusGroups, maxExercises, usedIds, dayType) {
  if (selected.length >= maxExercises) return selected

  const bannedForPull = dayType === 'Pull'
  const preferCardioOnly = dayType === 'Cardio'

  const isAllowed = (ex) => {
    const cat = normalizeCategory(ex.category)
    if (selected.find((s) => s.id === ex.id)) return false
    if (bannedForPull && cat === 'Peitoral') return false
    if (dayType === 'Push' && ['Costas', 'Bíceps'].includes(cat)) return false
    if (
      (dayType === 'Legs' || dayType === 'LegsLight') &&
      cat === 'Cardio' &&
      selected.filter((s) => ['Pernas', 'Glúteos', 'Panturrilha'].includes(normalizeCategory(s.category))).length < 2
    ) {
      return false
    }
    if (!preferCardioOnly && dayType === 'Legs' && cat === 'Cardio') return false
    return true
  }

  const preferred = shuffle(
    pool.filter(
      (ex) =>
        focusGroups.includes(normalizeCategory(ex.category)) &&
        !usedIds.has(ex.id) &&
        isAllowed(ex),
    ),
  )

  for (const ex of preferred) {
    if (selected.length >= maxExercises) break
    selected.push(ex)
    usedIds.add(ex.id)
  }

  if (selected.length < maxExercises) {
    const reuse = shuffle(
      pool.filter((ex) => focusGroups.includes(normalizeCategory(ex.category)) && isAllowed(ex)),
    )
    for (const ex of reuse) {
      if (selected.length >= maxExercises) break
      selected.push(ex)
      usedIds.add(ex.id)
    }
  }

  return selected
}

function emergencyFallback(focusGroups, maxExercises, usedIds, restrictions = [], dayType = 'FullBody') {
  const selected = []
  const byFocus = exercises.filter(
    (ex) => focusGroups.includes(normalizeCategory(ex.category)) && !isRestricted(ex, restrictions),
  )
  const any = exercises.filter((ex) => !isRestricted(ex, restrictions))
  const target = Math.max(3, maxExercises)

  for (const ex of [...shuffle(byFocus), ...shuffle(any)]) {
    if (selected.length >= target) break
    if (selected.find((s) => s.id === ex.id)) continue
    const cat = normalizeCategory(ex.category)
    if (dayType === 'Pull' && cat === 'Peitoral') continue
    if (dayType === 'Push' && ['Costas', 'Bíceps'].includes(cat) && selected.length > 0) continue
    if (focusGroups.includes('Costas') && !focusGroups.includes('Peitoral') && cat === 'Peitoral') continue
    if (
      (focusGroups.includes('Pernas') || focusGroups.includes('Glúteos')) &&
      !focusGroups.includes('Cardio') &&
      cat === 'Cardio' &&
      selected.filter((s) => normalizeCategory(s.category) !== 'Cardio').length < 2
    ) {
      continue
    }
    selected.push(ex)
    usedIds.add(ex.id)
  }
  return selected
}

function validateDayComposition(selected, dayType, focusGroups) {
  const cats = selected.map((ex) => normalizeCategory(ex.category))
  const has = (g) => cats.includes(g)

  if (dayType === 'Push' && !has('Peitoral')) return false
  if (dayType === 'Pull' && (has('Peitoral') || !has('Costas'))) return false
  if (dayType === 'Legs') {
    const strength = cats.filter((c) => ['Pernas', 'Glúteos', 'Panturrilha'].includes(c)).length
    if (strength === 0) return false
  }
  if (dayType === 'Superiores' && !has('Peitoral') && !has('Costas')) return false
  if (dayType === 'Inferiores' && !has('Pernas') && !has('Glúteos')) return false

  const ids = selected.map((s) => s.id)
  if (new Set(ids).size !== ids.length) return false

  if (focusGroups.length && selected.length >= 3) {
    const inFocus = cats.filter((c) => focusGroups.includes(c)).length
    if (inFocus < Math.min(2, selected.length)) return false
  }
  return true
}

/**
 * Seleciona exercícios para um dia com cotas por grupo.
 */
export function pickExercisesForDay(dayTemplate, options, usedIds = new Set()) {
  const focusGroups = normalizeFocus(dayTemplate.focus || [])
  const dayType = inferDayType(dayTemplate.name, focusGroups)
  const minutes = options.minutesPerWorkout || options.duration || 45
  const level = options.level || 'Intermediário'
  const restrictions = options.restrictions || []
  const effectiveFocus = expandFocusForQuotas(dayType, focusGroups, level, restrictions)
  const scopedQuotas = buildScopedQuotas(
    dayType,
    focusGroups,
    options.maxExercises,
    minutes,
    level,
    restrictions,
  )
  const requiredGroups = REQUIRED_GROUPS[dayType] || []

  const pool = buildPool(options)
  let selected = pickByQuotas(pool, scopedQuotas, options.maxExercises, usedIds, false, requiredGroups)

  // Sempre completar até a meta (antes só preenchia se < 3–4 — causa de Advanced sub-gerar)
  if (selected.length < options.maxExercises) {
    const more = pickByQuotas(pool, scopedQuotas, options.maxExercises, usedIds, true, requiredGroups)
    for (const ex of more) {
      if (selected.length >= options.maxExercises) break
      if (selected.find((s) => s.id === ex.id)) continue
      selected.push(ex)
      usedIds.add(ex.id)
    }
  }

  if (selected.length < options.maxExercises) {
    selected = fillRemaining(pool, selected, effectiveFocus, options.maxExercises, usedIds, dayType)
  }

  let usedFallback = false
  if (selected.length < 3 || !validateDayComposition(selected, dayType, effectiveFocus)) {
    usedFallback = true
    const repaired = emergencyFallback(
      effectiveFocus,
      options.maxExercises,
      usedIds,
      restrictions,
      dayType,
    )
    const merged = []
    const seen = new Set()
    for (const ex of [...selected, ...repaired]) {
      if (seen.has(ex.id)) continue
      const cat = normalizeCategory(ex.category)
      if (dayType === 'Pull' && cat === 'Peitoral') continue
      if (dayType === 'Push' && ['Costas', 'Bíceps'].includes(cat) && merged.length > 0) continue
      merged.push(ex)
      seen.add(ex.id)
      if (merged.length >= options.maxExercises) break
    }
    selected = merged
  }

  if (dayType === 'Push' && !selected.some((ex) => normalizeCategory(ex.category) === 'Peitoral')) {
    const chest = pool.find(
      (ex) => normalizeCategory(ex.category) === 'Peitoral' && !selected.find((s) => s.id === ex.id),
    )
    if (chest) {
      if (selected.length >= options.maxExercises) selected.pop()
      selected.unshift(chest)
      usedIds.add(chest.id)
    }
  }

  // Garante ombros e tríceps no Push quando possível
  if (dayType === 'Push') {
    for (const group of ['Ombros', 'Tríceps']) {
      if (selected.some((ex) => normalizeCategory(ex.category) === group)) continue
      const candidate = pool.find(
        (ex) => normalizeCategory(ex.category) === group && !selected.find((s) => s.id === ex.id),
      )
      if (!candidate) continue
      if (selected.length >= options.maxExercises) {
        const replaceIdx = [...selected]
          .map((ex, i) => ({ ex, i }))
          .reverse()
          .find(({ ex }) => normalizeCategory(ex.category) === 'Peitoral' && selected.filter((s) => normalizeCategory(s.category) === 'Peitoral').length > 1)
        if (replaceIdx) selected.splice(replaceIdx.i, 1)
        else selected.pop()
      }
      selected.push(candidate)
      usedIds.add(candidate.id)
    }
  }

  const unique = []
  const seenIds = new Set()
  for (const ex of selected) {
    if (seenIds.has(ex.id)) continue
    seenIds.add(ex.id)
    unique.push(ex)
  }

  return {
    selected: unique.slice(0, options.maxExercises),
    usedFallback,
    dayType,
    focusGroups: effectiveFocus.length ? effectiveFocus : focusGroups,
  }
}

function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n))
}

function getMaxExercises(level, duration, goal) {
  const table = TIME_EXERCISE_TABLE[level] || TIME_EXERCISE_TABLE.Iniciante
  const caps = LEVEL_CAPS[level] || LEVEL_CAPS.Iniciante
  let max = table[0][1]
  for (const [mins, count] of table) {
    if (duration >= mins) max = count
  }
  max = clamp(max, caps.min, caps.max)

  if (goal === 'saude') max = Math.min(max, level === 'Iniciante' ? 5 : 6)
  if (goal === 'mobilidade') max = Math.min(max, level === 'Iniciante' ? 4 : 6)
  if (goal === 'forca') max = Math.min(max, level === 'Iniciante' ? 4 : max)
  return max
}

/**
 * Push avançado pode precisar de 9–10 slots para cotas 4+3+2–3
 * (prioridade às cotas musculares sobre o teto genérico antigo).
 */
function getDayMaxExercises(dayType, level, duration, goal) {
  let max = getMaxExercises(level, duration, goal)
  if (dayType === 'Push' && level === 'Avançado') {
    const pushTarget = duration >= 75 ? 10 : duration >= 60 ? 9 : duration >= 45 ? 7 : 5
    max = Math.max(max, Math.min(pushTarget, LEVEL_CAPS.Avançado.max))
  }
  return max
}

/**
 * Distribui séries totais do grupo entre os exercícios (alvo min–max).
 */
function distributeGroupSets(entries, group, minSets, maxSets) {
  const groupIdxs = entries
    .map((ex, i) => (normalizeCategory(ex.muscleGroup) === group ? i : -1))
    .filter((i) => i >= 0)
  if (!groupIdxs.length) return entries

  const n = groupIdxs.length
  const target = clamp(Math.round((minSets + maxSets) / 2), minSets, maxSets)
  const next = [...entries]

  // Distribuição quase uniforme, compostos (índice 0) podem ficar com +1
  const base = Math.floor(target / n)
  let rem = target - base * n
  groupIdxs.forEach((idx) => {
    const sets = clamp(base + (rem > 0 ? 1 : 0), 3, 5)
    if (rem > 0) rem -= 1
    next[idx] = { ...next[idx], sets }
  })

  let total = groupIdxs.reduce((s, i) => s + next[i].sets, 0)
  let guard = 0
  while (total < minSets && guard < 24) {
    const i = groupIdxs[guard % groupIdxs.length]
    if (next[i].sets < 5) {
      next[i] = { ...next[i], sets: next[i].sets + 1 }
      total += 1
    }
    guard += 1
  }
  guard = 0
  while (total > maxSets && guard < 24) {
    const i = groupIdxs[groupIdxs.length - 1 - (guard % groupIdxs.length)]
    if (next[i].sets > 3) {
      next[i] = { ...next[i], sets: next[i].sets - 1 }
      total -= 1
    }
    guard += 1
  }

  return next
}

function applyAdvancedPushVolume(entries, level, dayType) {
  if (level !== 'Avançado' || dayType !== 'Push') return entries
  let next = entries
  for (const [group, range] of Object.entries(ADVANCED_PUSH_VOLUME)) {
    next = distributeGroupSets(next, group, range.min, range.max)
  }
  return next
}

function buildSetsRepsRest(exercise, level, goal, dayType) {
  const config = levelConfig[level] || levelConfig.Intermediário
  let sets = clamp(Math.round(parseSets(exercise.sets) * config.setsMultiplier), config.setsMin, config.setsMax)
  let rest = clamp(parseRestSeconds(exercise.rest) + config.restBonus, config.restMin, config.restMax)
  let reps = exercise.reps || config.defaultReps
  let observation = ''
  let intensityBias = 0

  if (level === 'Iniciante') {
    sets = clamp(sets, 2, 3)
    reps = '10-15'
    rest = clamp(rest, 60, 90)
    observation = 'Foque na técnica e amplitude controlada.'
  } else if (level === 'Intermediário') {
    sets = clamp(sets, 3, 4)
    reps = reps || '8-12'
    rest = clamp(rest, 60, 120)
  } else {
    sets = clamp(sets, 3, 5)
    rest = clamp(rest, 60, 150)
    if (!observation && Math.random() < 0.18 && !isRecoveryDay(dayType)) {
      observation =
        Math.random() < 0.5
          ? 'Opcional: bi-set com o próximo exercício do mesmo grupo (apenas se a técnica estiver estável).'
          : 'Opcional: drop set na última série (reduza a carga ~20% e continue com controle).'
    }
  }

  switch (goal) {
    case 'hipertrofia':
      reps = level === 'Iniciante' ? '10-12' : '8-12'
      rest = clamp(rest, 60, level === 'Avançado' ? 120 : 90)
      intensityBias = 1
      break
    case 'forca':
      reps = level === 'Iniciante' ? '6-8' : '4-6'
      rest = clamp(rest + 30, 90, 150)
      sets = clamp(sets + (level === 'Iniciante' ? 0 : 1), config.setsMin, config.setsMax)
      intensityBias = 1
      observation = observation || 'Carga desafiadora com execução limpa; não force além da técnica.'
      break
    case 'condicionamento':
      reps = level === 'Iniciante' ? '12-15' : '12-20'
      rest = clamp(rest - 15, 45, 75)
      intensityBias = 0
      break
    case 'emagrecimento':
      reps = '12-15'
      rest = clamp(rest - 10, 45, 75)
      intensityBias = 0
      observation =
        observation || 'Mantenha ritmo constante; priorize consistência, sem promessas de perda de peso.'
      break
    case 'mobilidade':
      if (['Mobilidade', 'Alongamento', 'Abdômen'].includes(normalizeCategory(exercise.category))) {
        reps = '30-60s'
        sets = clamp(sets, 2, 3)
        rest = 45
      }
      observation = observation || 'Movimento suave, sem forçar amplitude dolorosa.'
      intensityBias = -1
      break
    case 'saude':
    default:
      reps = exercise.reps || '10-12'
      rest = clamp(Math.max(60, rest), 60, 90)
      intensityBias = -1
      observation = observation || 'Priorize conforto e boa forma em todas as séries.'
      break
  }

  if (isRecoveryDay(dayType)) {
    sets = clamp(sets, 2, 3)
    rest = Math.min(rest, 60)
    intensityBias = -1
  }

  return { sets, reps, rest, observation, intensityBias }
}

function buildSafetyTip(exercise, restrictions, dayType) {
  const full = getExerciseById(exercise.id) || exercise
  const tips = []
  if (full.safetyTips?.[0]) tips.push(full.safetyTips[0])
  if (restrictions.includes('joelho')) {
    tips.push('Evite impacto e travamento de joelho; use amplitude confortável.')
  }
  if (restrictions.includes('lombar')) {
    tips.push('Mantenha a coluna neutra e evite carga excessiva na região lombar.')
  }
  if (restrictions.includes('ombro')) {
    tips.push('Controle a amplitude do ombro e evite elevações dolorosas.')
  }
  if (isRecoveryDay(dayType)) tips.push('Dia de menor intensidade — respeite sinais de fadiga.')
  if (!tips.length) tips.push('Pare em caso de dor aguda e priorize a técnica.')
  return tips[0]
}

function resolveIntensity(level, goal, dayType, intensityBias = 0) {
  if (isRecoveryDay(dayType)) return 'Recuperação'
  let score = level === 'Iniciante' ? 1 : level === 'Intermediário' ? 2 : 3
  if (goal === 'forca' || goal === 'hipertrofia') score += 1
  if (goal === 'saude' || goal === 'mobilidade') score -= 1
  score += intensityBias
  if (score <= 1) return 'Leve'
  if (score === 2) return 'Moderada'
  if (score === 3) return 'Moderada-Alta'
  // Avançado em dias de força/hipertrofia: intensidade alta com controle
  if (level === 'Avançado') return 'Alta controlada'
  return 'Alta'
}

function buildExerciseEntry(exercise, level, goal, dayType, restrictions) {
  const { sets, reps, rest, observation, intensityBias } = buildSetsRepsRest(exercise, level, goal, dayType)
  const full = getExerciseById(exercise.id) || exercise
  const safetyTip = buildSafetyTip(exercise, restrictions, dayType)
  const movementType = inferMovementRole(full)
  const obs =
    observation ||
    full.shortInstruction ||
    full.executionSteps?.[0] ||
    full.execution?.[0] ||
    'Movimento controlado.'

  return {
    exerciseId: exercise.id,
    name: exercise.name,
    muscleGroup: normalizeCategory(exercise.category),
    equipment: exercise.equipment,
    sets,
    reps,
    rest,
    restSeconds: rest,
    observation: obs,
    safetyTip,
    load: '',
    completed: false,
    level: exercise.level,
    movementType,
    movementRoleLabel: roleLabel(movementType),
    _intensityBias: intensityBias,
  }
}

function workoutTypeLabel(dayType, name) {
  const map = {
    Push: 'Push',
    Pull: 'Pull',
    Legs: 'Legs',
    LegsLight: 'Legs (leve)',
    FullBody: 'Full Body',
    Superiores: 'Superiores',
    Inferiores: 'Inferiores',
    Core: 'Core',
    Cardio: 'Cardio',
    Mobilidade: 'Mobilidade',
    HybridRecovery: 'Core + Cardio + Mobilidade',
  }
  return map[dayType] || name || 'Treino'
}

/**
 * Gera planilha personalizada.
 * Aceita aliases: goal|objective, minutesPerWorkout|duration
 */
export function generateWorkoutPlan(input = {}) {
  const goal = normalizeGoal(input.goal ?? input.objective ?? 'saude')
  const level = input.level || 'Iniciante'
  const days = Math.min(Math.max(Number(input.daysPerWeek) || 3, 2), 7)
  const minutesPerWorkout = Number(input.minutesPerWorkout ?? input.duration ?? 45)
  const location = input.location || 'Academia'
  const equipment = input.equipment?.length ? input.equipment : ['Academia completa']
  const restrictions = normalizeRestrictions(input.restrictions || [])

  const template = getSplitTemplate(days, level, goal)
  const maxExercises = getMaxExercises(level, minutesPerWorkout, goal)
  const usedIds = new Set()
  let usedFallback = false

  const weeklyPlan = template.map((dayTemplate) => {
    const dayTypePreview = inferDayType(dayTemplate.name, dayTemplate.focus)
    const recovery = isRecoveryDay(dayTypePreview, dayTemplate.name)
    const dayMax = recovery
      ? Math.min(4, Math.max(3, maxExercises - 1))
      : getDayMaxExercises(dayTypePreview, level, minutesPerWorkout, goal)

    const { selected, usedFallback: dayFallback, dayType, focusGroups } = pickExercisesForDay(
      dayTemplate,
      {
        level,
        equipment,
        restrictions,
        maxExercises: dayMax,
        location,
        minutesPerWorkout,
        duration: minutesPerWorkout,
      },
      usedIds,
    )
    if (dayFallback) usedFallback = true

    let exerciseEntries = selected.map((ex) => buildExerciseEntry(ex, level, goal, dayType, restrictions))
    exerciseEntries = applyAdvancedPushVolume(exerciseEntries, level, dayType)

    const avgBias =
      exerciseEntries.reduce((sum, ex) => sum + (ex._intensityBias || 0), 0) /
      Math.max(exerciseEntries.length, 1)
    const intensity = resolveIntensity(level, goal, dayType, Math.round(avgBias))
    const muscleGroups = focusGroups.length ? focusGroups : normalizeFocus(dayTemplate.focus)
    const workoutType = workoutTypeLabel(dayType, dayTemplate.name)
    const estimatedDuration = recovery
      ? Math.min(minutesPerWorkout, Math.max(25, minutesPerWorkout - 10))
      : minutesPerWorkout

    const cleanExercises = exerciseEntries.map(({ _intensityBias, ...ex }) => ex)
    const volumeSummary = summarizeDayVolume(cleanExercises, workoutType || dayTemplate.name)

    return {
      day: dayTemplate.day,
      workoutName: dayTemplate.name,
      workoutType,
      muscleGroups,
      estimatedDuration,
      intensity,
      exercises: cleanExercises,
      volumeSummary: volumeSummary.text,
      volumeParts: volumeSummary.parts,
      name: dayTemplate.name,
      focus: muscleGroups,
      estimatedMinutes: estimatedDuration,
    }
  })

  const safetyNotes = [
    'Aqueça 5–10 minutos antes de cada sessão.',
    'Priorize técnica sobre carga.',
    'Respeite sinais de fadiga e inclua recuperação adequada.',
    PROFESSIONAL_DISCLAIMER,
  ]

  if (restrictions.includes('joelho')) {
    safetyNotes.push(
      'Exercícios de alto impacto no joelho foram evitados ou substituídos por alternativas mais controladas.',
    )
  }
  if (restrictions.includes('lombar')) {
    safetyNotes.push(
      'Movimentos com alta demanda lombar foram evitados ou priorizados com carga e amplitude controladas.',
    )
  }
  if (restrictions.includes('ombro')) {
    safetyNotes.push(
      'Exercícios de ombro foram filtrados; prefira amplitudes indoloridas e progressão gradual.',
    )
  }
  if (goal === 'emagrecimento') {
    safetyNotes.push(
      'Este plano apoia condicionamento geral; resultados de composição corporal variam e não há garantia de emagrecimento.',
    )
  }
  if (usedFallback) {
    safetyNotes.push('Alguns exercícios foram completados com sugestões alternativas compatíveis com seu perfil.')
  }

  const objectiveLabel = objectiveLabels[goal] || goal
  const title = `Plano ${days}x/semana — ${objectiveLabel}`

  return {
    id: `plan-${Date.now()}`,
    createdAt: new Date().toISOString(),
    title,
    goal,
    level,
    daysPerWeek: days,
    minutesPerWorkout,
    location,
    equipment,
    restrictions: input.restrictions || [],
    weeklyPlan,
    objective: goal,
    objectiveLabel,
    duration: minutesPerWorkout,
    schedule: weeklyPlan,
    usedFallback,
    safetyNotes,
    disclaimer: PROFESSIONAL_DISCLAIMER,
  }
}

/**
 * Converte o plano gerado em treinos salvos (TODOS os dias).
 */
export function planToWorkouts(plan) {
  const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
  const days = plan.weeklyPlan || plan.schedule || []
  const today = new Date()
  const stamp = Date.now()

  return days.map((day, index) => {
    const workoutDate = new Date(today)
    workoutDate.setDate(today.getDate() + index)

    const muscleGroups = day.muscleGroups || day.focus || []
    const exercises = (day.exercises || []).map((ex) => ({
      exerciseId: ex.exerciseId,
      name: ex.name,
      muscleGroup: ex.muscleGroup,
      sets: ex.sets,
      reps: ex.reps,
      restSeconds: ex.restSeconds ?? ex.rest ?? 60,
      rest: ex.rest ?? ex.restSeconds ?? 60,
      equipment: ex.equipment,
      observation: ex.observation,
      safetyTip: ex.safetyTip,
      load: ex.load || '',
      completed: false,
      level: ex.level,
      movementType: ex.movementType,
      movementRoleLabel: ex.movementRoleLabel,
    }))

    const volumeSummary =
      day.volumeSummary || summarizeDayVolume(exercises, day.workoutType || day.workoutName || day.name).text

    return {
      id: `workout-${plan.id || stamp}-${day.day}-${index}`,
      planId: plan.id,
      name: day.workoutName || day.name,
      workoutType: day.workoutType,
      date: workoutDate.toISOString().split('T')[0],
      dayLabel: dayNames[workoutDate.getDay()],
      dayNumber: day.day,
      muscleGroups,
      exercises,
      volumeSummary,
      volumeParts: day.volumeParts || summarizeDayVolume(exercises, day.workoutType || day.workoutName).parts,
      status: 'Pendente',
      estimatedMinutes: day.estimatedDuration || day.estimatedMinutes || plan.minutesPerWorkout || plan.duration,
      intensity: day.intensity,
      createdAt: new Date().toISOString(),
    }
  })
}
