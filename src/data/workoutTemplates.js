import { getExerciseById, getExercisesByIds } from './exercisesData'

export const splitTemplates = {
  2: [
    { day: 1, name: 'Full Body A', focus: ['Peitoral', 'Costas', 'Pernas', 'Abdômen'] },
    { day: 2, name: 'Full Body B', focus: ['Ombros', 'Pernas', 'Glúteos', 'Bíceps', 'Tríceps'] },
  ],
  3: [
    { day: 1, name: 'Push', focus: ['Peitoral', 'Ombros', 'Tríceps'] },
    { day: 2, name: 'Pull', focus: ['Costas', 'Bíceps', 'Trapézio', 'Lombar'] },
    { day: 3, name: 'Legs', focus: ['Pernas', 'Glúteos', 'Panturrilha', 'Abdômen'] },
  ],
  '3_beginner': [
    { day: 1, name: 'Full Body A', focus: ['Peitoral', 'Costas', 'Pernas', 'Abdômen'] },
    { day: 2, name: 'Full Body B', focus: ['Ombros', 'Pernas', 'Glúteos', 'Bíceps'] },
    { day: 3, name: 'Full Body C', focus: ['Peitoral', 'Costas', 'Glúteos', 'Tríceps'] },
  ],
  4: [
    { day: 1, name: 'Upper A', focus: ['Peitoral', 'Costas', 'Ombros'] },
    { day: 2, name: 'Lower A', focus: ['Pernas', 'Glúteos', 'Panturrilha'] },
    { day: 3, name: 'Upper B', focus: ['Peitoral', 'Costas', 'Bíceps', 'Tríceps'] },
    { day: 4, name: 'Lower B', focus: ['Pernas', 'Glúteos', 'Abdômen'] },
  ],
  5: [
    { day: 1, name: 'Push', focus: ['Peitoral', 'Ombros', 'Tríceps'] },
    { day: 2, name: 'Pull', focus: ['Costas', 'Bíceps', 'Trapézio', 'Lombar'] },
    { day: 3, name: 'Legs', focus: ['Pernas', 'Glúteos', 'Panturrilha', 'Abdômen'] },
    { day: 4, name: 'Upper', focus: ['Peitoral', 'Costas', 'Ombros', 'Bíceps'] },
    { day: 5, name: 'Core + Cardio + Mobilidade', focus: ['Abdômen', 'Cardio', 'Mobilidade'] },
  ],
  6: [
    { day: 1, name: 'Push A', focus: ['Peitoral', 'Ombros', 'Tríceps'] },
    { day: 2, name: 'Pull A', focus: ['Costas', 'Bíceps', 'Trapézio'] },
    { day: 3, name: 'Legs A', focus: ['Pernas', 'Glúteos', 'Panturrilha'] },
    { day: 4, name: 'Push B', focus: ['Peitoral', 'Ombros', 'Tríceps'] },
    { day: 5, name: 'Pull B', focus: ['Costas', 'Bíceps', 'Trapézio', 'Lombar'] },
    { day: 6, name: 'Legs B', focus: ['Pernas', 'Glúteos', 'Panturrilha', 'Abdômen', 'Mobilidade'] },
  ],
  7: [
    { day: 1, name: 'Push A', focus: ['Peitoral', 'Ombros', 'Tríceps'] },
    { day: 2, name: 'Pull A', focus: ['Costas', 'Bíceps', 'Trapézio'] },
    { day: 3, name: 'Legs A', focus: ['Pernas', 'Glúteos', 'Panturrilha'] },
    { day: 4, name: 'Mobilidade / Recuperação ativa', focus: ['Mobilidade', 'Alongamento', 'Abdômen'] },
    { day: 5, name: 'Push B', focus: ['Peitoral', 'Ombros', 'Tríceps'] },
    { day: 6, name: 'Pull B', focus: ['Costas', 'Bíceps', 'Trapézio', 'Lombar'] },
    { day: 7, name: 'Legs leve ou Core + Cardio', focus: ['Pernas', 'Glúteos', 'Abdômen', 'Cardio'] },
  ],
}

