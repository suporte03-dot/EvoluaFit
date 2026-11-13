const BRAZIL_TZ = 'America/Sao_Paulo'

const WEEKDAY_SHORT = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB']
const WEEKDAY_TIMELINE = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

export function parseISO(iso) {
  const [year, month, day] = iso.split('-').map(Number)
  return new Date(year, month - 1, day)
}

export function toISO(date) {
  const d = startOfDay(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function startOfDay(date) {
  const d = date instanceof Date ? new Date(date.getTime()) : parseISO(date)
  d.setHours(0, 0, 0, 0)
  return d
}

export function getTodayBrazil() {
  const iso = new Intl.DateTimeFormat('en-CA', { timeZone: BRAZIL_TZ }).format(new Date())
  return parseISO(iso)
}

export function isSameDay(a, b) {
  const da = startOfDay(a)
  const db = startOfDay(b)
  return (
    da.getFullYear() === db.getFullYear()
    && da.getMonth() === db.getMonth()
    && da.getDate() === db.getDate()
  )
}

export function addDays(date, days) {
  const d = startOfDay(date)
  d.setDate(d.getDate() + days)
  return d
}

export function formatarDataEvento(date) {
  const d = startOfDay(date)
  const day = d.getDate()
  const month = new Intl.DateTimeFormat('pt-BR', { month: 'short' }).format(d)
  const monthLabel = month.charAt(0).toUpperCase() + month.slice(1).replace('.', '')
  return `${day} ${monthLabel}`
}

export function obterDiaSemana(date) {
  return WEEKDAY_SHORT[startOfDay(date).getDay()]
}

export function obterStatusEvento(date) {
  const today = getTodayBrazil()
  const eventDate = startOfDay(date)

  if (isSameDay(eventDate, today)) return 'Hoje'

  const tomorrow = addDays(today, 1)
  if (isSameDay(eventDate, tomorrow)) return 'Amanhã'

  if (eventDate < today) return 'Encerrado'

  return 'Em breve'
}

export function filtrarEventosPorPeriodo(eventos, periodo) {
  const today = getTodayBrazil()
  const todayISO = toISO(today)

  switch (periodo) {
    case 'hoje':
      return eventos.filter((event) => event.dateISO === todayISO)
    case 'amanha':
      return eventos.filter((event) => event.dateISO === toISO(addDays(today, 1)))
    case 'semana':
      return eventos.filter((event) => {
        const { dateISO } = event
        return dateISO >= todayISO && dateISO <= toISO(addDays(today, 6))
      })
    case 'fim-de-semana':
      return eventos.filter((event) => {
        if (event.dateISO < todayISO) return false
        const day = parseISO(event.dateISO).getDay()
        return day === 0 || day === 6
      })
    case '30-dias':
      return eventos.filter((event) => {
        const { dateISO } = event
        return dateISO >= todayISO && dateISO <= toISO(addDays(today, 30))
      })
    default:
      return eventos
  }
}

export function getAgendaWeekDays() {
  const today = getTodayBrazil()
  const dayOfWeek = today.getDay()
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
  const monday = addDays(today, mondayOffset)

  return Array.from({ length: 7 }, (_, index) => {
    const date = addDays(monday, index)
    return {
      key: toISO(date),
      label: WEEKDAY_TIMELINE[date.getDay()],
      short: String(date.getDate()),
      isToday: isSameDay(date, today),
    }
  })
}

export function resolveEventDate(event) {
  if (event.daysOffset !== undefined) {
    return addDays(getTodayBrazil(), event.daysOffset)
  }
  if (event.dateISO) {
    return parseISO(event.dateISO)
  }
  return getTodayBrazil()
}

export function enrichAgendaEvent(event) {
  const eventDate = resolveEventDate(event)
  const dateISO = toISO(eventDate)

  return {
    ...event,
    dateISO,
    date: formatarDataEvento(eventDate),
    day: obterDiaSemana(eventDate),
    status: obterStatusEvento(eventDate),
  }
}
