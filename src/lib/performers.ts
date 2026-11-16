import type { GalleryPhoto, PerformerItem } from '../types/data'

const MONTHS = [
  'january',
  'february',
  'march',
  'april',
  'may',
  'june',
  'july',
  'august',
  'september',
  'october',
  'november',
  'december',
]

/**
 * Identifies the two legacy placeholder documents ("Spotlight Awardee" with date-range months)
 * if any still exist in the database.
 */
export function isLegacyDateRangeItem(item: Partial<PerformerItem>): boolean {
  const month = String(item.month || '')
  const id = String(item.id || '')
  const name = String(item.name || '').trim()
  if (id === 'pom-sep-oct-2026' || id === 'pom-jul-aug-2026') return true
  return name === 'Spotlight Awardee' && /[–-]/.test(month)
}

export function getMonthSortIndex(month?: string): number {
  const lower = String(month || '').toLowerCase()
  const monthIdx = MONTHS.findIndex(m => lower.includes(m) || lower.includes(m.slice(0, 3)))
  if (monthIdx < 0) return -1
  const yearMatch = lower.match(/\b(20\d{2})\b/)
  const year = yearMatch ? Number(yearMatch[1]) : 2026
  return year * 12 + monthIdx
}

/**
 * Normalizes a performer's primary `image` and `photos` array into `{ url, caption }`
 * entries while preserving order and removing duplicate URLs within the record.
 */
export function extractPerformerPhotos(item: Partial<PerformerItem>): GalleryPhoto[] {
  const seen = new Set<string>()
  const result: GalleryPhoto[] = []

  const addEntry = (rawUrl?: string, caption?: string) => {
    const url = typeof rawUrl === 'string' ? rawUrl.trim() : ''
    if (!url || seen.has(url)) return
    seen.add(url)
    result.push({ url, caption: (caption || '').trim() })
  }

  if (Array.isArray(item.photos)) {
    for (const entry of item.photos) {
      if (typeof entry === 'string') {
        addEntry(entry)
      } else if (entry && typeof entry === 'object' && typeof entry.url === 'string') {
        addEntry(entry.url, entry.caption)
      }
    }
  }

  if (item.image) {
    const trimmed = item.image.trim()
    if (trimmed && !seen.has(trimmed)) {
      seen.add(trimmed)
      result.unshift({ url: trimmed, caption: '' })
    }
  }

  return result
}

export function mergePerformersWithLocal(
  apiItems: PerformerItem[],
  localItems: PerformerItem[]
): PerformerItem[] {
  const activeApi = apiItems.filter(item => !isLegacyDateRangeItem(item))
  if (activeApi.length === 0) return localItems

  const matchedApiKeys = new Set<string>()
  const getKey = (item: PerformerItem, idx: number) =>
    String(item._id || `${item.id || ''}-${item.month || idx}`)

  const mergedLocal = localItems.map(localItem => {
    const matchIdx = activeApi.findIndex(
      apiItem =>
        String(apiItem.id) === String(localItem.id) &&
        String(apiItem.month || '').trim().toLowerCase() ===
          String(localItem.month || '').trim().toLowerCase()
    )
    if (matchIdx === -1) return localItem
    const match = activeApi[matchIdx]
    matchedApiKeys.add(getKey(match, matchIdx))
    return {
      ...localItem,
      ...match,
      photos:
        Array.isArray(match.photos) && match.photos.length > 0
          ? match.photos
          : localItem.photos,
      coAwardees:
        Array.isArray(match.coAwardees) && match.coAwardees.length > 0
          ? match.coAwardees
          : localItem.coAwardees,
    }
  })

  const addedFromAdmin = activeApi.filter(
    (apiItem, idx) => !matchedApiKeys.has(getKey(apiItem, idx))
  )

  const combined = [...mergedLocal, ...addedFromAdmin]
  // Most recent month first
  combined.sort((a, b) => getMonthSortIndex(b.month) - getMonthSortIndex(a.month))
  return combined
}

/**
 * Filters out legacy placeholder records and sorts database performers most recent month first.
 */
export function normalizeDbPerformers(apiItems: PerformerItem[]): PerformerItem[] {
  return apiItems
    .filter(item => !isLegacyDateRangeItem(item))
    .slice()
    .sort((a, b) => {
      const scoreDiff = getMonthSortIndex(b.month) - getMonthSortIndex(a.month)
      if (scoreDiff !== 0) return scoreDiff
      const orderA = typeof (a as any).order === 'number' ? (a as any).order : 99
      const orderB = typeof (b as any).order === 'number' ? (b as any).order : 99
      return orderA - orderB
    })
}
