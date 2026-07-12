import { useEffect, useMemo, useRef, useState } from 'react'

const GENERIC_FALLBACK = `${import.meta.env.BASE_URL}media/exercises/fallback.svg`

function buildMediaSources(exercise) {
  if (!exercise) return []

  const sources = []
  const pushUnique = (kind, src) => {
    if (!src || sources.some((s) => s.src === src)) return
    sources.push({ kind, src })
  }

  pushUnique('video', exercise.video)
  pushUnique('gif', exercise.gif)
  pushUnique('image', exercise.image)
  pushUnique('image', exercise.thumbnail)
  if (exercise.mediaType === 'video') pushUnique('video', exercise.mediaUrl)
  else if (exercise.mediaType === 'gif') pushUnique('gif', exercise.mediaUrl)
  else pushUnique('image', exercise.mediaUrl)
  pushUnique('image', exercise.fallbackImage)
  pushUnique('image', exercise.fallbackSvg)
  pushUnique('image', GENERIC_FALLBACK)

  return sources
}

export default function ExerciseMedia({
  exercise,
  className = '',
  aspectRatio = '16/9',
  lazy = true,
  compact = false,
}) {
  const containerRef = useRef(null)
  const [inView, setInView] = useState(!lazy)
  const [sourceIndex, setSourceIndex] = useState(0)
  const [status, setStatus] = useState('loading')

  const sources = useMemo(() => buildMediaSources(exercise), [exercise])
  const current = sources[sourceIndex] ?? sources[sources.length - 1]

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
    setSourceIndex(0)
    setStatus('loading')
  }, [exercise?.id])

  const handleError = () => {
    if (sourceIndex < sources.length - 1) {
      setSourceIndex((i) => i + 1)
      setStatus('loading')
      return
    }
    setStatus('error')
  }

  if (!exercise || !current) return null

  const ratioClass = aspectRatio === '4/3' ? 'exercise-media--4-3' : 'exercise-media--16-9'
  const showSkeleton = inView && status === 'loading'
  const alt = `Demonstração: ${exercise.name}`

  return (
    <div
      ref={containerRef}
      className={`exercise-media ${ratioClass}${compact ? ' exercise-media--compact' : ''} ${className}`.trim()}
      style={{ aspectRatio }}
    >
      {showSkeleton && <div className="exercise-media__skeleton" aria-hidden="true" />}

      {!inView && (
        <img
          className="exercise-media__image"
          src={exercise.thumbnail || exercise.image || exercise.fallbackImage || GENERIC_FALLBACK}
          alt=""
          loading="lazy"
          aria-hidden="true"
        />
      )}

      {inView && current.kind === 'video' && (
        <video
          key={current.src}
          className="exercise-media__video"
          src={current.src}
          poster={exercise.thumbnail || exercise.image}
          autoPlay
          loop
          muted
          playsInline
          preload={lazy ? 'metadata' : 'auto'}
          onLoadedData={() => setStatus('loaded')}
          onError={handleError}
        />
      )}

      {inView && current.kind === 'gif' && (
        <img
          key={current.src}
          className="exercise-media__image"
          src={current.src}
          alt={alt}
          loading="lazy"
          onLoad={() => setStatus('loaded')}
          onError={handleError}
        />
      )}

      {inView && current.kind === 'image' && (
        <img
          key={current.src}
          className="exercise-media__image"
          src={current.src}
          alt={alt}
          loading="lazy"
          onLoad={() => setStatus('loaded')}
          onError={handleError}
        />
      )}

      <div className="exercise-media__overlay" aria-hidden="true" />
    </div>
  )
}
