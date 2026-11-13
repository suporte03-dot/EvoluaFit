/** Dados demonstrativos — não representam classificações oficiais em tempo real. */

const SEASON = '2026'
export const lastUpdated = '2026-07-11T15:00:00-03:00'

function team(id, name, stats) {
  const {
    played = 18,
    wins,
    draws,
    losses,
    goalsFor,
    goalsAgainst,
    form = ['V', 'E', 'V', 'D', 'V'],
    zone = 'safe',
  } = stats

  return {
    id,
    name,
    position: 0,
    played,
    wins,
    draws,
    losses,
    goalsFor,
    goalsAgainst,
    goalDifference: goalsFor - goalsAgainst,
    points: wins * 3 + draws,
    form,
    zone,
  }
}

function assignZones(teams, zoneRules) {
  return teams.map((t) => {
    let zone = 'safe'
    if (zoneRules.relegation && t.position >= zoneRules.relegation.from && t.position <= zoneRules.relegation.to) {
      zone = 'relegation'
    } else if (zoneRules.preLibertadores && t.position >= zoneRules.preLibertadores.from && t.position <= zoneRules.preLibertadores.to) {
      zone = 'pre-libertadores'
    } else if (zoneRules.libertadores && t.position >= zoneRules.libertadores.from && t.position <= zoneRules.libertadores.to) {
      zone = 'libertadores'
    }
    return { ...t, zone }
  })
}

function assignPositions(teams, zoneRules = null) {
  const sorted = teams
    .sort((a, b) => b.points - a.points || b.goalDifference - a.goalDifference || b.goalsFor - a.goalsFor)
    .map((t, i) => ({ ...t, position: i + 1 }))
  return zoneRules ? assignZones(sorted, zoneRules) : sorted
}

function groupLetter(letter, teams) {
  return {
    id: `grupo-${letter.toLowerCase()}`,
    name: `Grupo ${letter}`,
    teams: assignPositions(teams),
  }
}

function knockoutMatch(id, home, away, homeScore, awayScore, date, status = 'Encerrado', leg = null) {
  return { id, home, away, homeScore, awayScore, date, status, leg }
}

const serieAZoneRules = {
  libertadores: { from: 1, to: 6 },
  preLibertadores: { from: 7, to: 12 },
  relegation: { from: 17, to: 20 },
}

const serieBZoneRules = {
  libertadores: { from: 1, to: 4 },
  preLibertadores: { from: 5, to: 8 },
  relegation: { from: 17, to: 20 },
}

const eliminatoriasZoneRules = {
  libertadores: { from: 1, to: 6 },
  preLibertadores: { from: 7, to: 7 },
  relegation: { from: 8, to: 10 },
}

const serieATeams = assignPositions([
  team('flamengo', 'Flamengo', { wins: 11, draws: 4, losses: 3, goalsFor: 32, goalsAgainst: 14, form: ['V', 'V', 'E', 'V', 'V'] }),
  team('palmeiras', 'Palmeiras', { wins: 10, draws: 5, losses: 3, goalsFor: 29, goalsAgainst: 13, form: ['V', 'E', 'V', 'V', 'E'] }),
  team('botafogo', 'Botafogo', { wins: 10, draws: 3, losses: 5, goalsFor: 27, goalsAgainst: 16, form: ['V', 'D', 'V', 'V', 'E'] }),
  team('sao-paulo', 'São Paulo', { wins: 9, draws: 5, losses: 4, goalsFor: 25, goalsAgainst: 17, form: ['E', 'V', 'V', 'D', 'V'] }),
  team('internacional', 'Internacional', { wins: 9, draws: 4, losses: 5, goalsFor: 24, goalsAgainst: 18, form: ['V', 'V', 'D', 'V', 'E'] }),
  team('atletico-mg', 'Atlético-MG', { wins: 8, draws: 6, losses: 4, goalsFor: 23, goalsAgainst: 16, form: ['E', 'V', 'E', 'V', 'D'] }),
  team('fluminense', 'Fluminense', { wins: 8, draws: 5, losses: 5, goalsFor: 22, goalsAgainst: 17, form: ['D', 'V', 'E', 'V', 'V'] }),
  team('bragantino', 'Bragantino', { wins: 8, draws: 4, losses: 6, goalsFor: 21, goalsAgainst: 19, form: ['V', 'D', 'V', 'E', 'D'] }),
  team('corinthians', 'Corinthians', { wins: 7, draws: 6, losses: 5, goalsFor: 20, goalsAgainst: 18, form: ['E', 'E', 'V', 'D', 'V'] }),
  team('gremio', 'Grêmio', { wins: 7, draws: 5, losses: 6, goalsFor: 19, goalsAgainst: 19, form: ['D', 'V', 'E', 'V', 'D'] }),
  team('athletico-pr', 'Athletico-PR', { wins: 7, draws: 4, losses: 7, goalsFor: 18, goalsAgainst: 20, form: ['V', 'D', 'D', 'V', 'E'] }),
  team('fortaleza', 'Fortaleza', { wins: 6, draws: 6, losses: 6, goalsFor: 17, goalsAgainst: 18, form: ['E', 'V', 'D', 'E', 'V'] }),
  team('cruzeiro', 'Cruzeiro', { wins: 6, draws: 5, losses: 7, goalsFor: 17, goalsAgainst: 19, form: ['D', 'E', 'V', 'D', 'E'] }),
  team('vasco', 'Vasco', { wins: 6, draws: 4, losses: 8, goalsFor: 16, goalsAgainst: 21, form: ['D', 'V', 'D', 'E', 'D'] }),
  team('bahia', 'Bahia', { wins: 5, draws: 6, losses: 7, goalsFor: 15, goalsAgainst: 20, form: ['E', 'D', 'V', 'D', 'E'] }),
  team('santos', 'Santos', { wins: 5, draws: 5, losses: 8, goalsFor: 14, goalsAgainst: 21, form: ['D', 'E', 'D', 'V', 'D'] }),
  team('cuiaba', 'Cuiabá', { wins: 4, draws: 6, losses: 8, goalsFor: 13, goalsAgainst: 22, form: ['D', 'D', 'E', 'D', 'E'] }),
  team('juventude', 'Juventude', { wins: 4, draws: 5, losses: 9, goalsFor: 12, goalsAgainst: 23, form: ['D', 'D', 'V', 'D', 'E'] }),
  team('vitoria', 'Vitória', { wins: 3, draws: 6, losses: 9, goalsFor: 11, goalsAgainst: 24, form: ['D', 'E', 'D', 'D', 'E'] }),
  team('atletico-go', 'Atlético-GO', { wins: 3, draws: 5, losses: 10, goalsFor: 10, goalsAgainst: 25, form: ['D', 'D', 'E', 'D', 'D'] }),
], serieAZoneRules)

