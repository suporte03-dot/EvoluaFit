/**
 * Mídia local anatômica da seção Ombros (public/media/exercises/ombros/).
 */

/** @type {Record<string, string>} */
export const OMBROS_LOCAL_MEDIA = {
  // IDs legados (templates / storage)
  desenvolvimento: 'media/exercises/ombros/desenvolvimento-de-ombro-no-banco-com-halteres.png',
  'desenvolvimento-arnold': 'media/exercises/ombros/desenvolvimento-arnold-completo.png',

  // Presses / variantes
  'desenvolvimento-banco-halteres':
    'media/exercises/ombros/desenvolvimento-de-ombro-no-banco-com-halteres.png',
  'desenvolvimento-alternada-em-pe':
    'media/exercises/ombros/desenvolvimento-de-ombro-alternada-em-pe-com-halteres.png',
  'desenvolvimento-unilateral-halter':
    'media/exercises/ombros/desenvolvimento-de-ombro-unilateral-com-halter.png',
  'desenvolvimento-barra-sentado':
    'media/exercises/ombros/desenvolvimento-de-ombro-com-barra-sentado.png',
  'desenvolvimento-halteres-z':
    'media/exercises/ombros/desenvolvimento-de-ombro-com-halteres-em-z.png',
  'desenvolvimento-deitado': 'media/exercises/ombros/desenvolvimento-de-ombro-deitado.png',
  'desenvolvimento-maquina': 'media/exercises/ombros/desenvolvimento-de-ombro-na-maquina.png',
  'desenvolvimento-maquina-martelo':
    'media/exercises/ombros/desenvolvimento-de-ombro-na-maquina-pegada-martelo.png',
  'desenvolvimento-maquina-reversa':
    'media/exercises/ombros/desenvolvimento-de-ombro-reversa-na-maquina.png',
  'desenvolvimento-cabo': 'media/exercises/ombros/desenvolvimento-de-ombro-com-cabo.png',
  'desenvolvimento-cabo-ajoelhado':
    'media/exercises/ombros/desenvolvimento-de-ombro-com-cabo-ajoelhado.png',
  'desenvolvimento-rotacao-alternada':
    'media/exercises/ombros/desenvolvimento-de-ombros-com-rotacao-alternada-com-halteres.png',

  // Arnold / cubano
  'desenvolvimento-arnold-completo':
    'media/exercises/ombros/desenvolvimento-arnold-completo.png',
  'desenvolvimento-arnold-metade': 'media/exercises/ombros/desenvolvimento-arnold-metade.png',
  'desenvolvimento-arnold-um-braco':
    'media/exercises/ombros/desenvolvimento-arnold-com-um-braco.png',
  'desenvolvimento-cubano': 'media/exercises/ombros/desenvolvimento-cubano-com-halteres.png',
  'desenvolvimento-cubano-sentado':
    'media/exercises/ombros/desenvolvimento-cubano-sentado-com-halteres.png',

  // Isolamento / posterior
  'crucifixo-inverso-cabo': 'media/exercises/ombros/crucifixo-inverso-unilateral-com-cabo.png',
  'circulos-braco-pesos': 'media/exercises/ombros/circulos-de-braco-com-pesos.png',
}

export function getOmbrosLocalMediaUrl(id, base) {
  const relative = OMBROS_LOCAL_MEDIA[id]
  if (!relative) return null
  const root = base ?? (typeof import.meta !== 'undefined' && import.meta.env?.BASE_URL) ?? '/'
  return `${root}${relative}`
}

export function hasOmbrosLocalMedia(id) {
  return Boolean(OMBROS_LOCAL_MEDIA[id])
}
