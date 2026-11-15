import { Router } from 'express'
import { getVacancySettings } from '../services/siteSettings.js'

export const settingsRouter = Router()

/** Public: vacancy modal copy + top ribbon text (managed strictly via the Admin Panel). */
settingsRouter.get('/vacancy', async (_req, res, next) => {
  try {
    const settings = await getVacancySettings()
    res.set('Cache-Control', 'no-cache')
    res.json(settings)
  } catch (err) {
    next(err)
  }
})

