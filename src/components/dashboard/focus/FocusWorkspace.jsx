import { useEffect, useMemo, useState } from 'react'
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { SortableContext, rectSortingStrategy, sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { greetingParts } from '../dashboardUtils'
import { greetingLine, resolveDisplayName } from '../../../utils/displayName'
import { getWidget } from '../widgets/widgetRegistry'
import { LOCKED_WIDGET_ID, normalizeSize } from '../../../utils/dashboardLayout'
import { useAuth } from '../../../context/AuthContext'
import { useProfile } from '../../../context/ProfileContext'
import WidgetFrame from './WidgetFrame'
import WidgetLibraryDrawer from './WidgetLibraryDrawer'
import CustomizeBar from './CustomizeBar'
import DashboardFirstHint, { hasSeenFocusHint } from './DashboardFirstHint'

function useIsMobile() {
  const [mobile, setMobile] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia('(max-width: 767px)').matches : false,
  )
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)')
    const onChange = () => setMobile(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])
  return mobile
}

function WidgetBody({ id, ctx }) {
  const def = getWidget(id)
  if (!def?.Component) return null
  const Component = def.Component
  const mapped = def.mapProps ? def.mapProps(ctx) : null
  return <Component {...ctx} {...(mapped || {})} />
}

export default function FocusWorkspace({ profile, metrics, widgetCtx, layoutApi }) {
  const { user } = useAuth()
  const { profile: cloudProfile } = useProfile()
  const isMobile = useIsMobile()
  const [hint, setHint] = useState(() => !hasSeenFocusHint())
  const { hello } = greetingParts()
  const name = resolveDisplayName({
    cloudName: cloudProfile?.full_name,
    localName: profile?.name || metrics?.profileName,
    metaName: user?.user_metadata?.full_name,
  })
  const {
    layout,
    customizing,
    libraryOpen,
    setLibraryOpen,
    saving,
    beginCustomize,
    cancelCustomize,
    saveCustomize,
    resetLayout,
    pin,
    unpin,
    hide,
    restore,
    move,
    moveBy,
    resize,
  } = layoutApi

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const { hero, signals, extras } = useMemo(() => {
    const heroItem = layout.pinned.find((item) => item.id === LOCKED_WIDGET_ID) || {
      id: LOCKED_WIDGET_ID,
      size: 'large',
    }
    const rest = layout.pinned.filter((item) => {
      if (item.id === LOCKED_WIDGET_ID) return false
      if (!customizing && item.id === 'weekly-goal') return false
      return true
    })
    return {
      hero: heroItem,
      signals: rest.filter((item) => getWidget(item.id)?.presentation === 'signal'),
      extras: rest.filter((item) => getWidget(item.id)?.presentation !== 'signal'),
    }
  }, [layout.pinned, customizing])

  const sortableIds = useMemo(
    () => [...signals, ...extras].map((item) => item.id),
    [signals, extras],
  )

  const onDragEnd = (event) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    move(String(active.id), String(over.id))
  }

  const renderFrame = (item, variant) => {
    const def = getWidget(item.id)
    const size = normalizeSize(item.size, def?.supportedSizes)
    return (
      <WidgetFrame
        key={item.id}
        id={item.id}
        size={size}
        variant={variant}
        customizing={customizing}
        isMobile={isMobile}
        onUnpin={unpin}
        onHide={hide}
        onResize={resize}
        onMoveBy={moveBy}
      >
        <WidgetBody id={item.id} ctx={widgetCtx} />
      </WidgetFrame>
    )
  }

  return (
    <section id="inicio" className="dash-home dash-home--hoje focus-workspace" aria-label="Área de Foco">
      <div className="dash-home__inner">
        <header className="focus-chrome">
          <p className="focus-chrome__hello">{greetingLine(hello, name)}</p>
          <CustomizeBar
            customizing={customizing}
            saving={saving}
            onStart={beginCustomize}
            onSave={saveCustomize}
            onCancel={cancelCustomize}
            onReset={resetLayout}
            onOpenLibrary={() => setLibraryOpen(true)}
          />
        </header>

        {hint ? (
          <DashboardFirstHint
            onCustomize={() => {
              setHint(false)
              beginCustomize()
            }}
            onKeep={() => setHint(false)}
          />
        ) : null}

        <WidgetBody id={hero.id} ctx={widgetCtx} />

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={sortableIds} strategy={rectSortingStrategy}>
            {signals.length ? (
              <div className={`focus-signals${customizing ? ' is-editing' : ''}`}>
                {signals.map((item) => renderFrame(item, 'signal'))}
              </div>
            ) : null}
            {extras.length ? (
              <div className="focus-grid">
                {extras.map((item) => renderFrame(item, 'card'))}
              </div>
            ) : null}
          </SortableContext>
        </DndContext>

        {!signals.length && !extras.length && customizing ? (
          <div className="focus-empty">
            <h3>Seu espaço. Seu foco.</h3>
            <p>Escolha os indicadores mais importantes para você.</p>
            <button
              type="button"
              className="fit-hero__cta"
              onClick={() => {
                beginCustomize()
                setLibraryOpen(true)
              }}
            >
              + Adicionar widget
            </button>
          </div>
        ) : null}

        {libraryOpen ? (
          <WidgetLibraryDrawer
            open={libraryOpen}
            layout={layout}
            onClose={() => setLibraryOpen(false)}
            onPin={pin}
            onRestore={restore}
          />
        ) : null}
      </div>
    </section>
  )
}
