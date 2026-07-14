/**
 * Mídia local anatômica da seção Pernas (public/media/exercises/pernas/).
 */

/** @type {Record<string, string>} */
export const PERNAS_LOCAL_MEDIA = {
  // IDs legados
  agachamento: 'media/exercises/pernas/agachamento-barra.png',
  'agachamento-frontal': 'media/exercises/pernas/agachamento-frontal.png',
  'agachamento-goblet': 'media/exercises/pernas/agachamento-goblet-com-haltere.png',
  afundo: 'media/exercises/pernas/afundo-com-halteres.png',
  'passada-lateral': 'media/exercises/pernas/afundo-lateral-com-barra.png',

  // Agachamentos
  'agachamento-barra': 'media/exercises/pernas/agachamento-barra.png',
  'agachamento-no-smith': 'media/exercises/pernas/agachamento-no-smith.png',
  'agachamento-no-landmine': 'media/exercises/pernas/agachamento-no-landmine.png',
  'agachamento-hack-barra': 'media/exercises/pernas/agachamento-hack-com-barra.png',
  'agachamento-maquina-hack': 'media/exercises/pernas/agachamento-na-maquina-hack.png',
  'agachamento-hack-invertido': 'media/exercises/pernas/agachamento-hack-invertido.png',
  'agachamento-com-trava': 'media/exercises/pernas/agachamento-com-trava.png',
  'agachamento-kettlebell': 'media/exercises/pernas/agachamento-com-kettlebell.png',
  'agachamento-goblet-haltere': 'media/exercises/pernas/agachamento-goblet-com-haltere.png',
  'agachamento-sumo-halteres': 'media/exercises/pernas/agachamento-sumo-com-halteres.png',
  'agachamento-sissy': 'media/exercises/pernas/agachamento-sissy.png',
  'agachamento-zercher': 'media/exercises/pernas/agachamento-zercher.png',
  'agachamento-jefferson': 'media/exercises/pernas/agachamento-jefferson.png',
  'agachamento-halteres-banco': 'media/exercises/pernas/agachamento-com-halteres-no-banco.png',
  'agachamento-salto-halteres': 'media/exercises/pernas/agachamento-com-salto-e-halteres.png',
  'agachamento-pliometrico-halteres':
    'media/exercises/pernas/agachamento-em-pliometrico-com-halteres.png',
  'agachamento-unilateral-cruzado-barra':
    'media/exercises/pernas/agachamento-unilateral-cruzado-com-barra.png',
  'agachamento-unilateral-cruzado-haltere':
    'media/exercises/pernas/agachamento-unilateral-cruzado-com-haltere.png',
  'agachamento-bulgaro-barra': 'media/exercises/pernas/agachamento-bulgaro-com-barra.png',
  'agachamento-bulgaro-halteres': 'media/exercises/pernas/agachamento-bulgaro-com-halteres.png',

  // Frontais
  'agachamento-frontal-barra-banco':
    'media/exercises/pernas/agachamento-frontal-com-barra-no-banco.png',
  'agachamento-frontal-barra-smith':
    'media/exercises/pernas/agachamento-frontal-com-barra-no-smith.png',
  'agachamento-frontal-cabo': 'media/exercises/pernas/agachamento-frontal-com-cabo.png',
  'agachamento-frontal-polia': 'media/exercises/pernas/agachamento-frontal-com-polia.png',
  'agachamento-frontal-kettlebell':
    'media/exercises/pernas/agachamento-frontal-com-kettlebell.png',

  // Afundos / avanços
  'afundo-barra': 'media/exercises/pernas/afundo-com-barra.png',
  'afundo-halteres': 'media/exercises/pernas/afundo-com-halteres.png',
  'afundo-landmine': 'media/exercises/pernas/afundo-com-landmine.png',
  'afundo-lateral-barra': 'media/exercises/pernas/afundo-lateral-com-barra.png',
  'afundo-smith': 'media/exercises/pernas/afundo-na-maquina-smith.png',
  'afundo-banco-halteres': 'media/exercises/pernas/afundo-no-banco-com-halteres.png',
  'avanco-barra': 'media/exercises/pernas/avanco-com-barra.png',
  'avanco-cabo': 'media/exercises/pernas/avanco-com-cabo.png',
  'avanco-halteres': 'media/exercises/pernas/avanco-com-halteres.png',
  'avanco-invertido': 'media/exercises/pernas/avanco-invertido.png',
  'avanco-invertido-halteres': 'media/exercises/pernas/avanco-invertido-com-halteres.png',

  // Adução
  'aducao-quadril-cabo': 'media/exercises/pernas/aducao-do-quadril-com-cabo.png',
  'aducao-quadril-alavanca': 'media/exercises/pernas/aducao-do-quadril-lateral-com-alavanca.png',
}

export function getPernasLocalMediaUrl(id, base) {
  const relative = PERNAS_LOCAL_MEDIA[id]
  if (!relative) return null
  const root = base ?? (typeof import.meta !== 'undefined' && import.meta.env?.BASE_URL) ?? '/'
  return `${root}${relative}`
}

export function hasPernasLocalMedia(id) {
  return Boolean(PERNAS_LOCAL_MEDIA[id])
}
