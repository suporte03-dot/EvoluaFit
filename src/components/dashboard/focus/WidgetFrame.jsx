import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { LOCKED_WIDGET_ID } from '../../../utils/dashboardLayout'
import { getWidget } from '../widgets/widgetRegistry'

const SIZE_LABEL = { small: 'S', medium: 'M', large: 'L' }

export default function WidgetFrame({
  id,
  size,
  variant = 'card',
  customizing,
  children,
  onUnpin,
  onHide,
  onResize,
  onMoveBy,
  isMobile,
}) {
  const def = getWidget(id)
  const locked = def?.locked || id === LOCKED_WIDGET_ID
  const supported = def?.supportedSizes || ['medium']
  const sortable = useSortable({ id, disabled: !customizing || isMobile })
  const style = {
    transform: CSS.Transform.toString(sortable.transform),
    transition: sortable.transition || 'transform 180ms ease, box-shadow 180ms ease',
    zIndex: sortable.isDragging ? 4 : undefined,
  }

  const cycleSize = () => {
    const index = Math.max(0, supported.indexOf(size))
    const next = supported[(index + 1) % supported.length]
    onResize?.(id, next, supported)
  }

  return (
    <article
      ref={sortable.setNodeRef}
      style={style}
      className={`focus-cell focus-cell--${size} focus-cell--${variant}${customizing ? ' is-editing' : ''}${
        sortable.isDragging ? ' is-dragging' : ''
      }`}
      aria-label={def?.title || id}
    >
      {customizing ? (
        <div className="focus-cell__toolbar">
          <button
            type="button"
            className="focus-cell__handle"
            aria-label={`Mover ${def?.title || 'widget'}`}
            {...sortable.attributes}
            {...sortable.listeners}
          >
            ⋮⋮
          </button>
          {isMobile ? (
            <>
              <button type="button" aria-label="Mover para cima" onClick={() => onMoveBy?.(id, -1)}>
                ↑
              </button>
              <button type="button" aria-label="Mover para baixo" onClick={() => onMoveBy?.(id, 1)}>
                ↓
              </button>
            </>
          ) : null}
          {supported.length > 1 ? (
            <button type="button" aria-label="Alterar tamanho" onClick={cycleSize}>
              {SIZE_LABEL[size] || size}
            </button>
          ) : null}
          {!locked ? (
            <>
              <button type="button" aria-label="Enviar para a biblioteca" onClick={() => onUnpin?.(id)}>
                −
              </button>
              <button type="button" aria-label="Ocultar widget" onClick={() => onHide?.(id)}>
                ×
              </button>
            </>
          ) : (
            <span className="focus-cell__lock">Fixado</span>
          )}
        </div>
      ) : null}
      <div className="focus-cell__body">{children}</div>
    </article>
  )
}
