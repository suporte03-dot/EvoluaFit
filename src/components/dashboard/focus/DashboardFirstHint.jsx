const HINT_KEY = 'evoluafit-focus-hint'

export function hasSeenFocusHint() {
  try {
    return localStorage.getItem(HINT_KEY) === '1'
  } catch {
    return true
  }
}

export function markFocusHintSeen() {
  try {
    localStorage.setItem(HINT_KEY, '1')
  } catch {
    /* ignore */
  }
}

export default function DashboardFirstHint({ onCustomize, onKeep }) {
  const finish = (customize) => {
    markFocusHintSeen()
    if (customize) onCustomize?.()
    else onKeep?.()
  }

  return (
    <div className="focus-hint" role="dialog" aria-labelledby="focus-hint-title" aria-modal="true">
      <div className="focus-hint__card">
        <p className="hoje-card__kicker">Área de Foco</p>
        <h2 id="focus-hint-title">Seu painel. Do seu jeito.</h2>
        <p>Organize o EvoluaFit de acordo com o que importa para sua evolução.</p>
        <div className="focus-hint__actions">
          <button type="button" className="dash-hero__cta" onClick={() => finish(true)}>
            Personalizar agora
          </button>
          <button type="button" className="dash-hero__more" onClick={() => finish(false)}>
            Manter padrão
          </button>
        </div>
      </div>
    </div>
  )
}
