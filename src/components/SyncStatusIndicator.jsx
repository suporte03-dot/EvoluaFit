import { useSync } from '../context/SyncContext'

export default function SyncStatusIndicator() {
  const { syncStatus, pendingCount, syncError, isLikelyOnline, syncNow, conflictWarning } = useSync()

  let tone = 'ok'
  let label = 'Tudo sincronizado'
  let showRetry = false

  if (syncStatus === 'syncing') {
    tone = 'syncing'
    label = 'Sincronizando...'
  } else if (syncStatus === 'offline' || !isLikelyOnline) {
    tone = 'offline'
    label =
      pendingCount > 0
        ? `Sem conexão · ${pendingCount} pendente${pendingCount === 1 ? '' : 's'}`
        : 'Sem conexão'
  } else if (syncStatus === 'error') {
    tone = 'error'
    label = 'Não foi possível sincronizar. Tente novamente.'
    showRetry = true
  } else if (syncStatus === 'pending' || pendingCount > 0) {
    tone = 'pending'
    label = `${pendingCount} altera${pendingCount === 1 ? 'ção' : 'ções'} pendente${pendingCount === 1 ? '' : 's'}`
  }

  const hideOnMobileWhenIdle = tone === 'ok'

  return (
    <div
      className={`sync-indicator sync-indicator--${tone}${
        hideOnMobileWhenIdle ? ' sync-indicator--idle' : ''
      }`}
      role="status"
      aria-live="polite"
    >
      <span className="sync-indicator__dot" aria-hidden="true" />
      <span className="sync-indicator__label">{label}</span>
      {conflictWarning ? <span className="sync-indicator__warn">{conflictWarning}</span> : null}
      {showRetry ? (
        <button type="button" className="sync-indicator__retry" onClick={() => syncNow()}>
          Tentar novamente
        </button>
      ) : null}
    </div>
  )
}
