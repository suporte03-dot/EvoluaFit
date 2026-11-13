/** Dados demonstrativos — não representam classificações oficiais em tempo real. */

const ZONE_RULES = {
  libertadores: { from: 1, to: 6 },
  'pre-libertadores': { from: 7, to: 12 },
  'sul-americana': { from: 13, to: 16 },
  relegation: { from: 17, to: 20 },
}

function buildTeam(id, name, shortName, stats) {
  const {
    played = 14,
    wins,
    draws,
    losses,
    goalsFor,
    goalsAgainst,
    lastMatches = ['V', 'E', 'D'],
    zone = 'safe',
  } = stats

  const points = wins * 3 + draws
  const goalDifference = goalsFor - goalsAgainst
  const performance = played > 0 ? Math.round((points / (played * 3)) * 100) : 0

  return {
    id,
    name,
    shortName,
    points,
    played,
    wins,
    draws,
    losses,
    goalsFor,
    goalsAgainst,
    goalDifference,
    performance,
    lastMatches,
    zone,
    position: 0,
  }
}

function assignZones(teams) {
  return teams.map((team) => {
    let zone = 'safe'
    const pos = team.position
    if (pos >= ZONE_RULES.relegation.from) zone = 'relegation'
    else if (pos >= ZONE_RULES['sul-americana'].from && pos <= ZONE_RULES['sul-americana'].to) zone = 'sul-americana'
    else if (pos >= ZONE_RULES['pre-libertadores'].from && pos <= ZONE_RULES['pre-libertadores'].to) zone = 'pre-libertadores'
    else if (pos >= ZONE_RULES.libertadores.from && pos <= ZONE_RULES.libertadores.to) zone = 'libertadores'
    return { ...team, zone }
  })
}

function sortAndValidateTeams(teams) {
  const sorted = [...teams]
    .map((t) => ({
      ...t,
      points: t.wins * 3 + t.draws,
      goalDifference: t.goalsFor - t.goalsAgainst,
      performance: t.played > 0 ? Math.round(((t.wins * 3 + t.draws) / (t.played * 3)) * 100) : 0,
    }))
    .sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points
      if (b.wins !== a.wins) return b.wins - a.wins
      if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference
      return b.goalsFor - a.goalsFor
    })
    .map((t, i) => ({ ...t, position: i + 1 }))

  return assignZones(sorted)
}

const rawTeams = [
  buildTeam('flamengo', 'Flamengo', 'FLA', { wins: 9, draws: 3, losses: 2, goalsFor: 28, goalsAgainst: 12, lastMatches: ['V', 'V', 'E', 'V', 'V'] }),
  buildTeam('palmeiras', 'Palmeiras', 'PAL', { wins: 8, draws: 4, losses: 2, goalsFor: 25, goalsAgainst: 11, lastMatches: ['V', 'E', 'V', 'V', 'E'] }),
  buildTeam('botafogo', 'Botafogo', 'BOT', { wins: 8, draws: 2, losses: 4, goalsFor: 22, goalsAgainst: 14, lastMatches: ['V', 'D', 'V', 'V', 'E'] }),
  buildTeam('sao-paulo', 'São Paulo', 'SAO', { wins: 7, draws: 4, losses: 3, goalsFor: 21, goalsAgainst: 15, lastMatches: ['E', 'V', 'V', 'D', 'V'] }),
  buildTeam('internacional', 'Internacional', 'INT', { wins: 7, draws: 3, losses: 4, goalsFor: 20, goalsAgainst: 16, lastMatches: ['V', 'V', 'D', 'V', 'E'] }),
  buildTeam('atletico-mg', 'Atlético-MG', 'CAM', { wins: 6, draws: 5, losses: 3, goalsFor: 19, goalsAgainst: 14, lastMatches: ['E', 'V', 'E', 'V', 'D'] }),
  buildTeam('fluminense', 'Fluminense', 'FLU', { wins: 6, draws: 4, losses: 4, goalsFor: 18, goalsAgainst: 15, lastMatches: ['D', 'V', 'E', 'V', 'V'] }),
  buildTeam('bragantino', 'Bragantino', 'RBB', { wins: 6, draws: 3, losses: 5, goalsFor: 17, goalsAgainst: 17, lastMatches: ['V', 'D', 'V', 'E', 'D'] }),
  buildTeam('corinthians', 'Corinthians', 'COR', { wins: 5, draws: 5, losses: 4, goalsFor: 16, goalsAgainst: 16, lastMatches: ['E', 'E', 'V', 'D', 'V'] }),
  buildTeam('gremio', 'Grêmio', 'GRE', { wins: 5, draws: 4, losses: 5, goalsFor: 15, goalsAgainst: 17, lastMatches: ['D', 'V', 'E', 'V', 'D'] }),
  buildTeam('athletico-pr', 'Athletico-PR', 'CAP', { wins: 5, draws: 3, losses: 6, goalsFor: 14, goalsAgainst: 18, lastMatches: ['V', 'D', 'D', 'V', 'E'] }),
  buildTeam('fortaleza', 'Fortaleza', 'FOR', { wins: 4, draws: 5, losses: 5, goalsFor: 14, goalsAgainst: 16, lastMatches: ['E', 'V', 'D', 'E', 'V'] }),
  buildTeam('cruzeiro', 'Cruzeiro', 'CRU', { wins: 4, draws: 4, losses: 6, goalsFor: 13, goalsAgainst: 17, lastMatches: ['D', 'E', 'V', 'D', 'E'] }),
  buildTeam('vasco', 'Vasco', 'VAS', { wins: 4, draws: 3, losses: 7, goalsFor: 12, goalsAgainst: 19, lastMatches: ['D', 'V', 'D', 'E', 'D'] }),
  buildTeam('bahia', 'Bahia', 'BAH', { wins: 3, draws: 5, losses: 6, goalsFor: 12, goalsAgainst: 18, lastMatches: ['E', 'D', 'E', 'V', 'D'] }),
  buildTeam('santos', 'Santos', 'SAN', { wins: 3, draws: 4, losses: 7, goalsFor: 11, goalsAgainst: 19, lastMatches: ['D', 'E', 'D', 'V', 'E'] }),
  buildTeam('cuiaba', 'Cuiabá', 'CUI', { wins: 3, draws: 3, losses: 8, goalsFor: 10, goalsAgainst: 20, lastMatches: ['D', 'D', 'V', 'E', 'D'] }),
  buildTeam('goias', 'Goiás', 'GOI', { wins: 2, draws: 4, losses: 8, goalsFor: 9, goalsAgainst: 21, lastMatches: ['D', 'E', 'D', 'D', 'E'] }),
  buildTeam('criciuma', 'Criciúma', 'CRI', { wins: 2, draws: 3, losses: 9, goalsFor: 8, goalsAgainst: 22, lastMatches: ['D', 'D', 'E', 'D', 'V'] }),
  buildTeam('juventude', 'Juventude', 'JUV', { wins: 1, draws: 4, losses: 9, goalsFor: 7, goalsAgainst: 24, lastMatches: ['D', 'E', 'D', 'D', 'D'] }),
]