export const SPLIT_STYLES = [
  {
    id: 'auto',
    label: 'EvoluaFit escolhe',
    desc: 'Divisão equilibrada para os seus dias e o seu nível.',
    minDays: 2,
    maxDays: 7,
  },
  {
    id: 'full_body',
    label: 'Corpo inteiro',
    desc: 'Todos os grupos em cada sessão. Ideal para 2 a 4 dias.',
    minDays: 2,
    maxDays: 4,
  },
  {
    id: 'ppl',
    label: 'Push · Pull · Legs',
    desc: 'Empurrar, puxar e pernas em dias separados.',
    minDays: 3,
    maxDays: 6,
  },
  {
    id: 'upper_lower',
    label: 'Superior e inferior',
    desc: 'Um dia de cima, um de baixo.',
    minDays: 2,
    maxDays: 6,
  },
  {
    id: 'abc',
    label: 'A · B · C',
    desc: 'Peito e tríceps, costas e bíceps, pernas.',
    minDays: 3,
    maxDays: 6,
  },
  {
    id: 'muscle',
    label: 'Por grupo muscular',
    desc: 'Um módulo por dia: peito, costas, pernas…',
    minDays: 4,
    maxDays: 7,
  },
]

const SPLIT_PARTS = {
  push: { name: 'Push', focus: ['Peitoral', 'Ombros', 'Tríceps'] },
  pull: { name: 'Pull', focus: ['Costas', 'Bíceps', 'Trapézio', 'Lombar'] },
  legs: { name: 'Legs', focus: ['Pernas', 'Glúteos', 'Panturrilha', 'Abdômen'] },
  upper: { name: 'Upper', focus: ['Peitoral', 'Costas', 'Ombros', 'Bíceps', 'Tríceps'] },
  lower: { name: 'Lower', focus: ['Pernas', 'Glúteos', 'Panturrilha', 'Abdômen'] },
  abcA: { name: 'A — Peito e tríceps', focus: ['Peitoral', 'Tríceps'] },
  abcB: { name: 'B — Costas e bíceps', focus: ['Costas', 'Bíceps', 'Trapézio'] },
  abcC: { name: 'C — Pernas', focus: ['Pernas', 'Glúteos', 'Panturrilha'] },
  chest: { name: 'Peito', focus: ['Peitoral'] },
  back: { name: 'Costas', focus: ['Costas', 'Trapézio', 'Lombar'] },
  legsFocus: { name: 'Pernas', focus: ['Pernas', 'Glúteos', 'Panturrilha'] },
  shoulders: { name: 'Ombros', focus: ['Ombros'] },
  arms: { name: 'Braços', focus: ['Bíceps', 'Tríceps'] },
  core: { name: 'Core + Cardio', focus: ['Abdômen', 'Cardio'] },
  mobility: { name: 'Mobilidade', focus: ['Mobilidade', 'Alongamento'] },
}

function numberedDays(list) {
  return list.map((day, index) => ({ ...day, day: index + 1 }))
}

function repeatPattern(parts, days) {
  return numberedDays(
    Array.from({ length: days }, (_, index) => {
      const part = parts[index % parts.length]
      const round = Math.floor(index / parts.length)
      if (round === 0) return { name: part.name, focus: part.focus }
      return { name: `${part.name} ${String.fromCharCode(65 + round)}`, focus: part.focus }
    }),
  )
}

function buildFullBodySplit(days) {
  const variants = [
    { name: 'Full Body A', focus: ['Peitoral', 'Costas', 'Pernas', 'Abdômen'] },
    { name: 'Full Body B', focus: ['Ombros', 'Pernas', 'Glúteos', 'Bíceps'] },
    { name: 'Full Body C', focus: ['Peitoral', 'Costas', 'Glúteos', 'Tríceps'] },
    { name: 'Full Body D', focus: ['Ombros', 'Pernas', 'Abdômen', 'Mobilidade'] },
  ]
  return numberedDays(variants.slice(0, days))
}

function buildMuscleSplit(days) {
  const sequence = [
    SPLIT_PARTS.chest,
    SPLIT_PARTS.back,
    SPLIT_PARTS.legsFocus,
    days <= 4 ? { name: 'Ombros e braços', focus: ['Ombros', 'Bíceps', 'Tríceps'] } : SPLIT_PARTS.shoulders,
    SPLIT_PARTS.arms,
    SPLIT_PARTS.core,
    SPLIT_PARTS.mobility,
  ]
  return numberedDays(sequence.slice(0, days))
}

