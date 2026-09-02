const enabled = import.meta.env.DEV

export function trackDashboardEvent(name, payload = {}) {
  if (!name) return
  if (enabled && typeof console !== 'undefined') {
    console.debug('[dashboard]', name, payload)
  }
}
