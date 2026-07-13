import { useEffect, useState } from 'react'

export function useScrollSpy(sectionIds, offset = 120) {
  const [activeSection, setActiveSection] = useState(sectionIds[0])

  useEffect(() => {
    const ratios = new Map()
    const elements = sectionIds
      .map((id) => ({ id, el: document.getElementById(id) }))
      .filter((item) => item.el)

    if (!elements.length) return undefined

    const pickActive = () => {
      let bestId = sectionIds[0]
      let bestRatio = -1

      for (const { id } of elements) {
        const ratio = ratios.get(id) ?? 0
        if (ratio > bestRatio) {
          bestRatio = ratio
          bestId = id
        }
      }

      if (bestRatio > 0) setActiveSection(bestId)
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const id = entry.target.id
          if (id) ratios.set(id, entry.intersectionRatio)
        })
        pickActive()
      },
      {
        rootMargin: `-${offset}px 0px -55% 0px`,
        threshold: [0, 0.15, 0.35, 0.55, 0.75, 1],
      },
    )

    elements.forEach(({ el }) => observer.observe(el))

    return () => observer.disconnect()
  }, [sectionIds, offset])

  return activeSection
}