function buildStyledSplit(days, splitStyle) {
  switch (splitStyle) {
    case 'full_body':
      return buildFullBodySplit(days)
    case 'ppl':
      return repeatPattern([SPLIT_PARTS.push, SPLIT_PARTS.pull, SPLIT_PARTS.legs], days)
    case 'upper_lower':
      return repeatPattern([SPLIT_PARTS.upper, SPLIT_PARTS.lower], days)
    case 'abc':
      return repeatPattern([SPLIT_PARTS.abcA, SPLIT_PARTS.abcB, SPLIT_PARTS.abcC], days)
    case 'muscle':
      return buildMuscleSplit(days)
    default:
      return null
  }
}

export function getSplitOptionsForDays(daysPerWeek) {
  const days = Math.min(Math.max(Number(daysPerWeek) || 3, 2), 7)
  return SPLIT_STYLES.filter((style) => days >= style.minDays && days <= style.maxDays)
}

export function getSplitStyleLabel(splitStyle) {
  return SPLIT_STYLES.find((style) => style.id === splitStyle)?.label || SPLIT_STYLES[0].label
}

/**
 * Retorna a divisão semanal conforme dias, nível, objetivo e estilo escolhido.
 * `auto` preserva a lógica atual (iniciante em 3 dias = Full Body).
 */
export function getSplitTemplate(daysPerWeek, level = 'Intermediário', goal = 'saude', splitStyle = 'auto') {
  const days = Math.min(Math.max(Number(daysPerWeek) || 3, 2), 7)
  const allowed = getSplitOptionsForDays(days).some((style) => style.id === splitStyle)
  const style = allowed ? splitStyle : 'auto'

  if (style && style !== 'auto') {
    const styled = buildStyledSplit(days, style)
    if (styled?.length) return styled
  }

  if (days === 3 && level === 'Iniciante') {
    return splitTemplates['3_beginner']
  }

  if (goal === 'mobilidade' && days <= 3) {
    return [
      { day: 1, name: 'Mobilidade + Core A', focus: ['Mobilidade', 'Alongamento', 'Abdômen'] },
      { day: 2, name: 'Full Body controlado', focus: ['Peitoral', 'Costas', 'Pernas', 'Abdômen'] },
      ...(days === 3
        ? [{ day: 3, name: 'Mobilidade + Cardio leve', focus: ['Mobilidade', 'Cardio', 'Alongamento'] }]
        : []),
    ].slice(0, days)
  }

  return splitTemplates[days] || splitTemplates[3]
}

export const objectiveLabels = {
  hipertrofia: 'Hipertrofia',
  emagrecimento: 'Emagrecimento saudável',
  condicionamento: 'Condicionamento',
  forca: 'Força',
  saude: 'Saúde geral',
  mobilidade: 'Mobilidade',
}

export const levelConfig = {
  Iniciante: {
    setsMultiplier: 0.85,
    restBonus: 20,
    maxExercises: 5,
    setsMin: 2,
    setsMax: 3,
    restMin: 60,
    restMax: 90,
    defaultReps: '10-15',
  },
  Intermediário: {
    setsMultiplier: 1,
    restBonus: 0,
    maxExercises: 6,
    setsMin: 3,
    setsMax: 4,
    restMin: 60,
    restMax: 120,
    defaultReps: '8-12',
  },
  Avançado: {
    setsMultiplier: 1.1,
    restBonus: -5,
    maxExercises: 10,
    setsMin: 3,
    setsMax: 5,
    restMin: 60,
    restMax: 150,
    defaultReps: '6-15',
  },
}

export const PROFESSIONAL_DISCLAIMER =
  'Conteúdo informativo: não substitui orientação de um profissional de educação física ou saúde. Respeite seus limites.'

const DEFAULT_PRECAUTIONS = [
  'Aqueça 5–10 minutos antes de cada sessão.',
  'Priorize técnica correta em vez de aumentar carga rapidamente.',
  'Respeite sinais de fadiga e inclua dias de descanso na semana.',
  'Hidrate-se durante e após o treino.',
  'Interrompa imediatamente se sentir dor aguda ou desconforto incomum.',
  PROFESSIONAL_DISCLAIMER,
]

