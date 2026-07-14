/**
 * Validação de coerência exercício ↔ mídia ↔ grupo muscular.
 * Usado pela biblioteca, pelo resolve de mídia e pelo mapeamento Supabase.
 */
import {
  MEDIA_BLOCKLIST,
  exerciseMediaMap as VALIDATION_RULES,
  normalizeMuscleGroup,
  getValidatedMediaUrl,
  isMediaCoherent as baseIsMediaCoherent,
  logMediaIssuesOnce,
} from '../data/exerciseValidationMap.js'

export {
  MEDIA_BLOCKLIST,
  normalizeMuscleGroup,
  getValidatedMediaUrl,
  logMediaIssuesOnce,
}

export const OFFICIAL_MUSCLE_GROUPS = {
  principais: ['Peitoral', 'Costas', 'Pernas', 'Glúteos', 'Ombros', 'Bíceps', 'Tríceps'],
  complementares: ['Antebraço', 'Trapézio', 'Lombar', 'Abdômen', 'Panturrilha'],
  condicionamento: ['Cardio', 'Mobilidade', 'Funcional', 'Alongamento'],
}

/** Tokens de pasta/URL esperados por grupo */
const GROUP_PATH_TOKENS = {
  Peitoral: ['peito', 'peitoral', 'chest', 'bench', 'fly', 'push-up', 'flexao'],
  Costas: ['costas', 'back', 'row', 'pulldown', 'puxada', 'remada'],
  Pernas: ['pernas', 'leg', 'squat', 'agachamento', 'lunge', 'extensor', 'flexor'],
  Glúteos: ['glute', 'hip-thrust', 'ponte', 'gluteos'],
  Ombros: ['ombro', 'ombros', 'shoulder', 'lateral', 'raise', 'desenvolvimento'],
  Bíceps: ['biceps', 'bíceps', 'curl', 'rosca'],
  Tríceps: ['triceps', 'tríceps', 'pushdown', 'extensao', 'corda'],
  Antebraço: ['antebraco', 'forearm', 'punho', 'grip'],
  Trapézio: ['trapezio', 'shrug', 'face-pull', 'encolh'],
  Lombar: ['lombar', 'hyperextension', 'hiperextensao', 'superman'],
  Abdômen: ['abdomen', 'abdômen', 'core', 'plank', 'crunch', 'prancha'],
  Panturrilha: ['panturrilha', 'calf'],
  Cardio: ['cardio', 'treadmill', 'bike', 'run', 'walk', 'esteira'],
  Mobilidade: ['mobilidade', 'mobility', 'stretch', 'hip'],
  Funcional: ['funcional', 'functional', 'burpee', 'kettlebell'],
  Alongamento: ['alongamento', 'stretch', 'stretching'],
}

/** Pastas/grupos que NÃO devem aparecer juntos */
const CROSS_GROUP_BLOCK = {
  Peitoral: ['/costas/', '/pernas/', '/biceps/', '/lombar/', '/trapezio/', 'remada', 'puxada-', 'agachamento'],
  Costas: ['/peito/', '/triceps/', '/pernas/', 'supino', 'crucifixo', 'agachamento'],
  Pernas: ['/peito/', '/costas/', '/biceps/', '/triceps/', 'supino', 'rosca-', 'remada'],
  Bíceps: ['/triceps/', 'pushdown', 'triceps-', 'supino'],
  Tríceps: ['/biceps/', 'rosca-', 'curl'],
  Lombar: ['/peito/', 'supino', 'crucifixo'],
  Ombros: ['/peito/supino', 'agachamento', 'rosca-direta'],
}

/**
 * Coerência reforçada: blocklist + invalidKeywords + expectedKeywords (remoto) + cruzamento de pasta.
 */
export function isMediaCoherent(exerciseId, mediaUrl, muscleGroup) {
  if (!baseIsMediaCoherent(exerciseId, mediaUrl)) return false
  if (!mediaUrl) return false

  const haystack = String(mediaUrl).toLowerCase()
  const rules = VALIDATION_RULES[exerciseId]
  const group = normalizeMuscleGroup(muscleGroup || rules?.muscleGroup)

  if (rules?.expectedMediaKeywords?.length) {
    const isRemote = /^https?:\/\//i.test(mediaUrl)
    if (isRemote) {
      const ok = rules.expectedMediaKeywords.some((kw) => haystack.includes(String(kw).toLowerCase()))
      if (!ok) return false
    }
  }

  const blocked = CROSS_GROUP_BLOCK[group]
  if (blocked?.some((token) => haystack.includes(token))) {
    // Local path do próprio grupo ainda passa (ex.: peito/supino)
    const groupTokens = GROUP_PATH_TOKENS[group] || []
    const hasOwn = groupTokens.some((t) => haystack.includes(t))
    if (!hasOwn) return false
  }

  return true
}

/**
 * Valida um registro de exercício (campos essenciais).
 * @returns {{ ok: boolean, issues: string[], mediaPending: boolean }}
 */
export function validateExerciseRecord(exercise = {}) {
  const issues = []
  const id = String(exercise.id || exercise.slug || '')
  const name = exercise.name || ''
  const group = normalizeMuscleGroup(exercise.muscleGroup || exercise.category)
  const mediaUrl = exercise.mediaUrl || exercise.gif || exercise.image || exercise.thumbnail || null

  if (!id) issues.push('id ausente')
  if (!name) issues.push('nome ausente')
  if (!group) issues.push('grupo muscular ausente')

  const rules = VALIDATION_RULES[id]
  if (rules?.muscleGroup && normalizeMuscleGroup(rules.muscleGroup) !== group) {
    issues.push(`grupo esperado ${rules.muscleGroup}, encontrado ${group}`)
  }

  let mediaPending = Boolean(exercise.mediaPending)
  if (!mediaUrl) {
    mediaPending = true
    issues.push('mídia ausente')
  } else if (!isMediaCoherent(id, mediaUrl, group)) {
    mediaPending = true
    issues.push('mídia incompatível')
  }

  return {
    ok: issues.length === 0,
    issues,
    mediaPending,
    group,
  }
}

/**
 * Decide URL segura ou null (forçar fallback do grupo).
 */
export function resolveSafeMediaUrl(exerciseId, candidateUrl, muscleGroup) {
  if (!candidateUrl) return null
  if (!isMediaCoherent(exerciseId, candidateUrl, muscleGroup)) return null
  return candidateUrl
}

export function getValidationRules(exerciseId) {
  return VALIDATION_RULES[exerciseId] || null
}

export function isOfficialMuscleGroup(group) {
  const g = normalizeMuscleGroup(group)
  return Object.values(OFFICIAL_MUSCLE_GROUPS).flat().includes(g)
}
