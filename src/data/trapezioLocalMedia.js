/**
 * Mídia local anatômica da seção Trapézio (public/media/exercises/trapezio/).
 */

/** @type {Record<string, string>} */
export const TRAPEZIO_LOCAL_MEDIA = {
  // ID legado (antes em Ombros)
  'face-pull': 'media/exercises/trapezio/face-pull.png',

  // Encolhimentos
  'encolhimento-halteres': 'media/exercises/trapezio/encolhimento-com-halteres.png',
  'encolhimento-barra': 'media/exercises/trapezio/encolhimento-de-barra.png',
  'encolhimento-barra-atras': 'media/exercises/trapezio/encolhimento-de-barra-atras-das-costas.png',
  'encolhimento-cabo': 'media/exercises/trapezio/encolhimento-com-cabo.png',
  'encolhimento-alavanca': 'media/exercises/trapezio/encolhimento-com-alavanca.png',
  'encolhimento-maquina': 'media/exercises/trapezio/encolhimento-na-maquina.png',
  'encolhimento-smith': 'media/exercises/trapezio/encolhimento-de-ombros-na-maquina-smith.png',
  'encolhimento-halteres-declive':
    'media/exercises/trapezio/encolhimento-com-halteres-em-declive.png',
  'encolhimento-gittleson':
    'media/exercises/trapezio/encolhimento-sentado-de-gittleson-com-halteres.png',
  'encolhimento-acima-cabeca': 'media/exercises/trapezio/encolhimento-acima-da-cabeca.png',
  'encolhimento-inclinado-pronado':
    'media/exercises/trapezio/encolhimento-inclinado-pronado.png',

  // Face pull / puxada ao rosto
  'face-pull-joelhos': 'media/exercises/trapezio/puxada-para-o-rosto-de-joelhos.png',
  'face-pull-cabo-cruzado': 'media/exercises/trapezio/puxada-de-face-com-cabo-cruzado.png',
  'face-pull-meio-agachado':
    'media/exercises/trapezio/meio-agachado-com-puxada-para-o-rosto-no-cabo.png',

  // Remadas altas / Y / 45°
  'remada-alta-cabo': 'media/exercises/trapezio/remada-alta-com-cabo.png',
  'remada-alta-halter': 'media/exercises/trapezio/remada-alta-com-halter.png',
  'remada-alta-halteres-unilateral':
    'media/exercises/trapezio/remada-alta-com-halteres-unilateral.png',
  'remada-alta-barra-w': 'media/exercises/trapezio/remada-alta-com-barra-w.png',
  'remada-alta-barra': 'media/exercises/trapezio/remada-com-barra.png',
  'remada-y-cabo': 'media/exercises/trapezio/remada-em-y-com-cabo.png',
  'remada-inclinada-45-trapezio': 'media/exercises/trapezio/remada-inclinada-a-45-graus.png',
  'remada-invertida-cabo-inclinado':
    'media/exercises/trapezio/remada-invertida-com-cable-inclinado.png',
  'remada-invertida-halteres-inclinado':
    'media/exercises/trapezio/remada-invertida-com-halteres-inclinado.png',

  // Voadores / elevações posteriores / Y / T
  'voador-deltoide-posterior-cabo':
    'media/exercises/trapezio/voador-de-deltoides-posterior-com-cabo.png',
  'voador-deltoide-posterior-maquina':
    'media/exercises/trapezio/voador-na-maquina-para-deltoides-posteriores.png',
  'elevacao-y-halteres-inclinado':
    'media/exercises/trapezio/elevacao-de-deltoide-em-y-com-halteres-inclinado.png',
  'elevacao-deltoide-posterior-inclinado':
    'media/exercises/trapezio/elevacao-de-deltoide-posterior-com-halteres-inclinado.png',
  'elevacao-t-halteres-inclinada':
    'media/exercises/trapezio/elevacao-de-t-com-halteres-inclinada.png',
  'elevacao-lateral-tronco-inclinado':
    'media/exercises/trapezio/elevacao-lateral-tronco-inclinado.png',
  'dumbbell-raise-trapezio': 'media/exercises/trapezio/dumbbell-raise.png',
  'dips-escapula': 'media/exercises/trapezio/dips-de-escapula.png',
}

export function getTrapezioLocalMediaUrl(id, base) {
  const relative = TRAPEZIO_LOCAL_MEDIA[id]
  if (!relative) return null
  const root = base ?? (typeof import.meta !== 'undefined' && import.meta.env?.BASE_URL) ?? '/'
  return `${root}${relative}`
}

export function hasTrapezioLocalMedia(id) {
  return Boolean(TRAPEZIO_LOCAL_MEDIA[id])
}
