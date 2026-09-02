import { useEffect, useState } from 'react'
import { EvoluaPulseRing } from '../branding/EvoluaPulse'

function useCountUp(target, enabled) {
  const end = Math.max(0, Number(target) || 0)
  const [value, setValue] = useState(enabled ? 0 : end)

  useEffect(() => {
    if (!enabled) {
      setValue(end)
      return undefined
    }
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches
    if (reduce) {
      setValue(end)
      return undefined
    }
    let frame = 0
    const start = performance.now()
    const tick = (now) => {
      const t = Math.min(1, (now - start) / 280)
      setValue(Math.round(end * t))
      if (t < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [end, enabled])

  return value
}

export default function EvoluaScoreCard({ score, volumeDelta }) {
  const shown = useCountUp(score?.value ?? 0, Boolean(score))

  if (!score) {
    return (
      <div className="score-sig score-sig--empty">
        <p className="score-sig__kicker">Evolua Score</p>
        <p className="score-sig__empty">Complete os primeiros treinos para liberar o indicador.</p>
      </div>
    )
  }

  const delta =
    volumeDelta?.percent != null && volumeDelta.percent !== 0
      ? `${volumeDelta.percent > 0 ? '↑ +' : '↓ '}${Math.abs(volumeDelta.percent)}% esta semana`
      : null

  return (
    <div className="score-sig" aria-label={`Evolua Score ${score.value}. ${score.band || ''}`}>
      <div className="score-sig__ring">
        <EvoluaPulseRing value={score.value} />
        <strong className="score-sig__value">{shown}</strong>
      </div>
      <div className="score-sig__copy">
        <p className="score-sig__kicker">Evolua Score</p>
        {score.band ? <p className="score-sig__band">{score.band}</p> : null}
        {delta ? <p className="score-sig__delta">{delta}</p> : null}
      </div>
    </div>
  )
}
