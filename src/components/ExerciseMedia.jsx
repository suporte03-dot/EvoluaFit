import { useEffect, useRef, useState } from 'react'

function resolveMedia(exercise, failedSrc) {
  const mediaType = String(exercise.mediaType || '').toLowerCase()
  const primaryUrl = exercise.mediaUrl || exercise.media_url || null
  const thumbUrl = exercise.thumbnail || exercise.thumbnail_url || null
  const fallbackSrc = exercise.fallbackImage || exercise.fallbackSvg || null

  if (mediaType === 'video' && primaryUrl && failedSrc !== primaryUrl) {
    return { kind: 'video', src: primaryUrl, poster: thumbUrl || undefined }
  }

  if ((mediaType === 'gif' || mediaType === 'image') && primaryUrl && failedSrc !== primaryUrl) {
    return { kind: 'image', src: primaryUrl }
  }

  if (primaryUrl && failedSrc !== primaryUrl) {
    return { kind: primaryUrl.endsWith('.gif') ? 'image' : 'image', src: primaryUrl }
  }

  if (thumbUrl && failedSrc !== thumbUrl) {
    return { kind: 'image', src: thumbUrl }
  }

  if (exercise.video && failedSrc !== exercise.video) {
    return { kind: 'video', src: exercise.video, poster: thumbUrl || undefined }
  }

  if (exercise.gif && failedSrc !== exercise.gif) {
    return { kind: 'image', src: exercise.gif }
  }

  if (exercise.image && failedSrc !== exercise.image) {
    return { kind: 'image', src: exercise.image }
  }

  if (fallbackSrc && failedSrc !== fallbackSrc) {
    return { kind: 'fallback', src: fallbackSrc }
  }

  return { kind: null, src: null }
}

export default function ExerciseMedia({
  exercise,
  className = '',
  aspectRatio = '16/9',
  lazy = true,
  compact = false,
  square = false,
  fit = 'cover',
}) {
  const containerRef = useRef(null)
  const [inView, setInView] = useState(!lazy)
  const [failedSrc, setFailedSrc] = useState(null)

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
    setFailedSrc(null)
  }, [exercise?.id, exercise?.mediaUrl, exercise?.gif, exercise?.image, exercise?.video])

  if (!exercise) return null

  const ratioClass = square
    ? 'exercise-media--square'
    : aspectRatio === '4/3'
      ? 'exercise-media--4-3'
      : 'exercise-media--16-9'
  const alt = `Demonstração: ${exercise.name}`

  const media = resolveMedia(exercise, failedSrc)

  const handleError = () => {
    if (media.src) setFailedSrc(media.src)
  }

  return (
    <div
      ref={containerRef}
      className={`exercise-media exercise-media--photo exercise-media--fit-${fit} ${ratioClass}${compact ? ' exercise-media--compact' : ''}${square ? ' exercise-media--square-fill' : ''} ${className}`.trim()}
      style={square ? undefined : { aspectRatio }}
    >
      {!inView && <div className="exercise-media__skeleton" aria-hidden="true" />}

      {inView && media.kind === 'video' && media.src && (
        <video
          className="exercise-media__video"
          src={media.src}
          poster={media.poster}
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          aria-label={alt}
          onError={handleError}
        />
      )}

      {inView && (media.kind === 'image' || media.kind === 'fallback') && media.src && (
        <img
          className="exercise-media__image"
          src={media.src}
          alt={alt}
          loading={lazy ? 'lazy' : 'eager'}
          decoding="async"
          onError={handleError}
        />
      )}

      {inView && !media.src && (
        <div className="exercise-media__placeholder" aria-label={alt}>
          <p className="exercise-media__placeholder-text">{exercise.name}</p>
        </div>
      )}

      <div className="exercise-media__overlay" aria-hidden="true" />
    </div>
  )
}
