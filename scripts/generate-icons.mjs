import sharp from 'sharp'
import { mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT    = join(__dirname, '..')
const OUT     = join(ROOT, 'public/icons')
const PUBLIC  = join(ROOT, 'public')
const BRAND   = join(ROOT, 'public/brand/icon-color.png')

mkdirSync(OUT, { recursive: true })

// Build a square canvas: white bg + brand icon centered with padding
async function makeSquare(size, bg = '#ffffff', padding = 0.14) {
  const pad   = Math.round(size * padding)
  const inner = size - pad * 2

  const icon = await sharp(BRAND)
    .resize(inner, inner, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer()

  return sharp({
    create: { width: size, height: size, channels: 4, background: bg }
  })
    .composite([{ input: icon, gravity: 'center' }])
    .png()
}

// Standard icons — white background
const sizes = [72, 96, 128, 144, 152, 192, 384, 512]
for (const size of sizes) {
  await (await makeSquare(size)).toFile(join(OUT, `icon-${size}x${size}.png`))
  console.log(`✓ icon-${size}x${size}.png`)
}

// Maskable icon — brand blue bg, tighter padding (safe zone = 10%)
await (await makeSquare(512, '#0A0A63', 0.18)).toFile(join(OUT, 'icon-512x512-maskable.png'))
console.log('✓ icon-512x512-maskable.png')

// Apple touch icon (180x180, white bg, iOS adds its own rounding)
await (await makeSquare(180)).toFile(join(PUBLIC, 'apple-touch-icon.png'))
console.log('✓ apple-touch-icon.png')

// Favicon 32x32 (white bg)
await (await makeSquare(32)).toFile(join(PUBLIC, 'favicon-32x32.png'))
console.log('✓ favicon-32x32.png')

console.log('\nDone — all icons generated from real brand asset')
