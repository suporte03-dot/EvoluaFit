/**
 * Mídia local anatômica da seção Bíceps (public/media/exercises/biceps/).
 */

/** @type {Record<string, string>} */
export const BICEPS_LOCAL_MEDIA = {
  // IDs legados (templates)
  'rosca-direta': 'media/exercises/biceps/rosca-direta-com-barra.png',
  'rosca-martelo': 'media/exercises/biceps/rosca-martelo.png',
  'rosca-alternada': 'media/exercises/biceps/rosca-alternada.png',

  // Catálogo ampliado
  'rosca-direta-com-barra': 'media/exercises/biceps/rosca-direta-com-barra.png',
  'rosca-com-barra': 'media/exercises/biceps/rosca-com-barra.png',
  'rosca-direta-pegada-fechada':
    'media/exercises/biceps/rosca-direta-com-barra-em-pegada-fechada.png',
  'rosca-direta-barra-w-fechada':
    'media/exercises/biceps/rosca-biceps-com-pegada-fechada-na-barra-w.png',
  'rosca-direta-colete-scott':
    'media/exercises/biceps/rosca-direta-com-barra-no-colete-scott.png',
  'rosca-direta-deitada-banco':
    'media/exercises/biceps/rosca-direta-com-barra-deitado-em-banco-alto.png',
  'rosca-direta-cabo-deitado': 'media/exercises/biceps/rosca-direta-com-cabo-deitado.png',
  'rosca-biceps-com-halteres': 'media/exercises/biceps/rosca-biceps-com-halteres.png',
  'rosca-biceps-sentado': 'media/exercises/biceps/rosca-biceps-sentado.png',
  'rosca-biceps-unilateral': 'media/exercises/biceps/rosca-biceps-unilateral.png',
  'rosca-biceps-alta-halteres': 'media/exercises/biceps/rosca-biceps-alta-com-halteres.png',
  'rosca-banco-inclinado': 'media/exercises/biceps/rosca-banco-inclinado.png',
  'rosca-inclinada-halteres':
    'media/exercises/biceps/rosca-biceps-inclinada-com-halteres-sentado.png',
  'rosca-inclinada-cabos': 'media/exercises/biceps/rosca-biceps-inclinada-com-cabos.png',
  'rosca-bilateral-cabo-inclinado':
    'media/exercises/biceps/rosca-bilateral-com-cabo-em-banco-inclinado.png',
  'rosca-alternada-com-barra': 'media/exercises/biceps/rosca-alternada-com-barra.png',
  'rosca-alternada-halteres-sentado':
    'media/exercises/biceps/rosca-alternada-com-halteres-sentado.png',
  'rosca-com-polia-alta': 'media/exercises/biceps/rosca-com-polia-alta.png',
  'rosca-unilateral-cabo': 'media/exercises/biceps/rosca-unilateral-com-cabo.png',
  'rosca-cabo-um-braco': 'media/exercises/biceps/rosca-com-cabo-de-um-braco.png',
  'rosca-unilateral-cabo-alto': 'media/exercises/biceps/rosca-biceps-unilateral-no-cabo-alto.png',
  'rosca-unilateral-cabo-invertida':
    'media/exercises/biceps/rosca-biceps-unilateral-com-pegada-invertida-em-cabo.png',
  'rosca-cabo-ajoelhado': 'media/exercises/biceps/rosca-biceps-com-cabo-ajoelhado.png',
  'rosca-scott-barra-w': 'media/exercises/biceps/rosca-scott-com-barra-w.png',
  'rosca-scott-alavanca': 'media/exercises/biceps/rosca-scott-com-alavanca.png',
  'rosca-scott-halteres-martelo':
    'media/exercises/biceps/rosca-scott-com-halteres-martelo-no-banco.png',
  'rosca-concentrada-sentado':
    'media/exercises/biceps/rosca-concentrada-com-pegada-fechada-sentado.png',
  'rosca-inversa-halteres': 'media/exercises/biceps/rosca-inversa-com-halteres.png',
  'rosca-zottman': 'media/exercises/biceps/rosca-zottman.png',
  'rosca-maquina': 'media/exercises/biceps/maquina-de-rosca-direta.png',
}

export function getBicepsLocalMediaUrl(id, base) {
  const relative = BICEPS_LOCAL_MEDIA[id]
  if (!relative) return null
  const root = base ?? (typeof import.meta !== 'undefined' && import.meta.env?.BASE_URL) ?? '/'
  return `${root}${relative}`
}

export function hasBicepsLocalMedia(id) {
  return Boolean(BICEPS_LOCAL_MEDIA[id])
}