const teamNames = rawTeams.map((t) => t.name)

function match(id, round, date, time, home, away, homeScore, awayScore, status, stadium, city) {
  return { id, round, date, time, home, away, homeScore, awayScore, status, stadium, city }
}

const matches = [
  match(1, 13, '05 Jul 2026', '16:00', 'Flamengo', 'Palmeiras', 2, 1, 'Encerrado', 'Maracanã', 'Rio de Janeiro'),
  match(2, 13, '05 Jul 2026', '18:30', 'São Paulo', 'Corinthians', 1, 1, 'Encerrado', 'Morumbi', 'São Paulo'),
  match(3, 13, '05 Jul 2026', '21:00', 'Grêmio', 'Internacional', 0, 2, 'Encerrado', 'Arena do Grêmio', 'Porto Alegre'),
  match(4, 14, '08 Jul 2026', '19:00', 'Botafogo', 'Fluminense', 3, 0, 'Encerrado', 'Nilton Santos', 'Rio de Janeiro'),
  match(5, 14, '08 Jul 2026', '21:30', 'Atlético-MG', 'Cruzeiro', 2, 2, 'Encerrado', 'Arena MRV', 'Belo Horizonte'),
  match(6, 14, '09 Jul 2026', '20:00', 'Bragantino', 'Fortaleza', 1, 0, 'Encerrado', 'Nabi Abi Chedid', 'Bragança Paulista'),
  match(7, 15, '12 Jul 2026', '16:00', 'Palmeiras', 'Botafogo', null, null, 'Agendado', 'Allianz Parque', 'São Paulo'),
  match(8, 15, '12 Jul 2026', '18:30', 'Flamengo', 'São Paulo', null, null, 'Agendado', 'Maracanã', 'Rio de Janeiro'),
  match(9, 15, '12 Jul 2026', '21:00', 'Internacional', 'Grêmio', null, null, 'Agendado', 'Beira-Rio', 'Porto Alegre'),
  match(10, 15, '13 Jul 2026', '16:00', 'Corinthians', 'Santos', null, null, 'Agendado', 'Neo Química Arena', 'São Paulo'),
  match(11, 15, '13 Jul 2026', '18:30', 'Athletico-PR', 'Fluminense', null, null, 'Agendado', 'Ligga Arena', 'Curitiba'),
  match(12, 15, '13 Jul 2026', '21:00', 'Vasco', 'Bahia', null, null, 'Agendado', 'São Januário', 'Rio de Janeiro'),
  match(13, 14, '09 Jul 2026', '19:00', 'Vasco', 'Juventude', 2, 0, 'Encerrado', 'São Januário', 'Rio de Janeiro'),
  match(14, 14, '09 Jul 2026', '21:30', 'Cuiabá', 'Goiás', 1, 1, 'Encerrado', 'Arena Pantanal', 'Cuiabá'),
  match(15, 13, '06 Jul 2026', '19:00', 'Bahia', 'Criciúma', 3, 1, 'Encerrado', 'Arena Fonte Nova', 'Salvador'),
  match(16, 12, '28 Jun 2026', '16:00', 'Palmeiras', 'Athletico-PR', 2, 0, 'Encerrado', 'Allianz Parque', 'São Paulo'),
  match(17, 12, '28 Jun 2026', '18:30', 'Fluminense', 'Botafogo', 1, 2, 'Encerrado', 'Maracanã', 'Rio de Janeiro'),
  match(18, 12, '29 Jun 2026', '20:00', 'Santos', 'Cruzeiro', 0, 1, 'Encerrado', 'Vila Belmiro', 'Santos'),
]

