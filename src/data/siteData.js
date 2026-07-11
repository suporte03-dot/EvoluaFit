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
  olimpicos: sportImages.olimpicos,
  radicais: sportImages.radicais,
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
  { value: '9', label: 'modalidades' },
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
  { id: 'atletismo', label: 'Atletismo' },
  { id: 'olimpicos', label: 'Olímpicos' },
  { id: 'radicais', label: 'Radicais' },
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
  source: 'Arena 360',
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
    source: 'Arena 360',
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
    source: 'Arena 360',
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
    source: 'Arena 360',
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
    source: 'Arena 360',
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
    source: 'Arena 360',
  },
  {
    id: 7,
    category: 'Atletismo',
    filter: 'atletismo',
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
    source: 'Arena 360',
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
    source: 'Arena 360',
  },
  {
    id: 9,
    category: 'Esportes Radicais',
    filter: 'radicais',
    title: 'Surfista brasileiro vence etapa do circuito mundial',
    excerpt: 'Manobra perfeita na onda final garante vitória histórica na competição.',
    fullContent: [
      'Em condições de mar agitado, o surfista brasileiro encaixou uma manobra aérea decisiva na última onda da final.',
      'O resultado coloca o atleta no topo do ranking mundial e reforça o protagonismo do país nas modalidades radicais.',
    ],
    date: '06 Jul 2026',
    readTime: '4 min',
    image: sportImages.radicais,
    icon: '🏄',
    source: 'Arena 360',
  },
  {
    id: 10,
    category: 'Olímpicos',
    filter: 'olimpicos',
    title: 'Comitê Olímpico anuncia novas modalidades para os próximos Jogos',
    excerpt: 'Esportes urbanos e de breakdance entram no programa oficial.',
    fullContent: [
      'O comitê confirmou a inclusão de modalidades que ampliam o apelo aos públicos mais jovens.',
      'Atletas brasileiros já iniciam preparação específica para disputar medalhas nas novas categorias.',
    ],
    date: '06 Jul 2026',
    readTime: '5 min',
    image: sportImages.olimpicos,
    icon: '🏅',
    source: 'Arena 360',
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
    id: 'atletismo',
    name: 'Atletismo',
    icon: '🏃',
    description: 'Velocidade, resistência e superação em pista e campo.',
    color: '#00E887',
    image: sportImages.atletismo,
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
    fullContent: [
      'A formação de 11 jogadores por equipe surgiu nas escolas inglesas no século XIX, quando os campos passaram a ter tamanho padronizado.',
      'A Football Association de 1863 consolidou a regra, equilibrando ataque e defesa e permitindo táticas mais organizadas.',
      'Desde então, o formato se espalhou pelo mundo e permanece como padrão nas principais competições.',
    ],
    sport: 'Futebol',
  },
  {
    id: 2,
    icon: '🎾',
    question: 'Por que o tênis conta 15, 30 e 40?',
    answer:
      'A origem está ligada a antigos sistemas de marcação usados na Europa.',
    fullContent: [
      'Uma teoria popular associa os pontos ao uso de relógios de parede, em que cada ponto avançava um quadrante.',
      'Outra explicação liga a pontuação a jogos franceses medievais que usavam múltiplos de 15 para marcar vantagens.',
      'O sistema se manteve por tradição, mesmo com regras modernas como o tie-break.',
    ],
    sport: 'Tênis',
  },
  {
    id: 3,
    icon: '🏅',
    question: 'Qual esporte já foi olímpico e saiu do programa?',
    answer:
      'Algumas modalidades entraram e saíram ao longo da história dos Jogos Olímpicos.',
    fullContent: [
      'Ao longo da história, esportes como polo aquático em formato antigo, críquete e até tug-of-war já integraram o programa olímpico.',
      'Mudanças culturais, baixa popularidade global ou custos de organização levaram ao encerramento de algumas modalidades.',
      'Os Jogos continuam evoluindo, incluindo novas categorias para manter relevância com novas gerações.',
    ],
    sport: 'Olímpicos',
  },
  {
    id: 4,
    icon: '🏎️',
    question: 'Por que a Fórmula 1 usa bandeiras?',
    answer:
      'As bandeiras são uma linguagem visual rápida para orientar pilotos durante a corrida.',
    fullContent: [
      'Antes da comunicação por rádio em tempo real, as bandeiras eram o principal meio de alertar pilotos sobre perigos na pista.',
      'Cada cor tem significado: amarela indica atenção, vermelha interrupção, azul pede passagem e xadrez encerra a prova.',
      'Mesmo com tecnologia avançada, o sistema permanece por ser universal, rápido e eficiente em qualquer condição.',
    ],
    sport: 'Fórmula 1',
  },
  {
    id: 5,
    icon: '🏀',
    question: 'Por que a cesta do basquete tem 3,05 metros?',
    answer:
      'A altura foi definida por James Naismith e permanece desde a criação do esporte.',
    fullContent: [
      'James Naismith pendurou cestas de pêssego em um ginásio e a altura acabou padronizada em 10 pés (3,05 m).',
      'A medida equilibra desafio técnico e espetáculo, permitindo enterradas sem tornar o arremesso trivial.',
      'Hoje é uma das constantes mais reconhecidas do esporte em todo o mundo.',
    ],
    sport: 'Basquete',
  },
  {
    id: 6,
    icon: '🏄',
    question: 'Qual a maior onda já surfada?',
    answer:
      'Recordes oficiais ultrapassam os 24 metros em condições extremas de mar.',
    fullContent: [
      'Ondas gigantes em Nazaré, Portugal, e Jaws, no Havaí, atraem surfistas de big wave de todo o planeta.',
      'Medições por drones e sensores ajudam a validar recordes com mais precisão.',
      'O surf de ondas grandes exige preparo físico, jet-ski de resgate e leitura avançada do oceano.',
    ],
    sport: 'Esportes Radicais',
  },
]

