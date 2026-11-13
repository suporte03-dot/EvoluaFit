/**
 * Mapa centralizado exercício → mídia demonstrativa.
 * Prioridade: URL validada (exerciseGifMap) → fallback por grupo muscular.
 * Nunca exibe mídia incoerente com o exercício.
 */
import { getExerciseGifUrl } from './exerciseGifMap.js'
import { getPeitoLocalMediaUrl } from './peitoLocalMedia.js'
import { getCostasLocalMediaUrl } from './costasLocalMedia.js'
import { getBicepsLocalMediaUrl } from './bicepsLocalMedia.js'
import { getTricepsLocalMediaUrl } from './tricepsLocalMedia.js'
import { getAntebracoLocalMediaUrl } from './antebracoLocalMedia.js'
import { getOmbrosLocalMediaUrl } from './ombrosLocalMedia.js'
import { getLombarLocalMediaUrl } from './lombarLocalMedia.js'
import { getPernasLocalMediaUrl } from './pernasLocalMedia.js'
import { getTrapezioLocalMediaUrl } from './trapezioLocalMedia.js'
import {
  getValidatedMediaUrl,
  normalizeMuscleGroup,
  logMediaIssuesOnce,
} from './exerciseValidationMap.js'
import { resolveSafeMediaUrl } from '../utils/exerciseValidation.js'