export const workoutBenefitsByType = {
  Push: [
    'Desenvolve força e resistência dos membros superiores de empurrar.',
    'Melhora estabilidade do ombro e controle postural.',
    'Estimula peito, ombros e tríceps de forma equilibrada.',
  ],
  Pull: [
    'Fortalece a cadeia posterior e a estabilidade da coluna.',
    'Equilibra a musculatura da parte superior do corpo.',
    'Melhora capacidade de puxar e postura no dia a dia.',
  ],
  Legs: [
    'Desenvolve força funcional de pernas e glúteos.',
    'Estimula grandes grupos musculares com gasto energético elevado.',
    'Contribui para estabilidade de quadril e joelho.',
  ],
  'Full Body': [
    'Trabalha o corpo inteiro em uma única sessão.',
    'Útil para quem tem pouco tempo disponível na semana.',
    'Mantém equilíbrio muscular geral ao longo do tempo.',
  ],
  Cardio: [
    'Melhora capacidade cardiovascular e resistência aeróbica.',
    'Auxilia na saúde do coração e do sistema respiratório.',
    'Complementa treinos de força de forma segura.',
  ],
  Mobilidade: [
    'Aumenta amplitude de movimento articular.',
    'Reduz rigidez muscular após períodos sedentários.',
    'Prepara o corpo para atividades físicas com mais segurança.',
  ],
  'Core/Abdômen': [
    'Fortalece o core para maior estabilidade do tronco.',
    'Protege a coluna em movimentos do dia a dia.',
    'Melhora transferência de força entre membros superiores e inferiores.',
  ],
  Superiores: [
    'Desenvolve força e resistência dos membros superiores.',
    'Equilibra desenvolvimento de peito, costas, ombros e braços.',
    'Aumenta capacidade funcional para tarefas cotidianas.',
  ],
  Inferiores: [
    'Fortalece pernas, glúteos e estabilizadores do quadril.',
    'Melhora desempenho em subir escadas, agachar e caminhar.',
    'Contribui para estabilidade articular de joelho e quadril.',
  ],
  Funcional: [
    'Integra força, equilíbrio e coordenação motora.',
    'Prepara o corpo para demandas reais do cotidiano.',
    'Desenvolve padrões de movimento naturais e seguros.',
  ],
}

