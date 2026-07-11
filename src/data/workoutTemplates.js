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
      { name: 'Supino reto', sets: 4, reps: '8–12', rest: '90s', note: 'Controle a descida', muscleGroup: 'Peito' },
      { name: 'Desenvolvimento com halteres', sets: 3, reps: '10–12', rest: '75s', note: 'Evite arquear demais a lombar', muscleGroup: 'Ombros' },
      { name: 'Crucifixo inclinado', sets: 3, reps: '12–15', rest: '60s', note: 'Amplitude confortável', muscleGroup: 'Peito' },
      { name: 'Elevação lateral', sets: 3, reps: '12–15', rest: '45s', note: 'Carga moderada', muscleGroup: 'Ombros' },
      { name: 'Tríceps na polia', sets: 3, reps: '12–15', rest: '60s', note: 'Cotovelos fixos', muscleGroup: 'Tríceps' },
      { name: 'Flexão de braços', sets: 2, reps: 'até a falha técnica', rest: '60s', note: 'Ajuste inclinação se necessário', muscleGroup: 'Peito' },
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
      { name: 'Barra fixa ou puxada frontal', sets: 4, reps: '6–10', rest: '90s', note: 'Puxe com as costas', muscleGroup: 'Costas' },
      { name: 'Remada curvada', sets: 4, reps: '8–12', rest: '75s', note: 'Coluna neutra', muscleGroup: 'Costas' },
      { name: 'Remada unilateral', sets: 3, reps: '10–12', rest: '60s', note: 'Evite rotação excessiva', muscleGroup: 'Costas' },
      { name: 'Puxada alta com triângulo', sets: 3, reps: '12–15', rest: '60s', note: 'Cotovelos próximos ao corpo', muscleGroup: 'Costas' },
      { name: 'Rosca direta', sets: 3, reps: '10–12', rest: '60s', note: 'Sem balanço', muscleGroup: 'Bíceps' },
      { name: 'Prancha', sets: 3, reps: '30–45s', rest: '45s', note: 'Core ativado', muscleGroup: 'Abdômen' },
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
      { name: 'Agachamento livre', sets: 4, reps: '8–10', rest: '120s', note: 'Profundidade confortável', muscleGroup: 'Quadríceps' },
      { name: 'Leg press', sets: 3, reps: '10–12', rest: '90s', note: 'Pés na largura do quadril', muscleGroup: 'Quadríceps' },
      { name: 'Stiff', sets: 3, reps: '10–12', rest: '75s', note: 'Coluna neutra', muscleGroup: 'Posterior' },
      { name: 'Afundo com halteres', sets: 3, reps: '10 cada perna', rest: '75s', note: 'Passo controlado', muscleGroup: 'Glúteos' },
      { name: 'Cadeira extensora', sets: 3, reps: '12–15', rest: '60s', note: 'Contração no topo', muscleGroup: 'Quadríceps' },
      { name: 'Panturrilha em pé', sets: 4, reps: '15–20', rest: '45s', note: 'Amplitude completa', muscleGroup: 'Quadríceps' },
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
      { name: 'Agachamento com halteres', sets: 3, reps: '12–15', rest: '75s', note: 'Inicie com carga leve', muscleGroup: 'Quadríceps' },
      { name: 'Flexão de braços', sets: 3, reps: '8–12', rest: '60s', note: 'Joelhos no chão se necessário', muscleGroup: 'Peito' },
      { name: 'Remada com halteres', sets: 3, reps: '10–12', rest: '60s', note: 'Costas retas', muscleGroup: 'Costas' },
      { name: 'Desenvolvimento com halteres', sets: 3, reps: '10–12', rest: '60s', note: 'Sem impulso', muscleGroup: 'Ombros' },
      { name: 'Prancha', sets: 3, reps: '20–40s', rest: '45s', note: 'Respiração contínua', muscleGroup: 'Abdômen' },
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
      { name: 'Levantamento terra com halteres', sets: 3, reps: '10–12', rest: '75s', note: 'Coluna neutra', muscleGroup: 'Posterior' },
      { name: 'Elevação frontal + lateral', sets: 3, reps: '12', rest: '60s', note: 'Carga leve', muscleGroup: 'Ombros' },
      { name: 'Ponte de glúteos', sets: 3, reps: '15', rest: '45s', note: 'Contraia no topo', muscleGroup: 'Glúteos' },
      { name: 'Rosca alternada', sets: 3, reps: '12', rest: '60s', note: 'Cotovelos fixos', muscleGroup: 'Bíceps' },
      { name: 'Abdominal bicicleta', sets: 3, reps: '20', rest: '45s', note: 'Movimento controlado', muscleGroup: 'Abdômen' },
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
      { name: 'Aquecimento leve', sets: 1, reps: '5 min', rest: '—', note: 'Caminhada ou pedal suave', muscleGroup: 'Cardiovascular' },
      { name: 'Esteira — ritmo moderado', sets: 1, reps: '15 min', rest: '—', note: 'FC confortável', muscleGroup: 'Cardiovascular' },
      { name: 'Bicicleta — resistência leve', sets: 1, reps: '8 min', rest: '—', note: 'Cadência constante', muscleGroup: 'Cardiovascular' },
      { name: 'Desaquecimento', sets: 1, reps: '2 min', rest: '—', note: 'Reduza intensidade aos poucos', muscleGroup: 'Cardiovascular' },
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
      { name: 'Rotação torácica', sets: 2, reps: '10 cada lado', rest: '30s', note: 'Sentado ou em pé', muscleGroup: 'Coluna' },
      { name: 'Alongamento de quadríceps', sets: 2, reps: '30s cada perna', rest: '20s', note: 'Segure apoio se precisar', muscleGroup: 'Quadríceps' },
      { name: 'Mobilidade de quadril — 90/90', sets: 2, reps: '45s cada lado', rest: '20s', note: 'Tronco ereto', muscleGroup: 'Quadril' },
      { name: 'Alongamento posterior de ombro', sets: 2, reps: '30s cada braço', rest: '20s', note: 'Sem pressionar articulação', muscleGroup: 'Ombros' },
      { name: 'Gato-vaca', sets: 2, reps: '12', rest: '30s', note: 'Sincronize com a respiração', muscleGroup: 'Coluna' },
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
      { name: 'Prancha frontal', sets: 3, reps: '30–45s', rest: '45s', note: 'Quadril alinhado', muscleGroup: 'Abdômen' },
      { name: 'Prancha lateral', sets: 2, reps: '25s cada lado', rest: '30s', note: 'Corpo em linha reta', muscleGroup: 'Oblíquos' },
      { name: 'Dead bug', sets: 3, reps: '10 cada lado', rest: '45s', note: 'Lombar pressionada no chão', muscleGroup: 'Abdômen' },
      { name: 'Bird dog', sets: 3, reps: '10 cada lado', rest: '45s', note: 'Movimento lento', muscleGroup: 'Lombar' },
      { name: 'Pallof press com elástico', sets: 3, reps: '12 cada lado', rest: '45s', note: 'Resista à rotação', muscleGroup: 'Oblíquos' },
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
      { name: 'Supino inclinado com halteres', sets: 4, reps: '8–12', rest: '90s', note: 'Descida controlada', muscleGroup: 'Peito' },
      { name: 'Remada baixa no cabo', sets: 4, reps: '10–12', rest: '75s', note: 'Peito para fora', muscleGroup: 'Costas' },
      { name: 'Desenvolvimento Arnold', sets: 3, reps: '10–12', rest: '75s', note: 'Amplitude confortável', muscleGroup: 'Ombros' },
      { name: 'Crucifixo no cabo', sets: 3, reps: '12–15', rest: '60s', note: 'Leve flexão de cotovelo', muscleGroup: 'Peito' },
      { name: 'Puxada neutra', sets: 3, reps: '10–12', rest: '75s', note: 'Cotovelos para baixo', muscleGroup: 'Costas' },
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
      { name: 'Agachamento frontal', sets: 4, reps: '8–10', rest: '120s', note: 'Cotovelos altos', muscleGroup: 'Quadríceps' },
      { name: 'Mesa flexora', sets: 3, reps: '10–12', rest: '75s', note: 'Contração no final', muscleGroup: 'Posterior' },
      { name: 'Hip thrust', sets: 4, reps: '10–12', rest: '90s', note: 'Queixo recolhido', muscleGroup: 'Glúteos' },
      { name: 'Passada lateral com halter', sets: 3, reps: '10 cada lado', rest: '60s', note: 'Joelho alinhado ao pé', muscleGroup: 'Glúteos' },
      { name: 'Abdominal infra no banco', sets: 3, reps: '12–15', rest: '45s', note: 'Sem balanço', muscleGroup: 'Abdômen' },
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
      { name: 'Swing com kettlebell', sets: 4, reps: '15', rest: '60s', note: 'Impulso do quadril', muscleGroup: 'Posterior' },
      { name: 'Burpee modificado', sets: 3, reps: '8–10', rest: '75s', note: 'Sem salto se necessário', muscleGroup: 'Corpo inteiro' },
      { name: 'Farmer walk', sets: 3, reps: '30m', rest: '60s', note: 'Postura ereta', muscleGroup: 'Core' },
      { name: 'Step-up na caixa', sets: 3, reps: '10 cada perna', rest: '60s', note: 'Suba com controle', muscleGroup: 'Quadríceps' },
      { name: 'Battle rope — ondas', sets: 3, reps: '30s', rest: '60s', note: 'Ritmo constante', muscleGroup: 'Ombros' },
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

function normalizeExercises(exercises = []) {
  return exercises.map((ex) => ({
    name: ex.name,
    sets: ex.sets,
    reps: ex.reps,
    rest: ex.rest || (ex.restSeconds ? `${ex.restSeconds}s` : '60s'),
    note: ex.note || '',
    muscleGroup: ex.muscleGroup,
  }))
}

export function enrichWorkoutDetail(workout) {
  if (!workout) return null

  const template = resolveTemplateForWorkout(workout)
  const type = template?.type || inferTypeFromWorkout(workout)
  const benefits = template?.benefits || getWorkoutBenefitsByType(type)
  const precautions = template?.precautions || DEFAULT_PRECAUTIONS

  const userExercises = workout.exercises?.length ? normalizeExercises(workout.exercises) : null
  const exercises = userExercises?.length ? userExercises : normalizeExercises(template?.exercises || [])

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
