export const ZONE_COLORS = {
  classification: '#00E887',
  preQualification: '#4DA3FF',
  neutral: 'transparent',
  relegation: '#FF4D6A',
  leader: '#FFD166',
}

const TEAM_ZONE_TO_KEY = {
  libertadores: 'classification',
  'pre-libertadores': 'preQualification',
  safe: 'neutral',
  relegation: 'relegation',
}

export function calculatePerformance(results = []) {
  return results.slice(-5).map((r) => {
    if (r === 'W' || r === 'V') return 'V'
    if (r === 'D' || r === 'E') return 'E'
    if (r === 'L' || r === 'D') return 'D'
    return r
  })
}

export function formatGoalDifference(gd) {
  if (gd > 0) return `+${gd}`
  return String(gd)
}

export function getZoneKeyFromTeam(team, competition) {
  if (team?.zone && TEAM_ZONE_TO_KEY[team.zone]) {
    return TEAM_ZONE_TO_KEY[team.zone]
  }
  return getZoneForPosition(competition, team?.position)
}

export function getZoneForPosition(competition, position) {
  const zones = competition?.zones
  if (!zones || !position) return 'neutral'

  if (position === 1 && zones.leader) return 'leader'
  if (zones.classification && position >= zones.classification.from && position <= zones.classification.to) {
    return 'classification'
  }
  if (zones.preQualification && position >= zones.preQualification.from && position <= zones.preQualification.to) {
    return 'preQualification'
  }
  if (zones.relegation && position >= zones.relegation.from && position <= zones.relegation.to) {
    return 'relegation'
  }
  return 'neutral'
}

export function getZoneLabel(zoneKey, competition) {
  const zones = competition?.zones
  if (!zones) return null
  const map = {
    leader: zones.leader?.label ?? 'Líder',
    classification: zones.classification?.label,
    preQualification: zones.preQualification?.label,
    relegation: zones.relegation?.label,
  }
  return map[zoneKey] ?? null
}

export function buildLegend(competition) {
  if (!competition?.zones) return []
  const items = []
  if (competition.zones.leader) {
    items.push({ key: 'leader', label: competition.zones.leader.label, color: ZONE_COLORS.leader })
  }
  if (competition.zones.classification) {
    items.push({
      key: 'classification',
      label: competition.zones.classification.label,
      color: ZONE_COLORS.classification,
    })
  }
  if (competition.zones.preQualification) {
    items.push({
      key: 'preQualification',
      label: competition.zones.preQualification.label,
      color: ZONE_COLORS.preQualification,
    })
  }
  items.push({ key: 'neutral', label: 'Zona intermediária', color: 'var(--border)' })
  if (competition.zones.relegation) {
    items.push({
      key: 'relegation',
      label: competition.zones.relegation.label,
      color: ZONE_COLORS.relegation,
    })
  }
  return items
}

export function formatStandingsRow(team, competition = null) {
  const form = team.form ?? team.performance ?? []
  const zoneKey = competition ? getZoneKeyFromTeam(team, competition) : 'neutral'

  return {
    ...team,
    form: Array.isArray(form) ? form : calculatePerformance(form),
    zoneKey,
    goalDifferenceLabel: formatGoalDifference(team.goalDifference),
  }
}

export function sortLeagueTeams(teams) {
  return [...teams].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points
    if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference
    return b.goalsFor - a.goalsFor
  })
}

export function formatLastUpdated(isoString) {
  if (!isoString) return '—'
  try {
    return new Intl.DateTimeFormat('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(new Date(isoString))
  } catch {
    return isoString
  }
}

export function getSimulatedNextGames(teamName, competition) {
  const fromCompetition = competition?.nextGames?.filter(
    (g) => g.home === teamName || g.away === teamName,
  )
  if (fromCompetition?.length) return fromCompetition

  return [
    { home: teamName, away: 'Adversário (demo)', date: '20 Jul 2026', time: '16:00' },
    { home: 'Adversário (demo)', away: teamName, date: '27 Jul 2026', time: '19:00' },
  ]
}
