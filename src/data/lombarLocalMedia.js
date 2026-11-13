/**
 * Mídia local anatômica da seção Lombar (public/media/exercises/lombar/).
 */

/** @type {Record<string, string>} */
export const LOMBAR_LOCAL_MEDIA = {
  // ID legado (templates) — bird-dog fica com GIF remoto até haver ilustração dedicada

  superman: 'media/exercises/lombar/superman.png',
  'hiperextensao-chao': 'media/exercises/lombar/hiperextensao-no-chao.png',
  'hiperextensao-torcao': 'media/exercises/lombar/hiperextensao-com-torcao.png',
  'hiperextensao-banco-plano': 'media/exercises/lombar/hiperextensao-de-lombar-no-banco-plano.png',
  'hiperextensao-sapo': 'media/exercises/lombar/hiperextensao-invertida-de-sapo.png',
  'extensao-lombar-sentada': 'media/exercises/lombar/extensao-lombar-sentada.png',
  hiperextensao: 'media/exercises/lombar/hiperextensao.png',
  'extensao-lombar-peso': 'media/exercises/lombar/extensao-lombar-com-peso.png',
}

export function getLombarLocalMediaUrl(id, base) {
  const relative = LOMBAR_LOCAL_MEDIA[id]
  if (!relative) return null
  const root = base ?? (typeof import.meta !== 'undefined' && import.meta.env?.BASE_URL) ?? '/'
  return `${root}${relative}`
}

export function hasLombarLocalMedia(id) {
  return Boolean(LOMBAR_LOCAL_MEDIA[id])
}
