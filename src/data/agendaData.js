/** Dados demonstrativos — eventos ilustrativos, não representam calendário oficial em tempo real. */

import {
  addDays,
  enrichAgendaEvent,
  filtrarEventosPorPeriodo,
  getAgendaWeekDays,
  getTodayBrazil,
  toISO,
} from '../utils/agendaDateUtils'

const asset = (file) => `${import.meta.env.BASE_URL}assets/sports/${file}`

const rawAgendaEvents = [
  {
    id: 1,
    daysOffset: 0,
    title: 'Final ilustrativa — Campeonato Nacional',
    sport: 'Futebol',
    filter: 'futebol',
    time: '20:30',
    location: 'Maracanã, Rio de Janeiro',
    description: 'Cenário demonstrativo da decisão do título nacional em jogo único.',
    fullDescription: [
      'Evento fictício para demonstração do módulo de agenda da Arena 360.',
      'A partida ilustra como coberturas de finais nacionais seriam exibidas no portal, com destaque para contexto, horário e local.',
    ],
    featured: true,
    image: asset('futebol.jpg'),
    tag: 'Demo',
    eventType: 'Final',
    phase: 'Cenário ilustrativo',
    importance: 'Alta',
  },
  {
    id: 2,
    daysOffset: 0,
    title: 'NBA Summer League — semifinal (demo)',
    sport: 'Basquete',
    filter: 'basquete',
    time: '22:00',
    location: 'Las Vegas, EUA',
    description: 'Torneio de verão com confronto ilustrativo entre franquias de desenvolvimento.',
    fullDescription: [
      'Em julho, a NBA realiza a Summer League — cenário adequado para dados demonstrativos de basquete.',
      'Este evento não representa playoffs oficiais; serve apenas para ilustrar a experiência da agenda.',
    ],
    featured: false,
    image: asset('basquete.jpg'),
    tag: 'Demo',
    eventType: 'Semifinal',
    phase: 'Summer League',
    importance: 'Média',
  },
  {
    id: 3,
    daysOffset: 0,
    title: 'Superliga Feminina — jogo 2 da semifinal (demo)',
    sport: 'Vôlei',
    filter: 'volei',
    time: '19:30',
    location: 'Belo Horizonte, MG',
    description: 'Semifinal ilustrativa da principal liga nacional de vôlei feminino.',
    fullDescription: [
      'Confronto demonstrativo em série melhor de três, com vantagem de quadra para a mandante.',
      'Os dados não refletem o calendário real da Confederação Brasileira de Voleibol.',
    ],
    featured: false,
    image: asset('volei.jpg'),
    tag: 'Demo',
    eventType: 'Semifinal',
    phase: 'Superliga',
    importance: 'Média',
  },
  {
    id: 4,
    daysOffset: 0,
    title: 'Wimbledon — quartas de final femininas (demo)',
    sport: 'Tênis',
    filter: 'tenis',
    time: '15:00',
    location: 'Londres, Reino Unido',
    description: 'Cenário ilustrativo de Grand Slam em quadra de grama no início de julho.',
    fullDescription: [
      'Wimbledon costuma ocorrer no começo de julho — data coerente para demonstração.',
      'Nomes de atletas e resultados são fictícios; consulte fontes oficiais da ATP/WTA para dados reais.',
    ],
    featured: false,
    image: asset('tenis.jpg'),
    tag: 'Demo',
    eventType: 'Quartas de final',
    phase: 'Grand Slam',
    importance: 'Alta',
  },
  {
    id: 5,
    daysOffset: 0,
    title: 'UFC — card principal ilustrativo (demo)',
    sport: 'Lutas',
    filter: 'lutas',
    time: '23:00',
    location: 'Las Vegas, EUA',
    description: 'Card demonstrativo com disputa principal na categoria meio-pesado.',
    fullDescription: [
      'Evento fictício para mostrar como lutas internacionais aparecem na agenda.',
      'Não representa card oficial do UFC nem resultados reais de qualquer edição.',
    ],
    featured: false,
    image: asset('lutas.jpg'),
    tag: 'Demo',
    eventType: 'Card principal',
    phase: 'Cenário ilustrativo',
    importance: 'Alta',
  },
  {
    id: 6,
    daysOffset: 1,
    title: 'F1 — treinos livres do GP da Grã-Bretanha (demo)',
    sport: 'Fórmula 1',
    filter: 'formula1',
    time: '12:00',
    location: 'Silverstone, Reino Unido',
    description: 'Sessão demonstrativa no circuito britânico, etapa tradicional de julho.',
    fullDescription: [
      'Silverstone sedeia o GP da Grã-Bretanha — nomenclatura correta para o circuito.',
      'Horários e resultados são ilustrativos; consulte a FIA para o calendário oficial da F1.',
    ],
    featured: false,
    image: asset('formula1.jpg'),
    tag: 'Demo',
    eventType: 'Treino livre',
    phase: 'GP da Grã-Bretanha',
    importance: 'Média',
  },
  {
    id: 7,
    daysOffset: 1,
    title: 'Eliminatórias CONMEBOL — Brasil x Argentina (demo)',
    sport: 'Futebol',
    filter: 'futebol',
    time: '21:00',
    location: 'Maracanã, Rio de Janeiro',
    description: 'Clássico sul-americano em cenário ilustrativo de eliminatórias.',
    fullDescription: [
      'Confronto demonstrativo entre seleções — não reflete jogos reais da CONMEBOL.',
      'Serve para ilustrar como clássicos de seleções seriam destacados na agenda.',
    ],
    featured: false,
    image: asset('futebol-2.jpg'),
    tag: 'Demo',
    eventType: 'Eliminatórias',
    phase: 'Cenário ilustrativo',
    importance: 'Alta',
  },
  {
    id: 8,
    daysOffset: 1,
    title: 'NBA Summer League — final do torneio (demo)',
    sport: 'Basquete',
    filter: 'basquete',
    time: '19:30',
    location: 'Las Vegas, EUA',
    description: 'Decisão ilustrativa do torneio de verão da NBA.',
    fullDescription: [
      'Final demonstrativa encerra o ciclo fictício da Summer League na agenda.',
      'Evento criado para fins de interface — sem vínculo com temporada oficial da NBA.',
    ],
    featured: false,
    image: asset('basquete-2.jpg'),
    tag: 'Demo',
    eventType: 'Final',
    phase: 'Summer League',
    importance: 'Média',
  },
  {
    id: 9,
    daysOffset: 2,
    title: 'F1 — corrida do GP da Grã-Bretanha (demo)',
    sport: 'Fórmula 1',
    filter: 'formula1',
    time: '10:00',
    location: 'Silverstone, Reino Unido',
    description: 'Grande Prêmio demonstrativo no circuito mais tradicional do calendário.',
    fullDescription: [
      'Corrida ilustrativa em Silverstone, etapa conhecida como GP da Grã-Bretanha.',
      'Estratégias, pilotos e resultados são fictícios para demonstração do portal.',
    ],
    featured: false,
    image: asset('formula1.jpg'),
    tag: 'Demo',
    eventType: 'Grande Prêmio',
    phase: 'GP da Grã-Bretanha',
    importance: 'Alta',
  },
  {
    id: 10,
    daysOffset: 2,
    title: 'Circuito MMA Brasil — defesa de cinturão (demo)',
    sport: 'Lutas',
    filter: 'lutas',
    time: '19:00',
    location: 'São Paulo, SP',
    description: 'Lutador brasileiro em cenário ilustrativo de defesa de título nacional.',
    fullDescription: [
      'Card demonstrativo de MMA com foco em atletas nacionais.',
      'Não representa evento real de qualquer promoção de artes marciais mistas.',
    ],
    featured: false,
    image: asset('lutas.jpg'),
    tag: 'Demo',
    eventType: 'Título',
    phase: 'Cenário ilustrativo',
    importance: 'Alta',
  },
  {
    id: 11,
    daysOffset: 2,
    title: 'Superliga Masculina — final ilustrativa (demo)',
    sport: 'Vôlei',
    filter: 'volei',
    time: '18:00',
    location: 'Curitiba, PR',
    description: 'Decisão demonstrativa do campeonato nacional de vôlei masculino.',
    fullDescription: [
      'Final fictícia em jogo único para ilustrar cobertura de decisões nacionais.',
      'Equipes e placares não correspondem à temporada real da Superliga.',
    ],
    featured: false,
    image: asset('volei.jpg'),
    tag: 'Demo',
    eventType: 'Final',
    phase: 'Superliga',
    importance: 'Alta',
  },
  {
    id: 12,
    daysOffset: 3,
    title: 'ATP 1000 Cincinnati — semifinal masculina (demo)',
    sport: 'Tênis',
    filter: 'tenis',
    time: '10:00',
    location: 'Cincinnati, EUA',
    description: 'Semifinal ilustrativa do Masters 1000 de hard court nos EUA.',
    fullDescription: [
      'Cincinnati ocorre em agosto na vida real; aqui aparece como cenário demonstrativo antecipado.',
      'Útil para mostrar como torneios ATP seriam listados na agenda da Arena 360.',
    ],
    featured: false,
    image: asset('tenis.jpg'),
    tag: 'Demo',
    eventType: 'Semifinal',
    phase: 'Masters 1000',
    importance: 'Média',
  },
  {
    id: 13,
    daysOffset: 3,
    title: 'Diamond League — etapa de Paris (demo)',
    sport: 'Atletismo',
    filter: 'atletismo',
    time: '14:30',
    location: 'Paris, França',
    description: 'Meeting ilustrativo do circuito mundial de atletismo.',
    fullDescription: [
      'Provas demonstrativas de velocidade e meio-fundo com atletas fictícios.',
      'Consulte a World Athletics para calendário e resultados oficiais.',
    ],
    featured: false,
    image: asset('atletismo.jpg'),
    tag: 'Demo',
    eventType: 'Meeting',
    phase: 'Diamond League',
    importance: 'Média',
  },
  {
    id: 14,
    daysOffset: 4,
    title: 'Seletiva olímpica — natação (demo)',
    sport: 'Esportes Olímpicos',
    filter: 'olimpicos',
    time: '09:00',
    location: 'Rio de Janeiro, RJ',
    description: 'Provas classificatórias ilustrativas para composição de delegação.',
    fullDescription: [
      'Cenário demonstrativo de seletivas olímpicas brasileiras.',
      'Índices, nadadores e resultados são fictícios para fins de interface.',
    ],
    featured: false,
    image: asset('olimpicos.jpg'),
    tag: 'Demo',
    eventType: 'Seletiva',
    phase: 'Cenário ilustrativo',
    importance: 'Alta',
  },
  {
    id: 15,
    daysOffset: 4,
    title: 'Copa Estadual — final ilustrativa (demo)',
    sport: 'Futebol',
    filter: 'futebol',
    time: '20:00',
    location: 'Neo Química Arena, São Paulo',
    description: 'Decisão demonstrativa de competição estadual em jogo único.',
    fullDescription: [
      'Final fictícia para ilustrar cobertura de torneios regionais.',
      'Não representa edição real de campeonato estadual.',
    ],
    featured: false,
    image: asset('futebol-3.jpg'),
    tag: 'Demo',
    eventType: 'Final',
    phase: 'Copa estadual',
    importance: 'Média',
  },
  {
    id: 16,
    daysOffset: 5,
    title: 'Euroliga — estreia da temporada 2026/27 (demo)',
    sport: 'Basquete',
    filter: 'basquete',
    time: '16:00',
    location: 'Madrid, Espanha',
    description: 'Abertura ilustrativa da principal liga europeia de basquete.',
    fullDescription: [
      'A temporada europeia costuma iniciar no outono; evento antecipado para demonstração.',
      'Elencos e confrontos são fictícios.',
    ],
    featured: false,
    image: asset('basquete-3.jpg'),
    tag: 'Demo',
    eventType: 'Estreia',
    phase: 'Temporada regular',
    importance: 'Média',
  },
  {
    id: 17,
    daysOffset: 6,
    title: 'ATP 500 Toronto — final masculina (demo)',
    sport: 'Tênis',
    filter: 'tenis',
    time: '17:00',
    location: 'Toronto, Canadá',
    description: 'Final ilustrativa de torneio ATP 500 em quadras duras.',
    fullDescription: [
      'Cenário demonstrativo de final de torneio no calendário norte-americano.',
      'Resultados e participantes não correspondem a edição real.',
    ],
    featured: false,
    image: asset('tenis.jpg'),
    tag: 'Demo',
    eventType: 'Final',
    phase: 'ATP 500',
    importance: 'Média',
  },
  {
    id: 18,
    daysOffset: 6,
    title: 'Campeonato Sul-Americano de Atletismo (demo)',
    sport: 'Atletismo',
    filter: 'atletismo',
    time: '11:00',
    location: 'Santiago, Chile',
    description: 'Provas ilustrativas de velocidade e salto em altura.',
    fullDescription: [
      'Torneio continental demonstrativo com delegação brasileira fictícia.',
      'Medalhas e índices não refletem competição real.',
    ],
    featured: false,
    image: asset('atletismo.jpg'),
    tag: 'Demo',
    eventType: 'Campeonato',
    phase: 'Sul-americano',
    importance: 'Média',
  },
  {
    id: 19,
    daysOffset: 10,
    title: 'Circuito Mundial de Vôlei de Praia — etapa SC (demo)',
    sport: 'Vôlei',
    filter: 'volei',
    time: '13:00',
    location: 'Florianópolis, SC',
    description: 'Etapa brasileira ilustrativa do circuito internacional de praia.',
    fullDescription: [
      'Duplas fictícias disputam pontos em cenário demonstrativo.',
      'Não representa etapa oficial da FIVB.',
    ],
    featured: false,
    image: asset('volei.jpg'),
    tag: 'Demo',
    eventType: 'Torneio',
    phase: 'Circuito mundial',
    importance: 'Média',
  },
  {
    id: 20,
    daysOffset: 18,
    title: 'F1 — classificação do GP do Brasil (demo)',
    sport: 'Fórmula 1',
    filter: 'formula1',
    time: '14:00',
    location: 'Interlagos, São Paulo',
    description: 'Sessão classificatória ilustrativa no autódromo de Interlagos.',
    fullDescription: [
      'O GP do Brasil tradicionalmente ocorre em novembro; aqui aparece como evento demonstrativo futuro.',
      'Grid e horários são fictícios para fins de interface.',
    ],
    featured: false,
    image: asset('formula1.jpg'),
    tag: 'Demo',
    eventType: 'Classificação',
    phase: 'GP do Brasil',
    importance: 'Alta',
  },
  {
    id: 21,
    daysOffset: -1,
    title: 'Brasileirão — rodada 14 encerrada (demo)',
    sport: 'Futebol',
    filter: 'futebol',
    time: '19:00',
    location: 'São Paulo, SP',
    description: 'Rodada ilustrativa já concluída, com resultado fictício por 2 a 1.',
    fullDescription: [
      'Evento passado para demonstrar o status "Encerrado" na agenda.',
      'Resultado e confronto não correspondem a partida real do campeonato.',
    ],
    featured: false,
    image: asset('futebol-2.jpg'),
    tag: 'Demo',
    eventType: 'Rodada',
    phase: 'Brasileirão Série A',
    importance: 'Baixa',
  },
  {
    id: 22,
    daysOffset: -2,
    title: 'Seletiva olímpica — ginástica artística (demo)',
    sport: 'Esportes Olímpicos',
    filter: 'olimpicos',
    time: '14:00',
    location: 'Belo Horizonte, MG',
    description: 'Seletiva ilustrativa já realizada para composição de equipe.',
    fullDescription: [
      'Evento passado demonstrativo com apresentações em solo, salto e barras.',
      'Atletas e vagas são fictícios.',
    ],
    featured: false,
    image: asset('olimpicos.jpg'),
    tag: 'Demo',
    eventType: 'Seletiva',
    phase: 'Cenário ilustrativo',
    importance: 'Média',
  },
]

