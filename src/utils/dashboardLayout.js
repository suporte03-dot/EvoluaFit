export const LAYOUT_VERSION = 2
export const LOCKED_WIDGET_ID = 'today-workout'

export const DEFAULT_PINNED = [
  { id: 'today-workout', size: 'large' },
  { id: 'streak', size: 'small' },
  { id: 'evolua-score', size: 'small' },
  { id: 'coach-insight', size: 'medium' },
]

export const DEFAULT_LIBRARY = ['weekly-goal', 'weekly-volume', 'adaptive-week', 'challenge', 'achievements']

export function createDefaultLayout() {
  return {
    version: LAYOUT_VERSION,
    presetId: 'default',
    focusMode: null,
    pinned: DEFAULT_PINNED.map((item) => ({ ...item })),
    library: [...DEFAULT_LIBRARY],
    hidden: [],
    suggestions: [],
  }
}

const PRESETS = {
  default: () => createDefaultLayout(),
  treino: () => ({
    ...createDefaultLayout(),
    presetId: 'treino',
    pinned: [
      { id: 'today-workout', size: 'large' },
      { id: 'adaptive-week', size: 'medium' },
      { id: 'streak', size: 'small' },
      { id: 'weekly-volume', size: 'small' },
    ],
    library: ['weekly-goal', 'evolua-score', 'coach-insight', 'challenge', 'achievements'],
  }),
  evolucao: () => ({
    ...createDefaultLayout(),
    presetId: 'evolucao',
    pinned: [
      { id: 'today-workout', size: 'large' },
      { id: 'evolua-score', size: 'small' },
      { id: 'weekly-volume', size: 'small' },
      { id: 'coach-insight', size: 'medium' },
    ],
    library: ['weekly-goal', 'streak', 'adaptive-week', 'challenge', 'achievements'],
  }),
  consistencia: () => ({
    ...createDefaultLayout(),
    presetId: 'consistencia',
    pinned: [
      { id: 'today-workout', size: 'large' },
      { id: 'streak', size: 'small' },
      { id: 'evolua-score', size: 'small' },
      { id: 'challenge', size: 'medium' },
    ],
    library: ['weekly-goal', 'weekly-volume', 'adaptive-week', 'coach-insight', 'achievements'],
  }),
}

export function layoutFromPreset(presetId) {
  const build = PRESETS[presetId] || PRESETS.default
  return build()
}

function uniqueIds(ids) {
  const seen = new Set()
  return ids.filter((id) => {
    if (!id || seen.has(id)) return false
    seen.add(id)
    return true
  })
}

export function normalizeSize(size, supported = ['small', 'medium', 'large']) {
  if (supported.includes(size)) return size
  return supported[0] || 'medium'
}

export function normalizeLayout(raw, registryIds = []) {
  const input = raw && typeof raw === 'object' ? raw : {}
  if ((Number(input.version) || 1) < 2 && (input.presetId === 'default' || !input.presetId)) {
    return createDefaultLayout()
  }

  const base = createDefaultLayout()
  const known = new Set(registryIds.length ? registryIds : [
    ...DEFAULT_PINNED.map((p) => p.id),
    ...DEFAULT_LIBRARY,
  ])

  const pinned = []
  const seen = new Set()
  ;(Array.isArray(input.pinned) ? input.pinned : base.pinned).forEach((item) => {
    const id = item?.id
    if (!id || seen.has(id) || !known.has(id)) return
    seen.add(id)
    pinned.push({
      id,
      size: item.size || 'medium',
    })
  })

  if (!pinned.some((item) => item.id === LOCKED_WIDGET_ID)) {
    pinned.unshift({ id: LOCKED_WIDGET_ID, size: 'large' })
  }

  const library = uniqueIds([
    ...(Array.isArray(input.library) ? input.library : []),
    ...base.library,
  ]).filter((id) => known.has(id) && !pinned.some((p) => p.id === id))

  const hidden = uniqueIds(Array.isArray(input.hidden) ? input.hidden : []).filter(
    (id) => known.has(id) && id !== LOCKED_WIDGET_ID && !pinned.some((p) => p.id === id) && !library.includes(id),
  )

  const leftover = [...known].filter(
    (id) => id !== LOCKED_WIDGET_ID && !pinned.some((p) => p.id === id) && !library.includes(id) && !hidden.includes(id),
  )

  return {
    version: LAYOUT_VERSION,
    presetId: input.presetId === 'custom' || PRESETS[input.presetId] ? input.presetId : 'custom',
    focusMode: input.focusMode ?? null,
    pinned,
    library: [...library, ...leftover],
    hidden,
    suggestions: Array.isArray(input.suggestions) ? input.suggestions : [],
  }
}

export function movePinned(layout, fromId, toId) {
  const pinned = [...layout.pinned]
  const from = pinned.findIndex((item) => item.id === fromId)
  const to = pinned.findIndex((item) => item.id === toId)
  if (from < 0 || to < 0 || from === to) return layout
  const [item] = pinned.splice(from, 1)
  pinned.splice(to, 0, item)
  return { ...layout, presetId: 'custom', pinned }
}

export function movePinnedBy(layout, id, delta) {
  const pinned = [...layout.pinned]
  const index = pinned.findIndex((item) => item.id === id)
  if (index < 0) return layout
  const next = Math.max(0, Math.min(pinned.length - 1, index + delta))
  if (next === index) return layout
  const [item] = pinned.splice(index, 1)
  pinned.splice(next, 0, item)
  return { ...layout, presetId: 'custom', pinned }
}

export function resizePinned(layout, id, size, supported) {
  return {
    ...layout,
    presetId: 'custom',
    pinned: layout.pinned.map((item) =>
      item.id === id ? { ...item, size: normalizeSize(size, supported) } : item,
    ),
  }
}

export function pinFromLibrary(layout, id, size = 'medium') {
  if (layout.pinned.some((item) => item.id === id)) return layout
  return {
    ...layout,
    presetId: 'custom',
    pinned: [...layout.pinned, { id, size }],
    library: layout.library.filter((item) => item !== id),
    hidden: layout.hidden.filter((item) => item !== id),
  }
}

export function unpinToLibrary(layout, id) {
  if (id === LOCKED_WIDGET_ID) return layout
  const current = layout.pinned.find((item) => item.id === id)
  if (!current) return layout
  return {
    ...layout,
    presetId: 'custom',
    pinned: layout.pinned.filter((item) => item.id !== id),
    library: uniqueIds([...layout.library, id]),
    hidden: layout.hidden.filter((item) => item !== id),
  }
}

export function hideWidget(layout, id) {
  if (id === LOCKED_WIDGET_ID) return layout
  return {
    ...layout,
    presetId: 'custom',
    pinned: layout.pinned.filter((item) => item.id !== id),
    library: layout.library.filter((item) => item !== id),
    hidden: uniqueIds([...layout.hidden, id]),
  }
}

export function restoreHidden(layout, id) {
  if (!layout.hidden.includes(id)) return layout
  return {
    ...layout,
    presetId: 'custom',
    hidden: layout.hidden.filter((item) => item !== id),
    library: uniqueIds([...layout.library, id]),
  }
}
