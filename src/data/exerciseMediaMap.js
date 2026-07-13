/**
 * Mapa centralizado exercício → mídia demonstrativa.
 * Prioridade: URL validada (exerciseGifMap) → fallback por grupo muscular.
 * Nunca exibe mídia incoerente com o exercício.
 */
import { getExerciseGifUrl } from './exerciseGifMap.js'
import {
  getValidatedMediaUrl,
  normalizeMuscleGroup,
  logMediaIssuesOnce,
} from './exerciseValidationMap.js'

export const EXERCISE_POSE_MAP = {
  'supino-reto': 'bench-flat',
  'supino-inclinado': 'bench-incline',
  crucifixo: 'fly',
  'crucifixo-inclinado': 'fly',
  'crucifixo-cabo': 'cable-fly',
  flexao: 'pushup',
  desenvolvimento: 'shoulder-press',
  'desenvolvimento-arnold': 'shoulder-press',
  'elevacao-lateral': 'lateral-raise',
  'elevacao-frontal-lateral': 'lateral-raise',
  'triceps-pulley': 'tricep-rope',
  'remada-curvada': 'barbell-row',
  'puxada-frontal': 'lat-pulldown',
  'puxada-triangulo': 'lat-pulldown',
  'puxada-neutra': 'lat-pulldown',
  'remada-unilateral': 'dumbbell-row',
  'remada-baixa-cabo': 'cable-row',
  'rosca-direta': 'barbell-curl',
  'rosca-martelo': 'hammer-curl',
  'rosca-alternada': 'alternating-curl',
  'face-pull': 'face-pull',
  agachamento: 'squat',
  'agachamento-frontal': 'squat',
  'agachamento-goblet': 'goblet-squat',
  'leg-press': 'leg-press',
  'cadeira-extensora': 'leg-extension',
  stiff: 'deadlift',
  'cadeira-flexora': 'leg-curl',
  afundo: 'lunge',
  'passada-lateral': 'lunge',
  'hip-thrust': 'hip-thrust',
  'ponte-gluteos': 'hip-thrust',
  panturrilha: 'calf',
  'levantamento-terra-halteres': 'deadlift',
  prancha: 'plank',
  'prancha-lateral': 'side-plank',
  'abdominal-bicicleta': 'crunch',
  'abdominal-infra': 'leg-raise',
  'dead-bug': 'dead-bug',
  'bird-dog': 'bird-dog',
  'pallof-press': 'pallof-press',
  burpee: 'burpee',
  'kettlebell-swing': 'kettlebell',
  'farmer-walk': 'farmer-walk',
  'step-up': 'step-up',
  'battle-rope': 'battle-rope',
  'aquecimento-leve': 'warmup',
  'esteira-moderada': 'treadmill',
  'bicicleta-leve': 'cycling',
  desaquecimento: 'stretch',
  'rotacao-toracica': 'stretch',
  'alongamento-quadriceps': 'stretch',
  'mobilidade-quadril-90': 'hip-mobility',
  'alongamento-ombro': 'stretch',
  'gato-vaca': 'cat-cow',
}

export const MUSCLE_FALLBACK_KEYS = {
  Peitoral: 'peito',
  Peito: 'peito',
  Costas: 'costas',
  Ombros: 'ombros',
  Bíceps: 'biceps',
  Tríceps: 'triceps',
  Pernas: 'pernas',
  Quadríceps: 'pernas',
  Posterior: 'pernas',
  Glúteos: 'pernas',
  Abdômen: 'abdomen',
  Oblíquos: 'abdomen',
  Core: 'abdomen',
  Lombar: 'abdomen',
  Cardio: 'cardio',
  Cardiovascular: 'cardio',
  Funcional: 'funcional',
  'Corpo inteiro': 'funcional',
  Mobilidade: 'mobilidade',
  Coluna: 'mobilidade',
  Quadril: 'mobilidade',
}

