import { Router } from 'express'
import { collectionBySlug, collections } from '../content/registry.js'
import { contentModels } from '../models/content.js'
import { PositionModel } from '../models/Position.js'
import { HttpError } from '../middleware/errors.js'
import { requireAdmin } from '../middleware/auth.js'

export const adminCrudRouter = Router()

// All endpoints in this router require authentication
adminCrudRouter.use(requireAdmin)

// Get schema registry for the admin UI
adminCrudRouter.get('/schema', (_req, res) => {
  res.json({
    collections: collections.map(c => ({
      slug: c.slug,
      label: c.label,
      titleField: c.titleField,
      fields: c.fields,
    })),
  })
})

function resolve(slug: string) {
  const def = collectionBySlug.get(slug)
  const model = contentModels.get(slug)
  if (!def || !model) throw new HttpError(404, `Unknown collection "${slug}"`)
  return { def, model }
}

// 1. LIST items (includes unpublished items for admin)
adminCrudRouter.get('/:slug', async (req, res, next) => {
  try {
    const { model } = resolve(req.params.slug)
    const items = await model.find().sort({ order: 1, createdAt: -1 }).lean()
    res.json(items)
  } catch (err) {
    next(err)
  }
})

// 2. CREATE item
adminCrudRouter.post('/:slug', async (req, res, next) => {
  try {
    const { model } = resolve(req.params.slug)
    const count = await model.countDocuments()
    const item = await model.create({
      ...req.body,
      order: req.body.order ?? count,
      published: req.body.published ?? true,
    })
    res.status(201).json(item)
  } catch (err) {
    next(err)
  }
})

// 3. UPDATE item
adminCrudRouter.put('/:slug/:id', async (req, res, next) => {
  try {
    const { model } = resolve(req.params.slug)
    const item = await model.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    if (!item) throw new HttpError(404, 'Item not found')
    res.json(item)
  } catch (err) {
    next(err)
  }
})

// 4. DELETE item
adminCrudRouter.delete('/:slug/:id', async (req, res, next) => {
  try {
    const { model } = resolve(req.params.slug)
    const item = await model.findByIdAndDelete(req.params.id)
    if (!item) throw new HttpError(404, 'Item not found')
    res.json({ success: true, message: 'Item deleted' })
  } catch (err) {
    next(err)
  }
})

// --- POSITIONS ADMIN ROUTES ---
adminCrudRouter.get('/positions/all', async (_req, res, next) => {
  try {
    const positions = await PositionModel.find().sort({ order: 1, createdAt: -1 }).lean()
    res.json(positions)
  } catch (err) {
    next(err)
  }
})

adminCrudRouter.post('/positions', async (req, res, next) => {
  try {
    const position = await PositionModel.create(req.body)
    res.status(201).json(position)
  } catch (err) {
    next(err)
  }
})

adminCrudRouter.put('/positions/:id', async (req, res, next) => {
  try {
    const position = await PositionModel.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!position) throw new HttpError(404, 'Position not found')
    res.json(position)
  } catch (err) {
    next(err)
  }
})

adminCrudRouter.delete('/positions/:id', async (req, res, next) => {
  try {
    const position = await PositionModel.findByIdAndDelete(req.params.id)
    if (!position) throw new HttpError(404, 'Position not found')
    res.json({ success: true, message: 'Position deleted' })
  } catch (err) {
    next(err)
  }
})