const serieBTeams = assignPositions([
  team('sport', 'Sport Recife', { wins: 10, draws: 4, losses: 4, goalsFor: 26, goalsAgainst: 15, form: ['V', 'V', 'E', 'V', 'D'] }),
  team('coritiba', 'Coritiba', { wins: 9, draws: 5, losses: 4, goalsFor: 24, goalsAgainst: 14, form: ['V', 'E', 'V', 'E', 'V'] }),
  team('goias', 'Goiás', { wins: 9, draws: 4, losses: 5, goalsFor: 23, goalsAgainst: 16, form: ['D', 'V', 'V', 'E', 'V'] }),
  team('avai', 'Avaí', { wins: 8, draws: 5, losses: 5, goalsFor: 22, goalsAgainst: 15, form: ['E', 'V', 'D', 'V', 'E'] }),
  team('ponte-preta', 'Ponte Preta', { wins: 8, draws: 4, losses: 6, goalsFor: 21, goalsAgainst: 16, form: ['V', 'D', 'V', 'E', 'D'] }),
  team('vila-nova', 'Vila Nova', { wins: 7, draws: 5, losses: 6, goalsFor: 19, goalsAgainst: 17, form: ['E', 'V', 'E', 'D', 'V'] }),
  team('crb', 'CRB', { wins: 7, draws: 4, losses: 7, goalsFor: 18, goalsAgainst: 18, form: ['D', 'V', 'E', 'V', 'D'] }),
  team('chapecoense', 'Chapecoense', { wins: 6, draws: 5, losses: 7, goalsFor: 17, goalsAgainst: 17, form: ['E', 'D', 'V', 'E', 'D'] }),
  team('amazonas', 'Amazonas', { wins: 6, draws: 4, losses: 8, goalsFor: 16, goalsAgainst: 18, form: ['V', 'D', 'D', 'E', 'V'] }),
  team('operario', 'Operário-PR', { wins: 5, draws: 5, losses: 8, goalsFor: 15, goalsAgainst: 19, form: ['D', 'E', 'V', 'D', 'E'] }),
  team('novorizontino', 'Novorizontino', { wins: 5, draws: 4, losses: 9, goalsFor: 14, goalsAgainst: 20, form: ['D', 'V', 'D', 'E', 'D'] }),
  team('america-mg', 'América-MG', { wins: 4, draws: 5, losses: 9, goalsFor: 13, goalsAgainst: 21, form: ['E', 'D', 'D', 'V', 'E'] }),
  team('ituano', 'Ituano', { wins: 4, draws: 4, losses: 10, goalsFor: 12, goalsAgainst: 22, form: ['D', 'E', 'D', 'D', 'V'] }),
  team('botafogo-sp', 'Botafogo-SP', { wins: 3, draws: 5, losses: 10, goalsFor: 11, goalsAgainst: 23, form: ['D', 'D', 'E', 'E', 'D'] }),
  team('paysandu', 'Paysandu', { wins: 3, draws: 4, losses: 11, goalsFor: 10, goalsAgainst: 24, form: ['D', 'E', 'D', 'D', 'E'] }),
  team('brusque', 'Brusque', { wins: 2, draws: 5, losses: 11, goalsFor: 9, goalsAgainst: 25, form: ['E', 'D', 'D', 'D', 'E'] }),
  team('ferroviaria', 'Ferroviária', { wins: 2, draws: 4, losses: 12, goalsFor: 8, goalsAgainst: 26, form: ['D', 'D', 'E', 'D', 'D'] }),
  team('mirassol', 'Mirassol', { wins: 1, draws: 5, losses: 12, goalsFor: 7, goalsAgainst: 27, form: ['D', 'E', 'D', 'D', 'D'] }),
  team('criciuma', 'Criciúma', { wins: 1, draws: 4, losses: 13, goalsFor: 6, goalsAgainst: 28, form: ['D', 'D', 'E', 'D', 'D'] }),
  team('remo', 'Remo', { wins: 0, draws: 5, losses: 13, goalsFor: 5, goalsAgainst: 29, form: ['D', 'E', 'D', 'D', 'D'] }),
], serieBZoneRules)

const libertadoresGroups = [
  groupLetter('A', [
    team('flamengo-lib', 'Flamengo', { played: 6, wins: 4, draws: 1, losses: 1, goalsFor: 12, goalsAgainst: 5, form: ['V', 'E', 'V', 'V', 'D'] }),
    team('racing', 'Racing Club', { played: 6, wins: 3, draws: 2, losses: 1, goalsFor: 9, goalsAgainst: 6, form: ['V', 'E', 'D', 'V', 'E'] }),
    team('bolivar', 'Bolívar', { played: 6, wins: 2, draws: 1, losses: 3, goalsFor: 7, goalsAgainst: 9, form: ['D', 'V', 'D', 'E', 'D'] }),
    team('nacional-uru', 'Nacional', { played: 6, wins: 0, draws: 2, losses: 4, goalsFor: 3, goalsAgainst: 11, form: ['D', 'E', 'D', 'D', 'E'] }),
  ]),
  groupLetter('B', [
    team('palmeiras-lib', 'Palmeiras', { played: 6, wins: 5, draws: 1, losses: 0, goalsFor: 14, goalsAgainst: 3, form: ['V', 'V', 'E', 'V', 'V'] }),
    team('boca', 'Boca Juniors', { played: 6, wins: 3, draws: 1, losses: 2, goalsFor: 8, goalsAgainst: 7, form: ['V', 'D', 'V', 'E', 'D'] }),
    team('the-strongest', 'The Strongest', { played: 6, wins: 1, draws: 2, losses: 3, goalsFor: 5, goalsAgainst: 10, form: ['D', 'E', 'D', 'V', 'D'] }),
    team('barcelona-sc', 'Barcelona SC', { played: 6, wins: 0, draws: 2, losses: 4, goalsFor: 2, goalsAgainst: 9, form: ['D', 'E', 'D', 'D', 'E'] }),
  ]),
  groupLetter('C', [
    team('river', 'River Plate', { played: 6, wins: 4, draws: 2, losses: 0, goalsFor: 11, goalsAgainst: 4, form: ['V', 'E', 'V', 'V', 'E'] }),
    team('atletico-mg-lib', 'Atlético-MG', { played: 6, wins: 3, draws: 1, losses: 2, goalsFor: 8, goalsAgainst: 7, form: ['D', 'V', 'E', 'V', 'D'] }),
    team('alianza-lima', 'Alianza Lima', { played: 6, wins: 2, draws: 1, losses: 3, goalsFor: 6, goalsAgainst: 8, form: ['V', 'D', 'E', 'D', 'V'] }),
    team('sporting-cristal', 'Sporting Cristal', { played: 6, wins: 0, draws: 2, losses: 4, goalsFor: 3, goalsAgainst: 9, form: ['D', 'E', 'D', 'D', 'E'] }),
  ]),
  groupLetter('D', [
    team('penarol', 'Peñarol', { played: 6, wins: 3, draws: 2, losses: 1, goalsFor: 9, goalsAgainst: 6, form: ['E', 'V', 'D', 'V', 'E'] }),
    team('botafogo-lib', 'Botafogo', { played: 6, wins: 3, draws: 1, losses: 2, goalsFor: 8, goalsAgainst: 7, form: ['V', 'D', 'V', 'E', 'D'] }),
    team('ldu', 'LDU Quito', { played: 6, wins: 2, draws: 2, losses: 2, goalsFor: 7, goalsAgainst: 7, form: ['E', 'V', 'D', 'E', 'V'] }),
    team('universitario', 'Universitario', { played: 6, wins: 1, draws: 1, losses: 4, goalsFor: 4, goalsAgainst: 8, form: ['D', 'D', 'V', 'D', 'E'] }),
  ]),
]

