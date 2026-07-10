export const sportImages = {
  hero: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=1400&auto=format&fit=crop&q=80',
  futebol: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=900&auto=format&fit=crop&q=80',
  basquete: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=900&auto=format&fit=crop&q=80',
  volei: 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=900&auto=format&fit=crop&q=80',
  formula1: 'https://images.unsplash.com/photo-1551958219-acbc608c6377?w=900&auto=format&fit=crop&q=80',
  lutas: 'https://images.unsplash.com/photo-1549719386-74dfdf7f054d?w=900&auto=format&fit=crop&q=80',
  tenis: 'https://images.unsplash.com/photo-1554068865-24cecd4cd381?w=900&auto=format&fit=crop&q=80',
  olimpicos: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=900&auto=format&fit=crop&q=80',
  radicais: 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=900&auto=format&fit=crop&q=80',
  atletismo: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=900&auto=format&fit=crop&q=80',
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

export const heroQuickCards = [
  {
    label: 'Notícias do dia',
    value: '12+',
    detail: 'Atualizadas agora',
    href: '#destaques',
    icon: '📰',
  },
  {
    label: 'Modalidades',
    value: '8',
    detail: 'Esportes cobertos',
    href: '#modalidades',
    icon: '🏆',
  },
  {
    label: 'Agenda semanal',
    value: '6',
    detail: 'Eventos confirmados',
    href: '#agenda',
    icon: '📅',
  },
]

export const fanPanelCards = [
  {
    id: 1,
    title: 'Jogos hoje',
    value: '3',
    detail: 'Futebol, Basquete e Vôlei',
    icon: '⚽',
    accent: 'green',
  },
  {
    id: 2,
    title: 'Próximos eventos',
    value: '6',
    detail: 'Confirmados esta semana',
    icon: '📅',
    accent: 'accent',
  },
  {
    id: 3,
    title: 'Destaque da semana',
    value: 'Brasil',
    detail: 'Vitória nos acréscimos',
    icon: '⭐',
    accent: 'orange',
  },
  {
    id: 4,
    title: 'Modalidade em alta',
    value: 'Futebol',
    detail: '+42% de acessos',
    icon: '🔥',
    accent: 'green',
  },
]

export const trendingSports = [
  { rank: 1, name: 'Futebol', percent: 92, icon: '⚽', color: '#00c96b' },
  { rank: 2, name: 'Fórmula 1', percent: 78, icon: '🏎️', color: '#ef4444' },
  { rank: 3, name: 'Basquete', percent: 71, icon: '🏀', color: '#f5a623' },
  { rank: 4, name: 'Vôlei', percent: 58, icon: '🏐', color: '#3b82f6' },
  { rank: 5, name: 'Lutas', percent: 45, icon: '🥊', color: '#8b5cf6' },
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
  title: 'Brasil vence clássico sul-americano com gol nos acréscimos',
  excerpt:
    'Em partida eletrizante no estádio lotado, a seleção virou o placar no último minuto e consolidou liderança nas eliminatórias.',
  fullContent: [
    'A seleção brasileira protagonizou uma noite inesquecível no Maracanã, diante de mais de 70 mil torcedores. O adversário abriu o placar ainda no primeiro tempo, mas a equipe canarinho manteve a pressão durante todo o segundo período.',
    'Com a entrada de jovens talentos no banco, o técnico reorganizou o meio-campo e criou as condições para a virada. O gol da igualdade veio aos 88 minutos, em cabeceio preciso após escanteio bem trabalhado.',
    'Nos acréscimos, em lance de contra-ataque fulminante, o atacante completou cruzamento na área e selou a vitória por 2 a 1. Com o resultado, o Brasil assume a liderança isolada nas eliminatórias e encaminha a classificação para o torneio continental.',
  ],
  date: '10 Jul 2026',
  readTime: '6 min',
  tag: 'Manchete',
  image: sportImages.futebol,
  icon: '⚽',
}

export const secondaryHeadlines = [
  {
    id: 2,
    category: 'Basquete',
    filter: 'basquete',
    title: 'NBA: franquia surpreende e avança às finais da conferência',
    excerpt: 'Vitória épica no jogo 7 redefine a temporada e coloca o time no mapa da liga.',
    fullContent: [
      'Em uma das partidas mais emocionantes da temporada, a franquia venceu o jogo 7 por 112 a 108 e garantiu vaga na final da conferência pela primeira vez em mais de duas décadas.',
      'O armador foi o destaque com 38 pontos e 11 assistências, liderando a equipe em todos os momentos decisivos do quarto período.',
    ],
    date: '10 Jul 2026',
    readTime: '4 min',
    image: sportImages.basquete,
    icon: '🏀',
  },
  {
    id: 3,
    category: 'Vôlei',
    filter: 'volei',
    title: 'Superliga feminina define semifinalistas após rodada decisiva',
    excerpt: 'Clássicos e viradas emocionantes marcaram a reta final do campeonato nacional.',
    fullContent: [
      'A rodada decisiva da Superliga Feminina reservou três viradas espetaculares e definiu os quatro times que disputarão as semifinais do torneio.',
      'O Minas, atual campeão, confirmou favoritismo e lidera o chaveamento rumo à grande final prevista para o final do mês.',
    ],
    date: '09 Jul 2026',
    readTime: '3 min',
    image: sportImages.volei,
    icon: '🏐',
  },
  {
    id: 4,
    category: 'Fórmula 1',
    filter: 'formula1',
    title: 'Pilotos disputam pole position no GP da Europa',
    excerpt: 'Treinos classificatórios prometem disputa acirrada entre os principais nomes da temporada.',
    fullContent: [
      'O circuito de Silverstone recebe neste fim de semana o Grande Prêmio da Europa, com três pilotos separados por apenas 0,08 segundos nos treinos livres.',
      'A equipe líder do mundial surpreendeu com atualizações aerodinâmicas que prometem mudar o equilíbrio de forças na classificação de sábado.',
    ],
    date: '09 Jul 2026',
    readTime: '3 min',
    image: sportImages.formula1,
    icon: '🏎️',
  },
]

export const allNews = [
  mainHeadline,
  ...secondaryHeadlines,
  {
    id: 5,
    category: 'Atletismo',
    filter: 'olimpicos',
    title: 'Corredor brasileiro bate recorde sul-americano nos 100m',
    excerpt: 'Marca histórica coloca o atleta entre os favoritos para a próxima temporada.',
    fullContent: [
      'Com tempo de 9,92 segundos, o velocista brasileiro estabeleceu novo recorde sul-americano dos 100 metros rasos em prova realizada na Europa.',
      'O resultado coloca o atleta na sétima posição do ranking mundial da temporada e reacende as esperanças de medalha olímpica.',
    ],
    date: '09 Jul 2026',
    readTime: '4 min',
    image: sportImages.atletismo,
    icon: '🏃',
  },
  {
    id: 6,
    category: 'Lutas',
    filter: 'lutas',
    title: 'Lutador nacional conquista cinturão em evento internacional',
    excerpt: 'Finalização no segundo round consagra atleta como novo campeão da categoria.',
    fullContent: [
      'Em card transmitido para mais de 40 países, o lutador brasileiro finalizou o adversário com mata-leão no segundo round e conquistou o cinturão dos médios.',
      'A vitória representa o terceiro título brasileiro na história da categoria e consolida o país como potência nas artes marciais mistas.',
    ],
    date: '08 Jul 2026',
    readTime: '5 min',
    image: sportImages.lutas,
    icon: '🥊',
  },
  {
    id: 7,
    category: 'Tênis',
    filter: 'tenis',
    title: 'Brasileira avança às quartas em torneio de Grand Slam',
    excerpt: 'Vitória em três sets garante melhor campanha da carreira em torneio de Grand Slam.',
    fullContent: [
      'A tenista brasileira superou a adversária número 12 do mundo em partida de três sets e alcançou as quartas de final pela primeira vez em um Grand Slam.',
      'Com a vitória, ela entra no top 30 do ranking mundial e se torna a primeira brasileira a avançar tão longe no torneio em mais de 20 anos.',
    ],
    date: '08 Jul 2026',
    readTime: '3 min',
    image: sportImages.tenis,
    icon: '🎾',
  },
  {
    id: 8,
    category: 'Futebol',
    filter: 'futebol',
    title: 'Clube histórico anuncia novo técnico para a próxima temporada',
    excerpt: 'Treinador campeão europeu assume comando com missão de reconstruir o elenco.',
    fullContent: [
      'O clube centenário confirmou a contratação do técnico campeão da última Champions League para comandar o time nas próximas três temporadas.',
      'A diretoria projeta investimentos recordes no mercado de transferências para montar um elenco competitivo em competições nacionais e internacionais.',
    ],
    date: '07 Jul 2026',
    readTime: '4 min',
    image: sportImages.futebol,
    icon: '⚽',
  },
  {
    id: 9,
    category: 'Basquete',
    filter: 'basquete',
    title: 'Seleção de basquete estreia com vitória em torneio pré-olímpico',
    excerpt: 'Equipe nacional vence por 18 pontos de diferença e lidera o grupo da competição.',
    fullContent: [
      'A seleção brasileira de basquete estreou com vitória convincente por 94 a 76 no torneio pré-olímpico disputado na América do Norte.',
      'O pivô foi o destaque com 24 pontos e 14 rebotes, enquanto a defesa limitou o adversário a apenas 38% de aproveitamento nos arremessos.',
    ],
    date: '07 Jul 2026',
    readTime: '4 min',
    image: sportImages.basquete,
    icon: '🏀',
  },
]

export const categories = [
  {
    id: 'futebol',
    name: 'Futebol',
    icon: '⚽',
    description: 'Campeonatos, seleções e mercado da bola',
    color: '#00a650',
    image: sportImages.futebol,
  },
  {
    id: 'basquete',
    name: 'Basquete',
    icon: '🏀',
    description: 'NBA, NBB e competições internacionais',
    color: '#f5a623',
    image: sportImages.basquete,
  },
  {
    id: 'volei',
    name: 'Vôlei',
    icon: '🏐',
    description: 'Superliga, seleções e torneios mundiais',
    color: '#3b82f6',
    image: sportImages.volei,
  },
  {
    id: 'formula1',
    name: 'Fórmula 1',
    icon: '🏎️',
    description: 'GPs, pilotos e classificação do mundial',
    color: '#ef4444',
    image: sportImages.formula1,
  },
  {
    id: 'lutas',
    name: 'Lutas',
    icon: '🥊',
    description: 'UFC, boxe e artes marciais',
    color: '#8b5cf6',
    image: sportImages.lutas,
  },
  {
    id: 'tenis',
    name: 'Tênis',
    icon: '🎾',
    description: 'Grand Slams, ATP e WTA',
    color: '#10b981',
    image: sportImages.tenis,
  },
  {
    id: 'olimpicos',
    name: 'Esportes Olímpicos',
    icon: '🏅',
    description: 'Atletismo, natação e modalidades olímpicas',
    color: '#f97316',
    image: sportImages.olimpicos,
  },
  {
    id: 'radicais',
    name: 'Esportes Radicais',
    icon: '🏄',
    description: 'Surf, skate, escalada e aventura extrema',
    color: '#06b6d4',
    image: sportImages.radicais,
  },
]

export const weekAgenda = [
  {
    id: 1,
    date: '10 Jul',
    day: 'Sex',
    time: '16:00',
    sport: 'Futebol',
    event: 'Brasil x Argentina — Eliminatórias',
    description: 'Decisivo pelas eliminatórias sul-americanas no Maracanã',
    location: 'Maracanã, RJ',
    status: 'Hoje',
  },
  {
    id: 2,
    date: '11 Jul',
    day: 'Sáb',
    time: '21:30',
    sport: 'Basquete',
    event: 'Final da Conferência Leste — NBA',
    description: 'Jogo 7 define finalista da conferência leste',
    location: 'Boston, EUA',
    status: 'Amanhã',
  },
  {
    id: 3,
    date: '12 Jul',
    day: 'Dom',
    time: '15:00',
    sport: 'Fórmula 1',
    event: 'GP da Europa — Corrida',
    description: 'Grande Prêmio no histórico circuito de Silverstone',
    location: 'Silverstone, UK',
    status: 'Em breve',
  },
  {
    id: 4,
    date: '13 Jul',
    day: 'Seg',
    time: '20:00',
    sport: 'Vôlei',
    event: 'Superliga Feminina — Semifinal',
    description: 'Primeira semifinal da Superliga Feminina 2026',
    location: 'Belo Horizonte, BR',
    status: 'Em breve',
  },
  {
    id: 5,
    date: '14 Jul',
    day: 'Ter',
    time: '19:00',
    sport: 'Lutas',
    event: 'UFC Fight Night — Card Principal',
    description: 'Disputa de cinturão na categoria meio-pesado',
    location: 'Las Vegas, EUA',
    status: 'Em breve',
  },
  {
    id: 6,
    date: '15 Jul',
    day: 'Qua',
    time: '14:00',
    sport: 'Tênis',
    event: 'Wimbledon — Semifinais',
    description: 'Semifinais femininas no All England Club',
    location: 'Londres, UK',
    status: 'Em breve',
  },
]

export const curiosities = [
  {
    id: 1,
    icon: '⚽',
    question: 'Por que o futebol tem 11 jogadores?',
    answer:
      'A regra surgiu na Inglaterra do século XIX, quando times universitários adotaram 11 atletas para equilibrar o campo.',
    sport: 'Futebol',
  },
  {
    id: 2,
    icon: '🏎️',
    question: 'Como surgiu a Fórmula 1?',
    answer:
      'O campeonato mundial foi criado em 1950 pela FIA, reunindo as principais corridas da Europa em um único título.',
    sport: 'Fórmula 1',
  },
  {
    id: 3,
    icon: '🎾',
    question: 'Por que o tênis conta 15, 30 e 40?',
    answer:
      'A pontuação vem do jogo de paume medieval francês, em que o relógio marcava quartos de hora a cada ponto.',
    sport: 'Tênis',
  },
  {
    id: 4,
    icon: '🏅',
    question: 'Qual o esporte mais antigo do mundo?',
    answer:
      'Luta livre e atletismo aparecem em registros de mais de 3.000 anos na Grécia Antiga.',
    sport: 'Olímpicos',
  },
  {
    id: 5,
    icon: '🏀',
    question: 'Quem marcou 100 pontos em um jogo?',
    answer:
      'Wilt Chamberlain, em 1962 — feito que permanece inigualável na história da NBA.',
    sport: 'Basquete',
  },
  {
    id: 6,
    icon: '🥊',
    question: 'Qual a luta mais rápida da história do UFC?',
    answer:
      'A finalização mais rápida durou apenas 1 segundo, com nocaute técnico logo no início do combate.',
    sport: 'Lutas',
  },
  {
    id: 7,
    icon: '🏅',
    question: 'Qual esporte já foi olímpico e saiu do programa?',
    answer:
      'O polo aquático em equipes de 7 jogadores e o croquet foram modalidades olímpicas que deixaram o programa ao longo da história dos Jogos.',
    sport: 'Olímpicos',
  },
]

export const stories = [
  {
    id: 1,
    icon: '⚽',
    year: '1970',
    title: 'O tetra que encantou o mundo',
    excerpt:
      'A Seleção de 1970 é considerada a maior de todos os tempos, com futebol arte que eternizou Pelé.',
    sport: 'Futebol',
    tag: 'Copa do Mundo',
    image: sportImages.futebol,
  },
  {
    id: 2,
    icon: '🏀',
    year: '2016',
    title: 'A virada impossível no basquete',
    excerpt:
      'Time venceu após estar 25 pontos atrás no terceiro quarto — uma das maiores recuperações da NBA.',
    sport: 'Basquete',
    tag: 'Recordes',
    image: sportImages.basquete,
  },
  {
    id: 3,
    icon: '🏃',
    year: '2008',
    title: 'O salto que desafiou a gravidade',
    excerpt:
      'Usain Bolt cruzou os 100m em 9,69s na final olímpica e entrou para a história do atletismo.',
    sport: 'Atletismo',
    tag: 'Olimpíadas',
    image: sportImages.atletismo,
  },
  {
    id: 4,
    icon: '🏒',
    year: '1980',
    title: 'O milagre do gelo',
    excerpt:
      'Seleção amadora dos EUA derrotou a URSS no hóquei — um dos maiores upsets do esporte mundial.',
    sport: 'Hóquei',
    tag: 'História',
    image: sportImages.olimpicos,
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
    { label: 'Últimas notícias', href: '#noticias' },
    { label: 'Curiosidades', href: '#curiosidades' },
    { label: 'Histórias', href: '#historias' },
    { label: 'Newsletter', href: '#newsletter' },
  ],
  institucional: [
    { label: 'Sobre nós', href: '#contato' },
    { label: 'Política de privacidade', href: '#contato' },
    { label: 'Termos de uso', href: '#contato' },
    { label: 'Contato', href: '#contato' },
  ],
}

export const socialLinks = [
  { name: 'Instagram', href: '#', icon: 'instagram' },
  { name: 'Twitter', href: '#', icon: 'twitter' },
  { name: 'YouTube', href: '#', icon: 'youtube' },
  { name: 'Facebook', href: '#', icon: 'facebook' },
]
