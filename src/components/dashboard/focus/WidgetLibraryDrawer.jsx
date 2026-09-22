import { createPortal } from 'react-dom'
import { widgetsByCategory } from '../widgets/widgetRegistry'
import { IconClose } from '../icons'

export default function WidgetLibraryDrawer({ open, layout, onClose, onPin, onRestore }) {
  if (!open) return null
  const libraryGroups = widgetsByCategory(layout.library)
  const hidden = widgetsByCategory(layout.hidden)

  const drawer = (
    <div className="focus-library-layer" role="presentation">
      <button type="button" className="focus-library-scrim" aria-label="Fechar biblioteca" onClick={onClose} />
      <aside className="focus-library" aria-label="Meus widgets">
        <header className="focus-library__head">
          <div>
            <p className="hoje-card__kicker">Biblioteca</p>
            <h2>Meus widgets</h2>
          </div>
          <button type="button" className="focus-library__close" onClick={onClose} title="Fechar" aria-label="Fechar biblioteca">
            <IconClose size={16} />
          </button>
        </header>
        <p className="focus-library__hint">Toque para adicionar à Área de Foco.</p>
        {libraryGroups.map((group) => (
          <section key={group.id}>
            <h3>{group.label}</h3>
            <ul>
              {group.items.map((item) => (
                <li key={item.id}>
                  <button type="button" onClick={() => onPin(item.id, item.defaultSize)}>
                    {item.title}
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ))}
        {hidden.length ? (
          <section>
            <h3>Ocultos</h3>
            <ul>
              {hidden.flatMap((group) =>
                group.items.map((item) => (
                  <li key={item.id}>
                    <button type="button" onClick={() => onRestore(item.id)}>
                      Reativar {item.title}
                    </button>
                  </li>
                )),
              )}
            </ul>
          </section>
        ) : null}
        {!layout.library.length && !layout.hidden.length ? (
          <p className="hoje-card__note">Todos os widgets estão na Área de Foco.</p>
        ) : null}
      </aside>
    </div>
  )

  if (typeof document === 'undefined') return drawer
  return createPortal(drawer, document.body)
}