const sulAmericanaGroups = [
  groupLetter('A', [
    team('sao-paulo-sul', 'São Paulo', { played: 6, wins: 4, draws: 1, losses: 1, goalsFor: 10, goalsAgainst: 5, form: ['V', 'V', 'E', 'V', 'D'] }),
    team('lanus', 'Lanús', { played: 6, wins: 3, draws: 2, losses: 1, goalsFor: 8, goalsAgainst: 6, form: ['E', 'V', 'V', 'D', 'V'] }),
    team('cuiaba-sul', 'Cuiabá', { played: 6, wins: 2, draws: 1, losses: 3, goalsFor: 6, goalsAgainst: 8, form: ['D', 'V', 'D', 'E', 'D'] }),
    team('always-ready', 'Always Ready', { played: 6, wins: 0, draws: 2, losses: 4, goalsFor: 3, goalsAgainst: 8, form: ['D', 'E', 'D', 'D', 'E'] }),
  ]),
  groupLetter('B', [
    team('corinthians-sul', 'Corinthians', { played: 6, wins: 3, draws: 2, losses: 1, goalsFor: 9, goalsAgainst: 6, form: ['V', 'E', 'V', 'D', 'V'] }),
    team('independiente', 'Independiente', { played: 6, wins: 3, draws: 1, losses: 2, goalsFor: 7, goalsAgainst: 6, form: ['D', 'V', 'E', 'V', 'D'] }),
    team('red-bull', 'Bragantino', { played: 6, wins: 2, draws: 2, losses: 2, goalsFor: 6, goalsAgainst: 7, form: ['E', 'D', 'V', 'E', 'V'] }),
    team('metropolitanos', 'Metropolitanos', { played: 6, wins: 1, draws: 1, losses: 4, goalsFor: 4, goalsAgainst: 7, form: ['D', 'D', 'E', 'V', 'D'] }),
  ]),
  groupLetter('C', [
    team('gremio-sul', 'Grêmio', { played: 6, wins: 4, draws: 0, losses: 2, goalsFor: 9, goalsAgainst: 5, form: ['V', 'D', 'V', 'V', 'D'] }),
    team('defensa', 'Defensa y Justicia', { played: 6, wins: 3, draws: 2, losses: 1, goalsFor: 7, goalsAgainst: 5, form: ['E', 'V', 'V', 'E', 'D'] }),
    team('universidad-catolica', 'Universidad Católica', { played: 6, wins: 2, draws: 1, losses: 3, goalsFor: 5, goalsAgainst: 7, form: ['D', 'V', 'D', 'E', 'D'] }),
    team('guarani', 'Guaraní', { played: 6, wins: 0, draws: 1, losses: 5, goalsFor: 2, goalsAgainst: 6, form: ['D', 'D', 'E', 'D', 'D'] }),
  ]),
]

const championsGroups = [
  groupLetter('A', [
    team('bayern', 'Bayern München', { played: 6, wins: 5, draws: 0, losses: 1, goalsFor: 16, goalsAgainst: 6, form: ['V', 'V', 'D', 'V', 'V'] }),
    team('psg', 'Paris Saint-Germain', { played: 6, wins: 4, draws: 1, losses: 1, goalsFor: 12, goalsAgainst: 7, form: ['V', 'E', 'V', 'D', 'V'] }),
    team('benfica', 'Benfica', { played: 6, wins: 2, draws: 1, losses: 3, goalsFor: 8, goalsAgainst: 10, form: ['D', 'V', 'E', 'D', 'D'] }),
    team('feyenoord', 'Feyenoord', { played: 6, wins: 0, draws: 0, losses: 6, goalsFor: 3, goalsAgainst: 16, form: ['D', 'D', 'D', 'D', 'D'] }),
  ]),
  groupLetter('B', [
    team('real-madrid', 'Real Madrid', { played: 6, wins: 5, draws: 1, losses: 0, goalsFor: 15, goalsAgainst: 5, form: ['V', 'V', 'E', 'V', 'V'] }),
    team('man-city', 'Manchester City', { played: 6, wins: 4, draws: 1, losses: 1, goalsFor: 13, goalsAgainst: 6, form: ['V', 'E', 'V', 'D', 'V'] }),
    team('inter', 'Inter', { played: 6, wins: 2, draws: 1, losses: 3, goalsFor: 7, goalsAgainst: 9, form: ['D', 'V', 'D', 'E', 'D'] }),
    team('copenhagen', 'Copenhagen', { played: 6, wins: 0, draws: 1, losses: 5, goalsFor: 2, goalsAgainst: 17, form: ['D', 'D', 'E', 'D', 'D'] }),
  ]),
  groupLetter('C', [
    team('barcelona', 'Barcelona', { played: 6, wins: 4, draws: 2, losses: 0, goalsFor: 14, goalsAgainst: 6, form: ['V', 'E', 'V', 'V', 'E'] }),
    team('dortmund', 'Borussia Dortmund', { played: 6, wins: 3, draws: 2, losses: 1, goalsFor: 10, goalsAgainst: 7, form: ['E', 'V', 'D', 'V', 'E'] }),
    team('psv', 'PSV', { played: 6, wins: 2, draws: 0, losses: 4, goalsFor: 8, goalsAgainst: 12, form: ['D', 'V', 'D', 'D', 'V'] }),
    team('celtic', 'Celtic', { played: 6, wins: 0, draws: 2, losses: 4, goalsFor: 4, goalsAgainst: 11, form: ['E', 'D', 'D', 'E', 'D'] }),
  ]),
  groupLetter('D', [
    team('arsenal', 'Arsenal', { played: 6, wins: 5, draws: 0, losses: 1, goalsFor: 17, goalsAgainst: 5, form: ['V', 'V', 'V', 'D', 'V'] }),
    team('atletico-mad', 'Atlético de Madrid', { played: 6, wins: 3, draws: 2, losses: 1, goalsFor: 9, goalsAgainst: 6, form: ['E', 'V', 'E', 'V', 'D'] }),
    team('lazio', 'Lazio', { played: 6, wins: 2, draws: 1, losses: 3, goalsFor: 7, goalsAgainst: 9, form: ['D', 'V', 'D', 'E', 'D'] }),
    team('monaco', 'Monaco', { played: 6, wins: 0, draws: 1, losses: 5, goalsFor: 3, goalsAgainst: 16, form: ['D', 'D', 'E', 'D', 'D'] }),
  ]),
]

