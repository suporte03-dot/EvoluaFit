import { DEFAULT_UPPER_INCREMENT_KG, clampUpperIncrement } from './loadSuggestion.js'
import { DEFAULT_REST_SECONDS } from './restTimer.js'

const KEY = 'evoluafit-live-settings'

export const LIVE_DEFAULTS = {
  restSeconds: DEFAULT_REST_SECONDS,
  upperIncrementKg: DEFAULT_UPPER_INCREMENT_KG,
  sound: false,
}

export function loadLiveSettings() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || '{}')
    return {
      restSeconds: Math.min(300, Math.max(30, Number(saved.restSeconds) || LIVE_DEFAULTS.restSeconds)),
      upperIncrementKg: clampUpperIncrement(saved.upperIncrementKg ?? LIVE_DEFAULTS.upperIncrementKg),
      sound: Boolean(saved.sound),
    }
  } catch {
    return { ...LIVE_DEFAULTS }
  }
}

export function saveLiveSettings(settings) {
  try {
    localStorage.setItem(KEY, JSON.stringify(settings))
  } catch {
    /* storage cheio ou bloqueado: mantém só em memória */
  }
}