export const EXERCISE_POSE_MAP = {
  'supino-reto': 'bench-flat',
  'supino-com-halteres': 'bench-flat',
  'supino-inclinado': 'bench-incline',
  'supino-inclinado-com-barra': 'bench-incline',
  'supino-inclinado-com-halteres': 'bench-incline',
  'supino-inclinado-na-maquina': 'bench-incline',
  'supino-inclinado-na-alavanca': 'bench-incline',
  'supino-inclinado-com-cabo': 'bench-incline',
  'supino-inclinado-com-halteres-em-martelo': 'bench-incline',
  'supino-inclinado-com-pegada-fechada': 'bench-incline',
  'supino-com-banco-inclinado-no-smith': 'bench-incline',
  'supino-declinado-com-halteres': 'bench-flat',
  'supino-com-barra-declinado': 'bench-flat',
  'supino-declinado-na-maquina': 'bench-flat',
  'supino-declinado-na-maquina-smith': 'bench-flat',
  'supino-declinada-com-alavanca': 'bench-flat',
  'supino-declinado-pegada-martelo': 'bench-flat',
  'supino-reto-na-maquina': 'bench-flat',
  'supino-na-maquina': 'bench-flat',
  'supino-com-alavanca': 'bench-flat',
  'supino-na-maquina-smith': 'bench-flat',
  'supino-na-maquina-para-miolo-do-peitoral': 'bench-flat',
  'supino-com-pegada-fechada': 'bench-flat',
  'supino-fechado': 'bench-flat',
  'supino-com-pegada-aberta': 'bench-flat',
  'supino-pegada-martelo': 'bench-flat',
  'supino-com-halteres-com-pegada-fechada': 'bench-flat',
  'supino-alternado-com-halteres': 'bench-flat',
  'supino-unilateral-no-cabo': 'cable-fly',
  'supino-reto-em-pe-no-cross-over': 'cable-fly',
  'supino-com-cabo-sentado': 'cable-fly',
  'supino-com-pegada-fechada-sentado-com-cabo': 'cable-fly',
  'supino-unilateral-com-alavanca': 'bench-flat',
  'supino-em-pe-com-faixa-elastica': 'bench-flat',
  'supino-com-barra-no-chao': 'bench-flat',
  'supino-com-kettlebell-no-chao': 'bench-flat',
  'supino-com-kettlebell-de-um-braco': 'bench-flat',
  'supino-invertido-com-pegada-aberta': 'bench-flat',
  'supino-invertido-com-pegada-fechada': 'bench-flat',
  'supino-com-halteres-pegada-invertida': 'bench-flat',
  'supino-no-smith-com-triangulo': 'bench-flat',
  crucifixo: 'fly',
  'crucifixo-inclinado': 'fly',
  'crucifixo-cabo': 'cable-fly',
  flexao: 'pushup',
  desenvolvimento: 'shoulder-press',
  'desenvolvimento-arnold': 'shoulder-press',
  'desenvolvimento-banco-halteres': 'shoulder-press',
  'desenvolvimento-alternada-em-pe': 'shoulder-press',
  'desenvolvimento-unilateral-halter': 'shoulder-press',
  'desenvolvimento-barra-sentado': 'shoulder-press',
  'desenvolvimento-halteres-z': 'shoulder-press',
  'desenvolvimento-deitado': 'shoulder-press',
  'desenvolvimento-maquina': 'shoulder-press',
  'desenvolvimento-maquina-martelo': 'shoulder-press',
  'desenvolvimento-maquina-reversa': 'shoulder-press',
  'desenvolvimento-cabo': 'shoulder-press',
  'desenvolvimento-cabo-ajoelhado': 'face-pull',
  'desenvolvimento-rotacao-alternada': 'shoulder-press',
  'desenvolvimento-arnold-completo': 'shoulder-press',
  'desenvolvimento-arnold-metade': 'shoulder-press',
  'desenvolvimento-arnold-um-braco': 'shoulder-press',
  'desenvolvimento-cubano': 'shoulder-press',
  'desenvolvimento-cubano-sentado': 'shoulder-press',
  'crucifixo-inverso-cabo': 'face-pull',
  'circulos-braco-pesos': 'lateral-raise',
  'elevacao-lateral': 'lateral-raise',
  'elevacao-frontal-lateral': 'lateral-raise',
  'face-pull': 'face-pull',
  'remada-curvada': 'barbell-row',
  'triceps-cabos-cruzados': 'tricep-rope',
  'triceps-pegada-invertida': 'tricep-rope',
  'triceps-lateral-cabo': 'tricep-rope',
  'triceps-cabo-horizontal': 'tricep-rope',
  'triceps-cabo-inclinado': 'tricep-rope',
  'triceps-cabo-ajoelhado': 'tricep-rope',
  'triceps-cabo-posicao-ajoelhada': 'tricep-rope',
  'triceps-concentrada-cabo-joelho': 'tricep-rope',
  'triceps-pulley-sobre-cabeca': 'tricep-rope',
  'triceps-invertida-unilateral': 'tricep-rope',
  'triceps-deitado-corda': 'tricep-rope',
  'triceps-haltere-unilateral-sentado': 'tricep-rope',
  'triceps-um-braco': 'tricep-rope',
  'triceps-haltere-pronacao': 'tricep-rope',
  'triceps-barra-em-pe': 'tricep-rope',
  'triceps-barra-atras-cabeca': 'tricep-rope',
  'triceps-barra-w-inclinada': 'tricep-rope',
  'triceps-deitado-barra': 'tricep-rope',
  'triceps-deitado-barra-w': 'tricep-rope',
  'triceps-testa-declinado': 'tricep-rope',
  'rosca-punho-barra': 'hammer-curl',
  'rosca-punho-barra-atras': 'hammer-curl',
  'rosca-punho-reversa-barra': 'hammer-curl',
  'flexao-punho-reversa-banco': 'hammer-curl',
  'flexao-punho-halteres': 'hammer-curl',
  'flexao-pulso-neutra-halteres': 'hammer-curl',
  'rosca-punho-anilhas': 'hammer-curl',
  'flexao-punho-reversa-anilha': 'hammer-curl',
  'rosca-dedos-halteres': 'hammer-curl',
  'rosca-dedo-barra': 'hammer-curl',
  'rosca-inversa-barra': 'hammer-curl',
  'flexao-punho-cabo-chao': 'hammer-curl',
  'hand-grip': 'hammer-curl',
  'rolinho-antebraco': 'hammer-curl',
  'remada-curvada': 'barbell-row',
  'remada-curvada-com-barra': 'barbell-row',
  'remada-curvada-com-pegada-invertida': 'barbell-row',
  'remada-curvada-em-t': 'barbell-row',
  'remada-curvada-inclinada-com-barra': 'barbell-row',
  'remada-curvada-no-smith': 'barbell-row',
  'remada-inclinada-com-cabo': 'cable-row',
  'remada-inclinada-no-banco-com-cabo': 'cable-row',
  'remada-inclinada-pegada-neutra': 'dumbbell-row',
  'remada-inclinada-pegada-reversa': 'dumbbell-row',
  'remada-invertida': 'barbell-row',
  'remada-baixa': 'cable-row',
  'remada-baixa-cabo': 'cable-row',
  'remada-baixa-no-cabo': 'cable-row',
  'remada-sentada-com-anilhas': 'cable-row',
  'remada-unilateral': 'dumbbell-row',
  'puxada-frontal': 'lat-pulldown',
  'puxada-triangulo': 'lat-pulldown',
  'puxada-neutra': 'lat-pulldown',
  'puxada-alta': 'lat-pulldown',
  'puxada-alta-com-alavanca': 'lat-pulldown',
  'puxada-alta-com-triangulo': 'lat-pulldown',
  'puxada-alta-com-um-joelho-apoiado': 'lat-pulldown',
  'puxada-alta-invertida': 'lat-pulldown',
  'puxada-alta-na-maquina-nuca': 'lat-pulldown',
  'puxada-alta-na-polia-nuca': 'lat-pulldown',
  'puxada-alta-neutra-cabos-duplos': 'lat-pulldown',
  'puxada-alta-unilateral-ajoelhada': 'lat-pulldown',
  'puxada-com-triangulo': 'lat-pulldown',
  'puxada-com-um-braco-cabo': 'lat-pulldown',
  'puxada-com-um-braco-peso-adicional': 'lat-pulldown',
  'puxada-em-pe-com-torsao': 'lat-pulldown',
  'puxada-polia-pegada-fechada': 'lat-pulldown',
  'pulldown-com-corda': 'lat-pulldown',
  'pulldown-inclinado-com-corda': 'lat-pulldown',
  'pulldown-unilateral-no-cabo': 'lat-pulldown',
  'pullover-com-barra': 'lat-pulldown',
  'pullover-com-barra-declinado': 'lat-pulldown',
  'pullover-barra-w-invertida': 'lat-pulldown',
  'pullover-com-cabo': 'lat-pulldown',
  'pullover-com-cabo-sentado': 'lat-pulldown',
  'barra-fixa': 'lat-pulldown',
  'pull-up': 'lat-pulldown',
  'barra-fixa-assistida': 'lat-pulldown',
  'levantamento-terra': 'deadlift',
  'levantamento-terra-romeno': 'deadlift',
  stiff: 'deadlift',
  'rosca-direta': 'barbell-curl',
  'rosca-direta-com-barra': 'barbell-curl',
  'rosca-com-barra': 'barbell-curl',
  'rosca-direta-pegada-fechada': 'barbell-curl',
  'rosca-direta-barra-w-fechada': 'barbell-curl',
  'rosca-direta-colete-scott': 'barbell-curl',
  'rosca-direta-deitada-banco': 'barbell-curl',
  'rosca-direta-cabo-deitado': 'barbell-curl',
  'rosca-martelo': 'hammer-curl',
  'rosca-alternada': 'alternating-curl',
  'rosca-alternada-com-barra': 'alternating-curl',
  'rosca-alternada-halteres-sentado': 'alternating-curl',
  'rosca-biceps-com-halteres': 'alternating-curl',
  'rosca-biceps-sentado': 'alternating-curl',
  'rosca-biceps-unilateral': 'alternating-curl',
  'rosca-biceps-alta-halteres': 'alternating-curl',
  'rosca-banco-inclinado': 'alternating-curl',
  'rosca-inclinada-halteres': 'alternating-curl',
  'rosca-inclinada-cabos': 'barbell-curl',
  'rosca-bilateral-cabo-inclinado': 'barbell-curl',
  'rosca-com-polia-alta': 'barbell-curl',
  'rosca-unilateral-cabo': 'alternating-curl',
  'rosca-cabo-um-braco': 'alternating-curl',
  'rosca-unilateral-cabo-alto': 'alternating-curl',
  'rosca-unilateral-cabo-invertida': 'alternating-curl',
  'rosca-cabo-ajoelhado': 'barbell-curl',
  'rosca-scott-barra-w': 'barbell-curl',
  'rosca-scott-alavanca': 'barbell-curl',
  'rosca-scott-halteres-martelo': 'hammer-curl',
  'rosca-concentrada-sentado': 'barbell-curl',
  'rosca-inversa-halteres': 'hammer-curl',
  'rosca-zottman': 'hammer-curl',
  'rosca-maquina': 'barbell-curl',
  'face-pull': 'face-pull',
  'face-pull-joelhos': 'face-pull',
  'face-pull-cabo-cruzado': 'face-pull',
  'face-pull-meio-agachado': 'face-pull',
  'encolhimento-halteres': 'shrug',
  'encolhimento-barra': 'shrug',
  'encolhimento-barra-atras': 'shrug',
  'encolhimento-cabo': 'shrug',
  'encolhimento-alavanca': 'shrug',
  'encolhimento-maquina': 'shrug',
  'encolhimento-smith': 'shrug',
  'encolhimento-halteres-declive': 'shrug',
  'encolhimento-gittleson': 'shrug',
  'encolhimento-acima-cabeca': 'shrug',
  'encolhimento-inclinado-pronado': 'shrug',
  'remada-alta-cabo': 'upright-row',
  'remada-alta-halter': 'upright-row',
  'remada-alta-halteres-unilateral': 'upright-row',
  'remada-alta-barra-w': 'upright-row',
  'remada-alta-barra': 'upright-row',
  'remada-y-cabo': 'face-pull',
  'remada-inclinada-45-trapezio': 'barbell-row',
  'remada-invertida-cabo-inclinado': 'face-pull',
  'remada-invertida-halteres-inclinado': 'face-pull',
  'voador-deltoide-posterior-cabo': 'face-pull',
  'voador-deltoide-posterior-maquina': 'face-pull',
  'elevacao-y-halteres-inclinado': 'face-pull',
  'elevacao-deltoide-posterior-inclinado': 'face-pull',
  'elevacao-t-halteres-inclinada': 'face-pull',
  'elevacao-lateral-tronco-inclinado': 'face-pull',
  'dumbbell-raise-trapezio': 'face-pull',
  'dips-escapula': 'dip',
  agachamento: 'squat',
  'agachamento-frontal': 'squat',
  'agachamento-goblet': 'goblet-squat',
  'agachamento-barra': 'squat',
  'agachamento-no-smith': 'squat',
  'agachamento-no-landmine': 'goblet-squat',
  'agachamento-maquina-hack': 'leg-press',
  'agachamento-hack-barra': 'squat',
  'agachamento-hack-invertido': 'leg-press',
  'agachamento-com-trava': 'squat',
  'agachamento-kettlebell': 'goblet-squat',
  'agachamento-goblet-haltere': 'goblet-squat',
  'agachamento-sumo-halteres': 'goblet-squat',
  'agachamento-sissy': 'squat',
  'agachamento-zercher': 'squat',
  'agachamento-jefferson': 'squat',
  'agachamento-halteres-banco': 'goblet-squat',
  'agachamento-salto-halteres': 'squat',
  'agachamento-pliometrico-halteres': 'squat',
  'agachamento-unilateral-cruzado-barra': 'lunge',
  'agachamento-unilateral-cruzado-haltere': 'lunge',
  'agachamento-bulgaro-barra': 'lunge',
  'agachamento-bulgaro-halteres': 'lunge',
  'agachamento-frontal-barra-banco': 'squat',
  'agachamento-frontal-barra-smith': 'squat',
  'agachamento-frontal-cabo': 'goblet-squat',
  'agachamento-frontal-polia': 'goblet-squat',
  'agachamento-frontal-kettlebell': 'goblet-squat',
  'leg-press': 'leg-press',
  'cadeira-extensora': 'leg-extension',
  'cadeira-flexora': 'leg-curl',
  afundo: 'lunge',
  'afundo-halteres': 'lunge',
  'afundo-barra': 'lunge',
  'afundo-landmine': 'lunge',
  'afundo-lateral-barra': 'lunge',
  'afundo-smith': 'lunge',
  'afundo-banco-halteres': 'lunge',
  'avanco-halteres': 'lunge',
  'avanco-barra': 'lunge',
  'avanco-cabo': 'lunge',
  'avanco-invertido': 'lunge',
  'avanco-invertido-halteres': 'lunge',
  'passada-lateral': 'lunge',
  'aducao-quadril-cabo': 'lunge',
  'aducao-quadril-alavanca': 'lunge',
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
  superman: 'bird-dog',
  'hiperextensao-chao': 'bird-dog',
  hiperextensao: 'bird-dog',
  'extensao-lombar-peso': 'bird-dog',
  'hiperextensao-torcao': 'bird-dog',
  'hiperextensao-banco-plano': 'bird-dog',
  'hiperextensao-sapo': 'bird-dog',
  'extensao-lombar-sentada': 'bird-dog',
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
  Trapézio: 'costas',
  Ombros: 'ombros',
  Bíceps: 'biceps',
  Tríceps: 'triceps',
  Antebraço: 'bracos',
  Pernas: 'pernas',
  Quadríceps: 'pernas',
  Posterior: 'pernas',
  Glúteos: 'pernas',
  Panturrilha: 'pernas',
  Abdômen: 'abdomen',
  Oblíquos: 'abdomen',
  Core: 'abdomen',
  Lombar: 'abdomen',
  Cardio: 'cardio',
  Cardiovascular: 'cardio',
  Funcional: 'funcional',
  'Corpo inteiro': 'funcional',
  Mobilidade: 'mobilidade',
  Alongamento: 'mobilidade',
  Coluna: 'mobilidade',
  Quadril: 'mobilidade',
}