const topScorers = [
  { position: 1, player: 'Pedro', club: 'Flamengo', goals: 12, assists: 4, played: 14, avgGoals: 0.86 },
  { position: 2, player: 'Hulk', club: 'Atlético-MG', goals: 10, assists: 6, played: 14, avgGoals: 0.71 },
  { position: 3, player: 'Lucero', club: 'Fortaleza', goals: 9, assists: 2, played: 13, avgGoals: 0.69 },
  { position: 4, player: 'Calleri', club: 'São Paulo', goals: 8, assists: 3, played: 14, avgGoals: 0.57 },
  { position: 5, player: 'Vegetti', club: 'Vasco', goals: 8, assists: 1, played: 14, avgGoals: 0.57 },
  { position: 6, player: 'Estêvão', club: 'Palmeiras', goals: 7, assists: 5, played: 12, avgGoals: 0.58 },
  { position: 7, player: 'Tiquinho', club: 'Botafogo', goals: 7, assists: 2, played: 13, avgGoals: 0.54 },
  { position: 8, player: 'Yuri Alberto', club: 'Corinthians', goals: 6, assists: 3, played: 14, avgGoals: 0.43 },
  { position: 9, player: 'Borré', club: 'Internacional', goals: 6, assists: 2, played: 13, avgGoals: 0.46 },
  { position: 10, player: 'Cano', club: 'Fluminense', goals: 5, assists: 4, played: 12, avgGoals: 0.42 },
  { position: 11, player: 'Helinho', club: 'Bragantino', goals: 5, assists: 3, played: 14, avgGoals: 0.36 },
  { position: 12, player: 'Soteldo', club: 'Grêmio', goals: 4, assists: 6, played: 13, avgGoals: 0.31 },
  { position: 13, player: 'Pablo', club: 'Athletico-PR', goals: 4, assists: 2, played: 11, avgGoals: 0.36 },
  { position: 14, player: 'Dudu', club: 'Cruzeiro', goals: 4, assists: 1, played: 10, avgGoals: 0.4 },
  { position: 15, player: 'Everaldo', club: 'Bahia', goals: 3, assists: 2, played: 12, avgGoals: 0.25 },
]

export const brasileiraoSerieA = {
  season: 2026,
  lastUpdate: '2026-07-11T15:00:00-03:00',
  sourceLabel: 'Dados demonstrativos',
  currentRound: 15,
  teams: sortAndValidateTeams(rawTeams),
  matches,
  topScorers,
  teamNames,
  zoneRules: ZONE_RULES,
}

export function validateBrasileiraoData(data = brasileiraoSerieA) {
  const errors = []
  data.teams.forEach((team) => {
    const expectedPoints = team.wins * 3 + team.draws
    const expectedGd = team.goalsFor - team.goalsAgainst
    if (team.points !== expectedPoints) {
      errors.push(`${team.name}: pontos incorretos (${team.points} vs ${expectedPoints})`)
    }
    if (team.goalDifference !== expectedGd) {
      errors.push(`${team.name}: saldo incorreto`)
    }
  })
  return errors
}

export const BRASILEIRAO_ZONE_COLORS = {
  libertadores: '#00E887',
  'pre-libertadores': '#4DA3FF',
  'sul-americana': '#FF9F1C',
  safe: 'transparent',
  relegation: '#FF4D6A',
  leader: '#FFD166',
}

export const BRASILEIRAO_ZONE_LABELS = {
  libertadores: 'Libertadores',
  'pre-libertadores': 'Pré-Libertadores',
  'sul-americana': 'Sul-Americana',
  safe: 'Zona intermediária',
  relegation: 'Rebaixamento',
}
