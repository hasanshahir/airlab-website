export const DEFAULT_AVATAR = '/placeholder-avatar.svg'
export const DEFAULT_PROJECT_COVER = '/placeholder-project.svg'

/**
 * Validates a member avatar URL.
 * Replaces missing, empty, or stock unsplash/dummy images with generic placeholder.
 */
export function getMemberAvatar(image?: string): string {
  if (!image || typeof image !== 'string') return DEFAULT_AVATAR
  const clean = image.trim()
  if (!clean || clean === 'undefined' || clean === 'null') return DEFAULT_AVATAR
  if (clean.includes('unsplash.com') || clean.includes('default.png')) return DEFAULT_AVATAR
  return clean
}

/**
 * Validates a project cover image URL.
 * Replaces missing, empty, or stock unsplash/dummy images with generic placeholder.
 */
export function getProjectCover(image?: string): string {
  if (!image || typeof image !== 'string') return DEFAULT_PROJECT_COVER
  const clean = image.trim()
  if (!clean || clean === 'undefined' || clean === 'null') return DEFAULT_PROJECT_COVER
  if (clean.includes('unsplash.com')) return DEFAULT_PROJECT_COVER
  return clean
}
