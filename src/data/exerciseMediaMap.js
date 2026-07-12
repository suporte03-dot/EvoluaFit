/**
 * Mapa centralizado exercício → mídia demonstrativa.
 * Prioridade: GIF/image URL (exerciseGifMap) → fallback por grupo muscular.
 */
import { getExerciseGifUrl } from './exerciseGifMap.js'

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
  'rosca-alternada': 'hammer-curl',
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
  Peito: 'peito',
  Costas: 'costas',
  Ombros: 'ombros',
  'Bíceps': 'biceps',
  'Tríceps': 'triceps',
  'Quadríceps': 'pernas',
  Posterior: 'pernas',
  'Glúteos': 'pernas',
  'Abdômen': 'abdomen',
  'Corpo inteiro': 'cardio',
  Cardiovascular: 'cardio',
  Coluna: 'mobilidade',
  Quadril: 'mobilidade',
  'Oblíquos': 'abdomen',
  Lombar: 'abdomen',
  Core: 'abdomen',
}

/** Chips de categoria estilo Gif do Treino */
export const GDT_CATEGORY_CHIPS = [
  { id: 'Todos', label: 'Todos' },
  { id: 'Peito', label: 'Peitoral' },
  { id: 'Costas', label: 'Costas' },
  { id: 'Pernas', label: 'Pernas', categories: ['Quadríceps', 'Posterior', 'Glúteos'] },
  { id: 'Ombros', label: 'Ombros' },
  { id: 'Bíceps', label: 'Bíceps' },
  { id: 'Tríceps', label: 'Tríceps' },
  { id: 'Abdômen', label: 'Abdômen', categories: ['Abdômen', 'Oblíquos', 'Core', 'Lombar'] },
  { id: 'Cardio', label: 'Cardio', categories: ['Cardiovascular', 'Corpo inteiro'] },
  { id: 'Mobilidade', label: 'Mobilidade', categories: ['Coluna', 'Quadril'] },
]

export function getFallbackKey(category, type) {
  if (type === 'Cardio') return 'cardio'
  if (type === 'Mobilidade') return 'mobilidade'
  if (type === 'Funcional') return 'funcional'
  return MUSCLE_FALLBACK_KEYS[category] || 'funcional'
}

export function getFallbackMediaPath(key, base = import.meta.env.BASE_URL) {
  return `${base}media/exercises/fallbacks/${key}.svg`
}

export function matchesGdtChip(chipId, category) {
  if (chipId === 'Todos') return true
  const chip = GDT_CATEGORY_CHIPS.find((c) => c.id === chipId)
  if (!chip) return category === chipId
  if (chip.categories) return chip.categories.includes(category)
  return category === chipId
}

export function resolveExerciseMedia(id, category, type, base = import.meta.env.BASE_URL) {
  const fallbackKey = getFallbackKey(category, type)
  const fallbackImage = getFallbackMediaPath(fallbackKey, base)
  const remoteUrl = getExerciseGifUrl(id)
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
