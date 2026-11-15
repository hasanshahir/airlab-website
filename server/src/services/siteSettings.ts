import mongoose from 'mongoose'
import { SiteSettingModel } from '../models/SiteSetting.js'

/** Copy shown in the vacancy modal + top announcement ribbon. Managed strictly via the Admin Panel. */
export interface VacancySettings {
  status: 'Open' | 'Closed'
  badge: string
  title: string
  description: string
  ribbonLabel: string
  ribbonText: string
  closedMessage: string
}

export const DEFAULT_VACANCY_SETTINGS: VacancySettings = {
  status: 'Open',
  badge: 'AIR LAB APPLICATIONS',
  title: 'Application Form',
  description: '',
  ribbonLabel: 'AIR Lab NED:',
  ribbonText: 'Advancing Sovereign AI, Foundational Models, Cyber Defense, and Edge Systems for Pakistan — Department of CSIT, NED University',
  closedMessage:
    'Applications are currently closed. Please check back soon or follow our updates for the next intake.',
}

const VACANCY_KEY = 'vacancy'

const dbReady = () => mongoose.connection.readyState === 1

export async function getVacancySettings(): Promise<VacancySettings> {
  if (!dbReady()) return { ...DEFAULT_VACANCY_SETTINGS }
  try {
    const doc = await SiteSettingModel.findOne({ key: VACANCY_KEY }).maxTimeMS(3000).lean()
    return { ...DEFAULT_VACANCY_SETTINGS, ...((doc?.value as Partial<VacancySettings>) || {}) }
  } catch {
    return { ...DEFAULT_VACANCY_SETTINGS }
  }
}

export async function saveVacancySettings(partial: Partial<VacancySettings>): Promise<VacancySettings> {
  const current = await getVacancySettings()
  const merged: VacancySettings = {
    status: partial.status === 'Closed' ? 'Closed' : partial.status === 'Open' ? 'Open' : current.status,
    badge: typeof partial.badge === 'string' && partial.badge.trim() ? partial.badge.trim() : current.badge,
    title: typeof partial.title === 'string' && partial.title.trim() ? partial.title.trim() : current.title,
    description: typeof partial.description === 'string' ? partial.description.trim() : current.description,
    ribbonLabel:
      typeof partial.ribbonLabel === 'string' && partial.ribbonLabel.trim()
        ? partial.ribbonLabel.trim()
        : current.ribbonLabel,
    ribbonText:
      typeof partial.ribbonText === 'string' && partial.ribbonText.trim()
        ? partial.ribbonText.trim()
        : current.ribbonText,
    closedMessage:
      typeof partial.closedMessage === 'string' && partial.closedMessage.trim()
        ? partial.closedMessage.trim()
        : current.closedMessage,
  }
  await SiteSettingModel.updateOne({ key: VACANCY_KEY }, { $set: { value: merged } }, { upsert: true })
  return merged
}