export const workoutTemplates = [
  {
    id: 'tpl-push-a',
    name: 'Push',
    type: 'Push',
    goal: 'Hipertrofia',
    level: 'Intermediário',
    duration: 50,
    frequency: '1–2x por semana',
    mainMuscleGroup: 'Peito',
    secondaryMuscleGroups: ['Ombros', 'Tríceps'],
    equipment: ['Barra', 'Halteres', 'Banco'],
    benefits: workoutBenefitsByType.Push,
    precautions: DEFAULT_PRECAUTIONS,
    exercises: [
      'supino-reto',
      'desenvolvimento',
      'crucifixo-inclinado',
      'elevacao-lateral',
      'triceps-pulley',
      'flexao',
    ],
  },
  {
    id: 'tpl-pull-a',
    name: 'Pull',
    type: 'Pull',
    goal: 'Hipertrofia',
    level: 'Intermediário',
    duration: 50,
    frequency: '1–2x por semana',
    mainMuscleGroup: 'Costas',
    secondaryMuscleGroups: ['Bíceps', 'Abdômen'],
    equipment: ['Barra fixa', 'Halteres', 'Cabo'],
    benefits: workoutBenefitsByType.Pull,
    precautions: DEFAULT_PRECAUTIONS,
    exercises: [
      'puxada-frontal',
      'remada-curvada',
      'remada-unilateral',
      'puxada-triangulo',
      'rosca-direta',
      'prancha',
    ],
  },
  {
    id: 'tpl-legs-a',
    name: 'Legs',
    type: 'Legs',
    goal: 'Força',
    level: 'Intermediário',
    duration: 55,
    frequency: '1–2x por semana',
    mainMuscleGroup: 'Quadríceps',
    secondaryMuscleGroups: ['Posterior', 'Glúteos'],
    equipment: ['Barra', 'Halteres', 'Leg press'],
    benefits: workoutBenefitsByType.Legs,
    precautions: DEFAULT_PRECAUTIONS,
    exercises: [
      'agachamento',
      'leg-press',
      'stiff',
      'afundo',
      'cadeira-extensora',
      'panturrilha',
    ],
  },
  {
    id: 'tpl-full-body-a',
    name: 'Full Body A',
    type: 'Full Body',
    goal: 'Saúde geral',
    level: 'Iniciante',
    duration: 45,
    frequency: '2–3x por semana',
    mainMuscleGroup: 'Corpo inteiro',
    secondaryMuscleGroups: ['Peito', 'Costas', 'Quadríceps', 'Abdômen'],
    equipment: ['Halteres', 'Peso corporal'],
    benefits: workoutBenefitsByType['Full Body'],
    precautions: DEFAULT_PRECAUTIONS,
    exercises: [
      'agachamento-goblet',
      'flexao',
      'remada-unilateral',
      'desenvolvimento',
      'prancha',
    ],
  },
  {
    id: 'tpl-full-body-b',
    name: 'Full Body B',
    type: 'Full Body',
    goal: 'Condicionamento',
    level: 'Iniciante',
    duration: 40,
    frequency: '2–3x por semana',
    mainMuscleGroup: 'Corpo inteiro',
    secondaryMuscleGroups: ['Ombros', 'Posterior', 'Glúteos', 'Bíceps'],
    equipment: ['Halteres', 'Elástico'],
    benefits: workoutBenefitsByType['Full Body'],
    precautions: DEFAULT_PRECAUTIONS,
    exercises: [
      'levantamento-terra-halteres',
      'elevacao-frontal-lateral',
      'ponte-gluteos',
      'rosca-alternada',
      'abdominal-bicicleta',
    ],
  },
  {
    id: 'tpl-cardio-a',
    name: 'Cardio moderado',
    type: 'Cardio',
    goal: 'Condicionamento',
    level: 'Iniciante',
    duration: 30,
    frequency: '2–4x por semana',
    mainMuscleGroup: 'Cardiovascular',
    secondaryMuscleGroups: ['Pernas'],
    equipment: ['Esteira', 'Bicicleta ergométrica'],
    benefits: workoutBenefitsByType.Cardio,
    precautions: [
      ...DEFAULT_PRECAUTIONS.slice(0, 4),
      'Mantenha intensidade em que consiga conversar com algum esforço.',
      'Aumente duração gradualmente, sem saltos bruscos de volume.',
      PROFESSIONAL_DISCLAIMER,
    ],
    exercises: [
      'aquecimento-leve',
      'esteira-moderada',
      'bicicleta-leve',
      'desaquecimento',
    ],
  },
  {
    id: 'tpl-mobilidade-a',
    name: 'Mobilidade e alongamento',
    type: 'Mobilidade',
    goal: 'Saúde geral',
    level: 'Iniciante',
    duration: 25,
    frequency: '2–5x por semana',
    mainMuscleGroup: 'Corpo inteiro',
    secondaryMuscleGroups: ['Quadril', 'Coluna', 'Ombros'],
    equipment: ['Colchonete', 'Elástico'],
    benefits: workoutBenefitsByType.Mobilidade,
    precautions: [
      'Movimentos lentos e controlados — sem dor.',
      'Respire de forma contínua durante cada posição.',
      'Não force amplitude além do confortável.',
      PROFESSIONAL_DISCLAIMER,
    ],
    exercises: [
      'rotacao-toracica',
      'alongamento-quadriceps',
      'mobilidade-quadril-90',
      'alongamento-ombro',
      'gato-vaca',
    ],
  },
  {
    id: 'tpl-core-a',
    name: 'Core e abdômen',
    type: 'Core/Abdômen',
    goal: 'Condicionamento',
    level: 'Iniciante',
    duration: 30,
    frequency: '2–3x por semana',
    mainMuscleGroup: 'Abdômen',
    secondaryMuscleGroups: ['Oblíquos', 'Lombar'],
    equipment: ['Colchonete', 'Peso corporal'],
    benefits: workoutBenefitsByType['Core/Abdômen'],
    precautions: DEFAULT_PRECAUTIONS,
    exercises: [
      'prancha',
      'prancha-lateral',
      'dead-bug',
      'bird-dog',
      'pallof-press',
    ],
  },
  {
    id: 'tpl-superiores-a',
    name: 'Superior A',
    type: 'Superiores',
    goal: 'Hipertrofia',
    level: 'Intermediário',
    duration: 50,
    frequency: '1–2x por semana',
    mainMuscleGroup: 'Peito',
    secondaryMuscleGroups: ['Costas', 'Ombros'],
    equipment: ['Halteres', 'Barra', 'Cabo'],
    benefits: workoutBenefitsByType.Superiores,
    precautions: DEFAULT_PRECAUTIONS,
    exercises: [
      'supino-inclinado',
      'remada-baixa-cabo',
      'desenvolvimento-arnold',
      'crucifixo-cabo',
      'puxada-neutra',
    ],
  },
  {
    id: 'tpl-inferiores-a',
    name: 'Inferior A',
    type: 'Inferiores',
    goal: 'Força',
    level: 'Intermediário',
    duration: 50,
    frequency: '1–2x por semana',
    mainMuscleGroup: 'Quadríceps',
    secondaryMuscleGroups: ['Posterior', 'Glúteos', 'Abdômen'],
    equipment: ['Barra', 'Halteres', 'Máquinas'],
    benefits: workoutBenefitsByType.Inferiores,
    precautions: DEFAULT_PRECAUTIONS,
    exercises: [
      'agachamento-frontal',
      'cadeira-flexora',
      'hip-thrust',
      'passada-lateral',
      'abdominal-infra',
    ],
  },
  {
    id: 'tpl-funcional-a',
    name: 'Treino funcional',
    type: 'Funcional',
    goal: 'Condicionamento',
    level: 'Intermediário',
    duration: 40,
    frequency: '2–3x por semana',
    mainMuscleGroup: 'Corpo inteiro',
    secondaryMuscleGroups: ['Core', 'Pernas', 'Ombros'],
    equipment: ['Kettlebell', 'Corda', 'Caixa'],
    benefits: workoutBenefitsByType.Funcional,
    precautions: DEFAULT_PRECAUTIONS,
    exercises: [
      'kettlebell-swing',
      'burpee',
      'farmer-walk',
      'step-up',
      'battle-rope',
    ],
  },
]

