import { brasileiraoSerieA as staticData, validateBrasileiraoData } from '../data/brasileiraoData'

const API_URL = import.meta.env.VITE_BRASILEIRAO_API_URL || ''

let cache = structuredClone(staticData)
let lastUpdated = staticData.lastUpdate

function cloneData() {
  return structuredClone(cache)
}

async function tryFetchExternal() {
  if (!API_URL) return null

  try {
    const response = await fetch(API_URL, { signal: AbortSignal.timeout(6000) })
    if (!response.ok) return null
    const data = await response.json()
    if (!data?.teams?.length) return null
    return data
  } catch {
    return null
  }
}

export function getBrasileiraoTable() {
  return cloneData().teams
}

export function getBrasileiraoMatches(round = null) {
  const data = cloneData()
  if (round == null) return data.matches
  return data.matches.filter((m) => m.round === round)
}

export function getTopScorers() {
  return cloneData().topScorers
}

export function getBrasileiraoData() {
  return cloneData()
}

export function getCurrentRound() {
  return cache.currentRound
}

export function getLastSportsUpdate() {
  return lastUpdated
}

export function formatSportsUpdate(isoString = lastUpdated) {
  if (!isoString) return '—'
  try {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(isoString))
  } catch {
    return isoString
  }
}

export async function updateSportsData() {
  await new Promise((resolve) => setTimeout(resolve, 400))

  const external = await tryFetchExternal()
  if (external) {
    cache = { ...cache, ...external }
  } else {
    cache = structuredClone(staticData)
    const rotated = [...cache.matches]
    const last = rotated.pop()
    if (last) {
      rotated.unshift({ ...last, id: Date.now(), status: 'Agendado' })
      cache.matches = rotated
    }
  }

  const errors = validateBrasileiraoData(cache)
  if (errors.length > 0) {
    cache.teams = staticData.teams
  }

  lastUpdated = new Date().toISOString()
  cache.lastUpdate = lastUpdated

  return {
    data: cloneData(),
    lastUpdated,
  }
}
