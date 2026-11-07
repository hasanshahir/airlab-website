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
  badge: 'FELLOWSHIP & INTERNSHIP ADMISSIONS',
  title: 'Apply for Research Vacancy',
  description:
    'Department of CSIT · NED University. Work directly with faculty on LLMs, edge perception, and robotics testbeds.',
  ribbonLabel: 'Applications Open:',
  ribbonText: 'Student Research Internship & Fellowship Vacancies Open for Fall 2026 — NEDUET CSIT',
  closedMessage:
    'Applications are currently closed. Please check back soon or follow our updates for the next intake.',
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
        const resolved: VacancySettings = {
          ...DEFAULT_VACANCY_SETTINGS,
          ...(data && typeof data === 'object' ? data : {}),
        }
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

