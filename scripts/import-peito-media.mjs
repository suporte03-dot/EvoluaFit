/**
 * Copia imagens de Supino enviadas para public/media/exercises/peito/
 * e gera mapa slug → arquivo.
 */
import { copyFileSync, existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs'
import { basename, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(fileURLToPath(new URL('.', import.meta.url)), '..')
const assetsDir = join(
  process.env.USERPROFILE || '',
  '.cursor/projects/c-Users-Suporte03-Desktop-Site-Novo-Mundo-do-Esporte/assets',
)
const outDir = join(root, 'public/media/exercises/peito')

mkdirSync(outDir, { recursive: true })

const files = existsSync(assetsDir)
  ? readdirSync(assetsDir).filter((f) => /Supino/i.test(f) && /\.(png|jpe?g|gif|webp)$/i.test(f))
  : []

if (!files.length) {
  console.error('Nenhuma imagem Supino encontrada em', assetsDir)
  process.exit(1)
}

function slugifyFromAsset(name) {
  // ..._images_Supino_XXX-uuid.ext → extract Supino_XXX
  const m = name.match(/images_(Supino[\w\-]*)-[0-9a-f-]{36}/i)
  let raw = m ? m[1] : name
  raw = raw
    .replace(/^c__Users.*?images_/i, '')
    .replace(/-[0-9a-f]{8}-[0-9a-f-]{27,}\.(png|jpe?g|gif|webp)$/i, '')
    .replace(/\.(png|jpe?g|gif|webp)$/i, '')

  return raw
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/_/g, '-')
    .replace(/[^a-zA-Z0-9\-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase()
    .replace(/^supino-/, 'supino-')
}

const map = {}
const used = new Set()

for (const file of files) {
  let slug = slugifyFromAsset(file)
  if (!slug.startsWith('supino')) slug = `supino-${slug}`
  let finalSlug = slug
  let i = 2
  while (used.has(finalSlug)) {
    finalSlug = `${slug}-${i++}`
  }
  used.add(finalSlug)
  const dest = join(outDir, `${finalSlug}.png`)
  copyFileSync(join(assetsDir, file), dest)
  map[finalSlug] = `media/exercises/peito/${finalSlug}.png`
  console.log(file.slice(0, 60), '→', finalSlug)
}

writeFileSync(join(outDir, 'media-map.json'), JSON.stringify(map, null, 2), 'utf8')
console.log('\nCopied', Object.keys(map).length, 'files to', outDir)
