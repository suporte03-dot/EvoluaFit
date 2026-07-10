const asset = (file) => `${import.meta.env.BASE_URL}assets/sports/${file}`

export const brand = {
  name: 'Arena 360',
  slogan: 'O esporte em todos os ângulos',
  description:
    'Portal esportivo premium com notícias, agenda, modalidades, curiosidades e histórias que marcam o universo do esporte.',
}

export const sportImages = {
  hero: asset('hero.jpg'),
  futebol: asset('futebol.jpg'),
  futebol2: asset('futebol-2.jpg'),
  futebol3: asset('futebol-3.jpg'),
  basquete: asset('basquete.jpg'),
  basquete2: asset('basquete-2.jpg'),
  basquete3: asset('basquete-3.jpg'),
  volei: asset('volei.jpg'),
  formula1: asset('formula1.jpg'),
  lutas: asset('lutas.jpg'),
  tenis: asset('tenis.jpg'),
  atletismo: asset('atletismo.jpg'),
  olimpicos: asset('olimpicos.jpg'),
  radicais: asset('radicais.jpg'),
  fallback: asset('fallback.jpg'),
}

export const imageByFilter = {
  futebol: sportImages.futebol,
  basquete: sportImages.basquete,
  volei: sportImages.volei,
  formula1: sportImages.formula1,
  lutas: sportImages.lutas,
  tenis: sportImages.tenis,
  atletismo: sportImages.atletismo,
  olimpicos: sportImages.atletismo,
}

export function getNewsImage(news) {
  return news.image ?? imageByFilter[news.filter] ?? sportImages.fallback
}

export const sectionIds = [
  'inicio',
  'manchete',
  'destaques',
  'painel',
  'em-alta',
  'modalidades',
  'agenda',
  'curiosidades',
  'historias',
  'contato',
]

export const menuItems = [
  { label: 'Início', href: '#inicio', sectionId: 'inicio' },
  { label: 'Destaques', href: '#destaques', sectionId: 'destaques' },
  { label: 'Modalidades', href: '#modalidades', sectionId: 'modalidades' },
  { label: 'Agenda', href: '#agenda', sectionId: 'agenda' },
  { label: 'Curiosidades', href: '#curiosidades', sectionId: 'curiosidades' },
  { label: 'Histórias', href: '#historias', sectionId: 'historias' },
  { label: 'Contato', href: '#contato', sectionId: 'contato' },
]

export const heroStats = [
  { value: '500+', label: 'notícias por mês' },
  { value: '8', label: 'modalidades' },
  { value: '24h', label: 'de cobertura' },
  { value: '100%', label: 'paixão pelo esporte' },
]

export const fanPanelCards = [
  {
    id: 1,
    title: 'Jogos hoje',
    detail: '12 eventos em destaque',
    icon: '⚽',
    accent: 'green',
  },
  {
    id: 2,
    title: 'Modalidade em alta',
    detail: 'Futebol lidera as buscas',
    icon: '🔥',
    accent: 'accent',
  },
  {
    id: 3,
    title: 'Destaque da semana',
    detail: 'Final decisiva movimenta o calendário',
    icon: '⭐',
    accent: 'orange',
  },
  {
    id: 4,
    title: 'Próximos eventos',
    detail: 'Agenda atualizada da semana',
    icon: '📅',
    accent: 'green',
  },
]

export const trendingSports = [
  { rank: 1, name: 'Futebol', percent: 92, icon: '⚽', color: '#00E887' },
  { rank: 2, name: 'Fórmula 1', percent: 78, icon: '🏎️', color: '#FF9F1C' },
  { rank: 3, name: 'Basquete', percent: 71, icon: '🏀', color: '#00E887' },
  { rank: 4, name: 'Vôlei', percent: 58, icon: '🏐', color: '#A9B5C7' },
  { rank: 5, name: 'Lutas', percent: 45, icon: '🥊', color: '#FF9F1C' },
]

