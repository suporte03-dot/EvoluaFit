/**
 * Ajustes do treino do dia, só para a sessão (nunca reescrevem a planilha salva):
 * tempo disponível ("Hoje eu tenho 30 min") e check-in de prontidão (sono, energia, dor).
 */
import {
  KINDS,
  alternativesFor,
  catalogFor,
  durationLimit,
  entryKind,
  estimateWorkoutMinutes,
  fitToDuration,
  parseRestValue,
  parseSetCount,
  prescribeExercise,
} from './prescription/index.js'

export const TIME_OPTIONS = [20, 30, 45]

export const PAIN_REGIONS = [
  { id: 'joelho', label: 'Joelho' },
  { id: 'lombar', label: 'Lombar' },
  { id: 'ombro', label: 'Ombro' },
  { id: 'outra', label: 'Outra' },
]

export const PROFESSIONAL_ADVICE =
  'Se a dor persistir ou piorar, procure um profissional de saúde. O app não faz diagnóstico.'

/** Padrões que costumam carregar cada região, além de `restrictions` do catálogo. */
const REGION_PATTERNS = {
  joelho: /agach|afundo|avan[çc]o|passada|b[úu]lgar|lunge|step|salto|pliom|burpee|extensora|leg press|hack/,
  lombar: /terra|stiff|good morning|remada curvada|swing|agachamento livre|agachamento com barra|hiperextens/,
  ombro: /desenvolvimento|militar|eleva[çc][ãa]o lateral|eleva[çc][ãa]o frontal|arnold|mergulho|paralela|dips|crucifixo|supino inclinado/,
}

const SLEEP_ALIASES = { ruim: 'poor', poor: 'poor', pouco: 'poor', ok: 'ok', bom: 'good', good: 'good' }
const ENERGY_ALIASES = { baixa: 'low', low: 'low', ok: 'ok', alta: 'high', high: 'high' }

function cloneExercises(workout) {
  return (workout?.exercises || []).map((ex) => ({ ...ex }))
}

function plural(n, one, many) {
  return n === 1 ? one : many
}

function joinPt(items) {
  if (items.length <= 1) return items.join('')
  return `${items.slice(0, -1).join(', ')} e ${items[items.length - 1]}`
}

function originalMinutesOf(workout) {
  return Number(workout?.estimatedMinutes) || estimateWorkoutMinutes(workout) || 0
}

/** "Cortei 1 série de Crucifixo e removi Panturrilha" a partir das mudanças. */
export function describeChanges(changes = []) {
  const setCuts = new Map()
  const removed = []
  const replaced = []
  for (const change of changes) {
    if (change.type === 'sets') {
      const cut = Math.max(0, Number(change.from) - Number(change.to))
      if (cut > 0) setCuts.set(change.name, (setCuts.get(change.name) || 0) + cut)
    } else if (change.type === 'remove') {
      if (!removed.includes(change.name)) removed.push(change.name)
    } else if (change.type === 'replace') {
      replaced.push(`${change.from} por ${change.to}`)
    }
  }
  for (const name of removed) setCuts.delete(name)
  const parts = []
  if (setCuts.size) {
    const items = [...setCuts.entries()].map(([name, n]) => `${n} ${plural(n, 'série', 'séries')} de ${name}`)
    parts.push(`cortei ${joinPt(items)}`)
  }
  if (removed.length) parts.push(`removi ${joinPt(removed)}`)
  if (replaced.length) parts.push(`troquei ${joinPt(replaced)}`)
  if (!parts.length) return ''
  const text = joinPt(parts)
  return text.charAt(0).toUpperCase() + text.slice(1)
}

function baseExercises(workout) {
  if (workout?.sessionOriginalExercises?.length) {
    return workout.sessionOriginalExercises.map((ex) => ({ ...ex }))
  }
  return cloneExercises(workout)
}

/**
 * Encaixa o treino no tempo disponível. `minutes` vazio = tempo normal (cópia intacta).
 * Mantém `estimatedMinutes` original; o tempo da sessão vai em `sessionMinutes`.
 * @param {{ useCurrent?: boolean }} options — se true, corta a partir dos exercícios atuais
 *   (já ajustados por prontidão); senão, restaura `sessionOriginalExercises` quando existir.
 */
