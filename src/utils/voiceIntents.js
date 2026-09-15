/**
 * Intenções de voz em PT-BR — treino (Foco), montar planilha e agenda.
 * Regras locais: o áudio não sai do aparelho; só o texto transcrito chega aqui.
 */

const WEEKDAYS = {
  domingo: 0,
  segunda: 1,
  terca: 2,
  quarta: 3,
  quinta: 4,
  sexta: 5,
  sabado: 6,
}

const WORD_NUM = {
  um: 1,
  uma: 1,
  dois: 2,
  duas: 2,
  tres: 3,
  quatro: 4,
  cinco: 5,
  seis: 6,
  sete: 7,
  oito: 8,
  nove: 9,
  dez: 10,
  onze: 11,
  doze: 12,
  treze: 13,
  quinze: 15,
  vinte: 20,
  trinta: 30,
  quarenta: 40,
  cinquenta: 50,
  sessenta: 60,
  setenta: 70,
  oitenta: 80,
  noventa: 90,
  cem: 100,
  cento: 100,
}

const OBJECTIVE_PATTERNS = [
  { re: /hipertrof/, code: 'hipertrofia' },
  { re: /forca|força/, code: 'forca' },
  { re: /emagrec|perder peso/, code: 'emagrecimento' },
  { re: /condicion/, code: 'condicionamento' },
  { re: /mobilidade/, code: 'mobilidade' },
  { re: /saude|saúde/, code: 'saude' },
]

const WORKOUT_TYPE_PATTERNS = [
  { re: /\bpull\b|costas/, type: 'Pull', name: 'Pull' },
  { re: /\bpush\b|peito|peitoral/, type: 'Push', name: 'Push' },
  { re: /\blegs\b|pernas?|inferior/, type: 'Legs', name: 'Legs' },
  { re: /full body|corpo todo/, type: 'Full Body', name: 'Full Body' },
  { re: /cardio/, type: 'Cardio', name: 'Cardio' },
  { re: /mobilidade|alongamento/, type: 'Mobilidade', name: 'Mobilidade' },
]

