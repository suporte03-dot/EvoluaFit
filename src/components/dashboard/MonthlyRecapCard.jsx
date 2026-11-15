import { useMemo, useState } from 'react'
import {
  buildMonthlyRecap,
  drawMonthlyRecapCanvas,
  monthlyRecapShareMessage,
  monthlyRecapToBlob,
} from '../../utils/monthlyRecap'
import { sharePlainText } from '../../utils/shareWorkout'

export default function MonthlyRecapCard({ history, summaries, displayName }) {
  const recap = useMemo(
    () => buildMonthlyRecap({ history, summaries }),
    [history, summaries],
  )
  const [busy, setBusy] = useState(false)
  const [flash, setFlash] = useState('')

  const shareImage = async () => {
    setBusy(true)
    setFlash('')
    try {
      const blob = await monthlyRecapToBlob(recap, { displayName })
      const text = monthlyRecapShareMessage(recap)
      if (blob && typeof navigator !== 'undefined' && navigator.share && navigator.canShare) {
        const file = new File([blob], `evoluafit-${recap.year}-${recap.month + 1}.png`, {
          type: 'image/png',
        })
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file], title: 'Retrospectiva EvoluaFit', text })
          setFlash('Retrospectiva compartilhada.')
          return
        }
      }
      if (blob) {
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `evoluafit-retrospectiva-${recap.month + 1}-${recap.year}.png`
        link.click()
        URL.revokeObjectURL(url)
        setFlash('Imagem baixada. Agora você pode enviar no WhatsApp.')
      }
      await sharePlainText(text, 'Retrospectiva EvoluaFit')
    } catch (error) {
      if (error?.name !== 'AbortError') {
        await sharePlainText(monthlyRecapShareMessage(recap), 'Retrospectiva EvoluaFit')
      }
    } finally {
      setBusy(false)
      window.setTimeout(() => setFlash(''), 3200)
    }
  }

  const preview = () => {
    const canvas = drawMonthlyRecapCanvas(recap, { displayName })
    if (!canvas) return
    const url = canvas.toDataURL('image/png')
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="monthly-recap">
      <p className="hoje-card__kicker">Retrospectiva</p>
      <h3 className="hoje-card__title">{recap.headline}</h3>
      <p className="monthly-recap__body">
        Gere uma imagem do mês para compartilhar no WhatsApp — só com números reais do seu histórico.
      </p>
      <dl className="monthly-recap__stats">
        <div>
          <dt>Volume</dt>
          <dd>{recap.volumeKg.toLocaleString('pt-BR')} kg</dd>
        </div>
        <div>
          <dt>Tempo</dt>
          <dd>{recap.durationMinutes} min</dd>
        </div>
        <div>
          <dt>Séries</dt>
          <dd>{recap.sets}</dd>
        </div>
        <div>
          <dt>PRs</dt>
          <dd>{recap.prCount}</dd>
        </div>
      </dl>
      {recap.topGroups.length ? (
        <p className="monthly-recap__focus">Foco: {recap.topGroups.join(', ')}</p>
      ) : null}
      <div className="monthly-recap__actions">
        <button type="button" className="btn btn--primary" onClick={shareImage} disabled={busy}>
          {busy ? 'Preparando…' : 'Compartilhar retrospectiva'}
        </button>
        <button type="button" className="btn btn--ghost" onClick={preview} disabled={busy}>
          Ver imagem
        </button>
      </div>
      {flash ? (
        <p className="monthly-recap__flash" role="status">
          {flash}
        </p>
      ) : null}
    </div>
  )
}