const nameToTemplateMatchers = [
  { pattern: /push/i, id: 'tpl-push-a' },
  { pattern: /pull/i, id: 'tpl-pull-a' },
  { pattern: /leg|perna/i, id: 'tpl-legs-a' },
  { pattern: /full\s*body\s*b/i, id: 'tpl-full-body-b' },
  { pattern: /full\s*body/i, id: 'tpl-full-body-a' },
  { pattern: /cardio/i, id: 'tpl-cardio-a' },
  { pattern: /mobilidade|alongamento/i, id: 'tpl-mobilidade-a' },
  { pattern: /core|abd[oô]men/i, id: 'tpl-core-a' },
  { pattern: /superior\s*b/i, id: 'tpl-superiores-a' },
  { pattern: /superior/i, id: 'tpl-superiores-a' },
  { pattern: /inferior\s*b/i, id: 'tpl-inferiores-a' },
  { pattern: /inferior/i, id: 'tpl-inferiores-a' },
  { pattern: /funcional/i, id: 'tpl-funcional-a' },
  { pattern: /peito.*tr[ií]ceps/i, id: 'tpl-push-a' },
  { pattern: /costas.*b[ií]ceps/i, id: 'tpl-pull-a' },
  { pattern: /ombros.*abd[oô]men/i, id: 'tpl-core-a' },
]

export function getWorkoutBenefitsByType(type) {
  return workoutBenefitsByType[type] || []
}

export function getWorkoutTemplateById(id) {
  return workoutTemplates.find((t) => t.id === id) || null
}

export function resolveTemplateForWorkout(workout) {
  if (!workout) return null
  if (workout.templateId) {
    const byId = getWorkoutTemplateById(workout.templateId)
    if (byId) return byId
  }
  const byName = workoutTemplates.find(
    (t) => t.name.toLowerCase() === workout.name?.toLowerCase(),
  )
  if (byName) return byName
  const matcher = nameToTemplateMatchers.find((m) => m.pattern.test(workout.name || ''))
  if (matcher) return getWorkoutTemplateById(matcher.id)
  return null
}

