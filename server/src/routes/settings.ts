import { Router } from 'express'
import { getVacancySettings } from '../services/siteSettings.js'

export const settingsRouter = Router()

/** Public: vacancy modal copy + top ribbon text (edited from the "Vacancies" sheet tab). */
settingsRouter.get('/vacancy', async (_req, res, next) => {
  try {
    const settings = await getVacancySettings()
    res.set('Cache-Control', 'public, max-age=30')
    res.json(settings)
  } catch (err) {
    next(err)
  }
})

