/**
 * EvoluaFit training calendar helpers.
 * Calendar entries map to FitnessContext workouts (evoluafit-data).
 * Optional mirror key: training_calendar (kept in sync for tooling / offline reads).
 */

export const CALENDAR_STORAGE_KEY = 'training_calendar'

export const MONTHS_PT = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
]

export const WEEKDAYS_SHORT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
export const WEEKDAYS_FULL = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']

/** Canonical internal statuses */
export const CALENDAR_STATUS = {
  planned: 'planned',
  completed: 'completed',
  partial: 'partial',
  rest: 'rest',
  pending: 'pending',
  missed: 'missed',
}

/** Persist labels used in workouts (Portuguese, title case) */
export const STATUS_LABEL = {
  planned: 'Planejado',
  completed: 'Realizado',
  partial: 'Parcial',
  rest: 'Descanso',
  pending: 'Pendente',
  missed: 'Atrasado',
}

const LABEL_TO_CANONICAL = {
  planejado: 'planned',
  planned: 'planned',
  realizado: 'completed',
  completed: 'completed',
  parcial: 'partial',
  partial: 'partial',
  descanso: 'rest',
  rest: 'rest',
  pendente: 'pending',
  pending: 'pending',
  atrasado: 'missed',
  missed: 'missed',
  pulado: 'rest',
}

export function formatDateKey(date) {
  const d = date instanceof Date ? date : new Date(date)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function parseDateKey(key) {
  if (!key) return null
  const [y, m, d] = String(key).split('-').map(Number)
  if (!y || !m || !d) return null
  return new Date(y, m - 1, d)
}

export function todayKey(ref = new Date()) {
  return formatDateKey(ref)
}

export function addDays(dateKey, days) {
  const d = parseDateKey(dateKey)
  if (!d) return dateKey
  d.setDate(d.getDate() + days)
  return formatDateKey(d)
}

export function isIntenseWorkout(entry) {
  if (!entry) return false
  if (entry.isRest || entry.status === 'Descanso' || normalizeRawStatus(entry.status) === 'rest') {
    return false
  }
  const type = String(entry.workoutType || entry.name || '').toLowerCase()
  if (/mobilidade|alongamento|descanso|recupera|yoga|leve/.test(type)) return false
  const groups = (entry.muscleGroups || []).join(' ').toLowerCase()
  if (groups && /mobilidade|alongamento/.test(groups) && (entry.muscleGroups || []).length <= 2) {
    return false
  }
  return true
}

function normalizeRawStatus(status) {
  return LABEL_TO_CANONICAL[String(status || '').toLowerCase()] || 'pending'
}

/**
 * Resolve display status for a calendar entry on a given date.
 * Past Pendente/Planejado → missed; future Pendente → planned; today Pendente → pending.
 */
export function getTrainingStatusByDate(entry, dateKey, referenceDate = new Date()) {
  if (!entry) return null
  const today = todayKey(referenceDate)
  const key = dateKey || entry.date
  const raw = normalizeRawStatus(entry.status)

  if (entry.isRest || raw === 'rest') return CALENDAR_STATUS.rest
  if (raw === 'completed') return CALENDAR_STATUS.completed
  if (raw === 'partial') return CALENDAR_STATUS.partial
  if (raw === 'missed') return CALENDAR_STATUS.missed

  if (raw === 'planned' || raw === 'pending') {
    if (key < today) return CALENDAR_STATUS.missed
    if (key === today) return CALENDAR_STATUS.pending
    return CALENDAR_STATUS.planned
  }

  return raw
}

export function statusLabel(canonical) {
  return STATUS_LABEL[canonical] || STATUS_LABEL.pending
}

export function toPersistedStatus(canonical) {
  return STATUS_LABEL[canonical] || STATUS_LABEL.pending
}

/** Build month grid cells (null = padding from previous/next month filler) */
export function getCurrentMonthDays(year, month, workouts = [], referenceDate = new Date()) {
  const firstWeekday = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const byDate = groupWorkoutsByDate(workouts)
  const today = todayKey(referenceDate)
  const cells = []

  for (let i = 0; i < firstWeekday; i += 1) cells.push(null)

  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = formatDateKey(new Date(year, month, day))
    const entries = byDate[date] || []
    const primary = pickPrimaryEntry(entries)
    const status = primary
      ? getTrainingStatusByDate(primary, date, referenceDate)
      : entries.length === 0
        ? null
        : null

    cells.push({
      day,
      date,
      weekday: new Date(year, month, day).getDay(),
      entries,
      primary,
      status,
      isToday: date === today,
      isEmpty: entries.length === 0,
      isRestOnly: entries.length > 0 && entries.every((e) => getTrainingStatusByDate(e, date, referenceDate) === 'rest'),
    })
  }

  return cells
}

