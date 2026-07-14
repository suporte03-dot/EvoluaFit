/**
 * Validação de coerência exercício ↔ mídia.
 * Uso interno: bloquear mídia incompatível e registrar issues no console.
 * Não copiar assets do Gif do Treino.
 */

/** Exercícios cuja URL atual é conhecida como incoerente — forçar fallback */
export const MEDIA_BLOCKLIST = new Set([
  'aquecimento-leve', // walking lunges
  'desaquecimento', // walking lunges
])

/**
 * Mapa de validação por exercício.
 * expectedMediaKeywords: palavras aceitas na URL/query
 * invalidKeywords: se aparecerem na URL, rejeitar mídia
 */
export const exerciseMediaMap = {
  'supino-reto': {
    expectedNames: ['Supino reto com barra'],
    expectedMediaKeywords: ['supino-reto', 'peito', 'bench'],
    muscleGroup: 'Peitoral',
    equipment: ['Barra', 'Halteres', 'Máquina'],
    invalidKeywords: ['fly', 'crucifixo', 'squat', 'row', 'pulldown', 'curl'],
  },
  'supino-inclinado': {
    expectedNames: ['Supino inclinado com halteres'],
    expectedMediaKeywords: ['inclinado', 'peito', 'incline'],
    muscleGroup: 'Peitoral',
    equipment: ['Halteres', 'Barra'],
    invalidKeywords: ['fly', 'crucifixo', 'squat', 'Bench-press-1'],
  },
  crucifixo: {
    expectedNames: ['Crucifixo'],
    expectedMediaKeywords: ['fly', '27NNGFr'],
    muscleGroup: 'Peitoral',
    equipment: ['Halteres'],
    invalidKeywords: ['bench-press', 'supino', 'squat', 'row'],
  },
  'crucifixo-inclinado': {
    expectedNames: ['Crucifixo inclinado'],
    expectedMediaKeywords: ['fly', 'incline', '828'],
    muscleGroup: 'Peitoral',
    equipment: ['Halteres'],
    invalidKeywords: ['bench-press', 'cable', 'squat'],
  },
  'crucifixo-cabo': {
    expectedNames: ['Crucifixo no cabo'],
    expectedMediaKeywords: ['cable', 'cross-over', '0CXGHya', 'crossover'],
    muscleGroup: 'Peitoral',
    equipment: ['Cabo'],
    invalidKeywords: ['dumbbell', 'halter'],
  },
  agachamento: {
    expectedNames: ['Agachamento livre'],
    expectedMediaKeywords: ['squat', 'qXTaZnJ'],
    muscleGroup: 'Pernas',
    equipment: ['Barra', 'Peso corporal'],
    invalidKeywords: ['leg-press', 'leg_press', '10Z2DXU'],
  },
  'leg-press': {
    expectedNames: ['Leg press 45°'],
    expectedMediaKeywords: ['leg-press', 'leg press', 'sled', '10Z2DXU'],
    muscleGroup: 'Pernas',
    equipment: ['Máquina'],
    invalidKeywords: ['squat', 'qXTaZnJ'],
  },
  'remada-baixa-cabo': {
    expectedNames: ['Remada baixa no cabo'],
    expectedMediaKeywords: ['remada-baixa', 'costas', 'cabo', 'row'],
    muscleGroup: 'Costas',
    equipment: ['Cabo'],
    invalidKeywords: ['pulldown', 'lat-pulldown', 'puxada', 'squat'],
  },
  'puxada-frontal': {
    expectedNames: ['Puxada frontal'],
    expectedMediaKeywords: ['puxada', 'costas', 'pulldown'],
    muscleGroup: 'Costas',
    equipment: ['Cabo'],
    invalidKeywords: ['row', 'remada', 'squat'],
  },
  'puxada-neutra': {
    expectedNames: ['Puxada neutra'],
    expectedMediaKeywords: ['puxada-neutra', 'costas', 'neutra'],
    muscleGroup: 'Costas',
    equipment: ['Cabo'],
    invalidKeywords: ['squat', 'bench', 'fly'],
  },
  'remada-curvada': {
    expectedNames: ['Remada curvada com barra'],
    expectedMediaKeywords: ['remada-curvada', 'costas', 'barra'],
    muscleGroup: 'Costas',
    equipment: ['Barra'],
    invalidKeywords: ['squat', 'bench', 'curl'],
  },
  'rosca-direta': {
    expectedNames: ['Rosca direta com barra'],
    expectedMediaKeywords: ['rosca-direta', 'biceps', 'barra'],
    muscleGroup: 'Bíceps',
    equipment: ['Barra'],
    invalidKeywords: ['tricep', 'pushdown', 'extens'],
  },
  'rosca-martelo': {
    expectedNames: ['Rosca martelo'],
    expectedMediaKeywords: ['rosca-martelo', 'biceps', 'martelo'],
    muscleGroup: 'Bíceps',
    equipment: ['Halteres'],
    invalidKeywords: ['tricep', 'pushdown'],
  },
  'rosca-alternada': {
    expectedNames: ['Rosca alternada'],
    expectedMediaKeywords: ['rosca-alternada', 'biceps'],
    muscleGroup: 'Bíceps',
    equipment: ['Halteres'],
    invalidKeywords: ['tricep', 'pushdown'],
  },
  'triceps-pulley': {
    expectedNames: ['Tríceps na polia'],
    expectedMediaKeywords: ['triceps', 'cabos', 'extensao', 'pushdown'],
    muscleGroup: 'Tríceps',
    equipment: ['Cabo'],
    invalidKeywords: ['curl', 'bicep', 'rosca'],
  },
  'triceps-corda': {
    expectedNames: ['Tríceps corda', 'Tríceps na corda'],
    expectedMediaKeywords: ['triceps', 'corda', 'rope', 'pushdown'],
    muscleGroup: 'Tríceps',
    equipment: ['Cabo'],
    invalidKeywords: ['curl', 'bicep', 'rosca', 'bench', 'squat'],
  },
  'remada-baixa': {
    expectedNames: ['Remada baixa'],
    expectedMediaKeywords: ['remada-baixa', 'costas', 'row', 'cabo'],
    muscleGroup: 'Costas',
    equipment: ['Cabo'],
    invalidKeywords: ['pulldown', 'lat-pulldown', 'puxada', 'squat', 'bench'],
  },
  'encolhimento': {
    expectedNames: ['Encolhimento'],
    expectedMediaKeywords: ['encolh', 'shrug', 'trapezio'],
    muscleGroup: 'Trapézio',
    equipment: ['Halteres', 'Barra'],
    invalidKeywords: ['curl', 'squat', 'bench'],
  },
  hiperextensao: {
    expectedNames: ['Hiperextensão'],
    expectedMediaKeywords: ['hiperextensao', 'lombar', 'hyperextension'],
    muscleGroup: 'Lombar',
    equipment: ['Peso corporal'],
    invalidKeywords: ['bench-press', 'supino', 'curl'],
  },
  desenvolvimento: {
    expectedNames: ['Desenvolvimento com halteres'],
    expectedMediaKeywords: ['ombro', 'halteres', 'desenvolvimento', 'banco'],
    muscleGroup: 'Ombros',
    equipment: ['Halteres'],
    invalidKeywords: ['lateral-raise', 'cALkHHX', 'fly', 'rosca'],
  },
  'elevacao-lateral': {
    expectedNames: ['Elevação lateral'],
    expectedMediaKeywords: ['lateral', 'cALkHHX', 'raise'],
    muscleGroup: 'Ombros',
    equipment: ['Halteres'],
    invalidKeywords: ['press', 'znQUdHY', 'arnold'],
  },
  'face-pull': {
    expectedNames: ['Face pull'],
    expectedMediaKeywords: ['face-pull', 'trapezio', 'cabo', 'rosto'],
    muscleGroup: 'Trapézio',
    equipment: ['Cabo'],
    invalidKeywords: ['curl', 'squat'],
  },
  prancha: {
    expectedNames: ['Prancha abdominal'],
    expectedMediaKeywords: ['plank', 'VBAWRPG'],
    muscleGroup: 'Abdômen',
    equipment: ['Peso corporal'],
    invalidKeywords: ['crunch', 'bicycle', 'XUUD0Fs'],
  },
  'abdominal-bicicleta': {
    expectedNames: ['Abdominal bicicleta'],
    expectedMediaKeywords: ['bicycle', 'crunch', 'XUUD0Fs'],
    muscleGroup: 'Abdômen',
    equipment: ['Peso corporal'],
    invalidKeywords: ['plank', 'VBAWRPG'],
  },
  'esteira-moderada': {
    expectedNames: ['Esteira — ritmo moderado'],
    expectedMediaKeywords: ['treadmill', 'run', '1615', 'walk'],
    muscleGroup: 'Cardio',
    equipment: ['Máquina'],
    invalidKeywords: ['bench', 'squat', 'curl', 'press'],
  },
  'mobilidade-quadril-90': {
    expectedNames: ['Mobilidade de quadril — 90/90'],
    expectedMediaKeywords: ['hip', 'stretch', '0L2KwtI', 'mobility'],
    muscleGroup: 'Mobilidade',
    equipment: ['Colchonete'],
    invalidKeywords: ['squat', 'deadlift', 'press'],
  },
}

