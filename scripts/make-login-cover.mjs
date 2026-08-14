import sharp from 'sharp'
import path from 'path'
import fs from 'fs'

const base = path.resolve('public/branding')
const src = path.join(base, 'login-characters.jpg')
const outPublic = path.join(base, 'login-cover-balanced.jpg')
const outAssets = path.resolve('src/assets/branding/login-cover-balanced.jpg')

const meta = await sharp(src).metadata()
const outW = 1400
const imgW = outW
const imgH = Math.round(meta.height * (outW / meta.width))
const padTop = Math.round(imgH * 0.28)
const padBottom = Math.round(imgH * 0.22)
const outH = imgH + padTop + padBottom

const resized = await sharp(src)
  .resize(imgW, imgH, { kernel: sharp.kernel.lanczos3 })
  .toBuffer()

const outBuffer = await sharp({
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

fs.mkdirSync(path.dirname(outAssets), { recursive: true })
fs.writeFileSync(outPublic, outBuffer)
fs.writeFileSync(outAssets, outBuffer)
console.log({ imgW, imgH, padTop, padBottom, outW, outH })