export function getWeekDays(referenceDate = new Date(), workouts = []) {
  const ref = new Date(referenceDate)
  ref.setHours(0, 0, 0, 0)
  const start = new Date(ref)
  start.setDate(ref.getDate() - ref.getDay())
  const byDate = groupWorkoutsByDate(workouts)
  const today = todayKey(referenceDate)
  const days = []

  for (let i = 0; i < 7; i += 1) {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    const date = formatDateKey(d)
    const entries = byDate[date] || []
    const primary = pickPrimaryEntry(entries)
    days.push({
      day: d.getDate(),
      date,
      weekday: d.getDay(),
      entries,
      primary,
      status: primary ? getTrainingStatusByDate(primary, date, referenceDate) : null,
      isToday: date === today,
      isEmpty: entries.length === 0,
    })
  }
  return days
}

export function groupWorkoutsByDate(workouts = []) {
  const map = {}
  workouts.forEach((w) => {
    if (!w?.date) return
    if (!map[w.date]) map[w.date] = []
    map[w.date].push(w)
  })
  Object.keys(map).forEach((k) => {
    map[k].sort((a, b) => String(a.name || '').localeCompare(String(b.name || '')))
  })
  return map
}

function pickPrimaryEntry(entries) {
  if (!entries?.length) return null
  const priority = ['partial', 'pending', 'planned', 'missed', 'completed', 'rest']
  const scored = [...entries].sort((a, b) => {
    const sa = getTrainingStatusByDate(a, a.date)
    const sb = getTrainingStatusByDate(b, b.date)
    return priority.indexOf(sa) - priority.indexOf(sb)
  })
  return scored[0]
}

export function workoutToCalendarEntry(workout) {
  if (!workout) return null
  const status = getTrainingStatusByDate(workout, workout.date)
  return {
    id: workout.id,
    date: workout.date,
    workoutId: workout.id,
    workoutName: workout.name,
    workoutType: workout.workoutType || workout.dayLabel || inferTypeFromName(workout.name),
    muscleGroups: workout.muscleGroups || [],
    exercises: workout.exercises || [],
    duration: workout.estimatedMinutes || workout.durationMinutes || 0,
    status,
    notes: workout.notes || '',
    completedAt: workout.completedAt || null,
    isRest: Boolean(workout.isRest) || status === 'rest',
  }
}

function inferTypeFromName(name = '') {
  const n = String(name).toLowerCase()
  if (/push/.test(n)) return 'Push'
  if (/pull/.test(n)) return 'Pull'
  if (/legs|perna/.test(n)) return 'Legs'
  if (/full|corpo/.test(n)) return 'Full Body'
  if (/cardio/.test(n)) return 'Cardio'
  if (/mobil|along|descanso/.test(n)) return 'Mobilidade'
  return 'Treino'
}

export function addWorkoutToCalendar(workouts, payload) {
  const date = payload.date || todayKey()
  const entry = {
    id: payload.id || `workout-cal-${Date.now()}`,
    name: payload.workoutName || payload.name || 'Treino',
    date,
    workoutType: payload.workoutType || payload.type || inferTypeFromName(payload.workoutName || payload.name),
    muscleGroups: payload.muscleGroups || [],
    exercises: (payload.exercises || []).map((ex) => ({ ...ex })),
    estimatedMinutes: Number(payload.duration || payload.estimatedMinutes || 45),
    status: toPersistedStatus(payload.status || 'planned'),
    notes: payload.notes || '',
    createdAt: new Date().toISOString(),
    planId: payload.planId,
    source: payload.source || 'calendar',
    isRest: false,
  }
  const next = [entry, ...(workouts || [])]
  mirrorCalendar(next)
  return { workouts: next, entry }
}

export function markWorkoutCompleted(workouts, workoutId, extras = {}) {
  const completedAt = extras.completedAt || new Date().toISOString()
  const next = (workouts || []).map((w) => {
    if (w.id !== workoutId) return w
    return {
      ...w,
      status: toPersistedStatus('completed'),
      completedAt,
      notes: extras.notes != null ? extras.notes : w.notes,
      estimatedMinutes: extras.duration != null ? extras.duration : w.estimatedMinutes,
      exercises: extras.exercises || w.exercises,
    }
  })
  mirrorCalendar(next)
  return next
}

