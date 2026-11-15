import { useEffect, useState } from 'react'

/** Vacancy modal + top-ribbon copy, managed strictly via the Admin Panel. */
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

function normalizeVacancyCopy(data: Partial<VacancySettings> | null | undefined): VacancySettings {
  if (!data || typeof data !== 'object') return DEFAULT_VACANCY_SETTINGS

  return {
    status: data.status === 'Closed' ? 'Closed' : 'Open',
    badge: data.badge?.trim() || DEFAULT_VACANCY_SETTINGS.badge,
    title: data.title?.trim() || DEFAULT_VACANCY_SETTINGS.title,
    description: typeof data.description === 'string' ? data.description.trim() : DEFAULT_VACANCY_SETTINGS.description,
    ribbonLabel: data.ribbonLabel?.trim() || DEFAULT_VACANCY_SETTINGS.ribbonLabel,
    ribbonText: data.ribbonText?.trim() || DEFAULT_VACANCY_SETTINGS.ribbonText,
    closedMessage: data.closedMessage?.trim() || DEFAULT_VACANCY_SETTINGS.closedMessage,
  }
}

// Shared cache with ability to invalidate when updated via Admin Panel
let cache: VacancySettings | null = null
let inflight: Promise<VacancySettings> | null = null

export function invalidateVacancyCache(nextSettings?: VacancySettings) {
  cache = nextSettings ? normalizeVacancyCopy(nextSettings) : null
  inflight = null
}

function loadVacancySettings(): Promise<VacancySettings> {
  if (cache) return Promise.resolve(cache)
  if (!inflight) {
    const req: Promise<VacancySettings> = fetch('/api/settings/vacancy', { cache: 'no-store' })
      .then(r => (r.ok ? r.json() : null))
      .then((data): VacancySettings => {
        const resolved = normalizeVacancyCopy(data)
        cache = resolved
        return resolved
      })
      .catch((): VacancySettings => {
        inflight = null // allow a retry later
        return DEFAULT_VACANCY_SETTINGS
      })
    inflight = req
    return req
  }
  return inflight
}

export function useVacancySettings(): VacancySettings {
  const [settings, setSettings] = useState<VacancySettings>(cache ?? DEFAULT_VACANCY_SETTINGS)

  useEffect(() => {
    let active = true
    loadVacancySettings().then(s => {
      if (active) setSettings(s)
    })
    return () => {
      active = false
    }
  }, [])

  return settings
}
