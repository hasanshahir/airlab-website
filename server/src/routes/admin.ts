import { Router } from 'express'
import mongoose from 'mongoose'
import { collectionBySlug, collections } from '../content/registry.js'
import { contentModels } from '../models/content.js'
import { PositionModel } from '../models/Position.js'
import { HttpError } from '../middleware/errors.js'
import { requireAdmin } from '../middleware/auth.js'
import { getVacancySettings, saveVacancySettings } from '../services/siteSettings.js'

export const adminCrudRouter = Router()

// All endpoints in this router strictly require authenticated admin session
adminCrudRouter.use(requireAdmin)

const FORBIDDEN_KEYS = new Set(['_id', '__v', 'createdAt', 'updatedAt', '$where', '__proto__', 'constructor', 'prototype'])

/**
 * Strips MongoDB operator injections ($set, $gt, etc.), prototype pollution keys,
 * and immutable document metadata fields from incoming request payloads.
 */
function sanitizePayload(raw: unknown): Record<string, unknown> {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    throw new HttpError(400, 'Invalid request payload')
  }
  const clean: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    if (key.startsWith('$') || key.includes('.') || FORBIDDEN_KEYS.has(key)) {
      continue
    }
    clean[key] = value
  }
  return clean
}

function assertValidObjectId(id: string | string[] | undefined): string {
  const strId = typeof id === 'string' ? id : ''
  if (!strId || !mongoose.Types.ObjectId.isValid(strId)) {
    throw new HttpError(400, 'Invalid record ID')
  }
  return strId
}

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

// --- SITE & VACANCY SETTINGS ADMIN ROUTES ---
adminCrudRouter.get('/settings/vacancy', async (_req, res, next) => {
  try {
    const settings = await getVacancySettings()
    res.json(settings)
  } catch (err) {
    next(err)
  }
})

adminCrudRouter.put('/settings/vacancy', async (req, res, next) => {
  try {
    const clean = sanitizePayload(req.body)
    const updated = await saveVacancySettings(clean)
    res.json(updated)
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
    const clean = sanitizePayload(req.body)
    const position = await PositionModel.create(clean)
    res.status(201).json(position)
  } catch (err) {
    next(err)
  }
})

adminCrudRouter.put('/positions/:id', async (req, res, next) => {
  try {
    const id = assertValidObjectId(req.params.id)
    const clean = sanitizePayload(req.body)
    const position = await PositionModel.findByIdAndUpdate(
      id,
      { $set: clean },
      { new: true, runValidators: true }
    )
    if (!position) throw new HttpError(404, 'Position not found')
    res.json(position)
  } catch (err) {
    next(err)
  }
})

adminCrudRouter.delete('/positions/:id', async (req, res, next) => {
  try {
    const id = assertValidObjectId(req.params.id)
    const position = await PositionModel.findByIdAndDelete(id)
    if (!position) throw new HttpError(404, 'Position not found')
    res.json({ success: true, message: 'Position deleted' })
  } catch (err) {
    next(err)
  }
})

function resolve(slug: string | string[] | undefined) {
  const strSlug = typeof slug === 'string' ? slug : ''
  const def = collectionBySlug.get(strSlug)
  const model = contentModels.get(strSlug)
  if (!def || !model) throw new HttpError(404, `Unknown collection "${strSlug}"`)
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
    const clean = sanitizePayload(req.body)
    const count = await model.countDocuments()
    const item = await model.create({
      ...clean,
      order: typeof clean.order === 'number' ? clean.order : count,
      published: typeof clean.published === 'boolean' ? clean.published : true,
    })
    res.status(201).json(item)
  } catch (err) {
    next(err)
  }
})

// 3. UPDATE item
adminCrudRouter.put('/:slug/:id', async (req, res, next) => {
  try {
    const id = assertValidObjectId(req.params.id)
    const { model } = resolve(req.params.slug)
    const clean = sanitizePayload(req.body)
    const item = await model.findByIdAndUpdate(
      id,
      { $set: clean },
      { new: true, runValidators: true }
    )
    if (!item) throw new HttpError(404, 'Item not found')
    res.json(item)
  } catch (err) {
    next(err)
  }
})

// 4. DELETE item
adminCrudRouter.delete('/:slug/:id', async (req, res, next) => {
  try {
    const id = assertValidObjectId(req.params.id)
    const { model } = resolve(req.params.slug)
    const item = await model.findByIdAndDelete(id)
    if (!item) throw new HttpError(404, 'Item not found')
    res.json({ success: true, message: 'Item deleted' })
  } catch (err) {
    next(err)
  }
})
