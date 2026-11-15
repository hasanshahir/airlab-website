import { Router } from 'express'
import { getVacancySettings } from '../services/siteSettings.js'

export const settingsRouter = Router()

/** Public: vacancy modal copy + top ribbon text (managed strictly via the Admin Panel). */
settingsRouter.get('/vacancy', async (_req, res, next) => {
  try {
    const settings = await getVacancySettings()
    res.set('Cache-Control', 'public, max-age=0, s-maxage=60, stale-while-revalidate=86400')
    res.json(settings)
  } catch (err) {
    next(err)
  }
})