function inferTypeFromWorkout(workout) {
  const matcher = nameToTemplateMatchers.find((m) => m.pattern.test(workout.name || ''))
  if (matcher) {
    const tpl = getWorkoutTemplateById(matcher.id)
    if (tpl) return tpl.type
  }
  if (workout.muscleGroups?.some((g) => ['Peito', 'Ombros', 'Tríceps'].includes(g))) return 'Push'
  if (workout.muscleGroups?.some((g) => ['Costas', 'Bíceps'].includes(g))) return 'Pull'
  if (workout.muscleGroups?.some((g) => ['Quadríceps', 'Posterior', 'Glúteos'].includes(g))) return 'Legs'
  return 'Full Body'
}

function exerciseToDetail(exercise, overrides = {}) {
  if (!exercise) return null
  return {
    id: exercise.id,
    name: exercise.name,
    type: exercise.type,
    category: exercise.category,
    muscleGroup: exercise.category,
    muscles: exercise.muscles,
    sets: overrides.sets ?? exercise.sets,
    reps: overrides.reps ?? exercise.reps,
    rest: overrides.rest ?? exercise.rest,
    note: overrides.note || '',
    benefits: exercise.benefits,
    execution: exercise.execution,
    commonMistakes: exercise.commonMistakes,
    mediaType: exercise.mediaType,
    mediaUrl: exercise.mediaUrl,
    image: exercise.image,
    thumbnail: exercise.thumbnail,
    gif: exercise.gif,
    video: exercise.video,
    fallbackImage: exercise.fallbackImage,
    fallbackSvg: exercise.fallbackSvg,
    shortInstruction: exercise.shortInstruction,
    executionSteps: exercise.executionSteps,
    equipment: exercise.equipment,
    level: exercise.level,
  }
}

function resolveTemplateExercises(exerciseRefs = []) {
  if (!exerciseRefs.length) return []
  if (typeof exerciseRefs[0] === 'string') {
    return getExercisesByIds(exerciseRefs).map((ex) => exerciseToDetail(ex))
  }
  return exerciseRefs.map((ex) => {
    const full = ex.exerciseId ? getExerciseById(ex.exerciseId) : getExerciseById(ex.id)
    if (full) {
      return exerciseToDetail(full, {
        sets: ex.sets,
        reps: ex.reps,
        rest: ex.rest || (ex.restSeconds ? `${ex.restSeconds}s` : undefined),
        note: ex.note,
      })
    }
    return {
      id: ex.exerciseId || ex.id,
      name: ex.name,
      sets: ex.sets,
      reps: ex.reps,
      rest: ex.rest || (ex.restSeconds ? `${ex.restSeconds}s` : '60s'),
      note: ex.note || '',
      muscleGroup: ex.muscleGroup || ex.category,
      muscles: ex.muscles || (ex.muscleGroup ? [ex.muscleGroup] : []),
      benefits: ex.benefits || [],
      execution: ex.execution || (ex.instructions ? [ex.instructions] : []),
      commonMistakes: ex.commonMistakes || (ex.cautions ? [ex.cautions] : []),
    }
  })
}

function normalizeExercises(exercises = []) {
  return resolveTemplateExercises(exercises)
}

export function enrichWorkoutDetail(workout) {
  if (!workout) return null

  const template = resolveTemplateForWorkout(workout)
  const type = template?.type || inferTypeFromWorkout(workout)
  const benefits = template?.benefits || getWorkoutBenefitsByType(type)
  const precautions = template?.precautions || DEFAULT_PRECAUTIONS

  const userExercises = workout.exercises?.length ? resolveTemplateExercises(workout.exercises) : null
  const exercises = userExercises?.length
    ? userExercises
    : resolveTemplateExercises(template?.exercises || [])

  return {
    id: workout.id,
    name: workout.name,
    type,
    goal: template?.goal || workout.goal || 'Saúde geral',
    level: template?.level || workout.level || 'Intermediário',
    duration: workout.estimatedMinutes || template?.duration || 45,
    frequency: template?.frequency || 'Conforme sua planilha',
    mainMuscleGroup: template?.mainMuscleGroup || workout.muscleGroups?.[0] || 'Corpo inteiro',
    secondaryMuscleGroups:
      template?.secondaryMuscleGroups ||
      workout.muscleGroups?.slice(1) ||
      [],
    equipment: template?.equipment || ['Conforme disponível'],
    benefits,
    precautions,
    exercises,
    status: workout.status,
    date: workout.date,
    sourceWorkout: workout,
  }
}