export function normalizeVoiceText(raw) {
  return String(raw || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ç/g, 'c')
    .replace(/[^a-z0-9\s.,]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function wordToNumber(token) {
  return WORD_NUM[token] ?? null
}

function extractDigits(text) {
  const matches = [...String(text).matchAll(/(\d+(?:[.,]\d+)?)/g)].map((m) =>
    Number(String(m[1]).replace(',', '.')),
  )
  return matches.filter((n) => Number.isFinite(n))
}

function extractSpokenNumber(text) {
  const digits = extractDigits(text)
  if (digits.length) return digits[0]
  const tokens = normalizeVoiceText(text).split(' ')
  for (let i = 0; i < tokens.length; i += 1) {
    const a = wordToNumber(tokens[i])
    if (a == null) continue
    if (tokens[i + 1] === 'e') {
      const b = wordToNumber(tokens[i + 2])
      if (b != null) return a + b
    }
    return a
  }
  return null
}

function extractWeight(text) {
  const n = normalizeVoiceText(text)
  const tagged = n.match(/(\d+(?:[.,]\d+)?)\s*(kg|kilos?|quilos?)/)
  if (tagged) return Number(String(tagged[1]).replace(',', '.'))
  if (/\b(kg|quilo|kilo|carga|peso)\b/.test(n)) return extractSpokenNumber(n)
  const wordKg = n.match(
    /\b(vinte|trinta|quarenta|cinquenta|sessenta|setenta|oitenta|noventa|cem|cento)\b(?:\s+e\s+\w+)?/,
  )
  if (wordKg && /\b(kg|quilo|kilo|carga|peso)\b/.test(n)) return extractSpokenNumber(n)
  return null
}

function extractReps(text) {
  const n = normalizeVoiceText(text)
  const tagged = n.match(/(\d+)\s*(reps?|repeticoes?)/)
  if (tagged) return Number(tagged[1])
  if (/\b(reps?|repeticoes?)\b/.test(n)) return extractSpokenNumber(n)
  return null
}

function extractMinutes(text) {
  const n = normalizeVoiceText(text)
  const tagged = n.match(/(\d+)\s*(min|minutos?)/)
  if (tagged) return Number(tagged[1])
  if (/\bminutos?\b/.test(n)) return extractSpokenNumber(n)
  return null
}

function extractDaysPerWeek(text) {
  const n = normalizeVoiceText(text)
  const tagged = n.match(/(\d+)\s*(vezes|x|dias)?\s*(por)?\s*semana/)
  if (tagged) return Math.min(7, Math.max(2, Number(tagged[1])))
  const vezes = n.match(/(\d+)\s*(vezes|x)\b/)
  if (vezes) return Math.min(7, Math.max(2, Number(vezes[1])))
  if (/quatro vezes|4x/.test(n)) return 4
  if (/tres vezes|3x/.test(n)) return 3
  if (/cinco vezes|5x/.test(n)) return 5
  if (/seis vezes|6x/.test(n)) return 6
  if (/sete vezes|7x/.test(n)) return 7
  if (/duas vezes|2x/.test(n)) return 2
  return null
}

function extractObjective(text) {
  const n = normalizeVoiceText(text)
  const hit = OBJECTIVE_PATTERNS.find((p) => p.re.test(n))
  return hit?.code || null
}

function extractLocation(text) {
  const n = normalizeVoiceText(text)
  if (/\bcasa\b|home|halter/.test(n)) return 'Casa'
  if (/parque/.test(n)) return 'Parque'
  if (/academia/.test(n)) return 'Academia'
  return null
}

function extractRestrictions(text) {
  const n = normalizeVoiceText(text)
  const list = []
  if (/joelho/.test(n)) list.push('Joelho')
  if (/lombar|coluna/.test(n)) list.push('Lombar')
  if (/ombro/.test(n)) list.push('Ombro')
  return list
}

function extractWorkoutType(text) {
  const n = normalizeVoiceText(text)
  return WORKOUT_TYPE_PATTERNS.find((p) => p.re.test(n)) || null
}

function dateFromVoice(text, reference = new Date()) {
  const n = normalizeVoiceText(text)
  const ref = new Date(reference)
  ref.setHours(12, 0, 0, 0)

  if (/\bhoje\b/.test(n)) return toDateKey(ref)
  if (/\bamanha\b/.test(n)) {
    const d = new Date(ref)
    d.setDate(d.getDate() + 1)
    return toDateKey(d)
  }

  for (const [name, weekday] of Object.entries(WEEKDAYS)) {
    if (n.includes(name)) {
      const d = new Date(ref)
      const delta = (weekday - d.getDay() + 7) % 7
      d.setDate(d.getDate() + (delta === 0 ? 7 : delta))
      return toDateKey(d)
    }
  }
  return null
}

function toDateKey(d) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function plannedRepsFromExercise(exercise) {
  const match = String(exercise?.reps || '').match(/(\d+)/)
  return match ? match[1] : '10'
}

export function parseYesNo(text) {
  const n = normalizeVoiceText(text)
  if (/^(sim|isso|confirma|confirmo|pode|ok|positivo|uhum)\b/.test(n) || n === 'sim') return true
  if (/^(nao|não|cancela|cancelar|nega)\b/.test(n) || n === 'nao') return false
  return null
}

/**
 * Comandos do Modo Foco (mãos ocupadas).
 */
export function parseFocusVoiceCommand(text) {
  const n = normalizeVoiceText(text)
  if (!n) return { type: 'unknown', spoken: 'Não entendi. Segure o microfone e fale de novo.' }

  if (/\b(finaliza|termina|encerrar|acabar)(r)? (o )?treino\b/.test(n) || n === 'finalizar') {
    return {
      type: 'finish',
      needsConfirm: true,
      spoken: 'Finalizar o treino? Diga sim ou não.',
    }
  }
  if (/\b(sair|fechar modo foco|minimizar)\b/.test(n)) {
    return {
      type: 'exit',
      needsConfirm: true,
      spoken: 'Sair do modo foco e guardar o progresso? Diga sim ou não.',
    }
  }
  if (/\bcancelar treino\b/.test(n)) {
    return {
      type: 'cancel',
      needsConfirm: true,
      spoken: 'Cancelar este treino e descartar a sessão? Diga sim ou não.',
    }
  }
  if (/\b(pausar|pause|pausa)\b/.test(n)) return { type: 'pause', spoken: 'Treino pausado.' }
  if (/\b(retomar|continua|despausar)\b/.test(n)) return { type: 'resume', spoken: 'Retomando.' }

  if (/\b(pula|pular|skip) (o )?descanso\b/.test(n) || n === 'pular descanso') {
    return { type: 'skip_rest', spoken: 'Descanso encerrado. Próxima série.' }
  }
  if (/\b(descanso|descansar|timer)\b/.test(n) && !/\bpular\b/.test(n)) {
    return { type: 'start_rest', spoken: 'Iniciando descanso.' }
  }

  if (/\b(proximo|próximo) exercicio\b/.test(n) || n === 'proximo' || n === 'próximo') {
    return { type: 'next_exercise', spoken: 'Próximo exercício.' }
  }
  if (/\b(pular|pula) (o )?exercicio\b/.test(n)) {
    return { type: 'skip_exercise', spoken: 'Pulando este exercício.' }
  }

  const weight = extractWeight(n)
  const reps = extractReps(n)
  const complete =
    /serie (feita|concluida|completa)|concluir serie|proxima serie|fechei|fecha a serie|registrar serie|\bfeito\b|\bpronto\b/.test(
      n,
    )

  if (complete || (weight != null && reps != null)) {
    const heavy = weight != null && weight >= 100
    return {
      type: 'complete_set',
      slots: { weight, reps },
      needsConfirm: heavy,
      spoken: heavy
        ? `${weight} quilos. Confirma essa carga? Diga sim ou não.`
        : 'Registrando a série.',
    }
  }

  if (weight != null) {
    const heavy = weight >= 100
    return {
      type: 'set_weight',
      slots: { weight },
      needsConfirm: heavy,
      spoken: heavy ? `${weight} quilos. Confirma? Diga sim ou não.` : `Carga ${weight} quilos.`,
    }
  }

  if (reps != null) {
    return { type: 'set_reps', slots: { reps }, spoken: `${reps} repetições.` }
  }

  return {
    type: 'unknown',
    spoken: 'Pode dizer: série feita, 80 quilos, 10 reps, descanso ou próximo exercício.',
  }
}

/**
 * Comandos do Coach / home: montar, agendar, o que treinar.
 */
export function parseAppVoiceCommand(text) {
  const n = normalizeVoiceText(text)
  if (!n) return { domain: 'unknown' }

  if (/\b(reorganiza|reorganizar) (a )?semana\b/.test(n) || n.includes('o que eu perdi')) {
    return { domain: 'schedule', type: 'reorganize', needsConfirm: true }
  }

  if (/\b(adia|adiar|marca|marcar|agenda|agendar|coloca|colocar)\b/.test(n)) {
    const date = dateFromVoice(n)
    const kind = extractWorkoutType(n)
    const postpone = /\b(adia|adiar)\b/.test(n)
    return {
      domain: 'schedule',
      type: postpone ? 'postpone' : 'add',
      slots: {
        date: date || (postpone ? dateFromVoice('amanha') : dateFromVoice('hoje')),
        workoutType: kind?.type || 'Full Body',
        name: kind?.name || 'Treino',
      },
      needsConfirm: false,
    }
  }

  if (/\b(descanso|folga)\b/.test(n) && /\b(quarta|quinta|sexta|segunda|terca|sabado|hoje|amanha)\b/.test(n)) {
    return {
      domain: 'schedule',
      type: 'rest',
      slots: { date: dateFromVoice(n) },
      needsConfirm: false,
    }
  }

  const build =
    /\b(monta|montar|cria|criar|gera|gerar|planilha|treino personalizado)\b/.test(n) ||
    (/\btreino\b/.test(n) && (extractDaysPerWeek(n) || extractObjective(n) || extractMinutes(n)))

  if (build) {
    return {
      domain: 'build',
      type: 'plan',
      slots: {
        daysPerWeek: extractDaysPerWeek(n),
        objective: extractObjective(n),
        minutes: extractMinutes(n),
        location: extractLocation(n),
        restrictions: extractRestrictions(n),
      },
      needsConfirm: false,
    }
  }

  if (/\b(comeca|começar|iniciar|retomar) (o )?treino\b/.test(n) || n === 'vamos treinar') {
    return { domain: 'train', type: 'start' }
  }

  if (/o que (eu )?(faco|treino|treinar) agora|o que treinar hoje|treino de hoje/.test(n)) {
    return { domain: 'query', type: 'today' }
  }

  return { domain: 'unknown' }
}

export function describeBuildSlots(slots = {}) {
  const bits = []
  if (slots.daysPerWeek) bits.push(`${slots.daysPerWeek} vezes por semana`)
  if (slots.objective) bits.push(slots.objective)
  if (slots.minutes) bits.push(`${slots.minutes} minutos`)
  if (slots.location) bits.push(slots.location.toLowerCase())
  if (slots.restrictions?.length) bits.push(`cuidado com ${slots.restrictions.join(', ').toLowerCase()}`)
  return bits.length ? bits.join(', ') : 'seu perfil'
}
