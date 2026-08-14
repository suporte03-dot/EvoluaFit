import sharp from 'sharp'
import path from 'path'
import fs from 'fs'

const srcPath = path.resolve('public/branding/novalogopersonalizada.jpg')
const meta = await sharp(srcPath).metadata()

// Character + chart stage from personalized mockup (no baked title/privacy).
const left = Math.round(meta.width * 0.03)
const top = Math.round(meta.height * 0.395)
const width = Math.round(meta.width * 0.55)
const height = Math.round(meta.height * 0.46)

const stage = await sharp(srcPath)
  .extract({ left, top, width, height })
  .resize(1600, null, { kernel: sharp.kernel.lanczos3 })
  .toBuffer()

const stageMeta = await sharp(stage).metadata()

// Soft wipe residual subtitle pixels only
const wipe = Buffer.from(`
<svg width="${stageMeta.width}" height="${stageMeta.height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#050810" stop-opacity="0.92"/>
      <stop offset="100%" stop-color="#050810" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <rect x="0" y="0" width="${Math.round(stageMeta.width * 0.58)}" height="${Math.round(stageMeta.height * 0.12)}" fill="url(#g)"/>
</svg>
`)

const cleaned = await sharp(stage)
  .composite([{ input: wipe, top: 0, left: 0 }])
  .jpeg({ quality: 93, mozjpeg: true })
  .toBuffer()

const outPublic = path.resolve('public/branding/login-cover-premium.jpg')
const outAssets = path.resolve('src/assets/branding/login-cover-premium.jpg')
fs.mkdirSync(path.dirname(outAssets), { recursive: true })
fs.writeFileSync(outPublic, cleaned)
fs.writeFileSync(outAssets, cleaned)

const m = await sharp(cleaned).metadata()
console.log({
  crop: { left, top, width, height },
  out: `${m.width}x${m.height}`,
})
