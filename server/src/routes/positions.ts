import { Router } from 'express'
import { PositionModel } from '../models/Position.js'

/** GET /api/positions → currently open vacancies (deadline not passed). */
export const positionsRouter = Router()

positionsRouter.get('/', async (_req, res) => {
  const now = new Date()
  const positions = await PositionModel.find({
    isOpen: true,
    $or: [{ deadline: { $exists: false } }, { deadline: null }, { deadline: { $gte: now } }],
  })
    .sort({ order: 1, createdAt: -1 })
    .lean()
  res.json(positions)
})