const worldCupGroups = [
  groupLetter('A', [
    team('brasil', 'Brasil', { played: 3, wins: 2, draws: 1, losses: 0, goalsFor: 7, goalsAgainst: 2, form: ['V', 'E', 'V'] }),
    team('marrocos', 'Marrocos', { played: 3, wins: 2, draws: 0, losses: 1, goalsFor: 5, goalsAgainst: 3, form: ['V', 'D', 'V'] }),
    team('croacia', 'Croácia', { played: 3, wins: 1, draws: 1, losses: 1, goalsFor: 4, goalsAgainst: 4, form: ['E', 'V', 'D'] }),
    team('canada', 'Canadá', { played: 3, wins: 0, draws: 0, losses: 3, goalsFor: 1, goalsAgainst: 8, form: ['D', 'D', 'D'] }),
  ]),
  groupLetter('B', [
    team('argentina', 'Argentina', { played: 3, wins: 3, draws: 0, losses: 0, goalsFor: 8, goalsAgainst: 1, form: ['V', 'V', 'V'] }),
    team('mexico', 'México', { played: 3, wins: 1, draws: 1, losses: 1, goalsFor: 3, goalsAgainst: 3, form: ['E', 'V', 'D'] }),
    team('polonia', 'Polônia', { played: 3, wins: 1, draws: 1, losses: 1, goalsFor: 3, goalsAgainst: 4, form: ['D', 'E', 'V'] }),
    team('arabia', 'Arábia Saudita', { played: 3, wins: 0, draws: 0, losses: 3, goalsFor: 2, goalsAgainst: 8, form: ['D', 'D', 'D'] }),
  ]),
  groupLetter('C', [
    team('franca', 'França', { played: 3, wins: 2, draws: 1, losses: 0, goalsFor: 6, goalsAgainst: 2, form: ['V', 'E', 'V'] }),
    team('australia', 'Austrália', { played: 3, wins: 2, draws: 0, losses: 1, goalsFor: 4, goalsAgainst: 3, form: ['V', 'D', 'V'] }),
    team('dinamarca', 'Dinamarca', { played: 3, wins: 1, draws: 1, losses: 1, goalsFor: 3, goalsAgainst: 3, form: ['E', 'D', 'V'] }),
    team('tunisia', 'Tunísia', { played: 3, wins: 0, draws: 0, losses: 3, goalsFor: 1, goalsAgainst: 6, form: ['D', 'D', 'D'] }),
  ]),
  groupLetter('D', [
    team('inglaterra', 'Inglaterra', { played: 3, wins: 2, draws: 1, losses: 0, goalsFor: 7, goalsAgainst: 2, form: ['V', 'E', 'V'] }),
    team('eua', 'Estados Unidos', { played: 3, wins: 2, draws: 0, losses: 1, goalsFor: 5, goalsAgainst: 3, form: ['V', 'D', 'V'] }),
    team('senegal', 'Senegal', { played: 3, wins: 1, draws: 0, losses: 2, goalsFor: 3, goalsAgainst: 5, form: ['D', 'V', 'D'] }),
    team('ira', 'Irã', { played: 3, wins: 0, draws: 1, losses: 2, goalsFor: 2, goalsAgainst: 7, form: ['E', 'D', 'D'] }),
  ]),
  groupLetter('E', [
    team('espanha', 'Espanha', { played: 3, wins: 2, draws: 1, losses: 0, goalsFor: 6, goalsAgainst: 2, form: ['V', 'E', 'V'] }),
    team('japao', 'Japão', { played: 3, wins: 2, draws: 0, losses: 1, goalsFor: 5, goalsAgainst: 4, form: ['V', 'D', 'V'] }),
    team('alemanha', 'Alemanha', { played: 3, wins: 1, draws: 1, losses: 1, goalsFor: 4, goalsAgainst: 4, form: ['E', 'V', 'D'] }),
    team('costa-rica', 'Costa Rica', { played: 3, wins: 0, draws: 0, losses: 3, goalsFor: 1, goalsAgainst: 10, form: ['D', 'D', 'D'] }),
  ]),
  groupLetter('F', [
    team('belgica', 'Bélgica', { played: 3, wins: 2, draws: 1, losses: 0, goalsFor: 5, goalsAgainst: 2, form: ['V', 'E', 'V'] }),
    team('holanda', 'Holanda', { played: 3, wins: 2, draws: 0, losses: 1, goalsFor: 4, goalsAgainst: 3, form: ['V', 'D', 'V'] }),
    team('equador', 'Equador', { played: 3, wins: 1, draws: 0, losses: 2, goalsFor: 3, goalsAgainst: 4, form: ['D', 'V', 'D'] }),
    team('qatar', 'Catar', { played: 3, wins: 0, draws: 1, losses: 2, goalsFor: 2, goalsAgainst: 5, form: ['E', 'D', 'D'] }),
  ]),
  groupLetter('G', [
    team('portugal', 'Portugal', { played: 3, wins: 2, draws: 1, losses: 0, goalsFor: 7, goalsAgainst: 2, form: ['V', 'E', 'V'] }),
    team('suica', 'Suíça', { played: 3, wins: 2, draws: 0, losses: 1, goalsFor: 5, goalsAgainst: 4, form: ['V', 'D', 'V'] }),
    team('uruguai', 'Uruguai', { played: 3, wins: 1, draws: 1, losses: 1, goalsFor: 3, goalsAgainst: 3, form: ['E', 'D', 'V'] }),
    team('camaroes', 'Camarões', { played: 3, wins: 0, draws: 0, losses: 3, goalsFor: 1, goalsAgainst: 8, form: ['D', 'D', 'D'] }),
  ]),
  groupLetter('H', [
    team('colombia-wc', 'Colômbia', { played: 3, wins: 2, draws: 1, losses: 0, goalsFor: 6, goalsAgainst: 2, form: ['V', 'E', 'V'] }),
    team('coreia', 'Coreia do Sul', { played: 3, wins: 2, draws: 0, losses: 1, goalsFor: 5, goalsAgainst: 4, form: ['V', 'D', 'V'] }),
    team('servia', 'Sérvia', { played: 3, wins: 1, draws: 1, losses: 1, goalsFor: 3, goalsAgainst: 3, form: ['E', 'D', 'V'] }),
    team('gana', 'Gana', { played: 3, wins: 0, draws: 0, losses: 3, goalsFor: 2, goalsAgainst: 8, form: ['D', 'D', 'D'] }),
  ]),
]