/**
 * Filtros da biblioteca EvoluaFit, organizados por seção.
 * Cada chip filtra exatamente o grupo (exceto "Todos").
 */
export const GDT_FILTER_GROUPS = [
  {
    id: 'principais',
    label: 'Grupos principais',
    chips: [
      { id: 'Todos', label: 'Todos' },
      { id: 'Peitoral', label: 'Peitoral' },
      { id: 'Costas', label: 'Costas' },
      { id: 'Pernas', label: 'Pernas' },
      { id: 'Glúteos', label: 'Glúteos' },
      { id: 'Ombros', label: 'Ombros' },
      { id: 'Bíceps', label: 'Bíceps' },
      { id: 'Tríceps', label: 'Tríceps' },
    ],
  },
  {
    id: 'complementares',
    label: 'Complementares',
    chips: [
      { id: 'Antebraço', label: 'Antebraço' },
      { id: 'Trapézio', label: 'Trapézio' },
      { id: 'Lombar', label: 'Lombar' },
      { id: 'Abdômen', label: 'Abdômen' },
      { id: 'Panturrilha', label: 'Panturrilha' },
    ],
  },
  {
    id: 'condicionamento',
    label: 'Condicionamento',
    chips: [
      { id: 'Cardio', label: 'Cardio' },
      { id: 'Mobilidade', label: 'Mobilidade' },
      { id: 'Funcional', label: 'Funcional' },
      { id: 'Alongamento', label: 'Alongamento' },
    ],
  },
]

