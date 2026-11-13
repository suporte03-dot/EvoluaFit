export const BODY_CONSENT_VERSION = '1.0'

export const BODY_PHOTO_TYPES = [
  {
    id: 'front',
    label: 'Foto frontal',
    hint: 'Obrigatória',
    required: true,
  },
  {
    id: 'side',
    label: 'Foto lateral',
    hint: 'Recomendada',
    required: false,
  },
  {
    id: 'back',
    label: 'Foto traseira',
    hint: 'Opcional',
    required: false,
  },
]

export const BODY_PHOTO_TIPS = [
  'Boa iluminação, de preferência natural ou frontal.',
  'Fundo neutro e desimpedido.',
  'Corpo inteiro visível, da cabeça aos pés.',
  'Posição natural, câmera na altura do tronco.',
]

export const BODY_GOAL_TYPES = [
  { id: 'reduce', label: 'Redução de medidas' },
  { id: 'mass', label: 'Ganho de massa' },
  { id: 'definition', label: 'Definição' },
  { id: 'recomp', label: 'Recomposição corporal' },
  { id: 'performance', label: 'Performance' },
  { id: 'track', label: 'Apenas acompanhar minha evolução' },
  { id: 'other', label: 'Outro' },
]

export const BODY_MEASURE_FIELDS = [
  { id: 'weight', label: 'Peso', unit: 'kg', group: 'checkin' },
  { id: 'height', label: 'Altura', unit: 'cm', group: 'profile' },
  { id: 'waist', label: 'Cintura', unit: 'cm', group: 'measure' },
  { id: 'chest', label: 'Peito', unit: 'cm', group: 'measure' },
  { id: 'right_arm', label: 'Braço direito', unit: 'cm', group: 'measure' },
  { id: 'left_arm', label: 'Braço esquerdo', unit: 'cm', group: 'measure' },
  { id: 'hips', label: 'Quadril', unit: 'cm', group: 'measure' },
  { id: 'right_thigh', label: 'Coxa direita', unit: 'cm', group: 'measure' },
  { id: 'left_thigh', label: 'Coxa esquerda', unit: 'cm', group: 'measure' },
  { id: 'right_calf', label: 'Panturrilha direita', unit: 'cm', group: 'measure' },
  { id: 'left_calf', label: 'Panturrilha esquerda', unit: 'cm', group: 'measure' },
  { id: 'body_fat_percentage', label: 'Percentual de gordura', unit: '%', group: 'checkin' },
]

export const BODY_MEASURE_LIMITS = {
  weight: { min: 30, max: 250, label: 'peso' },
  height: { min: 120, max: 230, label: 'altura' },
  waist: { min: 40, max: 180, label: 'cintura' },
  chest: { min: 50, max: 180, label: 'peito' },
  right_arm: { min: 15, max: 70, label: 'braço direito' },
  left_arm: { min: 15, max: 70, label: 'braço esquerdo' },
  hips: { min: 50, max: 180, label: 'quadril' },
  right_thigh: { min: 25, max: 100, label: 'coxa direita' },
  left_thigh: { min: 25, max: 100, label: 'coxa esquerda' },
  right_calf: { min: 20, max: 70, label: 'panturrilha direita' },
  left_calf: { min: 20, max: 70, label: 'panturrilha esquerda' },
  body_fat_percentage: { min: 3, max: 60, label: 'percentual de gordura' },
}

export const BODY_GOAL_FIELDS = [
  { id: 'target_weight', source: 'weight', label: 'Peso', unit: 'kg' },
  { id: 'target_waist', source: 'waist', label: 'Cintura', unit: 'cm' },
  { id: 'target_chest', source: 'chest', label: 'Peito', unit: 'cm' },
  { id: 'target_arm', source: 'arm', label: 'Braço', unit: 'cm' },
  { id: 'target_hips', source: 'hips', label: 'Quadril', unit: 'cm' },
  { id: 'target_thigh', source: 'thigh', label: 'Coxa', unit: 'cm' },
]

export const BODY_PROJECTION_DISCLAIMER =
  'Esta representação é ilustrativa e não garante resultados físicos futuros. A evolução real pode variar conforme treino, alimentação, descanso, genética e outros fatores.'

export const BODY_CONSENT_COPY = {
  title: 'Suas fotos são privadas.',
  points: [
    'Finalidade: acompanhar sua evolução corporal dentro do Espelho Evolutivo.',
    'Armazenamento: pasta privada da sua conta, sem URL pública permanente.',
    'Acesso: somente você, autenticado, pode ver, substituir ou excluir.',
    'Exclusão: você pode apagar uma foto, um check-in ou todo o Espelho a qualquer momento.',
    'Uso: as imagens não alimentam o Evolua Score e não são compartilhadas automaticamente.',
  ],
  checkbox:
    'Li e concordo com o uso das minhas imagens exclusivamente para acompanhar minha evolução no EvoluaFit.',
}

export const ONBOARDING_STEPS = [
  { id: 'intro', title: 'Registre seu corpo', text: 'Uma foto e as medidas que você tiver já começam sua linha do tempo.' },
  { id: 'measures', title: 'Adicione suas medidas', text: 'Peso, cintura e o que mais quiser acompanhar. Nada é obrigatório além da foto frontal.' },
  { id: 'goal', title: 'Defina sua meta', text: 'Opcional. Uma simulação visual de objetivo, nunca uma previsão.' },
  { id: 'track', title: 'Acompanhe sua evolução', text: 'Compare o antes e o agora e veja o que mudou, sem julgamento.' },
]