const copaBrasilKnockout = {
  oitavas: [
    knockoutMatch('cb-1', 'Flamengo', 'Atlético-GO', 3, 1, '15 Jul 2026'),
    knockoutMatch('cb-2', 'Palmeiras', 'Criciúma', 2, 0, '16 Jul 2026'),
    knockoutMatch('cb-3', 'Corinthians', 'Bahia', 1, 1, '17 Jul 2026', 'Agendado'),
    knockoutMatch('cb-4', 'São Paulo', 'Sport Recife', 2, 1, '18 Jul 2026'),
    knockoutMatch('cb-5', 'Grêmio', 'Fluminense', 0, 2, '19 Jul 2026'),
    knockoutMatch('cb-6', 'Internacional', 'Botafogo', 1, 0, '20 Jul 2026'),
    knockoutMatch('cb-7', 'Atlético-MG', 'Cruzeiro', 3, 2, '21 Jul 2026'),
    knockoutMatch('cb-8', 'Fortaleza', 'Vasco', 2, 2, '22 Jul 2026', 'Agendado'),
  ],
  quartas: [
    knockoutMatch('cb-q1', 'Flamengo', 'Palmeiras', 1, 2, '05 Ago 2026', 'Agendado'),
    knockoutMatch('cb-q2', 'Corinthians', 'São Paulo', null, null, '06 Ago 2026', 'Agendado'),
    knockoutMatch('cb-q3', 'Fluminense', 'Internacional', 2, 1, '07 Ago 2026'),
    knockoutMatch('cb-q4', 'Atlético-MG', 'Fortaleza', null, null, '08 Ago 2026', 'Agendado'),
  ],
  semifinal: [
    knockoutMatch('cb-s1', 'Palmeiras', 'São Paulo', null, null, '20 Ago 2026', 'Agendado'),
    knockoutMatch('cb-s2', 'Fluminense', 'Atlético-MG', null, null, '21 Ago 2026', 'Agendado'),
  ],
  final: [
    knockoutMatch('cb-f', 'A definir', 'A definir', null, null, '15 Set 2026', 'Agendado'),
  ],
}

const libertadoresKnockout = {
  oitavas: [
    knockoutMatch('lib-1', 'Flamengo', 'Peñarol', null, null, '15 Ago 2026', 'Agendado'),
    knockoutMatch('lib-2', 'Palmeiras', 'River Plate', null, null, '16 Ago 2026', 'Agendado'),
    knockoutMatch('lib-3', 'Racing Club', 'Atlético-MG', null, null, '17 Ago 2026', 'Agendado'),
    knockoutMatch('lib-4', 'Botafogo', 'Boca Juniors', null, null, '18 Ago 2026', 'Agendado'),
  ],
  quartas: [
    knockoutMatch('lib-q1', 'A definir', 'A definir', null, null, '05 Set 2026', 'Agendado'),
    knockoutMatch('lib-q2', 'A definir', 'A definir', null, null, '06 Set 2026', 'Agendado'),
  ],
  semifinal: [
    knockoutMatch('lib-s1', 'A definir', 'A definir', null, null, '20 Out 2026', 'Agendado'),
    knockoutMatch('lib-s2', 'A definir', 'A definir', null, null, '21 Out 2026', 'Agendado'),
  ],
  final: [
    knockoutMatch('lib-f', 'A definir', 'A definir', null, null, '29 Nov 2026', 'Agendado'),
  ],
}

const sulAmericanaKnockout = {
  oitavas: [
    knockoutMatch('sul-1', 'São Paulo', 'Defensa y Justicia', null, null, '10 Ago 2026', 'Agendado'),
    knockoutMatch('sul-2', 'Corinthians', 'Grêmio', null, null, '11 Ago 2026', 'Agendado'),
    knockoutMatch('sul-3', 'Lanús', 'Bragantino', null, null, '12 Ago 2026', 'Agendado'),
    knockoutMatch('sul-4', 'Independiente', 'Cuiabá', null, null, '13 Ago 2026', 'Agendado'),
  ],
  quartas: [
    knockoutMatch('sul-q1', 'A definir', 'A definir', null, null, '25 Set 2026', 'Agendado'),
    knockoutMatch('sul-q2', 'A definir', 'A definir', null, null, '26 Set 2026', 'Agendado'),
  ],
  semifinal: [
    knockoutMatch('sul-s1', 'A definir', 'A definir', null, null, '15 Out 2026', 'Agendado'),
    knockoutMatch('sul-s2', 'A definir', 'A definir', null, null, '16 Out 2026', 'Agendado'),
  ],
  final: [
    knockoutMatch('sul-f', 'A definir', 'A definir', null, null, '08 Nov 2026', 'Agendado'),
  ],
}

const championsKnockout = {
  oitavas: [
    knockoutMatch('ucl-1', 'Real Madrid', 'Bayern München', null, null, '18 Fev 2026', 'Agendado'),
    knockoutMatch('ucl-2', 'Arsenal', 'Barcelona', null, null, '19 Fev 2026', 'Agendado'),
    knockoutMatch('ucl-3', 'Manchester City', 'Paris Saint-Germain', null, null, '25 Fev 2026', 'Agendado'),
    knockoutMatch('ucl-4', 'Borussia Dortmund', 'Atlético de Madrid', null, null, '26 Fev 2026', 'Agendado'),
  ],
  quartas: [
    knockoutMatch('ucl-q1', 'A definir', 'A definir', null, null, '08 Abr 2026', 'Agendado'),
    knockoutMatch('ucl-q2', 'A definir', 'A definir', null, null, '09 Abr 2026', 'Agendado'),
  ],
  semifinal: [
    knockoutMatch('ucl-s1', 'A definir', 'A definir', null, null, '29 Abr 2026', 'Agendado'),
    knockoutMatch('ucl-s2', 'A definir', 'A definir', null, null, '30 Abr 2026', 'Agendado'),
  ],
  final: [
    knockoutMatch('ucl-f', 'A definir', 'A definir', null, null, '30 Mai 2026', 'Agendado'),
  ],
}

