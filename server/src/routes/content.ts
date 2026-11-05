import { Router } from 'express'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { collectionBySlug, collections } from '../content/registry.js'
import { contentModels } from '../models/content.js'
import { HttpError } from '../middleware/errors.js'

const here = path.dirname(fileURLToPath(import.meta.url))
const DATA_DIR = path.resolve(here, '../../../src/data')

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
  const items = await model
    .find({ published: true })
    .sort({ order: 1, ...(def.defaultSort ?? {}), createdAt: 1 })
    .lean()

  // If database collection is currently empty, serve fallback seed data from src/data/*.json
  if (items.length === 0) {
    try {
      const seedPath = path.join(DATA_DIR, def.seedFile)
      let raw = await readFile(seedPath, 'utf8')
      if (raw.charCodeAt(0) === 0xfeff) raw = raw.slice(1)
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) {
        res.set('Cache-Control', 'public, max-age=60')
        return res.json(parsed)
      }
    } catch {
      // ignore read errors and return empty items
    }
  }

  res.set('Cache-Control', 'public, max-age=60')
  res.json(items)
})

contentRouter.get('/:slug/:id', async (req, res) => {
  const { model } = resolve(req.params.slug)
  const raw = req.params.id
  // Legacy ids may be numeric (projects, publications) or strings.
  const candidates: (string | number)[] = [raw]
  if (/^\d+$/.test(raw)) candidates.push(Number(raw))
  const item = await model.findOne({ id: { $in: candidates }, published: true }).lean()
  if (!item) throw new HttpError(404, 'Item not found')
  res.json(item)
})
