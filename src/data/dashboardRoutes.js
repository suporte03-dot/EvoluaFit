export const SECTION_PATHS = {
  inicio: '/app',
  treinos: '/app/treinos',
  planilha: '/app/planilha',
  exercicios: '/app/biblioteca',
  desempenho: '/app/indicadores',
  metas: '/app/metas',
  'coach-ia': '/app/coach',
  calendario: '/app/agenda',
  ajuda: '/app/ajuda',
  perfil: '/app/perfil',
  espelho: '/app/evolucao/espelho',
}

const PATH_TO_SECTION = {
  '/app': 'inicio',
  '/app/treinos': 'treinos',
  '/app/planilha': 'planilha',
  '/app/biblioteca': 'exercicios',
  '/app/indicadores': 'desempenho',
  '/app/metas': 'metas',
  '/app/coach': 'coach-ia',
  '/app/agenda': 'calendario',
  '/app/ajuda': 'ajuda',
}

export function normalizeAppPath(pathname = '') {
  if (!pathname) return ''
  const trimmed = pathname.replace(/\/+$/, '')
  return trimmed || '/'
}

export function sectionFromPath(pathname) {
  const path = normalizeAppPath(pathname)
  if (path.startsWith('/app/perfil')) return 'perfil'
  if (path.startsWith('/app/evolucao')) return 'espelho'
  if (path === '/app' || path === '') return 'inicio'
  return PATH_TO_SECTION[path] || null
}

export function isDedicatedAppRoute(pathname) {
  const section = sectionFromPath(pathname)
  return section === 'perfil' || section === 'espelho'
}

export function isDashboardHomePath(pathname) {
  return sectionFromPath(pathname) === 'inicio'
}
