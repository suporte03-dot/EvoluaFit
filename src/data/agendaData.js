const asset = (file) => `${import.meta.env.BASE_URL}assets/sports/${file}`

export const REFERENCE_DATE = '2026-07-10'

export const agendaSummary = [
  { id: 'today', icon: '📅', value: '5', label: 'Eventos hoje' },
  { id: 'week', icon: '🔥', value: '18', label: 'Próximos 7 dias' },
  { id: 'sports', icon: '🏆', value: '8', label: 'Modalidades' },
  { id: 'highlight', icon: '⭐', value: 'Final', label: 'Destaque nacional', isText: true },
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

export const agendaWeekDays = [
  { key: '2026-07-06', label: 'Seg', short: '6' },
  { key: '2026-07-07', label: 'Ter', short: '7' },
  { key: '2026-07-08', label: 'Qua', short: '8' },
  { key: '2026-07-09', label: 'Qui', short: '9' },
  { key: '2026-07-10', label: 'Sex', short: '10', isToday: true },
  { key: '2026-07-11', label: 'Sáb', short: '11' },
  { key: '2026-07-12', label: 'Dom', short: '12' },
]

export const agendaEvents = [
  {
    id: 1,
    title: 'Final do campeonato nacional',
    sport: 'Futebol',
    filter: 'futebol',
    date: '10 Jul',
    day: 'Sex',
    dateISO: '2026-07-10',
    time: '20:30',
    location: 'Maracanã, Rio de Janeiro',
    status: 'Hoje',
    description: 'Decisão do título nacional em jogo único com estádio lotado.',
    fullDescription: [
      'A grande final do campeonato nacional reúne os dois melhores times da temporada em confronto direto pelo título.',
      'Com mais de 70 mil torcedores esperados, a partida promete ser um espetáculo de emoção, técnica e rivalidade histórica.',
      'A Arena 360 acompanha cada lance com cobertura completa antes, durante e depois do apito final.',
    ],
    featured: true,
    image: asset('futebol.jpg'),
    tag: 'Destaque',
    eventType: 'Final',
    phase: 'Decisão do título',
    importance: 'Alta',
  },
  {
    id: 2,
    title: 'Semifinal da conferência leste — NBA',
    sport: 'Basquete',
    filter: 'basquete',
    date: '10 Jul',
    day: 'Sex',
    dateISO: '2026-07-10',
    time: '22:00',
    location: 'Boston, EUA',
    status: 'Hoje',
    description: 'Jogo 6 pode definir o finalista da conferência leste.',
    fullDescription: [
      'A franquia da casa busca fechar a série em casa diante de uma torcida que lota o ginásio.',
      'O confronto coloca frente a frente duas das melhores defesas da temporada, com ritmo intenso nos dois lados da quadra.',
    ],
    featured: false,
    image: asset('basquete.jpg'),
    tag: 'Playoffs',
    eventType: 'Semifinal',
    phase: 'Conferência Leste',
    importance: 'Alta',
  },
  {
    id: 3,
    title: 'Superliga feminina — Semifinal',
    sport: 'Vôlei',
    filter: 'volei',
    date: '10 Jul',
    day: 'Sex',
    dateISO: '2026-07-10',
    time: '19:30',
    location: 'Belo Horizonte, MG',
    status: 'Hoje',
    description: 'Primeira semifinal da Superliga Feminina 2026.',
    fullDescription: [
      'As equipes se enfrentam em série melhor de três, com vantagem de quadra para a dona da casa.',
      'A partida abre a reta decisiva do campeonato nacional de vôlei feminino.',
    ],
    featured: false,
    image: asset('volei.jpg'),
    tag: 'Nacional',
    eventType: 'Semifinal',
    phase: 'Superliga',
    importance: 'Média',
  },
  {
    id: 4,
    title: 'Quartas de final — Grand Slam',
    sport: 'Tênis',
    filter: 'tenis',
    date: '10 Jul',
    day: 'Sex',
    dateISO: '2026-07-10',
    time: '15:00',
    location: 'Londres, Reino Unido',
    status: 'Hoje',
    description: 'Brasileira busca vaga inédita entre as quatro melhores.',
    fullDescription: [
      'A tenista nacional entra em quadra como uma das grandes surpresas do torneio.',
      'Uma vitória garante a melhor campanha brasileira em Grand Slam na última década.',
    ],
    featured: false,
    image: asset('tenis.jpg'),
    tag: 'Grand Slam',
    eventType: 'Quartas de final',
    phase: 'Chave principal',
    importance: 'Alta',
  },
  {
    id: 5,
    title: 'UFC Fight Night — Card principal',
    sport: 'Lutas',
    filter: 'lutas',
    date: '10 Jul',
    day: 'Sex',
    dateISO: '2026-07-10',
    time: '23:00',
    location: 'Las Vegas, EUA',
    status: 'Hoje',
    description: 'Disputa de cinturão na categoria meio-pesado.',
    fullDescription: [
      'O card principal reúne dois campeões invictos em um confronto que pode definir o próximo grande nome da categoria.',
      'A transmissão começa com as preliminares a partir das 20h (horário local).',
    ],
    featured: false,
    image: asset('lutas.jpg'),
    tag: 'Cinturão',
    eventType: 'Título',
    phase: 'Card principal',
    importance: 'Alta',
  },
  {
    id: 6,
    title: 'Treino classificatório — GP da Europa',
    sport: 'Fórmula 1',
    filter: 'formula1',
    date: '11 Jul',
    day: 'Sáb',
    dateISO: '2026-07-11',
    time: '15:00',
    location: 'Silverstone, Reino Unido',
    status: 'Amanhã',
    description: 'Preparação decisiva para a corrida no histórico circuito britânico.',
    fullDescription: [
      'Os pilotos ajustam os carros em busca do melhor equilíbrio entre velocidade e estabilidade.',
      'A classificação de sábado promete disputa acirrada entre os três primeiros do mundial.',
    ],
    featured: false,
    image: asset('formula1.jpg'),
    tag: 'F1',
    eventType: 'Classificação',
    phase: 'GP da Europa',
    importance: 'Alta',
  },
  {
    id: 7,
    title: 'Brasil x Argentina — Eliminatórias',
    sport: 'Futebol',
    filter: 'futebol',
    date: '11 Jul',
    day: 'Sáb',
    dateISO: '2026-07-11',
    time: '21:00',
    location: 'Maracanã, Rio de Janeiro',
    status: 'Amanhã',
    description: 'Clássico sul-americano com impacto direto na classificação.',
    fullDescription: [
      'O clássico reúne duas seleções em boa fase e com histórico de jogos intensos nos últimos anos.',
      'A vitória pode consolidar a liderança nas eliminatórias rumo ao torneio continental.',
    ],
    featured: false,
    image: asset('futebol-2.jpg'),
    tag: 'Seleção',
    eventType: 'Eliminatórias',
    phase: 'Sul-americana',
    importance: 'Alta',
  },
  {
    id: 8,
    title: 'Final da conferência oeste — NBA',
    sport: 'Basquete',
    filter: 'basquete',
    date: '11 Jul',
    day: 'Sáb',
    dateISO: '2026-07-11',
    time: '19:30',
    location: 'Denver, EUA',
    status: 'Amanhã',
    description: 'Jogo 7 define o representante da conferência oeste.',
    fullDescription: [
      'A série chega ao duelo decisivo após seis jogos eletrizantes entre os dois melhores times do oeste.',
      'O vencedor avança à grande final da temporada da NBA.',
    ],
    featured: false,
    image: asset('basquete-2.jpg'),
    tag: 'Playoffs',
    eventType: 'Final de conferência',
    phase: 'Conferência Oeste',
    importance: 'Alta',
  },
  {
    id: 9,
    title: 'GP da Europa — Corrida',
    sport: 'Fórmula 1',
    filter: 'formula1',
    date: '12 Jul',
    day: 'Dom',
    dateISO: '2026-07-12',
    time: '10:00',
    location: 'Silverstone, Reino Unido',
    status: 'Em breve',
    description: 'Grande Prêmio no circuito mais tradicional do calendário.',
    fullDescription: [
      'A corrida em Silverstone costuma entregar ultrapassagens e mudanças de clima que alteram toda a estratégia.',
      'O líder do mundial precisa de um bom resultado para ampliar a vantagem no campeonato.',
    ],
    featured: false,
    image: asset('formula1.jpg'),
    tag: 'Corrida',
    eventType: 'Grande Prêmio',
    phase: 'Etapa 12',
    importance: 'Alta',
  },
  {
    id: 10,
    title: 'Disputa de cinturão internacional',
    sport: 'Lutas',
    filter: 'lutas',
    date: '12 Jul',
    day: 'Dom',
    dateISO: '2026-07-12',
    time: '19:00',
    location: 'São Paulo, SP',
    status: 'Em breve',
    description: 'Lutador brasileiro defende o título mundial dos médios.',
    fullDescription: [
      'O campeão entra no octógono pela terceira defesa consecutiva do cinturão internacional.',
      'O card completo reúne outras cinco lutas com atletas nacionais em ascensão.',
    ],
    featured: false,
    image: asset('lutas.jpg'),
    tag: 'MMA',
    eventType: 'Título',
    phase: 'Defesa de cinturão',
    importance: 'Alta',
  },
  {
    id: 11,
    title: 'Final da Superliga masculina',
    sport: 'Vôlei',
    filter: 'volei',
    date: '12 Jul',
    day: 'Dom',
    dateISO: '2026-07-12',
    time: '18:00',
    location: 'Curitiba, PR',
    status: 'Em breve',
    description: 'Decisão do campeonato nacional de vôlei masculino.',
    fullDescription: [
      'As duas melhores equipes da temporada se enfrentam em jogo único pela taça.',
      'A final promete alto nível técnico e disputa acirrada em todos os sets.',
    ],
    featured: false,
    image: asset('volei.jpg'),
    tag: 'Nacional',
    eventType: 'Final',
    phase: 'Superliga',
    importance: 'Alta',
  },
  {
    id: 12,
    title: 'Semifinal do torneio mundial',
    sport: 'Tênis',
    filter: 'tenis',
    date: '13 Jul',
    day: 'Seg',
    dateISO: '2026-07-13',
    time: '10:00',
    location: 'Cincinnati, EUA',
    status: 'Em breve',
    description: 'Semifinal masculina em quadra central.',
    fullDescription: [
      'Os semifinalistas chegam após uma semana de jogos intensos no torneio Masters 1000.',
      'A final está marcada para a noite de terça-feira.',
    ],
    featured: false,
    image: asset('tenis.jpg'),
    tag: 'ATP',
    eventType: 'Semifinal',
    phase: 'Masters 1000',
    importance: 'Média',
  },
  {
    id: 13,
    title: 'Meeting Diamond League — Paris',
    sport: 'Atletismo',
    filter: 'atletismo',
    date: '13 Jul',
    day: 'Seg',
    dateISO: '2026-07-13',
    time: '14:30',
    location: 'Paris, França',
    status: 'Em breve',
    description: 'Velocistas e fundistas em etapa crucial do circuito mundial.',
    fullDescription: [
      'A etapa parisiense do Diamond League reúne os principais nomes do atletismo mundial.',
      'Corredores brasileiros buscam índices olímpicos em provas de velocidade e meio-fundo.',
    ],
    featured: false,
    image: asset('atletismo.jpg'),
    tag: 'Diamond League',
    eventType: 'Meeting',
    phase: 'Circuito mundial',
    importance: 'Média',
  },
  {
    id: 14,
    title: 'Seletiva olímpica — Natação',
    sport: 'Esportes Olímpicos',
    filter: 'olimpicos',
    date: '14 Jul',
    day: 'Ter',
    dateISO: '2026-07-14',
    time: '09:00',
    location: 'Rio de Janeiro, RJ',
    status: 'Em breve',
    description: 'Provas classificatórias para os Jogos Olímpicos.',
    fullDescription: [
      'A seletiva define os representantes brasileiros nas provas de natação para a próxima olimpíada.',
      'Nadadores precisam atingir índices mínimos em cada modalidade para garantir vaga.',
    ],
    featured: false,
    image: asset('olimpicos.jpg'),
    tag: 'Olimpíadas',
    eventType: 'Seletiva',
    phase: 'Classificatória',
    importance: 'Alta',
  },
  {
    id: 15,
    title: 'Copa estadual — Final',
    sport: 'Futebol',
    filter: 'futebol',
    date: '14 Jul',
    day: 'Ter',
    dateISO: '2026-07-14',
    time: '20:00',
    location: 'Arena Corinthians, SP',
    status: 'Em breve',
    description: 'Decisão estadual em jogo de ida e volta.',
    fullDescription: [
      'Os finalistas chegam empatados na série e decidem o título estadual em jogo único.',
      'A partida fecha a temporada de competições regionais antes da pausa do calendário.',
    ],
    featured: false,
    image: asset('futebol-3.jpg'),
    tag: 'Estadual',
    eventType: 'Final',
    phase: 'Copa estadual',
    importance: 'Média',
  },
  {
    id: 16,
    title: 'Estreia da temporada europeia',
    sport: 'Basquete',
    filter: 'basquete',
    date: '15 Jul',
    day: 'Qua',
    dateISO: '2026-07-15',
    time: '16:00',
    location: 'Madrid, Espanha',
    status: 'Em breve',
    description: 'Abertura oficial da Euroliga 2026/27.',
    fullDescription: [
      'A nova temporada da principal liga europeia começa com o campeão defendendo o título em casa.',
      'Elencos reforçados prometem um dos campeonatos mais equilibrados dos últimos anos.',
    ],
    featured: false,
    image: asset('basquete-3.jpg'),
    tag: 'Euroliga',
    eventType: 'Estreia',
    phase: 'Temporada regular',
    importance: 'Média',
  },
  {
    id: 17,
    title: 'Final ATP 500 — Toronto',
    sport: 'Tênis',
    filter: 'tenis',
    date: '16 Jul',
    day: 'Qui',
    dateISO: '2026-07-16',
    time: '17:00',
    location: 'Toronto, Canadá',
    status: 'Em breve',
    description: 'Final masculina do torneio ATP 500.',
    fullDescription: [
      'Os finalistas chegam após duas semanas de jogos em quadras duras.',
      'O vencedor conquista pontos importantes para o ranking mundial.',
    ],
    featured: false,
    image: asset('tenis.jpg'),
    tag: 'ATP',
    eventType: 'Final',
    phase: 'ATP 500',
    importance: 'Média',
  },
  {
    id: 18,
    title: 'Campeonato sul-americano de atletismo',
    sport: 'Atletismo',
    filter: 'atletismo',
    date: '16 Jul',
    day: 'Qui',
    dateISO: '2026-07-16',
    time: '11:00',
    location: 'Santiago, Chile',
    status: 'Em breve',
    description: 'Provas de velocidade e salto em altura abrem o torneio.',
    fullDescription: [
      'O campeonato sul-americano reúne os melhores atletas do continente em busca de medalhas e índices.',
      'O Brasil envia delegação completa nas provas de pista e campo.',
    ],
    featured: false,
    image: asset('atletismo.jpg'),
    tag: 'Continental',
    eventType: 'Campeonato',
    phase: 'Sul-americano',
    importance: 'Média',
  },
  {
    id: 19,
    title: 'Rodada regular — Encerrada',
    sport: 'Futebol',
    filter: 'futebol',
    date: '09 Jul',
    day: 'Qui',
    dateISO: '2026-07-09',
    time: '19:00',
    location: 'São Paulo, SP',
    status: 'Encerrado',
    description: 'Última rodada antes da final do campeonato nacional.',
    fullDescription: [
      'A rodada definiu os finalistas do campeonato nacional após vitória por 2 a 1 nos acréscimos.',
      'O resultado confirmou o acesso à grande final deste fim de semana.',
    ],
    featured: false,
    image: asset('futebol-2.jpg'),
    tag: 'Rodada',
    eventType: 'Campeonato',
    phase: 'Rodada regular',
    importance: 'Baixa',
  },
  {
    id: 20,
    title: 'Torneio olímpico de ginástica — Seletiva',
    sport: 'Esportes Olímpicos',
    filter: 'olimpicos',
    date: '08 Jul',
    day: 'Qua',
    dateISO: '2026-07-08',
    time: '14:00',
    location: 'Belo Horizonte, MG',
    status: 'Encerrado',
    description: 'Ginastas disputam vagas para a delegação olímpica.',
    fullDescription: [
      'A seletiva nacional avaliou apresentações no solo, salto e barras assimétricas.',
      'Três atletas garantiram vaga na equipe que representará o país nos Jogos.',
    ],
    featured: false,
    image: asset('olimpicos.jpg'),
    tag: 'Olimpíadas',
    eventType: 'Seletiva',
    phase: 'Classificatória',
    importance: 'Média',
  },
]

export const agendaFeaturedEvent = agendaEvents.find((e) => e.featured)

export function getEventCountByDay(dateISO) {
  return agendaEvents.filter((e) => e.dateISO === dateISO).length
}

export function filterAgendaEvents(events, { sport, period, dayISO }) {
  let result = [...events]

  if (sport && sport !== 'todos') {
    result = result.filter((e) => e.filter === sport)
  }

  if (dayISO) {
    result = result.filter((e) => e.dateISO === dayISO)
    return result
  }

  if (!period || period === 'todos') return result

  const today = REFERENCE_DATE

  const addDays = (iso, days) => {
    const d = new Date(`${iso}T12:00:00`)
    d.setDate(d.getDate() + days)
    return d.toISOString().slice(0, 10)
  }

  const inRange = (eventISO, startISO, endISO) =>
    eventISO >= startISO && eventISO <= endISO

  switch (period) {
    case 'hoje':
      result = result.filter((e) => e.dateISO === today)
      break
    case 'amanha':
      result = result.filter((e) => e.dateISO === addDays(today, 1))
      break
    case 'semana':
      result = result.filter((e) => inRange(e.dateISO, today, addDays(today, 6)))
      break
    case 'fim-de-semana':
      result = result.filter((e) => {
        const day = new Date(`${e.dateISO}T12:00:00`).getDay()
        return day === 0 || day === 6
      })
      break
    case '30-dias':
      result = result.filter((e) => inRange(e.dateISO, today, addDays(today, 30)))
      break
    default:
      break
  }

  return result
}

/** @deprecated use agendaEvents */
export const weekAgenda = agendaEvents
