import {
  competitions as staticCompetitions,
  lastUpdated as staticLastUpdated,
  sportFilters as staticSportFilters,
  getCompetitionById as getStaticCompetitionById,
  getCompetitionsBySport,
} from '../data/standingsData'

const API_URL = import.meta.env.VITE_STANDINGS_API_URL || ''

let cache = [...staticCompetitions]
let lastUpdated = staticLastUpdated

async function tryFetchExternalStandings() {
  if (!API_URL) return null

  try {
    const response = await fetch(API_URL, { signal: AbortSignal.timeout(6000) })
    if (!response.ok) return null
    const data = await response.json()
    if (!Array.isArray(data?.competitions) || data.competitions.length === 0) return null
    return data
  } catch {
    return null
  }
}

export function getLastUpdated() {
  return lastUpdated
}

export function getSportFilters() {
  return staticSportFilters
}

export function getCompetitions(sport = null) {
  if (sport) return cache.filter((c) => c.sport === sport)
  return [...cache]
}

export function getCompetitionById(id) {
  return cache.find((c) => c.id === id) ?? getStaticCompetitionById(id) ?? null
}

export function searchStandings(query, competitions = null) {
  const normalized = query.trim().toLowerCase()
  const pool = competitions ?? cache
  if (!normalized) return [...pool]

  return pool.filter((competition) => {
    const nameMatch = competition.name.toLowerCase().includes(normalized)
    const countryMatch = competition.country?.toLowerCase().includes(normalized)
    const teamMatch = competition.teams?.some((t) => t.name.toLowerCase().includes(normalized))
    const groupMatch = competition.groups?.some((g) =>
      g.teams.some((t) => t.name.toLowerCase().includes(normalized)),
    )
    const knockoutMatch = competition.knockout
      ? Object.values(competition.knockout).flat().some(
          (m) => m.home?.toLowerCase().includes(normalized) || m.away?.toLowerCase().includes(normalized),
        )
      : false
    return nameMatch || countryMatch || teamMatch || groupMatch || knockoutMatch
  })
}

export function getFeaturedCompetitions(sport = 'futebol') {
  return getCompetitions(sport).filter((c) => c.featured)
}

export async function fetchStandings() {
  const external = await tryFetchExternalStandings()
  if (external) {
    cache = external.competitions
    lastUpdated = external.lastUpdated ?? new Date().toISOString()
  }
  return { competitions: [...cache], lastUpdated }
}

export async function refreshStandings() {
  await new Promise((resolve) => setTimeout(resolve, 350))

  const external = await tryFetchExternalStandings()
  if (external) {
    cache = external.competitions
  } else {
    cache = [...staticCompetitions]
  }

  lastUpdated = new Date().toISOString()
  return { competitions: [...cache], lastUpdated }
}

export function findTeamInCompetition(competition, teamIdOrName) {
  if (!competition) return null
  const needle = teamIdOrName.toLowerCase()

  const fromTeams = competition.teams?.find(
    (t) => t.id === teamIdOrName || t.name.toLowerCase() === needle,
  )
  if (fromTeams) return { team: fromTeams, competition }

  for (const group of competition.groups ?? []) {
    const found = group.teams.find((t) => t.id === teamIdOrName || t.name.toLowerCase() === needle)
    if (found) return { team: found, competition, group: group.name }
  }

  return null
}
