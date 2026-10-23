/** Autoajuda: explicações curtas dos módulos do EvoluaFit */

export const MODULE_HELP = [
  {
    id: 'dashboard',
    sectionId: 'inicio',
    label: 'Hoje',
    summary: 'O que fazer hoje e o próximo passo.',
    steps: [
      'Veja a saudação e o treino indicado para hoje.',
      'Use “Iniciar treino” para começar a sessão.',
      'Acompanhe o resumo semanal no topo da página.',
    ],
  },
  {
    id: 'indicadores',
    sectionId: 'inicio',
    hash: 'dash-indicadores',
    label: 'Sua semana',
    summary: 'Números essenciais da sua semana.',
    steps: [
      'Confira treinos da semana e sua sequência.',
      'Toque em um indicador para ir à área relacionada.',
      'Detalhes e gráficos ficam em Evolução.',
    ],
  },
  {
    id: 'treinos',
    sectionId: 'treinos',
    label: 'Meus Treinos',
    summary: 'Lista dos treinos da sua rotina.',
    steps: [
      'Abra “Ver meus treinos” para ver a lista.',
      'Toque em um treino para ver exercícios.',
      'Use “Iniciar” para começar a sessão.',
    ],
  },
  {
    id: 'planilha',
    sectionId: 'planilha',
    label: 'Monte seu treino',
    summary: 'Monte ou ajuste sua divisão de treinos.',
    steps: [
      'Escolha objetivo, dias e como organizar (PPL, ABC, por grupo…).',
      'Gere a rotina e revise os dias.',
      'Salve para usar em Meus treinos e no calendário.',
    ],
  },
  {
    id: 'biblioteca',
    sectionId: 'exercicios',
    label: 'Grupos musculares',
    summary: 'Módulos de peito, costas, pernas e os demais grupos.',
    steps: [
      'Escolha o grupo muscular.',
      'Abra um exercício para ver execução e detalhes.',
      'Adicione à rotina se quiser usar no treino.',
    ],
  },
  {
    id: 'calendario',
    sectionId: 'calendario',
    label: 'Calendário',
    summary: 'Agenda dos treinos ao longo do mês.',
    steps: [
      'Veja o que está planejado em cada dia.',
      'Marque ou ajuste sessões conforme a rotina.',
      'Use para manter a frequência semanal.',
    ],
  },
  {
    id: 'evolucao',
    sectionId: 'desempenho',
    label: 'Progresso',
    summary: 'Progresso com dados reais dos treinos.',
    steps: [
      'Veja o resumo do período e os gráficos.',
      'Escolha um exercício para acompanhar carga e volume.',
      'Consulte recordes pessoais na lista.',
    ],
  },
  {
    id: 'espelho',
    sectionId: 'desempenho',
    to: '/app/evolucao/espelho',
    label: 'Espelho Evolutivo',
    summary: 'Fotos, medidas e manequim da sua evolução corporal.',
    steps: [
      'Registre uma foto frontal e as medidas que tiver.',
      'Compare o antes e o agora quando houver mais de um check-in.',
      'Defina metas opcionais como simulação visual, nunca como previsão.',
    ],
  },
  {
    id: 'coach',
    sectionId: 'coach-ia',
    label: 'Coach',
    summary: 'Orientações com base na sua rotina e no seu histórico.',
    steps: [
      'Descreva o que precisa (ex.: treino em casa).',
      'Cada sugestão mostra o motivo e uma prévia antes de aplicar.',
      'O Coach usa a planilha e o histórico deste aparelho — sem modelo externo.',
    ],
  },
  {
    id: 'metas',
    sectionId: 'metas',
    label: 'Metas',
    summary: 'Objetivos semanais e de progresso.',
    steps: [
      'Defina quantos treinos quer por semana.',
      'Acompanhe o andamento no resumo da semana.',
      'Ajuste a meta quando a rotina mudar.',
    ],
  },
  {
    id: 'perfil',
    sectionId: 'perfil',
    to: '/app/perfil',
    label: 'Perfil',
    summary: 'Conta, preferências e aplicativo.',
    steps: [
      'Atualize nome, objetivo e nível.',
      'Instale o app pela opção Aplicativo, se quiser.',
      'Use Sair apenas quando for encerrar a sessão.',
    ],
  },
]

export const MODULE_HELP_FAQ = [
  {
    id: 'faq-start',
    question: 'Por onde começo?',
    answer:
      'Abra Hoje, confira o treino do dia e toque em Iniciar treino. Se ainda não tiver rotina, vá em Monte seu treino e gere a primeira semana.',
  },
  {
    id: 'faq-offline',
    question: 'E se a internet cair no treino?',
    answer:
      'As séries ficam salvas no aparelho e sincronizam depois. Se aparecer “sincronização pendente”, basta reconectar — não apague os dados.',
  },
  {
    id: 'faq-evolucao',
    question: 'Onde vejo se estou evoluindo?',
    answer:
      'Em Progresso: gráficos dos treinos e o Espelho Evolutivo para fotos e medidas. O resumo em Hoje mostra só o essencial da semana.',
  },
]
