import { Router } from 'express'
import mongoose from 'mongoose'
import { collectionBySlug, collections } from '../content/registry.js'
import { contentModels } from '../models/content.js'
import { HttpError } from '../middleware/errors.js'
import { externalizeImages } from './media.js'
import { enrichPerformersList } from '../services/performers.js'

/**
 * Edge (CDN) caches for 60s, then keeps serving the cached copy instantly while
 * it refreshes in the background. Admin edits show up on the site within ~1 min.
 */
const PUBLIC_CACHE = 'public, max-age=0, s-maxage=60, stale-while-revalidate=86400'

/**
 * Public, read-only access to website content.
 *   GET /api/content            → list of available collections
 *   GET /api/content/:slug      → published items, sorted for display
 *   GET /api/content/:slug/:id  → single published item by its public id
 */
export const contentRouter = Router()

contentRouter.get('/', (_req, res) => {
  res.json(collections.map(({ slug, label }) => ({ slug, label })))
})

function resolve(slug: string) {
  const def = collectionBySlug.get(slug)
  const model = contentModels.get(slug)
  if (!def || !model) throw new HttpError(404, `Unknown collection "${slug}"`)
  return { def, model }
}

contentRouter.get('/:slug', async (req, res) => {
  const { def, model } = resolve(req.params.slug)
  let items: any[] = []

  if (mongoose.connection.readyState === 1) {
    try {
      items = await model
        .find({ published: true })
        .sort({ order: 1, ...(def.defaultSort ?? {}), createdAt: 1 })
        .maxTimeMS(4000)
        .lean()
    } catch {
      items = []
    }
  }

  const dbReady = mongoose.connection.readyState === 1
  if (dbReady && req.params.slug === 'performers' && items.length > 0) {
    items = await enrichPerformersList(items, { externalizeAvatars: true })
  }
  res.set(
    'Cache-Control',
    !dbReady || req.params.slug === 'gallery' || req.params.slug === 'performers'
      ? 'no-store'
      : PUBLIC_CACHE
  )
  res.json(items.map(item => externalizeImages(req.params.slug, item)))
})

contentRouter.get('/:slug/:id', async (req, res) => {
  const { model } = resolve(req.params.slug)
  const raw = req.params.id
  // Legacy ids may be numeric (projects, publications) or strings.
  const candidates: (string | number)[] = [raw]
  if (/^\d+$/.test(raw)) candidates.push(Number(raw))
  const item = await model.findOne({ id: { $in: candidates }, published: true }).lean()
  if (!item) throw new HttpError(404, 'Item not found')
  let resolvedItem: Record<string, any> = item as any
  if (req.params.slug === 'performers') {
    const [enriched] = await enrichPerformersList([resolvedItem], { externalizeAvatars: true })
    if (enriched) resolvedItem = enriched
  }
  res.set('Cache-Control', PUBLIC_CACHE)
  res.json(externalizeImages(req.params.slug, resolvedItem))
})
