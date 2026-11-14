/**
 * Guarda local de dor/lesão — roda antes de qualquer IA e não depende dela.
 * Não faz diagnóstico: só orienta procurar profissional e evitar a região.
 */
import { normalizeVoiceText } from '../voiceIntents.js'

const PAIN_RE =
  /\b(dor|dores|doi|doendo|dolorido|dolorida|lesao|lesoes|lesionei|lesionado|lesionada|machuquei|machucado|machucada|machuca|machucou|inflamado|inflamada|inflamacao|inflamou|tendinite|tendinose|bursite|hernia|entorse|torci|distensao|estiramento|contratura|luxacao|fratura|condromalacia|menisco|ligamento|formigamento|travou|travada)\b/

/** Região → restrição aceita pelo gerador (normalizeRestrictions). */
const REGIONS = [
  { re: /joelho|menisco|condromalacia|patela|ligamento cruzado/, restriction: 'Joelho', label: 'joelho' },
  { re: /lombar|coluna|hernia|costas baixa|parte de baixo das costas|ciatico/, restriction: 'Lombar', label: 'lombar' },
  { re: /ombro|manguito/, restriction: 'Ombro', label: 'ombro' },
]

export function detectPainMention(text) {
  const n = normalizeVoiceText(text)
  if (!n || !PAIN_RE.test(n)) return { triggered: false, regions: [], restrictions: [] }
  const hits = REGIONS.filter((r) => r.re.test(n))
  return {
    triggered: true,
    regions: hits.map((r) => r.label),
    restrictions: hits.map((r) => r.restriction),
  }
}

export const PAIN_PROFESSIONAL_LINE =
  'Não consigo avaliar dor ou lesão. Procure um médico ou fisioterapeuta antes de continuar treinando a região — e pare qualquer exercício que provoque dor.'

export function painReplyText(pain, { proposalReady = false } = {}) {
  const lines = [PAIN_PROFESSIONAL_LINE]
  if (pain.regions.length) {
    const where = pain.regions.join(', ')
    lines.push(
      proposalReady
        ? `Enquanto isso, preparei uma versão da sua planilha que evita sobrecarregar ${where}. Veja o antes e depois abaixo e aplique só se fizer sentido para você.`
        : `Enquanto isso, prefira exercícios que não sobrecarreguem ${where}.`,
    )
  } else {
    lines.push(
      'Se me disser a região (por exemplo: joelho, lombar ou ombro), monto uma alternativa da planilha que evita essa área.',
    )
  }
  return lines.join('\n\n')
}
