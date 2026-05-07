import sharp from 'sharp'
import { mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT = join(__dirname, '../public/icons')
const PUBLIC = join(__dirname, '../public')
mkdirSync(OUT, { recursive: true })

function makeSvg(size) {
  const pad = size * 0.14
  const inner = size - pad * 2
  const r = size * 0.22
  const strokeW = size * 0.075
  const x1 = pad + inner * 0.08
  const x2 = pad + inner * 0.30
  const x3 = pad + inner * 0.50
  const x4 = pad + inner * 0.70
  const x5 = pad + inner * 0.92
  const yTop = pad + inner * 0.20
  const yMid = pad + inner * 0.58
  const yBot = pad + inner * 0.82

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${r}" fill="#0A0A63"/>
  <polyline
    points="${x1},${yBot} ${x1},${yTop} ${x3},${yMid} ${x5},${yTop} ${x5},${yBot}"
    fill="none"
    stroke="white"
    stroke-width="${strokeW}"
    stroke-linecap="round"
    stroke-linejoin="round"
  />
</svg>`
}

const sizes = [72, 96, 128, 144, 152, 192, 384, 512]

for (const size of sizes) {
  const svg = Buffer.from(makeSvg(size))
  const out = join(OUT, `icon-${size}x${size}.png`)
  await sharp(svg).png().toFile(out)
  console.log(`✓ icon-${size}x${size}.png`)
}

// Apple touch icon (180x180, no rounded corners — iOS applies them)
const appleSvg = Buffer.from(makeSvg(180))
await sharp(appleSvg).png().toFile(join(PUBLIC, 'apple-touch-icon.png'))
console.log('✓ apple-touch-icon.png')

// favicon 32x32
const faviconSvg = Buffer.from(makeSvg(32))
await sharp(faviconSvg).png().toFile(join(PUBLIC, 'favicon-32x32.png'))
console.log('✓ favicon-32x32.png')

console.log('\nDone — all icons generated')
