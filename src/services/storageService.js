const STORAGE_KEY = 'evoluafit-data'
const VERSION = 3

/** Legacy satellite keys — migrated into evoluafit-data on load */
const LEGACY_KEYS = {
  progress: 'workout_progress_history',
  session: 'active_workout_session',
  calendar: 'training_calendar',
  coach: 'coach_messages_local',
  coachLegacy: 'evoluafit-coach-messages',
  coachTts: 'evoluafit-coach-tts-enabled',
}

const DEMO_WORKOUT_IDS = new Set(['default-1', 'default-2', 'default-3'])
const DEMO_HISTORY_IDS = new Set(['hist-1', 'hist-2', 'hist-w1', 'hist-w2'])
const DEMO_GOAL_IDS = new Set(['goal-1', 'goal-2', 'goal-3', 'goal-4'])

const defaultProfile = {
  name: '',
  objective: '',
  level: '',
  daysPerWeek: 0,
  duration: 45,
  location: '',
  equipment: [],
  restrictions: [],
  weight: '',
  height: '',
  age: '',
}

function getDefaultData() {
  return {
    version: VERSION,
    profile: { ...defaultProfile },
    workouts: [],
    plans: [],
    history: [],
    goals: [],
    progressHistory: [],
    activeSession: null,
    calendarMirror: [],
    coachMessages: [],
    preferences: {
      coachTtsEnabled: true,
    },
  }
}

function stripDemoSeed(data) {
  const next = { ...data }
  let changed = false

  if (Array.isArray(next.workouts)) {
    const workouts = next.workouts.filter((w) => !DEMO_WORKOUT_IDS.has(w?.id))
    if (workouts.length !== next.workouts.length) {
      next.workouts = workouts
      changed = true
    }
  } else {
    next.workouts = []
    changed = true
  }

  if (Array.isArray(next.history)) {
    const history = next.history.filter(
      (h) => !DEMO_HISTORY_IDS.has(h?.id) && !DEMO_HISTORY_IDS.has(h?.workoutId),
    )
    if (history.length !== next.history.length) {
      next.history = history
      changed = true
    }
  } else {
    next.history = []
    changed = true
  }

  if (Array.isArray(next.goals)) {
    const goals = next.goals.filter((g) => !DEMO_GOAL_IDS.has(g?.id))
    if (goals.length !== next.goals.length) {
      next.goals = goals
      changed = true
    }
  } else {
    next.goals = []
    changed = true
  }

  const name = String(next.profile?.name || '').trim()
  if (!name || name.toLowerCase() === 'atleta') {
    next.profile = { ...defaultProfile, ...(next.profile || {}), name: name.toLowerCase() === 'atleta' ? '' : name }
    if (name.toLowerCase() === 'atleta') changed = true
  }

  next.version = VERSION
  return { data: next, changed }
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
    workouts: Array.isArray(data.workouts) ? data.workouts : [],
    plans: Array.isArray(data.plans) ? data.plans : [],
    history: Array.isArray(data.history) ? data.history : [],
    goals: Array.isArray(data.goals) ? data.goals : [],
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
      const migrated = stripDemoSeed(migrateToV2(defaults)).data
      saveRaw(migrated)
      syncLegacyMirrors(migrated)
      return migrated
    }

    const version = Number(raw.version) || 1
    const migrated = migrateToV2(raw)
    const stripped = stripDemoSeed(migrated)
    const next = stripped.data
    if (version < 3 || stripped.changed || !Array.isArray(raw.progressHistory)) {
      saveRaw(next)
      syncLegacyMirrors(next)
    }
    return next
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
          const migrated = stripDemoSeed(migrateToV2({ ...getDefaultData(), ...parsed })).data
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