export const newsFilters = [
  { id: 'todos', label: 'Todos' },
  { id: 'futebol', label: 'Futebol' },
  { id: 'basquete', label: 'Basquete' },
  { id: 'volei', label: 'Vôlei' },
  { id: 'formula1', label: 'Fórmula 1' },
  { id: 'lutas', label: 'Lutas' },
  { id: 'tenis', label: 'Tênis' },
  { id: 'olimpicos', label: 'Olímpicos' },
]

export const mainHeadline = {
  id: 1,
  category: 'Futebol',
  filter: 'futebol',
  title: 'Clássico nacional decide liderança em noite de estádio lotado',
  excerpt:
    'Rivalidade, pressão e grandes atuações prometem marcar uma das partidas mais aguardadas da temporada.',
  fullContent: [
    'Dois gigantes do futebol nacional se enfrentam nesta noite em um duelo que pode redefinir a liderança do campeonato. O estádio lotado promete atmosfera elétrica desde o apito inicial.',
    'O técnico da equipe mandante aposta em um meio-campo agressivo e transições rápidas, enquanto o visitante deve priorizar solidez defensiva e aproveitar bolas paradas.',
    'Com histórico recente equilibrado e grandes nomes em campo, a partida se consolida como o principal destaque da rodada na cobertura da Arena 360.',
  ],
  date: '10 Jul 2026',
  readTime: '6 min',
  tag: 'Destaque do Dia',
  image: sportImages.futebol,
  icon: '⚽',
}

export const gridNews = [
  {
    id: 2,
    category: 'Futebol',
    filter: 'futebol',
    title: 'Clube histórico anuncia novo técnico para a próxima temporada',
    excerpt: 'A mudança promete reformular o elenco e trazer uma nova filosofia de jogo.',
    fullContent: [
      'O clube centenário confirmou a contratação de um técnico renomado para comandar o time nas próximas temporadas, sinalizando um novo ciclo no projeto esportivo.',
      'A diretoria projeta reformulação do elenco e investimentos estratégicos para competir em alto nível no cenário nacional e internacional.',
    ],
    date: '10 Jul 2026',
    readTime: '4 min',
    image: sportImages.futebol2,
    icon: '⚽',
  },
  {
    id: 3,
    category: 'Fórmula 1',
    filter: 'formula1',
    title: 'Pilotos disputam pole position no GP da Europa',
    excerpt:
      'Treinos classificatórios prometem uma briga intensa entre os principais nomes do grid.',
    fullContent: [
      'O circuito de Silverstone recebe o Grande Prêmio da Europa com três pilotos separados por centésimos nos treinos livres.',
      'Atualizações aerodinâmicas e estratégias de pneus prometem definir um grid extremamente competitivo na classificação.',
    ],
    date: '09 Jul 2026',
    readTime: '3 min',
    image: sportImages.formula1,
    icon: '🏎️',
  },
  {
    id: 4,
    category: 'Lutas',
    filter: 'lutas',
    title: 'Lutador nacional conquista cinturão em evento internacional',
    excerpt: 'Finalização no segundo round consagra o atleta como novo campeão da categoria.',
    fullContent: [
      'Em card transmitido internacionalmente, o lutador brasileiro finalizou o adversário no segundo round e conquistou o cinturão dos médios.',
      'A vitória consolida o país como potência nas artes marciais mistas e abre caminho para defesas de título ao longo da temporada.',
    ],
    date: '09 Jul 2026',
    readTime: '5 min',
    image: sportImages.lutas,
    icon: '🥊',
  },
  {
    id: 5,
    category: 'Tênis',
    filter: 'tenis',
    title: 'Brasileira avança às quartas em torneio de Grand Slam',
    excerpt: 'Atuação consistente coloca a atleta entre os principais destaques da competição.',
    fullContent: [
      'A tenista brasileira superou adversária de top 15 em partida de três sets e alcançou as quartas de final em Grand Slam.',
      'Com a campanha, ela entra no top 30 do ranking mundial e se torna referência da modalidade no país.',
    ],
    date: '08 Jul 2026',
    readTime: '3 min',
    image: sportImages.tenis,
    icon: '🎾',
  },
  {
    id: 6,
    category: 'Basquete',
    filter: 'basquete',
    title: 'Seleção de basquete estreia com vitória em torneio pré-olímpico',
    excerpt: 'Equipe mostra força coletiva e começa a competição com resultado importante.',
    fullContent: [
      'A seleção brasileira estreou com vitória convincente no torneio pré-olímpico, dominando o adversário no segundo tempo.',
      'O pivô foi destaque com duplo-duplo, enquanto a defesa limitou o aproveitamento nos arremessos rivais.',
    ],
    date: '08 Jul 2026',
    readTime: '4 min',
    image: sportImages.basquete,
    icon: '🏀',
  },
  {
    id: 7,
    category: 'Atletismo',
    filter: 'olimpicos',
    title: 'Corredor brasileiro bate recorde sul-americano nos 100m',
    excerpt: 'Marca histórica coloca o atleta entre os favoritos para a próxima temporada.',
    fullContent: [
      'Com tempo histórico nos 100 metros rasos, o velocista brasileiro estabeleceu novo recorde sul-americano em prova internacional.',
      'O resultado reacende as esperanças de medalha olímpica e coloca o atleta no radar das principais competições do calendário.',
    ],
    date: '07 Jul 2026',
    readTime: '4 min',
    image: sportImages.atletismo,
    icon: '🏃',
  },
  {
    id: 8,
    category: 'Vôlei',
    filter: 'volei',
    title: 'Time brasileiro vence clássico continental no vôlei',
    excerpt: 'Partida equilibrada termina com vitória emocionante no tie-break.',
    fullContent: [
      'Em duelo tenso pela liderança do grupo, a seleção brasileira superou rival tradicional em cinco sets emocionantes.',
      'O oposto foi o destaque com 28 pontos, selando uma vitória que reforça o favoritismo rumo à próxima fase do torneio.',
    ],
    date: '07 Jul 2026',
    readTime: '3 min',
    image: sportImages.volei,
    icon: '🏐',
  },
]

