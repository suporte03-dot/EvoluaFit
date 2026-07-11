const STORAGE_KEY = 'evoluafit-data'
const VERSION = 1

const defaultProfile = {
  name: 'Atleta',
  objective: 'saude',
  level: 'Iniciante',
  daysPerWeek: 3,
  duration: 45,
  location: 'Academia',
  equipment: ['Academia completa'],
  restrictions: [],
  weight: '',
  height: '',
  age: '',
}

const defaultGoals = [
  {
    id: 'goal-1',
    title: 'Treinar 3x por semana',
    target: 3,
    current: 0,
    unit: 'treinos/semana',
    type: 'weekly_workouts',
    healthy: true,
  },
  {
    id: 'goal-2',
    title: 'Beber 2L de água por dia',
    target: 2,
    current: 1.5,
    unit: 'litros',
    type: 'hydration',
    healthy: true,
  },
  {
    id: 'goal-3',
    title: 'Dormir 7h por noite',
    target: 7,
    current: 6,
    unit: 'horas',
    type: 'sleep',
    healthy: true,
  },
  {
    id: 'goal-4',
    title: 'Caminhar 8.000 passos/dia',
    target: 8000,
    current: 5200,
    unit: 'passos',
    type: 'steps',
    healthy: true,
  },
]

function createDefaultWorkouts() {
  const today = new Date()
  const format = (offset) => {
    const d = new Date(today)
    d.setDate(d.getDate() + offset)
    return d.toISOString().split('T')[0]
  }

  return [
    {
      id: 'default-1',
      name: 'Push — Peito e Tríceps',
      date: format(0),
      dayLabel: 'Hoje',
      muscleGroups: ['Peito', 'Ombros', 'Tríceps'],
      status: 'Pendente',
      estimatedMinutes: 45,
      exercises: [
        { exerciseId: 'supino-reto', name: 'Supino reto', muscleGroup: 'Peito', sets: 4, reps: '8-12', restSeconds: 90, load: '40kg' },
        { exerciseId: 'supino-inclinado', name: 'Supino inclinado', muscleGroup: 'Peito', sets: 3, reps: '10-12', restSeconds: 75, load: '14kg' },
        { exerciseId: 'desenvolvimento', name: 'Desenvolvimento com halteres', muscleGroup: 'Ombros', sets: 3, reps: '8-12', restSeconds: 75, load: '12kg' },
        { exerciseId: 'triceps-pulley', name: 'Tríceps na polia', muscleGroup: 'Tríceps', sets: 3, reps: '12-15', restSeconds: 60, load: '25kg' },
      ],
      createdAt: new Date().toISOString(),
    },
    {
      id: 'default-2',
      name: 'Pull — Costas e Bíceps',
      date: format(2),
      muscleGroups: ['Costas', 'Bíceps'],
      status: 'Pendente',
      estimatedMinutes: 50,
      exercises: [
        { exerciseId: 'puxada-frontal', name: 'Puxada frontal', muscleGroup: 'Costas', sets: 4, reps: '10-12', restSeconds: 75, load: '45kg' },
        { exerciseId: 'remada-unilateral', name: 'Remada unilateral', muscleGroup: 'Costas', sets: 3, reps: '10-12', restSeconds: 60, load: '16kg' },
        { exerciseId: 'rosca-direta', name: 'Rosca direta', muscleGroup: 'Bíceps', sets: 3, reps: '10-12', restSeconds: 60, load: '10kg' },
      ],
      createdAt: new Date().toISOString(),
    },
    {
      id: 'default-3',
      name: 'Legs — Pernas completas',
      date: format(4),
      muscleGroups: ['Quadríceps', 'Posterior', 'Glúteos'],
      status: 'Pendente',
      estimatedMinutes: 55,
      exercises: [
        { exerciseId: 'agachamento-goblet', name: 'Agachamento goblet', muscleGroup: 'Quadríceps', sets: 4, reps: '12-15', restSeconds: 75, load: '16kg' },
        { exerciseId: 'cadeira-flexora', name: 'Cadeira flexora', muscleGroup: 'Posterior', sets: 3, reps: '12-15', restSeconds: 60, load: '35kg' },
        { exerciseId: 'hip-thrust', name: 'Hip thrust', muscleGroup: 'Glúteos', sets: 4, reps: '10-12', restSeconds: 90, load: '60kg' },
      ],
      createdAt: new Date().toISOString(),
    },
  ]
}

