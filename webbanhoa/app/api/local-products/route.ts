import { NextResponse } from 'next/server'
// Ensure this route runs in the Node runtime so server-side fs is available
export const runtime = 'nodejs'
import fs from 'fs'
import path from 'path'

const DATA_DIR = path.join(process.cwd(), 'data')
const DATA_FILE = path.join(DATA_DIR, 'local-products.json')
const IMAGE_DIR = path.join(process.cwd(), 'public', 'local_images')

async function ensureDirs() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })
  if (!fs.existsSync(IMAGE_DIR)) fs.mkdirSync(IMAGE_DIR, { recursive: true })
  if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, '[]')
}

async function readData() {
  await ensureDirs()
  const raw = fs.readFileSync(DATA_FILE, 'utf-8')
  try {
    return JSON.parse(raw)
  } catch (e) {
    return []
  }
}

async function writeData(arr: any[]) {
  await ensureDirs()
  fs.writeFileSync(DATA_FILE, JSON.stringify(arr, null, 2))
}

function decodeBase64Image(dataString: string) {
  const matches = dataString.match(/^data:(.+);base64,(.+)$/)
  if (!matches) return null
  const mime = matches[1]
  const data = matches[2]
  const buffer = Buffer.from(data, 'base64')
  return { mime, buffer }
}

export async function GET() {
  try {
    const arr = await readData()
    return NextResponse.json(arr)
  } catch (err) {
    return NextResponse.json({ error: 'failed' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { product, images } = body as { product: any; images?: string[] }
    if (!product) return NextResponse.json({ error: 'missing product' }, { status: 400 })

    const now = Date.now()
    const savedImages: string[] = []
    if (Array.isArray(images)) {
      for (let i = 0; i < images.length; i++) {
        const d = images[i]
        const decoded = decodeBase64Image(d)
        if (!decoded) continue
        const ext = decoded.mime.split('/')[1] || 'jpg'
        // sanitize product title for filename
        const rawTitle = (product && (product.title || product.name)) || 'product'
        const safeTitle = String(rawTitle)
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '_')
          .replace(/^_+|_+$/g, '')
          .slice(0, 60) || 'product'
        const filename = `${safeTitle}_${now}_${i}.${ext}`
        const outPath = path.join(IMAGE_DIR, filename)
        fs.writeFileSync(outPath, decoded.buffer)
        savedImages.push(`/local_images/${filename}`)
      }
    }

    const arr = await readData()
    const id = `local_${now}_${Math.floor(Math.random() * 9000 + 1000)}`
    const record = {
      id,
      title: product.title || product.name,
      description: product.description,
      price: Number(product.price || 0),
      inStock: Number(product.inStock || 0),
      images: savedImages,
      createdAt: new Date().toISOString(),
      origin: 'local',
    }
    arr.unshift(record)
    await writeData(arr)
    return NextResponse.json(record)
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('local-products POST error', err)
    return NextResponse.json({ error: 'server error' }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const body = await req.json()
    const { id } = body as { id?: string }
    if (!id) return NextResponse.json({ error: 'missing id' }, { status: 400 })

    const arr = await readData()
    const idx = arr.findIndex((r: any) => r.id === id)
    if (idx === -1) return NextResponse.json({ error: 'not found' }, { status: 404 })

    const [removed] = arr.splice(idx, 1)

    // remove associated image files from public/local_images
    if (Array.isArray(removed.images)) {
      for (const imgPath of removed.images) {
        try {
          // imgPath is like '/local_images/filename.ext'
          if (typeof imgPath === 'string' && imgPath.startsWith('/local_images/')) {
            const filename = imgPath.replace('/local_images/', '')
            const filePath = path.join(IMAGE_DIR, filename)
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath)
          }
        } catch (e) {
          // ignore individual file delete errors
        }
      }
    }

    await writeData(arr)
    return NextResponse.json({ ok: true, removed })
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('local-products DELETE error', err)
    return NextResponse.json({ error: 'server error' }, { status: 500 })
  }
}
