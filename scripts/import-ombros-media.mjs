/**
 * Copia imagens de Ombros para public/media/exercises/ombros/
 * Deduplica variantes __1_ e nomeia o arquivo sem título (__-uuid).
 */
import { copyFileSync, existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(fileURLToPath(new URL('.', import.meta.url)), '..')
const assetsDir = join(
  process.env.USERPROFILE || '',
  '.cursor/projects/c-Users-Suporte03-Desktop-Site-Novo-Mundo-do-Esporte/assets',
)
const outDir = join(root, 'public/media/exercises/ombros')
mkdirSync(outDir, { recursive: true })

const INCLUDE =
  /images_(Desenvolvimento|C_rculos_de_Bra|Crucifixo_inverso_unilateral|__-39a422b8)/i

const accentFixes = [
  [/m.quina/gi, 'maquina'],
  [/rota..o/gi, 'rotacao'],
  [/em.p./gi, 'em-pe'],
  [/bra.o/gi, 'braco'],
  [/c.rculos/gi, 'circulos'],
]

/** Renomes manuais após slugify */
const MANUAL_RENAME = {
  '': 'desenvolvimento-arnold-completo', // images__-uuid
  '-': 'desenvolvimento-arnold-completo',
  '--': 'desenvolvimento-arnold-completo',
}

function slugify(name) {
  // arquivo sem nome: images__-<uuid>
  if (/images__-[0-9a-f]{8}/i.test(name)) {
    return 'desenvolvimento-arnold-completo'
  }

  const m = name.match(/images_([^-]+(?:-[^-]+)*)-[0-9a-f]{8}-[0-9a-f-]{27,}\./i)
  let raw = m ? m[1] : name
  raw = raw
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/_/g, '-')
    .replace(/[^a-zA-Z0-9\-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase()

  for (const [re, replacement] of accentFixes) {
    raw = raw.replace(re, replacement)
  }
  // remove sufixo de duplicata (1)
  raw = raw.replace(/-1$/g, '').replace(/-+$/g, '')
  if (MANUAL_RENAME[raw]) raw = MANUAL_RENAME[raw]
  return raw.replace(/-+/g, '-').replace(/^-|-$/g, '')
}

const files = existsSync(assetsDir)
  ? readdirSync(assetsDir).filter((f) => INCLUDE.test(f) && /\.(png|jpe?g|gif|webp)$/i.test(f))
  : []

if (!files.length) {
  console.error('Nenhuma imagem de Ombros em', assetsDir)
  process.exit(1)
}

const map = {}
const used = new Set()
// Preferir versão sem __1_ quando houver duplicata
const sorted = [...files].sort((a, b) => {
  const aDup = /__1_/.test(a) ? 1 : 0
  const bDup = /__1_/.test(b) ? 1 : 0
  return aDup - bDup
})

for (const file of sorted) {
  let slug = slugify(file)
  if (used.has(slug)) {
    console.log('skip dup', slug, '←', file.slice(-60))
    continue
  }
  used.add(slug)
  copyFileSync(join(assetsDir, file), join(outDir, `${slug}.png`))
  map[slug] = `media/exercises/ombros/${slug}.png`
  console.log(slug)
}

writeFileSync(join(outDir, 'media-map.json'), JSON.stringify(map, null, 2), 'utf8')
console.log('\nCopied', Object.keys(map).length, '→', outDir)