/** Lista plana de chips (compatibilidade) */
export const GDT_CATEGORY_CHIPS = GDT_FILTER_GROUPS.flatMap((group) => group.chips)

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
  const normalized = normalizeMuscleGroup(category)
  return normalized === chipId || category === chipId
}

export function muscleGroupLabel(category) {
  const normalized = normalizeMuscleGroup(category)
  const chip = GDT_CATEGORY_CHIPS.find((c) => c.id === normalized)
  return chip?.label || normalized || category
}

export function countExercisesByChip(exercises, chipId) {
  if (chipId === 'Todos') return exercises.length
  return exercises.filter((ex) => matchesGdtChip(chipId, ex.category || ex.muscleGroup)).length
}

/**
 * Resolve mídia segura. Se inválida/suspeita → fallback + mediaPending.
 * Nunca retorna mídia incoerente com o exercício/grupo.
 */
export function resolveExerciseMedia(id, category, type, base) {
  logMediaIssuesOnce()

  const root = base ?? (typeof import.meta !== 'undefined' && import.meta.env?.BASE_URL) ?? '/'
  const group = normalizeMuscleGroup(category)
  const fallbackKey = getFallbackKey(category, type)
  const fallbackImage = getFallbackMediaPath(fallbackKey, root)
  const localCandidate =
    getPeitoLocalMediaUrl(id, root) ||
    getCostasLocalMediaUrl(id, root) ||
    getBicepsLocalMediaUrl(id, root) ||
    getTricepsLocalMediaUrl(id, root) ||
    getAntebracoLocalMediaUrl(id, root) ||
    getOmbrosLocalMediaUrl(id, root) ||
    getLombarLocalMediaUrl(id, root) ||
    getPernasLocalMediaUrl(id, root) ||
    getTrapezioLocalMediaUrl(id, root)

  const localUrl = resolveSafeMediaUrl(id, localCandidate, group)

  if (localUrl) {
    return {
      mediaType: 'image',
      mediaUrl: localUrl,
      image: localUrl,
      gif: null,
      thumbnail: localUrl,
      fallbackImage,
      fallbackSvg: fallbackImage,
      poseKey: EXERCISE_POSE_MAP[id] || fallbackKey,
      mediaPending: false,
      hasVerifiedMedia: true,
    }
  }

  // Candidato local existia mas falhou coerência → pendente (usa fallback do grupo)
  if (localCandidate && !localUrl) {
    return {
      mediaType: 'image',
      mediaUrl: fallbackImage,
      image: null,
      gif: null,
      thumbnail: fallbackImage,
      fallbackImage,
      fallbackSvg: fallbackImage,
      poseKey: EXERCISE_POSE_MAP[id] || fallbackKey,
      mediaPending: true,
      hasVerifiedMedia: false,
    }
  }

  const remoteCandidate = getExerciseGifUrl(id)
  const remoteUrl = resolveSafeMediaUrl(id, remoteCandidate, group) || getValidatedMediaUrl(id, remoteCandidate)
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
