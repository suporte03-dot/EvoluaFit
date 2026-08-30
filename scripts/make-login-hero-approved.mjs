import sharp from 'sharp'
import fs from 'fs'
import path from 'path'

/**
 * Hero do login a partir da capa limpa (sem mockup de formulário).
 * Corta a faixa preta do topo (texto “passo.” residual) e gera as variantes.
 */
const candidates = [
  path.resolve('public/branding/login-cover-loginnovo.png'),
  path.resolve('src/assets/branding/login-cover-loginnovo.png'),
]
const srcPath = candidates.find((p) => fs.existsSync(p))
if (!srcPath) {
  console.error('Fonte login-cover-loginnovo.png não encontrada')
  process.exit(1)
}

const meta = await sharp(srcPath).metadata()
const topCrop = Math.round(meta.height * 0.075)
const cleaned = await sharp(srcPath)
  .extract({
    left: 0,
    top: topCrop,
    width: meta.width,
    height: meta.height - topCrop,
  })
  .png({ compressionLevel: 8 })
  .toBuffer()

const outPublic = path.resolve('public/branding/evoluafit-login-hero-approved.png')
const outAssets = path.resolve('src/assets/branding/evoluafit-login-hero-approved.png')
fs.mkdirSync(path.dirname(outAssets), { recursive: true })
fs.writeFileSync(outPublic, cleaned)
fs.writeFileSync(outAssets, cleaned)

const variants = [
  { name: 'desktop', width: 1920 },
  { name: 'tablet', width: 1400 },
  { name: 'mobile', width: 720 },
]

for (const v of variants) {
  const buf = await sharp(cleaned)
    .resize({ width: v.width, kernel: sharp.kernel.lanczos3 })
    .png({ compressionLevel: 8 })
    .toBuffer()
  fs.writeFileSync(path.resolve(`public/branding/evoluafit-login-hero-${v.name}.png`), buf)
  const m = await sharp(buf).metadata()
  console.log(v.name, `${m.width}x${m.height}`, `${(buf.length / 1024).toFixed(0)}KB`)
}

const outMeta = await sharp(cleaned).metadata()
console.log({
  src: path.relative(process.cwd(), srcPath),
  srcSize: `${meta.width}x${meta.height}`,
  topCrop,
  approved: `${outMeta.width}x${outMeta.height}`,
})
