function getScrollOffset() {
  const styles = getComputedStyle(document.documentElement)
  const headerH = parseFloat(styles.getPropertyValue('--header-h')) || 0
  const bannerH = parseFloat(styles.getPropertyValue('--header-banner-h')) || 0
  // Desktop SaaS: header hidden (0); mobile keeps compact header clearance
  return Math.max(24, headerH + bannerH + 16)
}

export const scrollToSection = (id) => {
  const section = document.getElementById(id)
  if (!section) return

  const y = section.getBoundingClientRect().top + window.scrollY - getScrollOffset()
  window.scrollTo({ top: y, behavior: 'smooth' })
}

export const handleSectionClick = (event, sectionId, callback) => {
  event.preventDefault()
  callback?.()
  scrollToSection(sectionId)
}
