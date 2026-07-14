/**
 * Mídia local anatômica da seção Antebraço (public/media/exercises/antebraco/).
 */

/** @type {Record<string, string>} */
export const ANTEBRACO_LOCAL_MEDIA = {
  'rosca-punho-barra-atras':
    'media/exercises/antebraco/rosca-de-punho-com-barra-atras-das-costas.png',
  'rosca-punho-barra': 'media/exercises/antebraco/rosca-de-punho-com-barra.png',
  'rosca-punho-reversa-barra':
    'media/exercises/antebraco/rosca-de-punho-reversa-com-barra.png',
  'rosca-dedos-halteres': 'media/exercises/antebraco/rosca-de-dedos-com-halteres.png',
  'rosca-punho-anilhas':
    'media/exercises/antebraco/rosca-de-punho-pegada-neutra-com-anilhas.png',
  'hand-grip': 'media/exercises/antebraco/hand-grip.png',
  'rosca-dedo-barra': 'media/exercises/antebraco/rosca-de-dedo-com-barra.png',
  'rosca-inversa-barra': 'media/exercises/antebraco/rosca-inversa-com-barra.png',
  'flexao-punho-halteres': 'media/exercises/antebraco/flexao-de-punho-com-halteres.png',
  'flexao-punho-reversa-banco':
    'media/exercises/antebraco/flexao-de-punho-reversa-com-barra-sobre-um-banco.png',
  'flexao-punho-cabo-chao':
    'media/exercises/antebraco/flexao-de-punho-com-cabo-em-um-braco-no-chao.png',
  'flexao-pulso-neutra-halteres':
    'media/exercises/antebraco/flexao-de-pulso-neutra-sentado-com-halteres.png',
  'flexao-punho-reversa-anilha':
    'media/exercises/antebraco/flexao-de-punho-reversa-com-anilha.png',
  'rolinho-antebraco': 'media/exercises/antebraco/rolinho-de-antebraco.png',
}

export function getAntebracoLocalMediaUrl(id, base) {
  const relative = ANTEBRACO_LOCAL_MEDIA[id]
  if (!relative) return null
  const root = base ?? (typeof import.meta !== 'undefined' && import.meta.env?.BASE_URL) ?? '/'
  return `${root}${relative}`
}

export function hasAntebracoLocalMedia(id) {
  return Boolean(ANTEBRACO_LOCAL_MEDIA[id])
}