function createDefaultHistory() {
  const today = new Date()
  const daysAgo = (n) => {
    const d = new Date(today)
    d.setDate(d.getDate() - n)
    return d.toISOString()
  }

  return [
    {
      id: 'hist-1',
      workoutId: 'hist-w1',
      name: 'Full Body leve',
      completedAt: daysAgo(3),
      durationMinutes: 42,
      exercises: [
        { exerciseId: 'flexao', name: 'Flexão de braço', completedSets: 3, reps: '12', load: 'corporal' },
        { exerciseId: 'agachamento-goblet', name: 'Agachamento goblet', completedSets: 3, reps: '15', load: '14kg' },
        { exerciseId: 'prancha', name: 'Prancha abdominal', completedSets: 3, reps: '40s', load: '' },
      ],
    },
    {
      id: 'hist-2',
      workoutId: 'hist-w2',
      name: 'Superior A',
      completedAt: daysAgo(6),
      durationMinutes: 48,
      exercises: [
        { exerciseId: 'supino-reto', name: 'Supino reto', completedSets: 4, reps: '10', load: '38kg' },
        { exerciseId: 'puxada-frontal', name: 'Puxada frontal', completedSets: 4, reps: '10', load: '42kg' },
      ],
    },
  ]
}

function getDefaultData() {
  return {
    version: VERSION,
    profile: { ...defaultProfile },
    workouts: createDefaultWorkouts(),
    plans: [],
    history: createDefaultHistory(),
    goals: defaultGoals.map((g) => ({ ...g })),
  }
}

function loadRaw() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function saveRaw(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...data, version: VERSION }))
}

export const storageService = {
  load() {
    const data = loadRaw()
    if (!data) {
      const defaults = getDefaultData()
      saveRaw(defaults)
      return defaults
    }
    return {
      ...getDefaultData(),
      ...data,
      profile: { ...defaultProfile, ...data.profile },
    }
  },

  save(data) {
    saveRaw(data)
  },

  getProfile() {
    return this.load().profile
  },

  setProfile(profile) {
    const data = this.load()
    data.profile = { ...data.profile, ...profile }
    this.save(data)
    return data.profile
  },

  getWorkouts() {
    return this.load().workouts
  },

  setWorkouts(workouts) {
    const data = this.load()
    data.workouts = workouts
    this.save(data)
    return workouts
  },

  getPlans() {
    return this.load().plans
  },

  addPlan(plan) {
    const data = this.load()
    data.plans = [plan, ...data.plans]
    this.save(data)
    return plan
  },

  getHistory() {
    return this.load().history
  },

  addHistoryEntry(entry) {
    const data = this.load()
    data.history = [entry, ...data.history]
    this.save(data)
    return entry
  },

  getGoals() {
    return this.load().goals
  },

  setGoals(goals) {
    const data = this.load()
    data.goals = goals
    this.save(data)
    return goals
  },

  exportData() {
    const data = this.load()
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `evoluafit-backup-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
    return true
  },

  importData(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const parsed = JSON.parse(e.target.result)
          saveRaw({ ...getDefaultData(), ...parsed })
          resolve(parsed)
        } catch (err) {
          reject(err)
        }
      }
      reader.onerror = reject
      reader.readAsText(file)
    })
  },

  clearAll() {
    localStorage.removeItem(STORAGE_KEY)
    return getDefaultData()
  },
}

export default storageService
