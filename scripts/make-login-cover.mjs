import sharp from 'sharp'
import path from 'path'
import fs from 'fs'

/**
 * Personagens limpos (sem texto) encaixados no quadrado —
 * a cena inteira cabe (corpo disponível da arte, sem crop CSS).
 */
const src = path.resolve('public/branding/login-characters.jpg')
const outPublic = path.resolve('public/branding/login-cover-balanced.jpg')
const outAssets = path.resolve('src/assets/branding/login-cover-balanced.jpg')

const meta = await sharp(src).metadata()
const size = 1200

const outBuffer = await sharp(src)
  .resize(size, size, {
    fit: 'contain',
    background: { r: 5, g: 8, b: 16 },
    kernel: sharp.kernel.lanczos3,
  })
  .modulate({ brightness: 1.05, saturation: 1.06 })
  .jpeg({ quality: 93, mozjpeg: true })
  .toBuffer()

fs.mkdirSync(path.dirname(outAssets), { recursive: true })
fs.writeFileSync(outPublic, outBuffer)
fs.writeFileSync(outAssets, outBuffer)

const out = await sharp(outBuffer).metadata()
console.log({ src: `${meta.width}x${meta.height}`, out: `${out.width}x${out.height}` })