const worldCupKnockout = {
  oitavas: [
    knockoutMatch('wc-r16-1', 'Brasil', 'Coreia do Sul', 4, 1, '03 Dez 2026'),
    knockoutMatch('wc-r16-2', 'Japão', 'Croácia', 1, 1, '04 Dez 2026'),
    knockoutMatch('wc-r16-3', 'Marrocos', 'Espanha', 0, 0, '05 Dez 2026'),
    knockoutMatch('wc-r16-4', 'Portugal', 'Suíça', 6, 1, '06 Dez 2026'),
    knockoutMatch('wc-r16-5', 'França', 'Polônia', 3, 1, '07 Dez 2026'),
    knockoutMatch('wc-r16-6', 'Inglaterra', 'Senegal', 3, 0, '08 Dez 2026'),
    knockoutMatch('wc-r16-7', 'Holanda', 'Estados Unidos', 3, 1, '09 Dez 2026'),
    knockoutMatch('wc-r16-8', 'Argentina', 'Austrália', 2, 1, '10 Dez 2026'),
  ],
  quartas: [
    knockoutMatch('wc-qf-1', 'Brasil', 'Croácia', null, null, '14 Dez 2026', 'Agendado'),
    knockoutMatch('wc-qf-2', 'Marrocos', 'Portugal', null, null, '15 Dez 2026', 'Agendado'),
    knockoutMatch('wc-qf-3', 'Inglaterra', 'França', null, null, '16 Dez 2026', 'Agendado'),
    knockoutMatch('wc-qf-4', 'Argentina', 'Holanda', null, null, '17 Dez 2026', 'Agendado'),
  ],
  semifinal: [
    knockoutMatch('wc-sf-1', 'A definir', 'A definir', null, null, '21 Dez 2026', 'Agendado'),
    knockoutMatch('wc-sf-2', 'A definir', 'A definir', null, null, '22 Dez 2026', 'Agendado'),
  ],
  final: [
    knockoutMatch('wc-f', 'A definir', 'A definir', null, null, '28 Dez 2026', 'Agendado'),
  ],
}

const eliminatoriasTeams = assignPositions([
  team('argentina', 'Argentina', { played: 14, wins: 10, draws: 3, losses: 1, goalsFor: 26, goalsAgainst: 7, form: ['V', 'E', 'V', 'V', 'V'] }),
  team('brasil-elim', 'Brasil', { played: 14, wins: 8, draws: 4, losses: 2, goalsFor: 22, goalsAgainst: 10, form: ['V', 'E', 'D', 'V', 'E'] }),
  team('equador-elim', 'Equador', { played: 14, wins: 7, draws: 5, losses: 2, goalsFor: 18, goalsAgainst: 9, form: ['E', 'V', 'V', 'E', 'V'] }),
  team('uruguai-elim', 'Uruguai', { played: 14, wins: 7, draws: 4, losses: 3, goalsFor: 17, goalsAgainst: 11, form: ['V', 'D', 'V', 'E', 'V'] }),
  team('colombia', 'Colômbia', { played: 14, wins: 6, draws: 5, losses: 3, goalsFor: 15, goalsAgainst: 10, form: ['E', 'V', 'E', 'D', 'V'] }),
  team('paraguai', 'Paraguai', { played: 14, wins: 5, draws: 5, losses: 4, goalsFor: 13, goalsAgainst: 11, form: ['D', 'E', 'V', 'V', 'E'] }),
  team('chile', 'Chile', { played: 14, wins: 5, draws: 4, losses: 5, goalsFor: 12, goalsAgainst: 13, form: ['V', 'D', 'E', 'D', 'V'] }),
  team('peru', 'Peru', { played: 14, wins: 4, draws: 4, losses: 6, goalsFor: 10, goalsAgainst: 14, form: ['D', 'E', 'D', 'V', 'D'] }),
  team('venezuela', 'Venezuela', { played: 14, wins: 3, draws: 5, losses: 6, goalsFor: 9, goalsAgainst: 15, form: ['E', 'D', 'E', 'D', 'D'] }),
  team('bolivia', 'Bolívia', { played: 14, wins: 2, draws: 3, losses: 9, goalsFor: 7, goalsAgainst: 20, form: ['D', 'D', 'E', 'D', 'D'] }),
], eliminatoriasZoneRules)

export const sportFilters = [
  { id: 'futebol', label: 'Futebol', icon: '⚽' },
  { id: 'basquete', label: 'Basquete', icon: '🏀' },
  { id: 'volei', label: 'Vôlei', icon: '🏐' },
  { id: 'formula1', label: 'Fórmula 1', icon: '🏎️' },
  { id: 'lutas', label: 'Lutas', icon: '🥊' },
  { id: 'tenis', label: 'Tênis', icon: '🎾' },
  { id: 'olimpicos', label: 'Olímpicos', icon: '🏅' },
]

const DEMO_NOTE = 'Classificação ilustrativa para demonstração do módulo. Consulte a fonte oficial para dados reais.'

