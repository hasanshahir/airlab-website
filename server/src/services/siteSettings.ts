import mongoose from 'mongoose'
import { SiteSettingModel } from '../models/SiteSetting.js'
import { env } from '../config/env.js'

/** Copy shown in the vacancy modal + top announcement ribbon. Editable from the "Vacancies" sheet tab. */
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
  badge: 'FELLOWSHIP & INTERNSHIP ADMISSIONS',
  title: 'Apply for Research Vacancy',
  description:
    'Department of CSIT · NED University. Work directly with faculty on LLMs, edge perception, and robotics testbeds.',
  ribbonLabel: 'Applications Open:',
  ribbonText: 'Student Research Internship & Fellowship Vacancies Open for Fall 2026 — NEDUET CSIT',
  closedMessage:
    'Applications are currently closed. Please check back soon or follow our updates for the next intake.',
}

const VACANCY_KEY = 'vacancy'
const WEBHOOK_KEY = 'sheetsWebhookUrl'

const dbReady = () => mongoose.connection.readyState === 1

/**
 * Maps loosely-named sheet keys ("Modal Title", "modal_title", "Title") to our
 * canonical setting fields so lab staff don't have to type keys exactly.
 */
const KEY_ALIASES: Record<string, keyof VacancySettings> = {
  status: 'status',
  applicationsstatus: 'status',
  applicationstatus: 'status',
  badge: 'badge',
  badgetext: 'badge',
  title: 'title',
  modaltitle: 'title',
  heading: 'title',
  description: 'description',
  modaldescription: 'description',
  subtitle: 'description',
  ribbonlabel: 'ribbonLabel',
  topribbonlabel: 'ribbonLabel',
  ribbontext: 'ribbonText',
  topribbontext: 'ribbonText',
  announcement: 'ribbonText',
  topribbonannouncement: 'ribbonText',
  closedmessage: 'closedMessage',
}

/** Accepts either `{ "Modal Title": "..." }` or `[{ Setting, Value }]` and returns a partial settings object. */
export function normalizeVacancyInput(raw: unknown): Partial<VacancySettings> {
  const out: Partial<VacancySettings> = {}
  const entries: [string, unknown][] = []

  if (Array.isArray(raw)) {
    for (const row of raw) {
      if (!row || typeof row !== 'object') continue
      const r = row as Record<string, unknown>
      const k = r.Setting ?? r.setting ?? r.Key ?? r.key
      const v = r.Value ?? r.value
      if (k !== undefined) entries.push([String(k), v])
    }
  } else if (raw && typeof raw === 'object') {
    entries.push(...Object.entries(raw as Record<string, unknown>))
  }

  for (const [k, v] of entries) {
    const field = KEY_ALIASES[k.toLowerCase().replace(/[^a-z]/g, '')]
    if (!field || v === undefined || v === null) continue
    const value = String(v).trim()
    if (!value) continue
    if (field === 'status') {
      out.status = /clos|no|off|false/i.test(value) ? 'Closed' : 'Open'
    } else {
      out[field] = value
    }
  }
  return out
}

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
  const merged = { ...DEFAULT_VACANCY_SETTINGS, ...partial }
  await SiteSettingModel.updateOne({ key: VACANCY_KEY }, { $set: { value: merged } }, { upsert: true })
  return merged
}

/** Env var wins; otherwise use the URL the Apps Script reported during its last sync. */
export async function getSheetsWebhookUrl(): Promise<string | undefined> {
  if (env.SHEETS_WEBHOOK_URL) return env.SHEETS_WEBHOOK_URL
  if (!dbReady()) return undefined
  try {
    const doc = await SiteSettingModel.findOne({ key: WEBHOOK_KEY }).maxTimeMS(3000).lean()
    return typeof doc?.value === 'string' && doc.value.startsWith('https://') ? doc.value : undefined
  } catch {
    return undefined
  }
}

export async function saveSheetsWebhookUrl(url: string): Promise<void> {
  if (!/^https:\/\/script\.google(usercontent)?\.com\//.test(url)) return
  await SiteSettingModel.updateOne({ key: WEBHOOK_KEY }, { $set: { value: url } }, { upsert: true })
}

