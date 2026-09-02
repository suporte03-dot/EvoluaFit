import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { WIDGET_IDS } from '../components/dashboard/widgets/widgetRegistry'
import {
  createDefaultLayout,
  hideWidget,
  layoutFromPreset,
  movePinned,
  movePinnedBy,
  normalizeLayout,
  pinFromLibrary,
  resizePinned,
  restoreHidden,
  unpinToLibrary,
} from '../utils/dashboardLayout'
import { trackDashboardEvent } from '../utils/dashboardEvents'
import { fetchDashboardLayout, saveDashboardLayout } from '../services/dashboardLayoutService'

export function useDashboardLayout() {
  const { user } = useAuth()
  const userId = user?.id || null
  const [layout, setLayout] = useState(() => createDefaultLayout())
  const [draft, setDraft] = useState(null)
  const [customizing, setCustomizing] = useState(false)
  const [libraryOpen, setLibraryOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [source, setSource] = useState('default')

  const active = draft || layout

  useEffect(() => {
    let alive = true
    fetchDashboardLayout(userId, WIDGET_IDS).then((result) => {
      if (!alive) return
      setLayout(result.data)
      setSource(result.source)
    })
    return () => {
      alive = false
    }
  }, [userId])

  const beginCustomize = useCallback(() => {
    setDraft(normalizeLayout(layout, WIDGET_IDS))
    setCustomizing(true)
    setLibraryOpen(false)
    trackDashboardEvent('dashboard_customize_open')
  }, [layout])

  const cancelCustomize = useCallback(() => {
    setDraft(null)
    setCustomizing(false)
    setLibraryOpen(false)
  }, [])

  const persist = useCallback(
    async (next) => {
      setSaving(true)
      const result = await saveDashboardLayout(userId, next, WIDGET_IDS)
      setLayout(result.data)
      setSource(result.source)
      setSaving(false)
      return result
    },
    [userId],
  )

  const saveCustomize = useCallback(async () => {
    const next = normalizeLayout(draft || layout, WIDGET_IDS)
    await persist(next)
    setDraft(null)
    setCustomizing(false)
    setLibraryOpen(false)
  }, [draft, layout, persist])

  const resetLayout = useCallback(async () => {
    const next = layoutFromPreset('default')
    if (customizing) {
      setDraft(next)
      return
    }
    await persist(next)
    trackDashboardEvent('dashboard_reset')
  }, [customizing, persist])

  const patch = useCallback(
    (updater, eventName, payload) => {
      if (eventName) trackDashboardEvent(eventName, payload)
      if (customizing) {
        setDraft((current) => updater(current || layout))
        return
      }
      setLayout((current) => {
        const next = updater(current)
        persist(next)
        return next
      })
    },
    [customizing, layout, persist],
  )

  const actions = useMemo(
    () => ({
      pin: (id, size) => patch((l) => pinFromLibrary(l, id, size), 'widget_add', { id }),
      unpin: (id) => patch((l) => unpinToLibrary(l, id), 'widget_remove', { id }),
      hide: (id) => patch((l) => hideWidget(l, id), 'widget_remove', { id, hidden: true }),
      restore: (id) => patch((l) => restoreHidden(l, id), 'widget_add', { id, restored: true }),
      move: (fromId, toId) => patch((l) => movePinned(l, fromId, toId), 'widget_move', { fromId, toId }),
      moveBy: (id, delta) => patch((l) => movePinnedBy(l, id, delta), 'widget_move', { id, delta }),
      resize: (id, size, supported) =>
        patch((l) => resizePinned(l, id, size, supported), 'widget_resize', { id, size }),
    }),
    [patch],
  )

  return {
    layout: active,
    savedLayout: layout,
    source,
    customizing,
    libraryOpen,
    setLibraryOpen,
    saving,
    beginCustomize,
    cancelCustomize,
    saveCustomize,
    resetLayout,
    ...actions,
  }
}
