import { useEffect, useState } from 'react'

/** Vacancy modal + top-ribbon copy, edited from the "Vacancies" tab in Google Sheets. */
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

function sanitizeVacancyCopy(data: Partial<VacancySettings> | null | undefined): VacancySettings {
  if (!data || typeof data !== 'object') return DEFAULT_VACANCY_SETTINGS
  const isLegacyText = (val?: string) =>
    !val || /internship|fellowship|vacanc/i.test(val)

  return {
    status: data.status === 'Closed' ? 'Closed' : 'Open',
    badge: isLegacyText(data.badge) ? DEFAULT_VACANCY_SETTINGS.badge : data.badge!,
    title: isLegacyText(data.title) ? DEFAULT_VACANCY_SETTINGS.title : data.title!,
    description: isLegacyText(data.description) ? DEFAULT_VACANCY_SETTINGS.description : data.description!,
    ribbonLabel:
      !data.ribbonLabel || /open|internship|fellowship|vacanc/i.test(data.ribbonLabel)
        ? DEFAULT_VACANCY_SETTINGS.ribbonLabel
        : data.ribbonLabel,
    ribbonText: isLegacyText(data.ribbonText) ? DEFAULT_VACANCY_SETTINGS.ribbonText : data.ribbonText!,
    closedMessage: data.closedMessage || DEFAULT_VACANCY_SETTINGS.closedMessage,
  }
}

// One shared request per page load, reused by every component that needs it.
let cache: VacancySettings | null = null
let inflight: Promise<VacancySettings> | null = null

function loadVacancySettings(): Promise<VacancySettings> {
  if (cache) return Promise.resolve(cache)
  if (!inflight) {
    const req: Promise<VacancySettings> = fetch('/api/settings/vacancy')
      .then(r => (r.ok ? r.json() : null))
      .then((data): VacancySettings => {
        const resolved = sanitizeVacancyCopy(data)
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
