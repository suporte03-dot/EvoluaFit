import { writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const mediaDir = join(root, 'public/media/exercises')
const fallbacksDir = join(mediaDir, 'fallbacks')

const { EXERCISE_IMAGE_SOURCES, FALLBACK_IMAGE_SOURCES } = await import(
  pathToFileURL(join(root, 'src/data/exerciseMediaMap.js')).href
)

mkdirSync(mediaDir, { recursive: true })
mkdirSync(fallbacksDir, { recursive: true })

async function download(url, dest) {
  if (existsSync(dest)) {
    console.log(`skip ${dest}`)
    return true
  }
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'EvoluaFit/1.0 (exercise library)' },
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const buf = Buffer.from(await res.arrayBuffer())
    writeFileSync(dest, buf)
    console.log(`ok ${dest}`)
    return true
  } catch (err) {
    console.warn(`fail ${dest}: ${err.message}`)
    return false
  }
}

let ok = 0
let fail = 0

for (const [id, url] of Object.entries(EXERCISE_IMAGE_SOURCES)) {
  const success = await download(url, join(mediaDir, `${id}.jpg`))
  if (success) ok += 1
  else fail += 1
}

for (const [key, url] of Object.entries(FALLBACK_IMAGE_SOURCES)) {
  await download(url, join(fallbacksDir, `${key}.jpg`))
}

console.log(`Done: ${ok} exercises, ${fail} failed.`)
