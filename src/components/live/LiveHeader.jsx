import { IconClose, IconMore } from '../dashboard/icons'
import { formatClock } from '../../utils/liveWorkout/volume.js'

export default function LiveHeader({ elapsedSec, syncLabel, syncTone, onExit, onMore }) {
  return (
    <header className="live-header">
      <button type="button" className="live-icon-btn" onClick={onExit} aria-label="Sair do treino">
        <IconClose size={22} />
      </button>
      <div className="live-header__center">
        <span className="live-badge">
          <span className="live-badge__dot" aria-hidden="true" />
          AO VIVO
        </span>
        <span className="live-header__clock" role="timer" aria-label={`Tempo de treino ${formatClock(elapsedSec)}`}>
          {formatClock(elapsedSec)}
        </span>
        {syncLabel ? (
          <span className={`live-header__sync live-header__sync--${syncTone}`} role="status" aria-live="polite">
            {syncLabel}
          </span>
        ) : null}
      </div>
      <button type="button" className="live-icon-btn" onClick={onMore} aria-label="Mais opções">
        <IconMore size={22} />
      </button>
    </header>
  )
}