export const agendaSportFilters = [
  { id: 'todos', label: 'Todos' },
  { id: 'futebol', label: 'Futebol' },
  { id: 'basquete', label: 'Basquete' },
  { id: 'volei', label: 'Vôlei' },
  { id: 'formula1', label: 'Fórmula 1' },
  { id: 'lutas', label: 'Lutas' },
  { id: 'tenis', label: 'Tênis' },
  { id: 'atletismo', label: 'Atletismo' },
  { id: 'olimpicos', label: 'Olímpicos' },
]

export const agendaPeriodFilters = [
  { id: 'todos', label: 'Todos' },
  { id: 'hoje', label: 'Hoje' },
  { id: 'amanha', label: 'Amanhã' },
  { id: 'semana', label: 'Esta semana' },
  { id: 'fim-de-semana', label: 'Fim de semana' },
  { id: '30-dias', label: 'Próximos 30 dias' },
]

export function getAgendaEvents() {
  return rawAgendaEvents.map(enrichAgendaEvent)
}

export const agendaEvents = getAgendaEvents()

export function getAgendaFeaturedEvent() {
  return getAgendaEvents().find((event) => event.featured)
}

export function getAgendaSummary() {
  const events = getAgendaEvents()
  const todayISO = toISO(getTodayBrazil())
  const weekEndISO = toISO(addDays(getTodayBrazil(), 6))
  const todayCount = events.filter((event) => event.dateISO === todayISO).length
  const weekCount = events.filter(
    (event) => event.dateISO >= todayISO && event.dateISO <= weekEndISO,
  ).length
  const sportsCount = new Set(events.map((event) => event.filter)).size
  const featured = events.find((event) => event.featured)

  return [
    { id: 'today', icon: '📅', value: String(todayCount), label: 'Eventos hoje' },
    { id: 'week', icon: '🔥', value: String(weekCount), label: 'Próximos 7 dias' },
    { id: 'sports', icon: '🏆', value: String(sportsCount), label: 'Modalidades' },
    {
      id: 'highlight',
      icon: '⭐',
      value: featured?.eventType ?? 'Final',
      label: 'Destaque demonstrativo',
      isText: true,
    },
  ]
}

export function getEventCountByDay(dateISO) {
  return getAgendaEvents().filter((event) => event.dateISO === dateISO).length
}

export function filterAgendaEvents(events, { sport, period, dayISO }) {
  let result = [...events]

  if (sport && sport !== 'todos') {
    result = result.filter((event) => event.filter === sport)
  }

  if (dayISO) {
    return result.filter((event) => event.dateISO === dayISO)
  }

  if (!period || period === 'todos') {
    return result
  }

  return filtrarEventosPorPeriodo(result, period)
}

export { getAgendaWeekDays, filtrarEventosPorPeriodo, enrichAgendaEvent } from '../utils/agendaDateUtils'

/** @deprecated use agendaEvents */
export const weekAgenda = agendaEvents
