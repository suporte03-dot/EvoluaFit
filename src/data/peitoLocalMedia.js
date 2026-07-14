/**
 * Mídia local anatômica da seção Peitoral (public/media/exercises/peito/).
 * Prioridade sobre URLs remotas em resolveExerciseMedia.
 */

/** @type {Record<string, string>} */
export const PEITO_LOCAL_MEDIA = {
  'supino-reto': 'media/exercises/peito/supino-reto.png',
  'supino-com-halteres': 'media/exercises/peito/supino-com-halteres.png',
  'supino-inclinado': 'media/exercises/peito/supino-inclinado-com-halteres.png',
  'supino-inclinado-com-barra': 'media/exercises/peito/supino-inclinado-com-barra.png',
  'supino-inclinado-com-halteres': 'media/exercises/peito/supino-inclinado-com-halteres.png',
  'supino-inclinado-na-maquina': 'media/exercises/peito/supino-inclinado-na-maquina.png',
  'supino-inclinado-na-alavanca': 'media/exercises/peito/supino-inclinado-na-alavanca.png',
  'supino-inclinado-com-cabo': 'media/exercises/peito/supino-inclinado-com-cabo.png',
  'supino-inclinado-com-halteres-em-martelo':
    'media/exercises/peito/supino-inclinado-com-halteres-em-martelo.png',
  'supino-inclinado-com-pegada-fechada':
    'media/exercises/peito/supino-inclinado-com-pegada-fechada.png',
  'supino-com-banco-inclinado-no-smith':
    'media/exercises/peito/supino-com-banco-inclinado-no-smith.png',
  'supino-declinado-com-halteres': 'media/exercises/peito/supino-declinado-com-halteres.png',
  'supino-com-barra-declinado': 'media/exercises/peito/supino-com-barra-declinado.png',
  'supino-declinado-na-maquina': 'media/exercises/peito/supino-declinado-na-maquina.png',
  'supino-declinado-na-maquina-smith':
    'media/exercises/peito/supino-declinado-na-maquina-smith.png',
  'supino-declinada-com-alavanca': 'media/exercises/peito/supino-declinada-com-alavanca.png',
  'supino-declinado-pegada-martelo': 'media/exercises/peito/supino-declinado-pegada-martelo.png',
  'supino-reto-na-maquina': 'media/exercises/peito/supino-reto-na-maquina.png',
  'supino-na-maquina': 'media/exercises/peito/supino-na-maquina.png',
  'supino-com-alavanca': 'media/exercises/peito/supino-com-alavanca.png',
  'supino-na-maquina-smith': 'media/exercises/peito/supino-na-maquina-smith.png',
  'supino-na-maquina-para-miolo-do-peitoral':
    'media/exercises/peito/supino-na-maquina-para-miolo-do-peitoral.png',
  'supino-com-pegada-fechada': 'media/exercises/peito/supino-com-pegada-fechada.png',
  'supino-fechado': 'media/exercises/peito/supino-fechado.png',
  'supino-com-pegada-aberta': 'media/exercises/peito/supino-com-pegada-aberta.png',
  'supino-pegada-martelo': 'media/exercises/peito/supino-pegada-martelo.png',
  'supino-com-halteres-com-pegada-fechada':
    'media/exercises/peito/supino-com-halteres-com-pegada-fechada.png',
  'supino-alternado-com-halteres': 'media/exercises/peito/supino-alternado-com-halteres.png',
  'supino-unilateral-no-cabo': 'media/exercises/peito/supino-unilateral-no-cabo.png',
  'supino-reto-em-pe-no-cross-over': 'media/exercises/peito/supino-reto-em-pe-no-cross-over.png',
  'supino-com-cabo-sentado': 'media/exercises/peito/supino-com-cabo-sentado.png',
  'supino-com-pegada-fechada-sentado-com-cabo':
    'media/exercises/peito/supino-com-pegada-fechada-sentado-com-cabo.png',
  'supino-unilateral-com-alavanca': 'media/exercises/peito/supino-unilateral-com-alavanca.png',
  'supino-em-pe-com-faixa-elastica': 'media/exercises/peito/supino-em-pe-com-faixa-elastica.png',
  'supino-com-barra-no-chao': 'media/exercises/peito/supino-com-barra-no-chao.png',
  'supino-com-kettlebell-no-chao': 'media/exercises/peito/supino-com-kettlebell-no-chao.png',
  'supino-com-kettlebell-de-um-braco':
    'media/exercises/peito/supino-com-kettlebell-de-um-braco.png',
  'supino-invertido-com-pegada-aberta':
    'media/exercises/peito/supino-invertido-com-pegada-aberta.png',
  'supino-invertido-com-pegada-fechada':
    'media/exercises/peito/supino-invertido-com-pegada-fechada.png',
  'supino-com-halteres-pegada-invertida':
    'media/exercises/peito/supino-com-halteres-pegada-invertida.png',
  'supino-no-smith-com-triangulo': 'media/exercises/peito/supino-no-smith-com-triangulo.png',
}

export function getPeitoLocalMediaUrl(id, base) {
  const relative = PEITO_LOCAL_MEDIA[id]
  if (!relative) return null
  const root = base ?? (typeof import.meta !== 'undefined' && import.meta.env?.BASE_URL) ?? '/'
  return `${root}${relative}`
}

export function hasPeitoLocalMedia(id) {
  return Boolean(PEITO_LOCAL_MEDIA[id])
}