export const stories = [
  {
    id: 1,
    title: 'A virada impossível',
    excerpt:
      'Quando uma equipe desacreditada transformou derrota certa em uma noite histórica.',
    fullContent: [
      'Com três gols de desvantagem e poucos minutos no relógio, poucos acreditavam em uma reação. O estádio esvaziava nas arquibancadas superiores.',
      'Uma substituição ousada mudou o ritmo do jogo. Pressão alta, erros adversários e uma sequência de gols em dez minutos empataram a partida.',
      'No último lance, um cabeceio no escanteio final selou uma das maiores viradas da história recente do campeonato.',
    ],
    sport: 'Futebol',
    tag: 'Virada',
    date: '12 Jun 2026',
    readTime: '7 min',
    image: sportImages.futebol2,
  },
  {
    id: 2,
    title: 'O recorde que parecia inalcançável',
    excerpt:
      'Uma marca que atravessou gerações até ser superada diante do mundo.',
    fullContent: [
      'Por mais de duas décadas, o recorde mundial dos 100 metros parecia intocável, sustentado por uma geração de velocistas dominantes.',
      'Em uma noite de pista rápida e vento favorável, um jovem atleta brasileiro cruzou a linha com tempo histórico.',
      'A marca não apenas caiu — redefiniu o debate sobre os limites humanos na modalidade.',
    ],
    sport: 'Atletismo',
    tag: 'Recordes',
    date: '03 Mai 2026',
    readTime: '6 min',
    image: sportImages.atletismo,
  },
  {
    id: 3,
    title: 'O atleta que mudou sua modalidade',
    excerpt:
      'Talento, disciplina e impacto cultural dentro e fora das competições.',
    fullContent: [
      'Iniciada em uma modalidade de equipe, a carreira ganhou novo rumo quando lesões a levaram a experimentar uma prova individual.',
      'Em menos de dois anos, treinos específicos e suporte multidisciplinar transformaram potencial em medalhas internacionais.',
      'Hoje, ela é referência de reinvenção e inspira jovens atletas a não desistirem diante de obstáculos.',
    ],
    sport: 'Olímpicos',
    tag: 'Legado',
    date: '18 Abr 2026',
    readTime: '8 min',
    image: sportImages.olimpicos,
  },
  {
    id: 4,
    title: 'A final que parou o país',
    excerpt:
      'Um jogo decidido nos detalhes e lembrado até hoje pelos torcedores.',
    fullContent: [
      'A decisão reuniu duas torcidas historicamente rivais em um estádio neutro lotado. O clima era de final antecipada de um grande torneio.',
      'Com placar apertado, cada lance era celebrado como gol. Defesas decisivas e um pênalti polêmico marcaram o segundo tempo.',
      'O título foi conquistado nos acréscimos, gerando imagens que circulam até hoje nas redes e na memória coletiva do esporte nacional.',
    ],
    sport: 'Futebol',
    tag: 'História',
    date: '22 Mar 2026',
    readTime: '9 min',
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
