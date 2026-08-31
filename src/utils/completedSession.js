const COMPLETED = new Set(['completed', 'realizado', 'done'])
const CANCELLED = new Set(['cancelled', 'canceled', 'cancelado', 'aborted'])

export function isCancelledSession(entry) {
  if (!entry) return false
  return CANCELLED.has(String(entry.status || '').toLowerCase())
}

export function isCompletedSession(entry) {
  if (!entry) return false
  const status = String(entry.status || '').toLowerCase()
  if (CANCELLED.has(status)) return false
  if (COMPLETED.has(status)) return true
  if (!status && (entry.completedAt || entry.completed_at)) return true
  return false
}
