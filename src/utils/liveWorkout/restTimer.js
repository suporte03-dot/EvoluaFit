/**
 * Descanso calculado por timestamp de término, não por contador decrementado:
 * continua correto com a aba em segundo plano ou a tela bloqueada.
 */

export const DEFAULT_REST_SECONDS = 90

export function startRest(durationSec, now = Date.now()) {
  const duration = Math.max(1, Math.round(Number(durationSec) || DEFAULT_REST_SECONDS))
  return { startedAt: now, endsAt: now + duration * 1000, durationSec: duration }
}

export function remainingSeconds(rest, now = Date.now()) {
  if (!rest) return 0
  return Math.max(0, Math.ceil((rest.endsAt - now) / 1000))
}

export function isRestDone(rest, now = Date.now()) {
  return !rest || now >= rest.endsAt
}

export function extendRest(rest, seconds, now = Date.now()) {
  if (!rest) return startRest(seconds, now)
  const base = Math.max(rest.endsAt, now)
  return {
    ...rest,
    endsAt: base + seconds * 1000,
    durationSec: rest.durationSec + seconds,
  }
}

/** Fração já decorrida (0 → 1) para o anel de progresso. */
export function restProgress(rest, now = Date.now()) {
  if (!rest) return 1
  const total = rest.endsAt - rest.startedAt
  if (total <= 0) return 1
  return Math.min(1, Math.max(0, (now - rest.startedAt) / total))
}

export function resolveRestSeconds(exercise, fallbackSec = DEFAULT_REST_SECONDS) {
  const own = Number(exercise?.restSeconds)
  if (Number.isFinite(own) && own > 0) return Math.round(own)
  const parsed = parseInt(String(exercise?.rest || '').match(/\d+/)?.[0] || '', 10)
  if (parsed > 0) return /min/i.test(String(exercise.rest)) ? parsed * 60 : parsed
  return fallbackSec
}