export function markWorkoutPartial(workouts, workoutId) {
  const next = (workouts || []).map((w) => {
    if (w.id !== workoutId) return w
    if (w.status === 'Realizado' || w.status === STATUS_LABEL.completed) return w
    return { ...w, status: toPersistedStatus('partial') }
  })
  mirrorCalendar(next)
  return next
}

export function markRestDay(workouts, date, notes = '') {
  const dayKey = date || todayKey()
  const withoutNonRest = (workouts || []).filter((w) => {
    if (w.date !== dayKey) return true
    const st = getTrainingStatusByDate(w, dayKey)
    return st === 'completed' || st === 'partial'
  })

  const rest = {
    id: `rest-${dayKey}-${Date.now()}`,
    name: 'Descanso',
    date: dayKey,
    workoutType: 'Descanso',
    muscleGroups: [],
    exercises: [],
    estimatedMinutes: 0,
    status: toPersistedStatus('rest'),
    notes: notes || 'Dia de recuperação — priorize sono, hidratação e mobilidade leve.',
    createdAt: new Date().toISOString(),
    isRest: true,
    source: 'calendar',
  }

  const next = [rest, ...withoutNonRest]
  mirrorCalendar(next)
  return { workouts: next, entry: rest }
}

export function updateCalendarNotes(workouts, workoutId, notes) {
  const next = (workouts || []).map((w) => (w.id === workoutId ? { ...w, notes } : w))
  mirrorCalendar(next)
  return next
}

export function updateCalendarWorkout(workouts, workoutId, updates) {
  const next = (workouts || []).map((w) => {
    if (w.id !== workoutId) return w
    const mapped = { ...w, ...updates }
    if (updates.status && CALENDAR_STATUS[updates.status]) {
      mapped.status = toPersistedStatus(updates.status)
    }
    if (updates.duration != null) mapped.estimatedMinutes = updates.duration
    if (updates.workoutName) mapped.name = updates.workoutName
    if (updates.workoutType) mapped.workoutType = updates.workoutType
    return mapped
  })
  mirrorCalendar(next)
  return next
}

/**
 * Distribute weekly plan schedule onto calendar days.
 * @param {object} options.overwrite — replace existing non-completed entries on target dates
 */
