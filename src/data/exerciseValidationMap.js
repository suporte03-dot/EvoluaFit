/**
 * Validação de coerência exercício ↔ mídia.
 * Uso interno: bloquear mídia incompatível e registrar issues no console.
 * Não copiar assets do Gif do Treino.
 */

/** Exercícios cuja URL atual é conhecida como incoerente — forçar fallback */
export const MEDIA_BLOCKLIST = new Set([
  'supino-inclinado', // imagem de banco reto (Bench-press-1)
  'desenvolvimento-arnold', // reutiliza GIF do desenvolvimento comum
  'aquecimento-leve', // walking lunges
  'desaquecimento', // walking lunges
  'puxada-neutra', // mídia corresponde a pull-up, não puxada neutra
])

/**
 * Mapa de validação por exercício.
 * expectedMediaKeywords: palavras aceitas na URL/query
 * invalidKeywords: se aparecerem na URL, rejeitar mídia
 */
export const exerciseMediaMap = {
  'supino-reto': {
    expectedNames: ['Supino reto'],
    expectedMediaKeywords: ['bench-press', 'bench', '3TZduzM', 'supino'],
    muscleGroup: 'Peitoral',
    equipment: ['Barra', 'Halteres', 'Máquina'],
    invalidKeywords: ['fly', 'crucifixo', 'squat', 'row', 'pulldown', 'curl', 'incline'],
  },
  'supino-inclinado': {
    expectedNames: ['Supino inclinado'],
    expectedMediaKeywords: ['incline', 'inclinado'],
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
    expectedMediaKeywords: ['row', 'seated', 'c8oybX6', 'cable'],
    muscleGroup: 'Costas',
    equipment: ['Cabo'],
    invalidKeywords: ['pulldown', 'lat-pulldown', 'puxada'],
  },
  'puxada-frontal': {
    expectedNames: ['Puxada frontal'],
    expectedMediaKeywords: ['pulldown', 'lat', '1971'],
    muscleGroup: 'Costas',
    equipment: ['Cabo'],
    invalidKeywords: ['row', 'remada', 'c8oybX6'],
  },
  'rosca-direta': {
    expectedNames: ['Rosca direta'],
    expectedMediaKeywords: ['curl', '25GPyDY', 'barbell'],
    muscleGroup: 'Bíceps',
    equipment: ['Barra'],
    invalidKeywords: ['tricep', 'pushdown', 'extens'],
  },
  'rosca-alternada': {
    expectedNames: ['Rosca alternada'],
    expectedMediaKeywords: ['curl', '0IgNjSM', 'alternate'],
    muscleGroup: 'Bíceps',
    equipment: ['Halteres'],
    invalidKeywords: ['barbell', 'tricep'],
  },
  'triceps-pulley': {
    expectedNames: ['Tríceps na polia'],
    expectedMediaKeywords: ['tricep', 'pushdown', '3ZflifB', 'rope'],
    muscleGroup: 'Tríceps',
    equipment: ['Cabo'],
    invalidKeywords: ['curl', 'bicep', 'rosca'],
  },
  desenvolvimento: {
    expectedNames: ['Desenvolvimento com halteres'],
    expectedMediaKeywords: ['shoulder-press', 'press', 'znQUdHY'],
    muscleGroup: 'Ombros',
    equipment: ['Halteres'],
    invalidKeywords: ['lateral-raise', 'cALkHHX', 'fly'],
  },
  'elevacao-lateral': {
    expectedNames: ['Elevação lateral'],
    expectedMediaKeywords: ['lateral', 'cALkHHX', 'raise'],
    muscleGroup: 'Ombros',
    equipment: ['Halteres'],
    invalidKeywords: ['press', 'znQUdHY', 'arnold'],
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
    exercise: 'Supino inclinado',
    issue: 'Mídia atual parece banco reto (Bench-press-1.png), não inclinado',
    action: 'Substituir mídia por demonstração de supino inclinado',
  },
  {
    exercise: 'Desenvolvimento Arnold',
    issue: 'Usa o mesmo GIF do desenvolvimento comum',
    action: 'Cadastrar mídia específica de Arnold press',
  },
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
    exercise: 'Puxada neutra',
    issue: 'Query/mídia associada a pull-up, não puxada neutra na polia',
    action: 'Substituir por GIF de lat pulldown pegada neutra',
  },
  {
    exercise: 'Rosca direta',
    issue: 'Equipamento cadastrado como Halteres, mídia é barra',
    action: 'Alinhar equipamento para Barra (corrigido no código local)',
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
  Quadríceps: 'Pernas',
  Posterior: 'Pernas',
  Pernas: 'Pernas',
  Glúteos: 'Glúteos',
  Abdômen: 'Abdômen',
  Oblíquos: 'Abdômen',
  Core: 'Abdômen',
  Lombar: 'Abdômen',
  Cardiovascular: 'Cardio',
  Cardio: 'Cardio',
  'Corpo inteiro': 'Funcional',
  Funcional: 'Funcional',
  Coluna: 'Mobilidade',
  Quadril: 'Mobilidade',
  Mobilidade: 'Mobilidade',
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