export function adjustForTime(workout, minutes, options = {}) {
  if (!workout) return { workout, changes: [], minutes: 0, summary: '', target: null }
  const target = Number(minutes) > 0 ? Number(minutes) : null
  const original = options.useCurrent ? cloneExercises(workout) : baseExercises(workout)
  const planOriginal = workout.sessionOriginalExercises || (options.useCurrent ? null : original)
  if (!target || !original.length) {
    const { sessionMinutes: _m, sessionTimeTarget: _t, ...rest } = workout
    const minutes = estimateWorkoutMinutes(original)
    return {
      workout: {
        ...rest,
        exercises: original,
        ...(planOriginal ? { sessionOriginalExercises: planOriginal } : {}),
      },
      changes: [],
      minutes,
      summary: '',
      target: null,
      fits: true,
      originalMinutes: originalMinutesOf(workout),
    }
  }
  const fitted = fitToDuration(original, target)
  const limit = durationLimit(target)
  const fits = fitted.minutes <= limit
  const described = describeChanges(fitted.changes)
  let summary = ''
  if (!fits) {
    summary = `A versão mais curta ainda fica em ~${fitted.minutes} min (meta ${target} min). Escolha outro tempo ou comece esta versão.`
  } else if (fitted.changes.length) {
    summary = `${described} para caber em ${target} min. Prévia: ~${fitted.minutes} min.`
  } else {
    summary = `O treino já cabe em ${target} min (~${fitted.minutes} min).`
  }
  return {
    workout: {
      ...workout,
      exercises: fitted.exercises,
      estimatedMinutes: workout.estimatedMinutes,
      sessionMinutes: fitted.minutes,
      sessionTimeTarget: target,
      sessionOriginalExercises: planOriginal || original,
    },
    changes: fitted.changes,
    minutes: fitted.minutes,
    summary,
    target,
    fits,
    originalMinutes: originalMinutesOf(workout),
  }
}

/** low = dormiu mal e energia baixa; high = dormiu bem e energia alta. */
export function readinessLevel(check = {}) {
  const sleep = SLEEP_ALIASES[String(check.sleep || '').toLowerCase()] || 'ok'
  const energy = ENERGY_ALIASES[String(check.energy || '').toLowerCase()] || 'ok'
  if (sleep === 'poor' && energy === 'low') return 'low'
  if (sleep === 'good' && energy === 'high') return 'high'
  return 'normal'
}

/** Normaliza a região de dor (aceita texto livre antigo: "dor no joelho"). */
export function painRegionOf(check = {}) {
  if (!check.pain) return null
  const raw = String(check.painRegion || check.painGroup || '').toLowerCase()
  if (!raw || raw === 'leve') return null
  if (/joelho/.test(raw)) return 'joelho'
  if (/lombar|coluna|costas baixa/.test(raw)) return 'lombar'
  if (/ombro/.test(raw)) return 'ombro'
  if (raw === 'outra') return 'outra'
  return 'outra'
}

export function loadsRegion(exercise, region) {
  if (!exercise || !REGION_PATTERNS[region]) return false
  const catalog = catalogFor(exercise)
  const restrictions = [...(exercise.restrictions || []), ...(catalog?.restrictions || [])]
  if (restrictions.includes(region)) return true
  const name = `${exercise.name || ''} ${catalog?.name || ''}`.toLowerCase()
  return REGION_PATTERNS[region].test(name)
}

function replacementFor(exercise, region, exclude, ctx) {
  let pick = alternativesFor(exercise, { exclude, limit: 200 }).find((alt) => !loadsRegion(alt, region))
  if (!pick && region === 'joelho') {
    const hipDominant = { category: 'Glúteos', kind: entryKind(exercise).kind }
    pick = alternativesFor(hipDominant, { exclude, limit: 200 }).find((alt) => !loadsRegion(alt, region))
  }
  if (!pick) return null
  const rx = prescribeExercise(pick, ctx)
  return {
    ...exercise,
    exerciseId: pick.id,
    name: pick.name,
    equipment: pick.equipment,
    sets: Math.min(parseSetCount(exercise.sets), rx.sets),
    reps: rx.reps,
    rest: rx.rest,
    restSeconds: rx.restSeconds,
    kind: rx.kind,
    principal: rx.principal,
    observation: rx.observation,
    replacedFrom: exercise.name,
  }
}

function withExtraRest(ex, seconds) {
  const next = parseRestValue(ex) + seconds
  const numericRest = typeof ex.rest === 'number' || /^\d+$/.test(String(ex.rest ?? ''))
  return { ...ex, restSeconds: next, ...(numericRest || ex.rest == null ? { rest: next } : {}) }
}

/**
 * Ajusta o treino do dia pelo check-in. Nunca altera o objeto recebido.
 * @param {{ sleep?, energy?, pain?, painRegion?, painGroup? }} check
 * @param {{ level?, goal? }} ctx — perfil, para prescrever substitutos
 */
