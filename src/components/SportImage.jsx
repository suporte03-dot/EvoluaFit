import { useEffect, useState } from 'react'
import { imageByFilter, sportImages } from '../data/siteData'

function SportImage({ src, filter, alt = '', className = '', loading = 'lazy' }) {
  const [imgSrc, setImgSrc] = useState(src)

  useEffect(() => {
    setImgSrc(src)
  }, [src])

  const handleError = () => {
    const categoryFallback = filter ? imageByFilter[filter] : null

    if (categoryFallback && imgSrc !== categoryFallback) {
      setImgSrc(categoryFallback)
      return
    }

    if (imgSrc !== sportImages.fallback) {
      setImgSrc(sportImages.fallback)
    }
  }

  return (
    <img
      src={imgSrc}
      alt={alt}
      className={className}
      loading={loading}
      decoding="async"
      onError={handleError}
    />
  )
}

export default SportImage
