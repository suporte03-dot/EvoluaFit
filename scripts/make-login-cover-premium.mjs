import sharp from 'sharp'
import path from 'path'
import fs from 'fs'

const srcPath = path.resolve('public/branding/novalogopersonalizada.jpg')
const meta = await sharp(srcPath).metadata()

// Wider character stage from personalized mockup; skip baked title/privacy.
const left = Math.round(meta.width * 0.035)
const top = Math.round(meta.height * 0.40)
const width = Math.round(meta.width * 0.545)
const height = Math.round(meta.height * 0.45)

const stage = await sharp(srcPath)
  .extract({ left, top, width, height })
  .toBuffer()

const stageMeta = await sharp(stage).metadata()
const outW = 1600
const scale = outW / stageMeta.width
const imgW = outW
const imgH = Math.round(stageMeta.height * scale)

// Soft wipe any residual subtitle pixels at the very top of the stage
const wipe = Buffer.from(`
<svg width="${imgW}" height="${imgH}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#050810" stop-opacity="0.95"/>
      <stop offset="100%" stop-color="#050810" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <rect x="0" y="0" width="${Math.round(imgW * 0.62)}" height="${Math.round(imgH * 0.14)}" fill="url(#g)"/>
</svg>
`)

const resized = await sharp(stage)
  .resize(imgW, imgH, { kernel: sharp.kernel.lanczos3 })
  .composite([{ input: wipe, top: 0, left: 0 }])
  .toBuffer()

const padTop = Math.round(imgH * 0.48)
const padBottom = Math.round(imgH * 0.38)
const outH = imgH + padTop + padBottom

const padded = await sharp({
  create: {
    width: outW,
    height: outH,
    channels: 3,
    background: { r: 5, g: 8, b: 16 },
  },
})
  .composite([{ input: resized, left: 0, top: padTop }])
  .jpeg({ quality: 93, mozjpeg: true })
  .toBuffer()

const outPublic = path.resolve('public/branding/login-cover-premium.jpg')
const outAssets = path.resolve('src/assets/branding/login-cover-premium.jpg')
fs.mkdirSync(path.dirname(outAssets), { recursive: true })
fs.writeFileSync(outPublic, padded)
fs.writeFileSync(outAssets, padded)

const m = await sharp(padded).metadata()
console.log({
  crop: { left, top, width, height },
  stage: `${stageMeta.width}x${stageMeta.height}`,
  out: `${m.width}x${m.height}`,
})
