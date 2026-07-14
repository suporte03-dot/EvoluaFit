/**
 * Mídia local anatômica da seção Tríceps (public/media/exercises/triceps/).
 */

/** @type {Record<string, string>} */
export const TRICEPS_LOCAL_MEDIA = {
  // ID legado (templates)
  'triceps-pulley': 'media/exercises/triceps/extensao-de-triceps-com-cabos-cruzados.png',

  // Polia / cabo
  'triceps-cabos-cruzados': 'media/exercises/triceps/extensao-de-triceps-com-cabos-cruzados.png',
  'triceps-pegada-invertida': 'media/exercises/triceps/extensao-de-triceps-com-pegada-invertida.png',
  'triceps-lateral-cabo': 'media/exercises/triceps/extensao-de-triceps-lateral-com-cabo.png',
  'triceps-cabo-horizontal':
    'media/exercises/triceps/extensao-de-triceps-com-cabo-posicao-horizontal.png',
  'triceps-cabo-inclinado': 'media/exercises/triceps/extensao-de-triceps-com-cabo-inclinado.png',
  'triceps-cabo-ajoelhado': 'media/exercises/triceps/extensao-de-triceps-com-cabo-ajoelhado.png',
  'triceps-cabo-posicao-ajoelhada':
    'media/exercises/triceps/extensao-de-triceps-com-cabo-posicao-ajoelhada.png',
  'triceps-concentrada-cabo-joelho':
    'media/exercises/triceps/extensao-concentrada-com-cabo-no-joelho.png',
  'triceps-pulley-sobre-cabeca':
    'media/exercises/triceps/extensao-de-triceps-com-uma-mao-no-pulley-alto-sobre-a-cabeca.png',
  'triceps-invertida-unilateral':
    'media/exercises/triceps/extensao-de-triceps-invertida-com-unilateral.png',
  'triceps-deitado-corda': 'media/exercises/triceps/extensao-de-triceps-deitado-com-corda.png',

  // Halteres
  'triceps-haltere-unilateral-sentado':
    'media/exercises/triceps/extensao-de-triceps-com-haltere-unilateral-sentado.png',
  'triceps-um-braco': 'media/exercises/triceps/extensao-de-triceps-com-um-braco.png',
  'triceps-haltere-pronacao':
    'media/exercises/triceps/extensao-de-triceps-com-haltere-pronacao-um-braco.png',

  // Barra / testa
  'triceps-barra-em-pe': 'media/exercises/triceps/extensao-de-triceps-com-barra-em-pe.png',
  'triceps-barra-atras-cabeca':
    'media/exercises/triceps/extensao-de-triceps-com-barra-atras-da-cabeca.png',
  'triceps-barra-w-inclinada':
    'media/exercises/triceps/extensao-de-triceps-com-barra-w-inclinada.png',
  'triceps-deitado-barra': 'media/exercises/triceps/extensao-de-triceps-deitado-com-barra.png',
  'triceps-deitado-barra-w':
    'media/exercises/triceps/extensao-de-triceps-deitado-com-barra-w-pegada-fechada-atras-da-cabeca.png',
  'triceps-testa-declinado':
    'media/exercises/triceps/extensao-de-triceps-testa-declinado-fechado.png',
}

export function getTricepsLocalMediaUrl(id, base) {
  const relative = TRICEPS_LOCAL_MEDIA[id]
  if (!relative) return null
  const root = base ?? (typeof import.meta !== 'undefined' && import.meta.env?.BASE_URL) ?? '/'
  return `${root}${relative}`
}

export function hasTricepsLocalMedia(id) {
  return Boolean(TRICEPS_LOCAL_MEDIA[id])
}