export const competitions = [
  {
    id: 'brasileirao-serie-a',
    name: 'Brasileirão Série A',
    sport: 'futebol',
    type: 'league',
    season: SEASON,
    status: 'Em andamento',
    country: 'Brasil',
    format: 'Pontos corridos — 38 rodadas (dados demonstrativos)',
    teams: serieATeams,
    groups: null,
    knockout: null,
    zones: {
      leader: { label: 'Líder / Campeão' },
      classification: { from: 1, to: 6, label: 'Libertadores' },
      preQualification: { from: 7, to: 12, label: 'Pré-Libertadores / Sul-Americana' },
      relegation: { from: 17, to: 20, label: 'Rebaixamento' },
    },
    participants: 20,
    notes: DEMO_NOTE,
    nextGames: [
      { home: 'Flamengo', away: 'Corinthians', date: '12 Jul 2026', time: '16:00' },
      { home: 'Palmeiras', away: 'São Paulo', date: '12 Jul 2026', time: '18:30' },
      { home: 'Grêmio', away: 'Internacional', date: '13 Jul 2026', time: '20:00' },
    ],
    featured: true,
    cardSummary: 'Classificação ilustrativa — temporada 2026 (demo)',
    isDemonstrative: true,
  },
  {
    id: 'brasileirao-serie-b',
    name: 'Brasileirão Série B',
    sport: 'futebol',
    type: 'league',
    season: SEASON,
    status: 'Em andamento',
    country: 'Brasil',
    format: 'Pontos corridos — 38 rodadas (dados demonstrativos)',
    teams: serieBTeams,
    groups: null,
    knockout: null,
    zones: {
      leader: { label: 'Líder / Acesso direto' },
      classification: { from: 1, to: 4, label: 'Acesso à Série A' },
      preQualification: { from: 5, to: 8, label: 'Pré-Série A' },
      relegation: { from: 17, to: 20, label: 'Rebaixamento' },
    },
    participants: 20,
    notes: DEMO_NOTE,
    nextGames: [
      { home: 'Sport Recife', away: 'Coritiba', date: '11 Jul 2026', time: '19:00' },
      { home: 'Goiás', away: 'Avaí', date: '12 Jul 2026', time: '16:00' },
    ],
    featured: true,
    cardSummary: 'Sport Recife lidera cenário demonstrativo',
    isDemonstrative: true,
  },
  {
    id: 'copa-do-brasil',
    name: 'Copa do Brasil',
    sport: 'futebol',
    type: 'knockout',
    season: SEASON,
    status: 'Mata-mata',
    country: 'Brasil',
    format: 'Eliminatória em jogos de ida e volta (dados demonstrativos)',
    teams: [],
    groups: null,
    knockout: copaBrasilKnockout,
    participants: 80,
    notes: DEMO_NOTE,
    nextGames: [
      { home: 'Corinthians', away: 'Bahia', date: '17 Jul 2026', time: '21:30', leg: 'Volta' },
      { home: 'Fortaleza', away: 'Vasco', date: '22 Jul 2026', time: '19:00', leg: 'Volta' },
    ],
    featured: true,
    cardSummary: 'Chave eliminatória ilustrativa — edição 2026',
    isDemonstrative: true,
  },
  {
    id: 'libertadores',
    name: 'Copa Libertadores',
    sport: 'futebol',
    type: 'groups-knockout',
    season: SEASON,
    status: 'Fase de grupos',
    country: 'América do Sul',
    format: 'Grupos + mata-mata (dados demonstrativos)',
    teams: [],
    groups: libertadoresGroups,
    knockout: libertadoresKnockout,
    participants: 47,
    notes: DEMO_NOTE,
    nextGames: [
      { home: 'Flamengo', away: 'Nacional', date: '08 Jul 2026', time: '21:30' },
      { home: 'Palmeiras', away: 'Boca Juniors', date: '09 Jul 2026', time: '19:00' },
    ],
    featured: true,
    cardSummary: 'Grupos e mata-mata — cenário ilustrativo 2026',
    isDemonstrative: true,
  },
  {
    id: 'sul-americana',
    name: 'Copa Sul-Americana',
    sport: 'futebol',
    type: 'groups-knockout',
    season: SEASON,
    status: 'Fase de grupos',
    country: 'América do Sul',
    format: 'Grupos + mata-mata (dados demonstrativos)',
    teams: [],
    groups: sulAmericanaGroups,
    knockout: sulAmericanaKnockout,
    participants: 44,
    notes: DEMO_NOTE,
    nextGames: [
      { home: 'São Paulo', away: 'Lanús', date: '10 Jul 2026', time: '21:30' },
    ],
    featured: false,
    cardSummary: 'Grupos e oitavas — dados demonstrativos',
    isDemonstrative: true,
  },
  {
    id: 'champions-league',
    name: 'UEFA Champions League',
    sport: 'futebol',
    type: 'groups-knockout',
    season: SEASON,
    status: 'Fase de grupos',
    country: 'Europa',
    format: 'Grupos + mata-mata (dados demonstrativos)',
    teams: [],
    groups: championsGroups,
    knockout: championsKnockout,
    participants: 36,
    notes: DEMO_NOTE,
    nextGames: [
      { home: 'Real Madrid', away: 'Manchester City', date: '14 Jul 2026', time: '16:00' },
      { home: 'Barcelona', away: 'Bayern München', date: '15 Jul 2026', time: '16:00' },
    ],
    featured: true,
    cardSummary: 'Grupos e oitavas — cenário ilustrativo 2026',
    isDemonstrative: true,
  },
  {
    id: 'copa-do-mundo',
    name: 'Copa do Mundo FIFA',
    sport: 'futebol',
    type: 'world-cup',
    season: SEASON,
    status: 'Fase de grupos',
    country: 'EUA / México / Canadá',
    format: '48 seleções — grupos A a H + mata-mata (dados demonstrativos)',
    teams: [],
    groups: worldCupGroups,
    knockout: worldCupKnockout,
    participants: 48,
    notes: DEMO_NOTE,
    nextGames: [
      { home: 'Brasil', away: 'Suíça', date: '18 Jul 2026', time: '16:00' },
      { home: 'Argentina', away: 'México', date: '19 Jul 2026', time: '19:00' },
    ],
    featured: true,
    cardSummary: 'Grupos A–H e mata-mata — cenário ilustrativo',
    isDemonstrative: true,
  },
  {
    id: 'eliminatorias',
    name: 'Eliminatórias CONMEBOL',
    sport: 'futebol',
    type: 'league',
    season: SEASON,
    status: 'Em andamento',
    country: 'América do Sul',
    format: 'Pontos corridos — 6 vagas diretas + repescagem (dados demonstrativos)',
    teams: eliminatoriasTeams,
    groups: null,
    knockout: null,
    zones: {
      leader: { label: 'Líder' },
      classification: { from: 1, to: 6, label: 'Classificação direta' },
      preQualification: { from: 7, to: 7, label: 'Repescagem' },
      relegation: { from: 8, to: 10, label: 'Eliminado' },
    },
    participants: 10,
    notes: DEMO_NOTE,
    nextGames: [
      { home: 'Brasil', away: 'Uruguai', date: '15 Jul 2026', time: '21:30' },
      { home: 'Argentina', away: 'Equador', date: '16 Jul 2026', time: '19:00' },
    ],
    featured: false,
    cardSummary: 'Classificação ilustrativa para a Copa 2026',
    isDemonstrative: true,
  },
  {
    id: 'paulistao',
    name: 'Campeonato Paulista',
    sport: 'futebol',
    type: 'league',
    season: SEASON,
    status: 'Encerrado',
    country: 'Brasil — SP',
    format: 'Pontos corridos + mata-mata (dados demonstrativos)',
    teams: assignPositions([
      team('palmeiras-paul', 'Palmeiras', { played: 12, wins: 9, draws: 2, losses: 1, goalsFor: 24, goalsAgainst: 8, form: ['V', 'V', 'E', 'V', 'V'] }),
      team('santos-paul', 'Santos', { played: 12, wins: 7, draws: 3, losses: 2, goalsFor: 18, goalsAgainst: 10, form: ['V', 'E', 'V', 'D', 'V'] }),
      team('corinthians-paul', 'Corinthians', { played: 12, wins: 6, draws: 4, losses: 2, goalsFor: 16, goalsAgainst: 11, form: ['E', 'V', 'E', 'V', 'D'] }),
      team('sao-paulo-paul', 'São Paulo', { played: 12, wins: 6, draws: 3, losses: 3, goalsFor: 15, goalsAgainst: 12, form: ['V', 'D', 'V', 'E', 'V'] }),
      team('bragantino-paul', 'Bragantino', { played: 12, wins: 5, draws: 3, losses: 4, goalsFor: 14, goalsAgainst: 13, form: ['D', 'V', 'E', 'V', 'D'] }),
      team('ponte-preta-paul', 'Ponte Preta', { played: 12, wins: 4, draws: 2, losses: 6, goalsFor: 11, goalsAgainst: 16, form: ['D', 'D', 'V', 'E', 'D'] }),
    ]),
    groups: null,
    knockout: null,
    zones: {
      leader: { label: 'Campeão' },
      classification: { from: 1, to: 4, label: 'Semifinal' },
      relegation: { from: 5, to: 6, label: 'Eliminado' },
    },
    participants: 16,
    notes: DEMO_NOTE,
    nextGames: [],
    featured: false,
    cardSummary: 'Resultado ilustrativo — Palmeiras campeão',
    isDemonstrative: true,
  },
  {
    id: 'carioca',
    name: 'Campeonato Carioca',
    sport: 'futebol',
    type: 'league',
    season: SEASON,
    status: 'Encerrado',
    country: 'Brasil — RJ',
    format: 'Taça Guanabara + Taça Rio + final (dados demonstrativos)',
    teams: assignPositions([
      team('flamengo-car', 'Flamengo', { played: 11, wins: 8, draws: 2, losses: 1, goalsFor: 22, goalsAgainst: 7, form: ['V', 'V', 'E', 'V', 'V'] }),
      team('fluminense-car', 'Fluminense', { played: 11, wins: 6, draws: 3, losses: 2, goalsFor: 16, goalsAgainst: 10, form: ['E', 'V', 'V', 'D', 'V'] }),
      team('vasco-car', 'Vasco', { played: 11, wins: 5, draws: 2, losses: 4, goalsFor: 13, goalsAgainst: 12, form: ['V', 'D', 'E', 'V', 'D'] }),
      team('botafogo-car', 'Botafogo', { played: 11, wins: 4, draws: 3, losses: 4, goalsFor: 12, goalsAgainst: 13, form: ['D', 'E', 'V', 'D', 'E'] }),
    ]),
    groups: null,
    knockout: null,
    zones: {
      leader: { label: 'Campeão' },
      classification: { from: 1, to: 2, label: 'Final' },
    },
    participants: 12,
    notes: DEMO_NOTE,
    nextGames: [],
    featured: false,
    cardSummary: 'Resultado ilustrativo — Flamengo campeão',
    isDemonstrative: true,
  },
  {
    id: 'nba',
    name: 'NBA',
    sport: 'basquete',
    type: 'coming-soon',
    season: SEASON,
    status: 'Em breve',
    country: 'EUA',
    format: 'Conferências Leste e Oeste',
    teams: [],
    groups: null,
    knockout: null,
    participants: 30,
    notes: 'Classificação completa da NBA em breve na Arena 360.',
    nextGames: [],
    featured: false,
    cardSummary: 'Tabelas da NBA em breve',
  },
  {
    id: 'nbb',
    name: 'NBB',
    sport: 'basquete',
    type: 'coming-soon',
    season: SEASON,
    status: 'Em breve',
    country: 'Brasil',
    format: 'Liga nacional de basquete',
    teams: [],
    groups: null,
    knockout: null,
    participants: 16,
    notes: 'O novo basquete brasileiro terá cobertura de classificação em breve.',
    nextGames: [],
    featured: false,
    cardSummary: 'NBB em breve',
  },
  {
    id: 'superliga-volei',
    name: 'Superliga Masculina',
    sport: 'volei',
    type: 'coming-soon',
    season: SEASON,
    status: 'Em breve',
    country: 'Brasil',
    format: 'Pontos corridos + playoffs',
    teams: [],
    groups: null,
    knockout: null,
    participants: 12,
    notes: 'Tabela da Superliga de vôlei em desenvolvimento.',
    nextGames: [],
    featured: false,
    cardSummary: 'Superliga em breve',
  },
  {
    id: 'f1-2026',
    name: 'Fórmula 1 — 2026',
    sport: 'formula1',
    type: 'coming-soon',
    season: SEASON,
    status: 'Em breve',
    country: 'Mundial',
    format: 'Campeonato de pilotos e construtores',
    teams: [],
    groups: null,
    knockout: null,
    participants: 20,
    notes: 'Classificação de pilotos e equipes da F1 em breve.',
    nextGames: [],
    featured: false,
    cardSummary: 'Grid da F1 em breve',
  },
  {
    id: 'ufc-rankings',
    name: 'Ranking UFC',
    sport: 'lutas',
    type: 'coming-soon',
    season: SEASON,
    status: 'Em breve',
    country: 'Mundial',
    format: 'Ranking por categoria de peso',
    teams: [],
    groups: null,
    knockout: null,
    participants: 0,
    notes: 'Rankings oficiais do UFC em breve.',
    nextGames: [],
    featured: false,
    cardSummary: 'Rankings UFC em breve',
  },
  {
    id: 'atp-rankings',
    name: 'Ranking ATP',
    sport: 'tenis',
    type: 'coming-soon',
    season: SEASON,
    status: 'Em breve',
    country: 'Mundial',
    format: 'Ranking individual masculino',
    teams: [],
    groups: null,
    knockout: null,
    participants: 0,
    notes: 'Top 20 do ranking ATP em breve.',
    nextGames: [],
    featured: false,
    cardSummary: 'ATP em breve',
  },
  {
    id: 'olimpiadas-2028',
    name: 'Medalhas — Los Angeles 2028',
    sport: 'olimpicos',
    type: 'coming-soon',
    season: '2028',
    status: 'Em breve',
    country: 'EUA',
    format: 'Quadro de medalhas por país',
    teams: [],
    groups: null,
    knockout: null,
    participants: 0,
    notes: 'Quadro de medalhas olímpicas em breve.',
    nextGames: [],
    featured: false,
    cardSummary: 'Medalhas olímpicas em breve',
  },
]

export function getCompetitionsBySport(sport) {
  return competitions.filter((c) => c.sport === sport)
}

export function getCompetitionById(id) {
  return competitions.find((c) => c.id === id) ?? null
}

export function getFootballCompetitions() {
  return competitions.filter((c) => c.sport === 'futebol')
}
