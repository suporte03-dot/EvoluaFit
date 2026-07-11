import { useEffect, useRef, useState } from 'react'

const FALLBACK_SVG = `${import.meta.env.BASE_URL}media/exercises/fallback.svg`

function ExercisePlaceholder({ name, compact = false }) {
  return (
    <div className={`exercise-media__placeholder${compact ? ' exercise-media__placeholder--compact' : ''}`}>
      <div className="exercise-media__placeholder-icon" aria-hidden="true">
        <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="24" cy="14" r="6" stroke="currentColor" strokeWidth="2" />
          <path d="M12 38c0-6.627 5.373-12 12-12s12 5.373 12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M18 22l-4 8M30 22l4 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>
      <p className="exercise-media__placeholder-text">Demonstração em breve</p>
      {name && <span className="exercise-media__placeholder-name">{name}</span>}
    </div>
  )
}

export default function ExerciseMedia({
  exercise,
  className = '',
  aspectRatio = '16/9',
  lazy = true,
  compact = false,
  showPlaceholderName = true,
}) {
  const containerRef = useRef(null)
  const [inView, setInView] = useState(!lazy)
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    if (!lazy) return undefined
    const el = containerRef.current
    if (!el) return undefined

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          observer.disconnect()
        }
      },
      { rootMargin: '120px' },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [lazy])

  useEffect(() => {
    setStatus('loading')
  }, [exercise?.id, exercise?.mediaUrl])

  if (!exercise) return null

  const ratioClass = aspectRatio === '4/3' ? 'exercise-media--4-3' : 'exercise-media--16-9'
  const showMedia = inView && status !== 'error'
  const showSkeleton = inView && status === 'loading'

  return (
    <div
      ref={containerRef}
      className={`exercise-media ${ratioClass} ${className}`.trim()}
      style={{ aspectRatio }}
    >
      {showSkeleton && <div className="exercise-media__skeleton" aria-hidden="true" />}

      {showMedia && exercise.mediaType === 'video' && (
        <video
          className="exercise-media__video"
          src={exercise.mediaUrl}
          poster={exercise.thumbnail}
          autoPlay
          loop
          muted
          playsInline
          preload={lazy ? 'metadata' : 'auto'}
          onLoadedData={() => setStatus('loaded')}
          onError={() => setStatus('error')}
        />
      )}

      {showMedia && exercise.mediaType === 'gif' && (
        <img
          className="exercise-media__image"
          src={exercise.mediaUrl}
          alt={`Demonstração: ${exercise.name}`}
          loading="lazy"
          onLoad={() => setStatus('loaded')}
          onError={() => setStatus('error')}
        />
      )}

      {(!inView || status === 'error') && (
        status === 'error' ? (
          <ExercisePlaceholder name={showPlaceholderName ? exercise.name : null} compact={compact} />
        ) : (
          <img
            className="exercise-media__thumb"
            src={exercise.thumbnail}
            alt=""
            loading="lazy"
            onError={(e) => {
              e.currentTarget.src = FALLBACK_SVG
            }}
          />
        )
      )}
    </div>
  )
}
