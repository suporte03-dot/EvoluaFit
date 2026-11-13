const STORAGE_KEY = 'evoluafit-data'
const VERSION = 2

/** Legacy satellite keys — migrated into evoluafit-data on load */
const LEGACY_KEYS = {
  progress: 'workout_progress_history',
  session: 'active_workout_session',
  calendar: 'training_calendar',
  coach: 'coach_messages_local',
  coachLegacy: 'evoluafit-coach-messages',
  coachTts: 'evoluafit-coach-tts-enabled',
}

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

function readLegacyJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw)
  } catch {
    return fallback
  }
}

function getDefaultData() {
  return {
    version: VERSION,
    profile: { ...defaultProfile },
    workouts: createDefaultWorkouts(),
    plans: [],
    history: createDefaultHistory(),
    goals: defaultGoals.map((g) => ({ ...g })),
    progressHistory: [],
    activeSession: null,
    calendarMirror: [],
    coachMessages: [],
    preferences: {
      coachTtsEnabled: true,
    },
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
  // Always fold latest satellite keys so out-of-band writers (progressStorage) aren't wiped
  const merged = {
    ...data,
    version: VERSION,
    progressHistory: readLegacyJson(LEGACY_KEYS.progress, data.progressHistory || []),
    activeSession:
      data.activeSession !== undefined
        ? data.activeSession
        : readLegacyJson(LEGACY_KEYS.session, null),
  }
  // If activeSession explicitly null, clear; else prefer explicit or legacy
  if (data.activeSession === null) {
    merged.activeSession = null
  } else if (data.activeSession) {
    merged.activeSession = data.activeSession
  } else {
    merged.activeSession = readLegacyJson(LEGACY_KEYS.session, null)
  }
  if (!Array.isArray(merged.progressHistory) || !merged.progressHistory.length) {
    const fromData = Array.isArray(data.progressHistory) ? data.progressHistory : []
    const fromLegacy = readLegacyJson(LEGACY_KEYS.progress, [])
    merged.progressHistory = fromLegacy.length >= fromData.length ? fromLegacy : fromData
  } else {
    const fromLegacy = readLegacyJson(LEGACY_KEYS.progress, [])
    if (fromLegacy.length > merged.progressHistory.length) {
      merged.progressHistory = fromLegacy
    }
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(merged))
  syncLegacyMirrors(merged)
  return merged
}

/**
 * Migrate v1 → v2: fold satellite localStorage keys into evoluafit-data.
 * Keeps legacy keys in sync for readers that still use them (progressStorage, calendar).
 */
function migrateToV2(data) {
  const next = {
    ...getDefaultData(),
    ...data,
    profile: { ...defaultProfile, ...(data.profile || {}) },
    workouts: Array.isArray(data.workouts) ? data.workouts : getDefaultData().workouts,
    plans: Array.isArray(data.plans) ? data.plans : [],
    history: Array.isArray(data.history) ? data.history : [],
    goals: Array.isArray(data.goals) ? data.goals : getDefaultData().goals,
    version: VERSION,
  }

  if (!Array.isArray(next.progressHistory) || !next.progressHistory.length) {
    const legacy = readLegacyJson(LEGACY_KEYS.progress, [])
    if (Array.isArray(legacy) && legacy.length) next.progressHistory = legacy
  }

  if (next.activeSession == null) {
    const legacy = readLegacyJson(LEGACY_KEYS.session, null)
    if (legacy) next.activeSession = legacy
  }

  if (!Array.isArray(next.calendarMirror) || !next.calendarMirror.length) {
    const legacy = readLegacyJson(LEGACY_KEYS.calendar, [])
    if (Array.isArray(legacy) && legacy.length) next.calendarMirror = legacy
  }

  if (!Array.isArray(next.coachMessages) || !next.coachMessages.length) {
    const coach =
      readLegacyJson(LEGACY_KEYS.coach, null) || readLegacyJson(LEGACY_KEYS.coachLegacy, [])
    if (Array.isArray(coach) && coach.length) next.coachMessages = coach
  }

  if (!next.preferences) next.preferences = { coachTtsEnabled: true }
  const ttsRaw = localStorage.getItem(LEGACY_KEYS.coachTts)
  if (ttsRaw === '0' || ttsRaw === '1') {
    next.preferences.coachTtsEnabled = ttsRaw === '1'
  }

  return next
}

/** Mirror nested fields back to legacy keys so older modules keep working */
function syncLegacyMirrors(data) {
  try {
    if (Array.isArray(data.progressHistory)) {
      localStorage.setItem(LEGACY_KEYS.progress, JSON.stringify(data.progressHistory.slice(0, 2000)))
    }
    if (data.activeSession) {
      localStorage.setItem(LEGACY_KEYS.session, JSON.stringify(data.activeSession))
    } else {
      localStorage.removeItem(LEGACY_KEYS.session)
    }
    if (Array.isArray(data.calendarMirror)) {
      localStorage.setItem(LEGACY_KEYS.calendar, JSON.stringify(data.calendarMirror))
    }
    if (Array.isArray(data.coachMessages)) {
      localStorage.setItem(LEGACY_KEYS.coach, JSON.stringify(data.coachMessages.slice(0, 80)))
    }
    if (data.preferences?.coachTtsEnabled != null) {
      localStorage.setItem(LEGACY_KEYS.coachTts, data.preferences.coachTtsEnabled ? '1' : '0')
    }
  } catch {
    /* quota / private mode */
  }
}

export const storageService = {
  STORAGE_KEY,
  VERSION,
  LEGACY_KEYS,

  load() {
    const raw = loadRaw()
    if (!raw) {
      const defaults = getDefaultData()
      // First visit: still migrate any orphan legacy keys
      const migrated = migrateToV2(defaults)
      saveRaw(migrated)
      syncLegacyMirrors(migrated)
      return migrated
    }

    const version = Number(raw.version) || 1
    const migrated = version < 2 ? migrateToV2(raw) : migrateToV2(raw)
    if (version < 2 || !Array.isArray(raw.progressHistory)) {
      saveRaw(migrated)
      syncLegacyMirrors(migrated)
    }
    return migrated
  },

  save(data) {
    return saveRaw({ ...data, version: VERSION })
  },

  /** Patch nested satellite fields without clobbering workouts/history */
  patchMeta(partial) {
    const data = this.load()
    return this.save({ ...data, ...partial, version: VERSION })
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

  /** Replace a single day inside a saved plan without touching other days */
  updatePlanDay(planId, dayNumber, dayUpdates) {
    const data = this.load()
    data.plans = data.plans.map((plan) => {
      if (plan.id !== planId) return plan
      const days = plan.weeklyPlan || plan.schedule || []
      const key = plan.weeklyPlan ? 'weeklyPlan' : 'schedule'
      return {
        ...plan,
        [key]: days.map((day) =>
          day.day === dayNumber || day.dayNumber === dayNumber
            ? { ...day, ...dayUpdates }
            : day,
        ),
      }
    })
    this.save(data)
    return data.plans.find((p) => p.id === planId) || null
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
          const migrated = migrateToV2({ ...getDefaultData(), ...parsed })
          this.save(migrated)
          resolve(migrated)
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
    Object.values(LEGACY_KEYS).forEach((key) => {
      try {
        localStorage.removeItem(key)
      } catch {
        /* ignore */
      }
    })
    const defaults = getDefaultData()
    saveRaw(defaults)
    return defaults
  },
}

export default storageService
