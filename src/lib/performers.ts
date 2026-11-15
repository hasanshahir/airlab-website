import type { GalleryPhoto, PerformerItem } from '../types/data'

const MONTH_ORDER = ['july', 'august', 'september', 'october']

/**
 * Identifies the two legacy placeholder documents originally seeded in MongoDB
 * ("Spotlight Awardee" with date-range months) so they don't override the
 * month-wise local awardees unless explicitly replaced/created in Admin.
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
  const idx = MONTH_ORDER.findIndex(m => lower.includes(m))
  return idx >= 0 ? idx : 99
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
    // Prefer keeping primary image first if it wasn't already added in `photos`
    const trimmed = item.image.trim()
    if (trimmed && !seen.has(trimmed)) {
      seen.add(trimmed)
      result.unshift({ url: trimmed, caption: '' })
    }
  }

  return result
}

/**
 * Merges live API performers with local month-wise seed data, preserving any
 * Admin-edited overrides and appending newly created performers from Admin.
 */
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
  combined.sort((a, b) => getMonthSortIndex(a.month) - getMonthSortIndex(b.month))
  return combined
}
