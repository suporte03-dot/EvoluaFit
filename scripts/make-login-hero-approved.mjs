import sharp from 'sharp'
import fs from 'fs'
import path from 'path'

/**
 * Hero do login: recorte do mockup (painel esquerdo) sem faixa preta
 * e sem cortar a cabeça dos personagens.
 */
const candidates = [
  path.resolve('public/branding/loginnovo.png'),
  path.resolve('src/assets/branding/loginnovo.png'),
]
const srcPath = candidates.find((p) => fs.existsSync(p))
if (!srcPath) {
  console.error('Fonte loginnovo.png não encontrada')
  process.exit(1)
}

const meta = await sharp(srcPath).metadata()
const crop = {
  left: 0,
  top: 0,
  width: Math.round(meta.width * 0.7),
  height: meta.height,
}

const cleaned = await sharp(srcPath).extract(crop).jpeg({ quality: 76, mozjpeg: true }).toBuffer()

const outPublic = path.resolve('public/branding/evoluafit-login-hero-approved.jpg')
const outAssets = path.resolve('src/assets/branding/evoluafit-login-hero-approved.jpg')
fs.mkdirSync(path.dirname(outAssets), { recursive: true })
fs.writeFileSync(outPublic, cleaned)
fs.writeFileSync(outAssets, cleaned)

const variants = [
  { name: 'desktop', width: 1400 },
  { name: 'tablet', width: 1000 },
  { name: 'mobile', width: 720 },
]

for (const v of variants) {
  const buf = await sharp(cleaned)
    .resize({ width: v.width, kernel: sharp.kernel.lanczos3 })
    .jpeg({ quality: 76, mozjpeg: true })
    .toBuffer()
  fs.writeFileSync(path.resolve(`public/branding/evoluafit-login-hero-${v.name}.jpg`), buf)
  const m = await sharp(buf).metadata()
  console.log(v.name, `${m.width}x${m.height}`, `${(buf.length / 1024).toFixed(0)}KB`)
}

const outMeta = await sharp(cleaned).metadata()
console.log({
  src: path.relative(process.cwd(), srcPath),
  srcSize: `${meta.width}x${meta.height}`,
  crop,
  approved: `${outMeta.width}x${outMeta.height}`,
  ar: Number((outMeta.width / outMeta.height).toFixed(3)),
})
