/**
 * Classificação de exercícios para o motor de prescrição.
 * Tipos: composto | isolado | core | panturrilha | mobilidade | cardio.
 * Usa `kind`/`principal` do catálogo quando existirem; senão, heurística.
 */

export const KINDS = {
  composto: 'composto',
  isolado: 'isolado',
  core: 'core',
  panturrilha: 'panturrilha',
  mobilidade: 'mobilidade',
  cardio: 'cardio',
}

export const KIND_LABELS = {
  composto: 'Composto',
  isolado: 'Isolado',
  core: 'Core',
  panturrilha: 'Panturrilha',
  mobilidade: 'Mobilidade',
  cardio: 'Cardio',
}

/** Ordem em que os tipos aparecem dentro de uma sessão. */
export const KIND_ORDER = ['composto', 'isolado', 'panturrilha', 'core', 'mobilidade', 'cardio']

/** Compostos principais: recebem faixa 3-6 na força e até 5 séries no avançado. */
const PRINCIPAL_IDS = new Set([
  'agachamento',
  'agachamento-frontal',
  'agachamento-barra',
  'levantamento-terra',
  'levantamento-terra-halteres',
  'supino-reto',
  'supino-inclinado-com-barra',
  'desenvolvimento-militar-barra',
  'desenvolvimento-barra-sentado',
  'remada-curvada',
  'barra-fixa',
  'leg-press',
])

const CATEGORY_ALIASES = {
  Peito: 'Peitoral',
  Quadríceps: 'Pernas',
  Posterior: 'Pernas',
  Oblíquos: 'Abdômen',
  Core: 'Abdômen',
  Cardiovascular: 'Cardio',
  'Corpo inteiro': 'Funcional',
  Coluna: 'Mobilidade',
  Quadril: 'Mobilidade',
}

export function normalizeGroup(label) {
  if (!label) return ''
  return CATEGORY_ALIASES[label] || label
}

function fold(value = '') {
  return String(value)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

function heuristicKind(exercise) {
  const group = normalizeGroup(exercise.category || exercise.muscleGroup)
  const type = fold(exercise.type)
  const hay = fold(`${exercise.id || ''} ${exercise.name || ''}`)

  if (group === 'Cardio' || type === 'cardio') return KINDS.cardio
  if (group === 'Mobilidade' || group === 'Alongamento' || type === 'mobilidade') return KINDS.mobilidade
  if (group === 'Panturrilha') return KINDS.panturrilha
  if (group === 'Abdômen') return KINDS.core
  if (/esteira|bicicleta|aquecimento|desaquecimento|battle.?rope|burpee/.test(hay)) return KINDS.cardio
  if (/alongamento|mobilidade|gato.?vaca|rotacao.?toracica/.test(hay)) return KINDS.mobilidade
  if (/panturrilha|gemeos/.test(hay)) return KINDS.panturrilha
  if (group !== 'Costas' && /prancha|abdominal|dead.?bug|pallof|bird.?dog/.test(hay)) return KINDS.core

  if (group === 'Lombar') {
    return /terra|good.?morning|bom.?dia/.test(hay) ? KINDS.composto : KINDS.core
  }
  if (group === 'Antebraço') return KINDS.isolado
  if (group === 'Bíceps') return KINDS.isolado
  if (group === 'Tríceps') {
    return /mergulho|paralela|dips?\b|supino.*fechad|flexao.*diamante/.test(hay) ? KINDS.composto : KINDS.isolado
  }
  if (group === 'Trapézio') {
    return /remada/.test(hay) && !/elevacao|voador/.test(hay) ? KINDS.composto : KINDS.isolado
  }
  if (group === 'Peitoral') {
    return /crucifix|crossover|cross.?over|voador|pec.?deck|fly|pullover/.test(hay) ? KINDS.isolado : KINDS.composto
  }
  if (group === 'Ombros') {
    return /desenvolvimento|militar|arnold|press|cubano/.test(hay) && !/elevacao|levantamento|circulo|crucifix/.test(hay)
      ? KINDS.composto
      : KINDS.isolado
  }
  if (group === 'Costas') {
    return /pullover|crucifix|voador|extensao/.test(hay) ? KINDS.isolado : KINDS.composto
  }
  if (group === 'Pernas') {
    return /extensora|flexora|leg.?curl|aducao|adutor|abducao|abdutor|sissy/.test(hay) ? KINDS.isolado : KINDS.composto
  }
  if (group === 'Glúteos') {
    return /abducao|abdutor|coice|kickback|cabo.*gluteo|gluteo.*cabo|extensao de quadril/.test(hay)
      ? KINDS.isolado
      : KINDS.composto
  }
  if (group === 'Funcional') {
    return /swing|farmer|carregada|terra|agachamento|thruster/.test(hay) ? KINDS.composto : KINDS.cardio
  }
  return KINDS.composto
}

/**
 * @returns {{ kind: string, principal: boolean }}
 */
export function classifyExercise(exercise) {
  if (!exercise) return { kind: KINDS.composto, principal: false }
  const kind = KINDS[exercise.kind] ? exercise.kind : heuristicKind(exercise)
  const id = exercise.id || exercise.exerciseId || ''
  const principal =
    kind === KINDS.composto && (exercise.principal === true || (exercise.principal !== false && PRINCIPAL_IDS.has(id)))
  return { kind, principal }
}

export function exerciseKind(exercise) {
  return classifyExercise(exercise).kind
}

export function isMainCompound(exercise) {
  return classifyExercise(exercise).principal
}

export function isStrengthKind(kind) {
  return kind === KINDS.composto || kind === KINDS.isolado || kind === KINDS.panturrilha
}