/** Chips padronizados da biblioteca EvoluaFit */
export const GDT_CATEGORY_CHIPS = [
  { id: 'Todos', label: 'Todos' },
  { id: 'Peitoral', label: 'Peitoral', categories: ['Peitoral', 'Peito'] },
  { id: 'Costas', label: 'Costas' },
  { id: 'Pernas', label: 'Pernas', categories: ['Pernas', 'Quadríceps', 'Posterior'] },
  { id: 'Glúteos', label: 'Glúteos' },
  { id: 'Ombros', label: 'Ombros' },
  { id: 'Bíceps', label: 'Bíceps' },
  { id: 'Tríceps', label: 'Tríceps' },
  { id: 'Abdômen', label: 'Abdômen', categories: ['Abdômen', 'Oblíquos', 'Core', 'Lombar'] },
  { id: 'Cardio', label: 'Cardio', categories: ['Cardio', 'Cardiovascular'] },
  { id: 'Mobilidade', label: 'Mobilidade', categories: ['Mobilidade', 'Coluna', 'Quadril'] },
]

export function getFallbackKey(category, type) {
  if (type === 'Cardio') return 'cardio'
  if (type === 'Mobilidade') return 'mobilidade'
  if (type === 'Funcional') return 'funcional'
  const normalized = normalizeMuscleGroup(category)
  return MUSCLE_FALLBACK_KEYS[category] || MUSCLE_FALLBACK_KEYS[normalized] || 'funcional'
}

export function getFallbackMediaPath(key, base) {
  const root = base ?? (typeof import.meta !== 'undefined' && import.meta.env?.BASE_URL) ?? '/'
  return `${root}media/exercises/fallbacks/${key}.svg`
}

export function matchesGdtChip(chipId, category) {
  if (chipId === 'Todos') return true
  const chip = GDT_CATEGORY_CHIPS.find((c) => c.id === chipId)
  if (!chip) return normalizeMuscleGroup(category) === chipId
  if (chip.categories) {
    return chip.categories.includes(category) || chip.categories.includes(normalizeMuscleGroup(category))
  }
  return category === chipId || normalizeMuscleGroup(category) === chipId
}

export function muscleGroupLabel(category) {
  const normalized = normalizeMuscleGroup(category)
  const chip = GDT_CATEGORY_CHIPS.find(
    (c) => c.id === normalized || c.categories?.includes(category) || c.categories?.includes(normalized),
  )
  return chip?.label || normalized || category
}

/**
 * Resolve mídia segura. Se inválida/suspeita → fallback + mediaPending.
 */
export function resolveExerciseMedia(id, category, type, base) {
  logMediaIssuesOnce()

  const root = base ?? (typeof import.meta !== 'undefined' && import.meta.env?.BASE_URL) ?? '/'
  const fallbackKey = getFallbackKey(category, type)
  const fallbackImage = getFallbackMediaPath(fallbackKey, root)
  const remoteCandidate = getExerciseGifUrl(id)
  const remoteUrl = getValidatedMediaUrl(id, remoteCandidate)
  const mediaPending = !remoteUrl
  const isGif = remoteUrl?.endsWith('.gif')

  return {
    mediaType: remoteUrl ? (isGif ? 'gif' : 'image') : 'image',
    mediaUrl: remoteUrl || fallbackImage,
    image: remoteUrl && !isGif ? remoteUrl : null,
    gif: remoteUrl && isGif ? remoteUrl : null,
    thumbnail: remoteUrl || fallbackImage,
    fallbackImage,
    fallbackSvg: fallbackImage,
    poseKey: EXERCISE_POSE_MAP[id] || fallbackKey,
    mediaPending,
    hasVerifiedMedia: Boolean(remoteUrl),
  }
}

export const MUSCLE_FALLBACK_MEDIA_MAP = {
  peito: 'media/exercises/fallbacks/peito.svg',
  costas: 'media/exercises/fallbacks/costas.svg',
  pernas: 'media/exercises/fallbacks/pernas.svg',
  ombros: 'media/exercises/fallbacks/ombros.svg',
  biceps: 'media/exercises/fallbacks/biceps.svg',
  triceps: 'media/exercises/fallbacks/triceps.svg',
  bracos: 'media/exercises/fallbacks/bracos.svg',
  abdomen: 'media/exercises/fallbacks/abdomen.svg',
  cardio: 'media/exercises/fallbacks/cardio.svg',
  mobilidade: 'media/exercises/fallbacks/mobilidade.svg',
  funcional: 'media/exercises/fallbacks/funcional.svg',
}