export function syncPlanToCalendar(workouts, planWorkouts, options = {}) {
  const { overwrite = true, startDate } = options
  const base = startDate ? parseDateKey(startDate) : new Date()
  const today = todayKey(base)

  const intenseRecent = countConsecutiveIntenseDays(workouts, today)
  const safetyWarning =
    intenseRecent >= 6
      ? 'Você já tem vários dias intensos seguidos. Considere incluir descanso ou mobilidade nesta semana.'
      : null

  let dated = (planWorkouts || []).map((w, index) => {
    if (w.date) return { ...w }
    const d = new Date(base)
    d.setDate(base.getDate() + index)
    return { ...w, date: formatDateKey(d) }
  })

  if (intenseRecent >= 6 && dated.length) {
    const first = dated[0]
    if (isIntenseWorkout(first)) {
      dated = [
        {
          ...first,
          id: `rest-suggest-${Date.now()}`,
          name: 'Descanso / Mobilidade',
          workoutType: 'Mobilidade',
          status: toPersistedStatus('rest'),
          isRest: true,
          exercises: first.exercises?.filter((ex) =>
            /mobil|along|core/i.test(String(ex.muscleGroup || ex.name || '')),
          ) || [],
          notes: 'Sugestão de recuperação após sequência intensa.',
          estimatedMinutes: 25,
        },
        ...dated.slice(1).map((w, i) => ({
          ...w,
          date: addDays(first.date || today, i + 1),
        })),
      ]
    }
  }

  const targetDates = new Set(dated.map((w) => w.date))
  let next = [...(workouts || [])]

  if (overwrite) {
    next = next.filter((w) => {
      if (!targetDates.has(w.date)) return true
      const st = getTrainingStatusByDate(w, w.date)
      return st === 'completed' || st === 'partial'
    })
  }

  const incoming = dated.map((w) => ({
    ...w,
    id: w.id || `workout-plan-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    status: w.status || toPersistedStatus('planned'),
    source: w.source || 'plan-sync',
    createdAt: w.createdAt || new Date().toISOString(),
  }))

  next = [...incoming, ...next]
  mirrorCalendar(next)
  return { workouts: next, added: incoming.length, safetyWarning }
}

export function countConsecutiveIntenseDays(workouts, fromDateKey = todayKey()) {
  let count = 0
  let cursor = fromDateKey
  const byDate = groupWorkoutsByDate(workouts)

  for (let i = 0; i < 14; i += 1) {
    const entries = byDate[cursor] || []
    const hasIntense = entries.some(
      (e) =>
        isIntenseWorkout(e) &&
        ['completed', 'partial', 'planned', 'pending', 'missed'].includes(
          getTrainingStatusByDate(e, cursor),
        ),
    )
    const hasRest = entries.some((e) => getTrainingStatusByDate(e, cursor) === 'rest')
    if (hasIntense && !hasRest) {
      count += 1
      cursor = addDays(cursor, -1)
    } else if (entries.length === 0 && i === 0) {
      cursor = addDays(cursor, -1)
    } else {
      break
    }
  }
  return count
}

export function wouldCreateSevenIntenseDays(workouts, dateKey, payload) {
  if (!isIntenseWorkout(payload)) return false
  const simulated = addWorkoutToCalendar(workouts, {
    ...payload,
    date: dateKey,
    status: 'planned',
  }).workouts
  return countConsecutiveIntenseDays(simulated, dateKey) >= 7
}

/**
 * @param {object[]} workouts
 * @param {Date} referenceDate
 * @param {{ weekGoal?: number }} [options] — weekGoal from profile.daysPerWeek or weekly goal
 */
export function getCalendarSummary(workouts = [], referenceDate = new Date(), options = {}) {
  const month = referenceDate.getMonth()
  const year = referenceDate.getFullYear()
  const today = todayKey(referenceDate)
  const week = getWeekDays(referenceDate, workouts)
  const monthCells = getCurrentMonthDays(year, month, workouts, referenceDate).filter(Boolean)

  let planned = 0
  let completed = 0
  let rest = 0
  let pending = 0
  let missed = 0
  let partial = 0

  monthCells.forEach((cell) => {
    if (!cell.entries.length) return
    const statuses = new Set(
      cell.entries.map((e) => getTrainingStatusByDate(e, cell.date, referenceDate)),
    )
    if (statuses.has('completed')) completed += 1
    else if (statuses.has('partial')) partial += 1
    else if (statuses.has('rest') && cell.isRestOnly) rest += 1
    else if (statuses.has('missed')) missed += 1
    else if (statuses.has('pending')) pending += 1
    else if (statuses.has('planned')) planned += 1
  })

  pending += partial

  const streak = calculateCalendarStreak(workouts, referenceDate)

  const upcoming = (workouts || [])
    .filter((w) => {
      const st = getTrainingStatusByDate(w, w.date, referenceDate)
      return w.date >= today && (st === 'planned' || st === 'pending') && !w.isRest
    })
    .sort((a, b) => a.date.localeCompare(b.date))

  const nextWorkout = upcoming[0] || null

  const weekCompleted = week.filter((d) =>
    d.entries.some((e) => getTrainingStatusByDate(e, d.date, referenceDate) === 'completed'),
  ).length
  const weekScheduled = week.filter((d) =>
    d.entries.some((e) => {
      const st = getTrainingStatusByDate(e, d.date, referenceDate)
      return st === 'planned' || st === 'pending' || st === 'completed' || st === 'partial'
    }),
  ).length

  // Prefer explicit user goal; fall back to scheduled count; never invent a fake "1"
  const weekGoal =
    options.weekGoal > 0
      ? options.weekGoal
      : weekScheduled > 0
        ? weekScheduled
        : null

  const weekPct = weekGoal ? Math.min((weekCompleted / weekGoal) * 100, 100) : 0

  return {
    planned,
    completed,
    rest,
    pending,
    missed,
    partial,
    streak,
    nextWorkout,
    nextLabel: nextWorkout
      ? `${nextWorkout.name} · ${formatDisplayDate(nextWorkout.date)}`
      : 'Nenhum treino agendado',
    weekCompleted,
    weekGoal,
    weekScheduled,
    weekPct,
    weekGoalSource: options.weekGoal > 0 ? 'meta' : weekScheduled > 0 ? 'agenda' : null,
    weekLabel:
      weekGoal != null
        ? `${weekCompleted} de ${weekGoal} na semana`
        : `${weekCompleted} realizados na semana`,
    monthLabel: `${completed} realizados em ${MONTHS_PT[month]}`,
    intenseStreak: countConsecutiveIntenseDays(workouts, today),
    hasMonthActivity: planned + completed + rest + pending + missed > 0,
  }
}

function calculateCalendarStreak(workouts, referenceDate = new Date()) {
  const byDate = groupWorkoutsByDate(workouts)
  let streak = 0
  let cursor = todayKey(referenceDate)

  for (let i = 0; i < 60; i += 1) {
    const entries = byDate[cursor] || []
    const done = entries.some((e) => {
      const st = getTrainingStatusByDate(e, cursor, referenceDate)
      return st === 'completed' || st === 'partial'
    })
    if (done) {
      streak += 1
      cursor = addDays(cursor, -1)
    } else if (i === 0) {
      cursor = addDays(cursor, -1)
    } else {
      break
    }
  }
  return streak
}

export function formatDisplayDate(dateKey) {
  const d = parseDateKey(dateKey)
  if (!d) return dateKey
  return `${d.getDate()} de ${MONTHS_PT[d.getMonth()]}`
}

export function formatMonthLabel(year, month) {
  return `${MONTHS_PT[month]} de ${year}`
}

export function filterCalendarEntries(workouts, filter, referenceDate = new Date()) {
  const today = todayKey(referenceDate)
  const ref = new Date(referenceDate)
  const weekStart = new Date(ref)
  weekStart.setDate(ref.getDate() - ref.getDay())
  weekStart.setHours(0, 0, 0, 0)
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekStart.getDate() + 7)
  const month = ref.getMonth()
  const year = ref.getFullYear()

  return (workouts || []).filter((w) => {
    const st = getTrainingStatusByDate(w, w.date, referenceDate)
    const d = parseDateKey(w.date)
    if (!d) return false

    switch (filter) {
      case 'planned':
        return st === 'planned'
      case 'completed':
        return st === 'completed'
      case 'pending':
        return st === 'pending' || st === 'missed' || st === 'partial'
      case 'rest':
        return st === 'rest'
      case 'week':
        return d >= weekStart && d < weekEnd
      case 'month':
        return d.getMonth() === month && d.getFullYear() === year
      case 'all':
      default:
        return true
    }
  })
}

export function getMobileAgenda(workouts, referenceDate = new Date()) {
  const today = todayKey(referenceDate)
  const tomorrow = addDays(today, 1)
  const byDate = groupWorkoutsByDate(workouts)

  const build = (date) => {
    const entries = byDate[date] || []
    return {
      date,
      label: formatDisplayDate(date),
      weekday: WEEKDAYS_FULL[parseDateKey(date)?.getDay() || 0],
      entries,
      primary: pickPrimaryEntry(entries),
      status: pickPrimaryEntry(entries)
        ? getTrainingStatusByDate(pickPrimaryEntry(entries), date, referenceDate)
        : null,
      isEmpty: entries.length === 0,
    }
  }

  const upcomingDates = Object.keys(byDate)
    .filter((d) => d > tomorrow)
    .sort()
    .slice(0, 10)

  const emptyUpcoming = []
  for (let i = 2; i < 8 && upcomingDates.length + emptyUpcoming.length < 5; i += 1) {
    const d = addDays(today, i)
    if (!byDate[d]) emptyUpcoming.push(d)
  }

  return {
    today: build(today),
    tomorrow: build(tomorrow),
    upcoming: [...upcomingDates, ...emptyUpcoming]
      .sort()
      .slice(0, 8)
      .map(build),
  }
}

export function mirrorCalendar(workouts) {
  try {
    const entries = (workouts || []).map(workoutToCalendarEntry).filter(Boolean)
    localStorage.setItem(CALENDAR_STORAGE_KEY, JSON.stringify(entries))
  } catch {
    /* ignore quota / private mode */
  }
}

export function readCalendarMirror() {
  try {
    const raw = localStorage.getItem(CALENDAR_STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw)
  } catch {
    return []
  }
}

/** Ensure mirror exists after load */
export function ensureCalendarMirror(workouts) {
  const existing = readCalendarMirror()
  if (!existing.length && workouts?.length) {
    mirrorCalendar(workouts)
  }
}