export const allNews = [mainHeadline, ...gridNews]

export const categories = [
  {
    id: 'futebol',
    name: 'Futebol',
    icon: '⚽',
    description: 'O esporte mais popular do mundo, com emoção dentro e fora de campo.',
    color: '#00E887',
    image: sportImages.futebol3,
  },
  {
    id: 'basquete',
    name: 'Basquete',
    icon: '🏀',
    description: 'Velocidade, estratégia e grandes jogadas nas quadras.',
    color: '#FF9F1C',
    image: sportImages.basquete3,
  },
  {
    id: 'volei',
    name: 'Vôlei',
    icon: '🏐',
    description: 'Técnica, força e trabalho em equipe em cada ponto.',
    color: '#A9B5C7',
    image: sportImages.volei,
  },
  {
    id: 'formula1',
    name: 'Fórmula 1',
    icon: '🏎️',
    description: 'Alta velocidade, tecnologia e precisão nas pistas.',
    color: '#FF9F1C',
    image: sportImages.formula1,
  },
  {
    id: 'lutas',
    name: 'Lutas',
    icon: '🥊',
    description: 'Combate, disciplina e superação em cada confronto.',
    color: '#00E887',
    image: sportImages.lutas,
  },
  {
    id: 'tenis',
    name: 'Tênis',
    icon: '🎾',
    description: 'Concentração, resistência e talento em duelos individuais.',
    color: '#A9B5C7',
    image: sportImages.tenis,
  },
  {
    id: 'olimpicos',
    name: 'Esportes Olímpicos',
    icon: '🏅',
    description: 'Histórias, recordes e conquistas que marcam gerações.',
    color: '#FF9F1C',
    image: sportImages.olimpicos,
  },
  {
    id: 'radicais',
    name: 'Esportes Radicais',
    icon: '🏄',
    description: 'Adrenalina, coragem e manobras que desafiam limites.',
    color: '#00E887',
    image: sportImages.radicais,
  },
]