export function adjustForReadiness(workout, check = {}, ctx = {}) {
  const level = readinessLevel(check)
  const region = painRegionOf(check)
  const empty = { workout, changes: [], messages: [], level, region, professionalAdvice: null, note: '' }
  if (!workout) return empty

  let list = cloneExercises(workout)
  const changes = []
  const messages = []
  let note = ''

  if (level === 'low') {
    const reduceKinds = new Set([KINDS.composto, KINDS.isolado])
    list = list.map((ex) => {
      if (!reduceKinds.has(entryKind(ex).kind)) return ex
      const from = parseSetCount(ex.sets)
      const base = withExtraRest(ex, 15)
      if (from <= 2) return base
      changes.push({
        type: 'sets',
        exerciseId: ex.exerciseId,
        name: ex.name,
        from,
        to: from - 1,
        reason: 'Prontidão baixa: uma série a menos hoje.',
      })
      return { ...base, sets: from - 1 }
    })
    note = 'Prontidão baixa: treine 2–3 repetições longe da falha e use cargas um pouco menores hoje.'
    messages.push('Dia de recuperação parcial: menos volume, mesmas repetições e +15 s de descanso.')
  } else if (level === 'high') {
    messages.push('Boa prontidão. Treino mantido como planejado.')
  }

  let professionalAdvice = null
  if (check.pain && !region) {
    professionalAdvice = PROFESSIONAL_ADVICE
    messages.push('Dor leve: reduza a carga ou pule o movimento se incomodar.')
  }

  if (region) {
    professionalAdvice = PROFESSIONAL_ADVICE
    if (region === 'outra') {
      messages.push('Evite qualquer movimento que provoque dor e reduza a carga se precisar.')
    } else {
      const label = { joelho: 'o joelho', lombar: 'a lombar', ombro: 'o ombro' }[region]
      const used = new Set(list.map((ex) => ex.exerciseId).filter(Boolean))
      const next = []
      for (const ex of list) {
        if (!loadsRegion(ex, region)) {
          next.push(ex)
          continue
        }
        const swap = replacementFor(ex, region, [...used], ctx)
        if (swap) {
          used.add(swap.exerciseId)
          next.push(swap)
          changes.push({
            type: 'replace',
            exerciseId: ex.exerciseId,
            name: ex.name,
            from: ex.name,
            to: swap.name,
            reason: `Alternativa que poupa ${label}.`,
          })
        } else {
          changes.push({
            type: 'remove',
            exerciseId: ex.exerciseId,
            name: ex.name,
            from: ex.name,
            to: null,
            reason: `Exercício que carrega ${label} removido hoje.`,
          })
        }
      }
      list = next
      if (changes.some((c) => c.type === 'replace' || c.type === 'remove')) {
        messages.push(`Poupei ${label} nesta sessão.`)
      } else {
        messages.push(`Nenhum exercício de hoje carrega muito ${label}. Se algum incomodar, pule.`)
      }
    }
  }

  if (!changes.length && !note) {
    return { ...empty, messages, professionalAdvice }
  }

  return {
    workout: {
      ...workout,
      exercises: list,
      estimatedMinutes: workout.estimatedMinutes,
      sessionMinutes: estimateWorkoutMinutes(list),
      ...(note ? { readinessNote: note } : {}),
    },
    changes,
    messages,
    level,
    region,
    professionalAdvice,
    note,
  }
}

/** Prontidão primeiro (o que sai por dor não conta tempo), depois o tempo disponível. */
export function adjustDayWorkout(workout, check = {}, ctx = {}) {
  if (!workout) return { workout, changes: [], messages: [], summary: '', professionalAdvice: null }
  const base = {
    ...workout,
    exercises: baseExercises(workout),
    estimatedMinutes: workout.estimatedMinutes,
  }
  const readiness = adjustForReadiness(base, check, ctx)
  const time = adjustForTime(
    {
      ...readiness.workout,
      sessionOriginalExercises: workout.sessionOriginalExercises || base.exercises,
    },
    check.minutes,
    { useCurrent: true },
  )
  const changes = [...readiness.changes, ...time.changes]
  const sessionMinutes = estimateWorkoutMinutes(time.workout?.exercises || [])
  const described = describeChanges(changes)
  const summary = described
    ? `${described}${time.target ? ` para caber em ${time.target} min` : ''}. Prévia: ~${sessionMinutes} min.`
    : time.summary
  return {
    workout: {
      ...time.workout,
      estimatedMinutes: workout.estimatedMinutes,
      sessionMinutes,
    },
    changes,
    messages: readiness.messages,
    summary,
    note: readiness.note,
    level: readiness.level,
    region: readiness.region,
    professionalAdvice: readiness.professionalAdvice,
    originalMinutes: originalMinutesOf(workout),
    sessionMinutes,
    fits: time.fits !== false,
    target: time.target,
  }
}
