import sharp from 'sharp'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const logoPath = join(root, 'public/assets/evoluafit-logo.png')
const iconPath = join(root, 'public/assets/evoluafit-icon.png')

const meta = await sharp(logoPath).metadata()
const { width, height } = meta

// Left hexagon icon is roughly square; crop ~32% of width centered vertically
const cropSize = Math.round(Math.min(height, width * 0.34))
const left = Math.round(width * 0.02)
const top = Math.round((height - cropSize) / 2)

await sharp(logoPath)
  .extract({ left, top, width: cropSize, height: cropSize })
  .png()
  .toFile(iconPath)

console.log(`Logo: ${width}x${height}`)
console.log(`Icon crop: ${cropSize}x${cropSize} at (${left}, ${top})`)
console.log(`Saved: ${iconPath}`)
