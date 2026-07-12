import { useEffect, useRef, useState } from 'react'

export default function ExerciseMedia({
  exercise,
  className = '',
  aspectRatio = '16/9',
  lazy = true,
  compact = false,
  square = false,
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
  }, [exercise?.id, exercise?.gif, exercise?.image, exercise?.video])

  if (!exercise) return null

  const ratioClass = square
    ? 'exercise-media--square'
    : aspectRatio === '4/3'
      ? 'exercise-media--4-3'
      : 'exercise-media--16-9'
  const alt = `Demonstração: ${exercise.name}`

  const gifSrc = exercise.gif
  const imageSrc = exercise.image || (!exercise.gif ? exercise.mediaUrl : null)
  const videoSrc = exercise.video
  const fallbackSrc = exercise.fallbackImage || exercise.fallbackSvg

  let mediaSrc = null
  let mediaKind = null

  if (videoSrc) {
    mediaSrc = videoSrc
    mediaKind = 'video'
  } else if (gifSrc && failedSrc !== gifSrc) {
    mediaSrc = gifSrc
    mediaKind = 'gif'
  } else if (imageSrc && failedSrc !== imageSrc) {
    mediaSrc = imageSrc
    mediaKind = 'image'
  } else if (fallbackSrc && failedSrc !== fallbackSrc) {
    mediaSrc = fallbackSrc
    mediaKind = 'fallback'
  }

  const handleError = () => {
    if (mediaSrc) setFailedSrc(mediaSrc)
  }

  return (
    <div
      ref={containerRef}
      className={`exercise-media ${ratioClass}${compact ? ' exercise-media--compact' : ''}${square ? ' exercise-media--photo' : ''} ${className}`.trim()}
      style={square ? undefined : { aspectRatio }}
    >
      {!inView && <div className="exercise-media__skeleton" aria-hidden="true" />}

      {inView && mediaKind === 'video' && (
        <video
          className="exercise-media__video"
          src={mediaSrc}
          poster={exercise.thumbnail}
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          aria-label={alt}
        />
      )}

      {inView && (mediaKind === 'gif' || mediaKind === 'image' || mediaKind === 'fallback') && mediaSrc && (
        <img
          className="exercise-media__image"
          src={mediaSrc}
          alt={alt}
          loading="lazy"
          onError={handleError}
        />
      )}

      {inView && !mediaSrc && (
        <div className="exercise-media__placeholder" aria-label={alt}>
          <p className="exercise-media__placeholder-text">{exercise.name}</p>
        </div>
      )}
    </div>
  )
}
