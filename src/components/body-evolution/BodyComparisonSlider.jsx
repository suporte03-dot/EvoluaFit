import { useEffect, useId, useRef, useState } from 'react'

export default function BodyComparisonSlider({
  beforeUrl,
  afterUrl,
  beforeLabel = 'Antes',
  afterLabel = 'Agora',
}) {
  const sliderId = useId()
  const stageRef = useRef(null)
  const [mode, setMode] = useState('slider')
  const [value, setValue] = useState(50)
  const [stageWidth, setStageWidth] = useState(0)

  useEffect(() => {
    const node = stageRef.current
    if (!node || typeof ResizeObserver === 'undefined') return undefined
    const observer = new ResizeObserver(() => setStageWidth(node.clientWidth))
    observer.observe(node)
    setStageWidth(node.clientWidth)
    return () => observer.disconnect()
  }, [mode, beforeUrl, afterUrl])

  if (!beforeUrl || !afterUrl) {
    return (
      <p className="body-compare__empty">
        Continue registrando sua evolução para visualizar comparações.
      </p>
    )
  }

  return (
    <div className="body-compare">
      <div className="body-compare__modes" role="group" aria-label="Modo de comparação">
        <button
          type="button"
          className={mode === 'slider' ? 'is-active' : ''}
          onClick={() => setMode('slider')}
        >
          Slider
        </button>
        <button
          type="button"
          className={mode === 'side' ? 'is-active' : ''}
          onClick={() => setMode('side')}
        >
          Lado a lado
        </button>
      </div>

      {mode === 'side' ? (
        <div className="body-compare__side">
          <figure>
            <img src={beforeUrl} alt={`Foto ${beforeLabel}`} />
            <figcaption>{beforeLabel}</figcaption>
          </figure>
          <figure>
            <img src={afterUrl} alt={`Foto ${afterLabel}`} />
            <figcaption>{afterLabel}</figcaption>
          </figure>
        </div>
      ) : (
        <div className="body-compare__stage" ref={stageRef}>
          <img src={afterUrl} alt={`Foto ${afterLabel}`} className="body-compare__base" />
          <div className="body-compare__clip" style={{ width: `${value}%` }}>
            <img
              src={beforeUrl}
              alt={`Foto ${beforeLabel}`}
              style={stageWidth ? { width: `${stageWidth}px` } : undefined}
            />
          </div>
          <div className="body-compare__labels" aria-hidden="true">
            <span>{beforeLabel}</span>
            <span>{afterLabel}</span>
          </div>
          <label className="body-compare__slider" htmlFor={sliderId}>
            <span className="visually-hidden">Comparar {beforeLabel} e {afterLabel}</span>
            <input
              id={sliderId}
              type="range"
              min="0"
              max="100"
              value={value}
              onChange={(event) => setValue(Number(event.target.value))}
            />
          </label>
        </div>
      )}
    </div>
  )
}
