/**
 * Copia imagens de Costas (Remada, Puxada, Pullover, etc.)
 * para public/media/exercises/costas/
 */
import { copyFileSync, existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(fileURLToPath(new URL('.', import.meta.url)), '..')
const assetsDir = join(
  process.env.USERPROFILE || '',
  '.cursor/projects/c-Users-Suporte03-Desktop-Site-Novo-Mundo-do-Esporte/assets',
)
const outDir = join(root, 'public/media/exercises/costas')
mkdirSync(outDir, { recursive: true })

const INCLUDE =
  /images_(Remada|REMADA|Puxada|PUXADA|Pull|Pullover|Pulldown|Barra_|Levantamento)/i
const EXCLUDE = /images_(Supino|CRUCIFIXO)/i

const accentFixes = [
  [/bra.o/gi, 'braco'],
  [/m.quina/gi, 'maquina'],
  [/tri.ngulo/gi, 'triangulo'],
  [/ch.o/gi, 'chao'],
  [/em.p./gi, 'em-pe'],
  [/tor..o/gi, 'torsao'],
  [/faixa.el.stica/gi, 'faixa-elastica'],
]

function slugify(name) {
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
  return raw.replace(/-+/g, '-').replace(/^-|-$/g, '')
}

const files = existsSync(assetsDir)
  ? readdirSync(assetsDir).filter((f) => INCLUDE.test(f) && !EXCLUDE.test(f) && /\.(png|jpe?g|gif|webp)$/i.test(f))
  : []

if (!files.length) {
  console.error('Nenhuma imagem de Costas em', assetsDir)
  process.exit(1)
}

const map = {}
const used = new Set()

for (const file of files) {
  let slug = slugify(file)
  let finalSlug = slug
  let i = 2
  while (used.has(finalSlug)) finalSlug = `${slug}-${i++}`
  used.add(finalSlug)
  copyFileSync(join(assetsDir, file), join(outDir, `${finalSlug}.png`))
  map[finalSlug] = `media/exercises/costas/${finalSlug}.png`
  console.log(finalSlug)
}

writeFileSync(join(outDir, 'media-map.json'), JSON.stringify(map, null, 2), 'utf8')
console.log('\nCopied', Object.keys(map).length, '→', outDir)