/** Issues internas para correção (não exibir ao usuário) */
export const mediaIssues = [
  {
    exercise: 'Aquecimento leve',
    issue: 'Mídia atual é walking lunges',
    action: 'Substituir por aquecimento genérico ou caminhada',
  },
  {
    exercise: 'Desaquecimento',
    issue: 'Mídia atual é walking lunges',
    action: 'Substituir por alongamento/desaquecimento',
  },
  {
    exercise: 'Rosca direta',
    issue: 'Equipamento cadastrado como Halteres, mídia é barra',
    action: 'Alinhar equipamento para Barra (corrigido no código local)',
  },
  {
    exercise: 'Elevação lateral / frontal',
    issue: 'Ainda usam GIF remoto — lote de Ombros veio sem elevação dedicada',
    action: 'Importar ilustrações locais de elevação lateral e frontal quando disponíveis',
  },
]

const CATEGORY_NORMALIZE = {
  Peito: 'Peitoral',
  Peitoral: 'Peitoral',
  peito: 'Peitoral',
  Costas: 'Costas',
  Ombros: 'Ombros',
  Bíceps: 'Bíceps',
  Tríceps: 'Tríceps',
  Antebraço: 'Antebraço',
  Trapézio: 'Trapézio',
  Quadríceps: 'Pernas',
  Posterior: 'Pernas',
  Pernas: 'Pernas',
  Glúteos: 'Glúteos',
  Panturrilha: 'Panturrilha',
  Abdômen: 'Abdômen',
  Abdomen: 'Abdômen',
  Oblíquos: 'Abdômen',
  Core: 'Abdômen',
  Lombar: 'Lombar',
  Cardiovascular: 'Cardio',
  Cardio: 'Cardio',
  'Corpo inteiro': 'Funcional',
  Funcional: 'Funcional',
  Coluna: 'Mobilidade',
  Quadril: 'Mobilidade',
  Mobilidade: 'Mobilidade',
  Alongamento: 'Alongamento',
}

