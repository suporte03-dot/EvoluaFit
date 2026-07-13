import { useEffect } from 'react'
import { scrollToSection } from '../utils/scrollToSection'

export function useSectionHash(sectionIds) {
  useEffect(() => {
    const scrollFromHash = () => {
      const raw = window.location.hash.replace(/^#/, '')
      if (!raw || raw.startsWith('/')) return
      if (!sectionIds.includes(raw)) return

      requestAnimationFrame(() => {
        scrollToSection(raw)
      })
    }

    scrollFromHash()
    window.addEventListener('hashchange', scrollFromHash)
    return () => window.removeEventListener('hashchange', scrollFromHash)
  }, [sectionIds])
}