export const weekAgenda = []

export { agendaEvents, agendaSummary, agendaSportFilters, agendaPeriodFilters, agendaWeekDays, agendaFeaturedEvent, filterAgendaEvents, getEventCountByDay, REFERENCE_DATE } from './agendaData'

export const curiosities = [
  {
    id: 1,
    icon: '⚽',
    question: 'Por que o futebol tem 11 jogadores?',
    answer:
      'A formação se consolidou no século XIX e se tornou padrão nas regras oficiais.',
    sport: 'Futebol',
  },
  {
    id: 2,
    icon: '🎾',
    question: 'Por que o tênis conta 15, 30 e 40?',
    answer:
      'A origem está ligada a antigos sistemas de marcação usados na Europa.',
    sport: 'Tênis',
  },
  {
    id: 3,
    icon: '🏅',
    question: 'Qual esporte já foi olímpico e saiu do programa?',
    answer:
      'Algumas modalidades entraram e saíram ao longo da história dos Jogos Olímpicos.',
    sport: 'Olímpicos',
  },
  {
    id: 4,
    icon: '🏎️',
    question: 'Por que a Fórmula 1 usa bandeiras?',
    answer:
      'As bandeiras são uma linguagem visual rápida para orientar pilotos durante a corrida.',
    sport: 'Fórmula 1',
  },
]

export const stories = [
  {
    id: 1,
    title: 'A virada impossível',
    excerpt:
      'Quando uma equipe desacreditada transformou derrota certa em uma noite histórica.',
    sport: 'Futebol',
    tag: 'Virada',
    image: sportImages.futebol2,
  },
  {
    id: 2,
    title: 'O recorde que parecia inalcançável',
    excerpt:
      'Uma marca que atravessou gerações até ser superada diante do mundo.',
    sport: 'Atletismo',
    tag: 'Recordes',
    image: sportImages.atletismo,
  },
  {
    id: 3,
    title: 'O atleta que mudou sua modalidade',
    excerpt:
      'Talento, disciplina e impacto cultural dentro e fora das competições.',
    sport: 'Olímpicos',
    tag: 'Legado',
    image: sportImages.olimpicos,
  },
  {
    id: 4,
    title: 'A final que parou o país',
    excerpt:
      'Um jogo decidido nos detalhes e lembrado até hoje pelos torcedores.',
    sport: 'Futebol',
    tag: 'História',
    image: sportImages.futebol3,
  },
]

export const footerLinks = {
  navegacao: [
    { label: 'Início', href: '#inicio' },
    { label: 'Destaques', href: '#destaques' },
    { label: 'Modalidades', href: '#modalidades' },
    { label: 'Agenda', href: '#agenda' },
  ],
  conteudo: [
    { label: 'Curiosidades', href: '#curiosidades' },
    { label: 'Histórias', href: '#historias' },
    { label: 'Newsletter', href: '#newsletter' },
    { label: 'Contato', href: '#contato' },
  ],
  institucional: [
    { label: 'Sobre a Arena 360', href: '#contato' },
    { label: 'Política de privacidade', href: '#contato' },
    { label: 'Termos de uso', href: '#contato' },
    { label: 'Contato', href: '#contato' },
  ],
}

export const socialLinks = [
  { name: 'Instagram', href: '#', icon: 'instagram' },
  { name: 'YouTube', href: '#', icon: 'youtube' },
  { name: 'X / Twitter', href: '#', icon: 'twitter' },
  { name: 'TikTok', href: '#', icon: 'tiktok' },
]