export function normalizeMuscleGroup(category) {
  if (!category) return 'Funcional'
  return CATEGORY_NORMALIZE[category] || category
}

/**
 * Decide se a URL de mídia é segura para o exercício.
 */
export function isMediaCoherent(exerciseId, mediaUrl) {
  if (!mediaUrl) return false
  if (MEDIA_BLOCKLIST.has(exerciseId)) return false

  const rules = exerciseMediaMap[exerciseId]
  if (!rules) return true

  const haystack = String(mediaUrl).toLowerCase()
  if (rules.invalidKeywords?.some((kw) => haystack.includes(String(kw).toLowerCase()))) {
    return false
  }
  return true
}

/**
 * Retorna URL validada ou null (usar fallback).
 */
export function getValidatedMediaUrl(exerciseId, candidateUrl) {
  if (!candidateUrl) return null
  if (!isMediaCoherent(exerciseId, candidateUrl)) return null
  return candidateUrl
}

export function logMediaIssuesOnce() {
  if (typeof window === 'undefined') return
  if (window.__evoluafitMediaIssuesLogged) return
  window.__evoluafitMediaIssuesLogged = true
  console.info(
    '[EvoluaFit] Mídia pendente/suspeita (uso interno):',
    mediaIssues,
    '| blocked IDs:',
    [...MEDIA_BLOCKLIST],
  )
}
