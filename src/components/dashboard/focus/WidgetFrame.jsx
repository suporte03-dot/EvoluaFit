import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { LOCKED_WIDGET_ID } from '../../../utils/dashboardLayout'
import { getWidget } from '../widgets/widgetRegistry'
import { IconChevron, IconClose, IconGrip, IconMinimize, IconSize } from '../icons'

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

  const title = def?.title || 'widget'

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
            title="Mover"
            aria-label={`Mover ${title}`}
            {...sortable.attributes}
            {...sortable.listeners}
          >
            <IconGrip size={14} />
          </button>
          {isMobile ? (
            <>
              <button
                type="button"
                title="Mover para cima"
                aria-label="Mover para cima"
                onClick={() => onMoveBy?.(id, -1)}
              >
                <IconChevron size={14} style={{ transform: 'rotate(-90deg)' }} />
              </button>
              <button
                type="button"
                title="Mover para baixo"
                aria-label="Mover para baixo"
                onClick={() => onMoveBy?.(id, 1)}
              >
                <IconChevron size={14} style={{ transform: 'rotate(90deg)' }} />
              </button>
            </>
          ) : null}
          {supported.length > 1 ? (
            <button type="button" title="Tamanho" aria-label={`Alterar tamanho de ${title}`} onClick={cycleSize}>
              <IconSize size={14} />
            </button>
          ) : null}
          {!locked ? (
            <>
              <button
                type="button"
                title="Minimizar"
                aria-label={`Minimizar ${title}`}
                onClick={() => onUnpin?.(id)}
              >
                <IconMinimize size={14} />
              </button>
              <button type="button" title="Remover" aria-label={`Remover ${title}`} onClick={() => onHide?.(id)}>
                <IconClose size={14} />
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
