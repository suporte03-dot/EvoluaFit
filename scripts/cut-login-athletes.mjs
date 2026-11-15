import { readFile } from 'node:fs/promises'
import sharp from 'sharp'
import { pipeline, RawImage } from '@huggingface/transformers'

const originalPath = 'public/branding/evoluafit-login-athletes.png'
const outputPath = 'public/branding/evoluafit-login-athletes-transparent.png'
const keep = new Set([
  'Hair',
  'Upper-clothes',
  'Skirt',
  'Pants',
  'Dress',
  'Belt',
  'Left-shoe',
  'Right-shoe',
  'Face',
  'Left-leg',
  'Right-leg',
  'Left-arm',
  'Right-arm',
])

const original = await sharp(originalPath).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
const { width, height, channels } = original.info
const src = original.data
const idx = (x, y) => (y * width + x) * channels

const segmenter = await pipeline('image-segmentation', 'mattmdjaga/segformer_b2_clothes', {
  dtype: 'fp32',
})
const image = await RawImage.fromBlob(new Blob([await readFile(originalPath)], { type: 'image/png' }))
const parts = await segmenter(image)

const mask = new Uint8Array(width * height)
for (const part of parts) {
  if (!keep.has(part.label)) continue
  const raw = part.mask
  for (let y = 0; y < height; y++) {
    const sy = Math.min(raw.height - 1, Math.round((y / height) * raw.height))
    for (let x = 0; x < width; x++) {
      const sx = Math.min(raw.width - 1, Math.round((x / width) * raw.width))
      if (raw.data[sy * raw.width + sx] > 48) mask[y * width + x] = 1
    }
  }
}

function dilate(srcMask, radius) {
  const out = new Uint8Array(srcMask.length)
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let keepPx = 0
      for (let dy = -radius; dy <= radius && !keepPx; dy++) {
        const yy = y + dy
        if (yy < 0 || yy >= height) continue
        for (let dx = -radius; dx <= radius; dx++) {
          if (dx * dx + dy * dy > radius * radius) continue
          const xx = x + dx
          if (xx < 0 || xx >= width) continue
          if (srcMask[yy * width + xx]) {
            keepPx = 1
            break
          }
        }
      }
      out[y * width + x] = keepPx
    }
  }
  return out
}

const body = dilate(mask, 2)

const soles = []
for (let y = Math.floor(height * 0.78); y < height; y++) {
  for (let x = 0; x < width; x++) {
    const i = idx(x, y)
    const lum = 0.2126 * src[i] + 0.7152 * src[i + 1] + 0.0722 * src[i + 2]
    if (lum > 22) {
      body[y * width + x] = 1
      soles.push([x, y])
    }
  }
}

const bodyXs = []
for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) if (mask[y * width + x]) bodyXs.push(x)
}
bodyXs.sort((a, b) => a - b)
const split = bodyXs[Math.floor(bodyXs.length / 2)]

for (const side of [
  { test: (x) => x < split },
  { test: (x) => x >= split },
]) {
  let minX = width
  let maxX = 0
  let maxY = 0
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (!mask[y * width + x] || !side.test(x)) continue
      if (x < minX) minX = x
      if (x > maxX) maxX = x
      if (y > maxY) maxY = y
    }
  }
  const mid = (minX + maxX) / 2
  const sideSoles = soles.filter((p) => side.test(p[0]))
  const left = sideSoles.filter((p) => p[0] < mid)
  const right = sideSoles.filter((p) => p[0] >= mid)
  for (const foot of [left, right].filter((f) => f.length > 4)) {
    const fx = foot.reduce((s, p) => s + p[0], 0) / foot.length
    const fy = Math.max(...foot.map((p) => p[1]))
    for (let y = maxY - 8; y <= fy; y++) {
      const t = (y - (maxY - 8)) / Math.max(1, fy - (maxY - 8))
      const half = 17 * (1 - t) + 11 * t
      const x0 = Math.max(0, Math.floor(fx - half))
      const x1 = Math.min(width - 1, Math.ceil(fx + half))
      for (let x = x0; x <= x1; x++) body[y * width + x] = 1
    }
  }
}

const out = Buffer.from(src)
let kept = 0
for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    const i = idx(x, y)
    if (!body[y * width + x]) {
      out[i] = 0
      out[i + 1] = 0
      out[i + 2] = 0
      out[i + 3] = 0
      continue
    }
    kept++
    out[i + 3] = 255
    const lum = 0.2126 * out[i] + 0.7152 * out[i + 1] + 0.0722 * out[i + 2]
    if (lum < 14) {
      const t = (14 - lum) / 14
      out[i] = Math.round(out[i] + (36 - out[i]) * t * 0.88)
      out[i + 1] = Math.round(out[i + 1] + (40 - out[i + 1]) * t * 0.88)
      out[i + 2] = Math.round(out[i + 2] + (56 - out[i + 2]) * t * 0.88)
    }
  }
}

await sharp(out, { raw: { width, height, channels: 4 } }).png({ compressionLevel: 9 }).toFile(outputPath)
console.log({ kept, coverage: (kept / (width * height)).toFixed(3) })
