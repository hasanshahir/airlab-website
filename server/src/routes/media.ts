import { Router } from 'express'
import mongoose from 'mongoose'
import { contentModels } from '../models/content.js'
import { HttpError } from '../middleware/errors.js'

/**
 * Images uploaded through the admin panel are stored in MongoDB as base64
 * data URIs. Sending them inline makes the public JSON huge and un-cacheable,
 * so the public content API swaps each data URI for a URL pointing here:
 *
 *   GET /api/media/:slug/:oid/:path?v=<updatedAt>
 *
 * `path` is the dot-joined location of the image inside the document
 * (e.g. "coverImage", "images.2", "photos.0.url"). The `v` param changes
 * whenever the document is edited, so responses can be cached forever.
 */
export const mediaRouter = Router()

const DATA_URI = /^data:([\w/+.-]+);base64,(.*)$/s

function mediaUrl(slug: string, oid: string, path: string, version: number) {
  return `/api/media/${slug}/${oid}/${encodeURIComponent(path)}?v=${version}`
}

/** Returns a copy of `item` with every inline data-URI image replaced by a /api/media URL. */
export function externalizeImages<T extends Record<string, any>>(slug: string, item: T): T {
  if (!item || !item._id) return item
  const oid = String(item._id)
  const version = new Date(item.updatedAt ?? item.createdAt ?? 0).getTime() || 0

  const walk = (value: any, path: string): any => {
    if (typeof value === 'string') {
      return value.startsWith('data:image') ? mediaUrl(slug, oid, path, version) : value
    }
    if (Array.isArray(value)) return value.map((v, i) => walk(v, `${path}.${i}`))
    if (value && typeof value === 'object' && !(value instanceof Date) && !(value instanceof mongoose.Types.ObjectId)) {
      const out: Record<string, any> = {}
      for (const [k, v] of Object.entries(value)) out[k] = walk(v, path ? `${path}.${k}` : k)
      return out
    }
    return value
  }

  const out: Record<string, any> = {}
  for (const [k, v] of Object.entries(item)) out[k] = k === '_id' ? v : walk(v, k)
  return out as T
}

mediaRouter.get('/:slug/:oid/:path', async (req, res) => {
  const { slug, oid } = req.params
  const path = decodeURIComponent(req.params.path)
  const model = contentModels.get(slug)
  if (!model || !mongoose.isValidObjectId(oid) || !/^[\w.]+$/.test(path)) {
    throw new HttpError(404, 'Not found')
  }

  const topField = path.split('.')[0]
  const doc: any = await model
    .findOne({ _id: oid, published: true })
    .select(topField)
    .maxTimeMS(4000)
    .lean()
  if (!doc) throw new HttpError(404, 'Not found')

  let value: any = doc
  for (const key of path.split('.')) value = value?.[key]
  const match = typeof value === 'string' ? DATA_URI.exec(value) : null
  if (!match) throw new HttpError(404, 'Not found')

  const [, mime, b64] = match
  res.set({
    'Content-Type': mime,
    // URL is versioned by the document's updatedAt, so it never goes stale.
    'Cache-Control': 'public, max-age=31536000, immutable',
    'Cross-Origin-Resource-Policy': 'cross-origin',
  })
  res.send(Buffer.from(b64, 'base64'))
})
