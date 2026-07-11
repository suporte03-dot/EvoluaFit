import { getExerciseById, getExercisesByIds } from './exercisesData'

export const splitTemplates = {
  2: [
    { day: 1, name: 'Full Body A', focus: ['Peito', 'Costas', 'Quadríceps', 'Abdômen'] },
    { day: 2, name: 'Full Body B', focus: ['Ombros', 'Posterior', 'Glúteos', 'Bíceps', 'Tríceps'] },
  ],
  3: [
    { day: 1, name: 'Push', focus: ['Peito', 'Ombros', 'Tríceps'] },
    { day: 2, name: 'Pull', focus: ['Costas', 'Bíceps', 'Abdômen'] },
    { day: 3, name: 'Legs', focus: ['Quadríceps', 'Posterior', 'Glúteos'] },
  ],
  4: [
    { day: 1, name: 'Superior A', focus: ['Peito', 'Costas', 'Ombros'] },
    { day: 2, name: 'Inferior A', focus: ['Quadríceps', 'Posterior', 'Glúteos'] },
    { day: 3, name: 'Superior B', focus: ['Peito', 'Costas', 'Bíceps', 'Tríceps'] },
    { day: 4, name: 'Inferior B', focus: ['Quadríceps', 'Posterior', 'Abdômen'] },
  ],
  5: [
    { day: 1, name: 'Peito + Tríceps', focus: ['Peito', 'Tríceps'] },
    { day: 2, name: 'Costas + Bíceps', focus: ['Costas', 'Bíceps'] },
    { day: 3, name: 'Pernas', focus: ['Quadríceps', 'Posterior', 'Glúteos'] },
    { day: 4, name: 'Ombros + Abdômen', focus: ['Ombros', 'Abdômen'] },
    { day: 5, name: 'Full Body leve', focus: ['Corpo inteiro'] },
  ],
  6: [
    { day: 1, name: 'Push A', focus: ['Peito', 'Ombros', 'Tríceps'] },
    { day: 2, name: 'Pull A', focus: ['Costas', 'Bíceps'] },
    { day: 3, name: 'Legs A', focus: ['Quadríceps', 'Posterior'] },
    { day: 4, name: 'Push B', focus: ['Peito', 'Ombros', 'Tríceps'] },
    { day: 5, name: 'Pull B', focus: ['Costas', 'Bíceps', 'Abdômen'] },
    { day: 6, name: 'Legs B', focus: ['Glúteos', 'Quadríceps', 'Posterior'] },
  ],
}

export const objectiveLabels = {
  hipertrofia: 'Hipertrofia',
  emagrecimento: 'Emagrecimento',
  condicionamento: 'Condicionamento',
  forca: 'Força',
  saude: 'Saúde geral',
}

export const levelConfig = {
  Iniciante: { setsMultiplier: 0.8, restBonus: 15, maxExercises: 5 },
  Intermediário: { setsMultiplier: 1, restBonus: 0, maxExercises: 6 },
  Avançado: { setsMultiplier: 1.2, restBonus: -10, maxExercises: 7 },
}

const PROFESSIONAL_DISCLAIMER =
  'Este conteúdo é informativo e não substitui avaliação de um profissional de educação física ou saúde. Consulte um especialista antes de iniciar ou alterar sua rotina.'

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
