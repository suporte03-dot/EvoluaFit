const PLACEHOLDERS = new Set(['atleta', 'usuário', 'usuario', 'user', 'athlete'])

export function resolveDisplayName({ cloudName, localName, metaName } = {}) {
  for (const raw of [cloudName, localName, metaName]) {
    const name = String(raw || '').trim()
    if (!name) continue
    if (PLACEHOLDERS.has(name.toLowerCase())) continue
    return name
  }
  return ''
}

export function greetingLine(hello, name) {
  return name ? `${hello}, ${name}` : hello
}

export function initialsFromDisplayName(name) {
  const parts = String(name || '').trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return '·'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
}
