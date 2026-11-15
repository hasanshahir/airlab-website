import mongoose from 'mongoose'
import { contentModels } from '../models/content.js'
import { externalizeImages } from '../routes/media.js'

export interface DirectoryMember {
  id: string
  _id?: string
  name: string
  role: string
  category: string
  categoryTab: 'faculty' | 'interns' | 'previous'
  department?: string
  researchFocus?: string
  email?: string
  linkedin?: string
  cvUrl?: string
  avatar?: string
}

export interface MemberDirectory {
  byId: Map<string, DirectoryMember>
  byName: Map<string, DirectoryMember>
}

function getCategoryTab(doc: Record<string, any>, sourceSlug: string): 'faculty' | 'interns' | 'previous' {
  if (
    sourceSlug === 'previous-interns' ||
    doc.category === 'Alumni' ||
    doc.category === 'Previous Interns'
  ) {
    return 'previous'
  }
  if (doc.isLead || doc.category === 'Faculty') {
    return 'faculty'
  }
  return 'interns'
}

export async function buildMemberDirectory(options?: {
  includeUnpublished?: boolean
  externalizeAvatars?: boolean
}): Promise<MemberDirectory> {
  const byId = new Map<string, DirectoryMember>()
  const byName = new Map<string, DirectoryMember>()

  if (mongoose.connection.readyState !== 1) {
    return { byId, byName }
  }

  const filter = options?.includeUnpublished ? {} : { published: true }
  const teamModel = contentModels.get('team')
  const prevModel = contentModels.get('previous-interns')

  const [rawTeam, rawPrev] = await Promise.all([
    teamModel ? teamModel.find(filter).maxTimeMS(4000).lean() : Promise.resolve([]),
    prevModel ? prevModel.find(filter).maxTimeMS(4000).lean() : Promise.resolve([]),
  ])

  const register = (doc: Record<string, any>, sourceSlug: string) => {
    const normalizedDoc =
      options?.externalizeAvatars && sourceSlug === 'team'
        ? externalizeImages('team', doc)
        : doc

    const publicId = String(normalizedDoc.id ?? normalizedDoc._id ?? '').trim()
    const mongoId = normalizedDoc._id ? String(normalizedDoc._id).trim() : ''
    const name = String(normalizedDoc.name ?? '').trim()
    if (!publicId || !name) return

    const entry: DirectoryMember = {
      id: publicId,
      _id: mongoId || undefined,
      name,
      role: String(
        normalizedDoc.role ||
          normalizedDoc.tenure ||
          (sourceSlug === 'previous-interns' ? 'Former Research Intern' : 'Research Intern')
      ).trim(),
      category: String(
        normalizedDoc.category ||
          (sourceSlug === 'previous-interns' ? 'Past Interns' : 'Research Interns')
      ).trim(),
      categoryTab: getCategoryTab(normalizedDoc, sourceSlug),
      department: normalizedDoc.department ? String(normalizedDoc.department).trim() : undefined,
      researchFocus: normalizedDoc.researchFocus ? String(normalizedDoc.researchFocus).trim() : undefined,
      email: normalizedDoc.email ? String(normalizedDoc.email).trim() : undefined,
      linkedin: normalizedDoc.linkedin ? String(normalizedDoc.linkedin).trim() : undefined,
      cvUrl: normalizedDoc.cvUrl ? String(normalizedDoc.cvUrl).trim() : undefined,
      avatar: normalizedDoc.image ? String(normalizedDoc.image).trim() : undefined,
    }

    if (!byId.has(publicId)) byId.set(publicId, entry)
    if (mongoId && !byId.has(mongoId)) byId.set(mongoId, entry)
    const lowerName = name.toLowerCase()
    if (!byName.has(lowerName)) byName.set(lowerName, entry)
  }

  for (const doc of rawTeam as Record<string, any>[]) {
    register(doc, 'team')
  }
  for (const doc of rawPrev as Record<string, any>[]) {
    register(doc, 'previous-interns')
  }

  return { byId, byName }
}

function formatAwardeeNames(names: string[]): string {
  const clean = names.map(n => n.trim()).filter(Boolean)
  if (clean.length === 0) return ''
  if (clean.length === 1) return clean[0]
  if (clean.length === 2) return `${clean[0]} & ${clean[1]}`
  return `${clean.slice(0, -1).join(', ')} & ${clean[clean.length - 1]}`
}

function formatAwardeeRole(roles: string[]): string {
  const unique = Array.from(new Set(roles.map(r => r.trim()).filter(Boolean)))
  if (unique.length === 0) return 'Research Intern'
  if (roles.length === 1) return unique[0]
  if (unique.length === 1) {
    const single = unique[0]
    if (/intern$/i.test(single)) return `${single}s`
    return single
  }
  return unique.join(' & ')
}

function resolveMemberIdsFromRecord(item: Record<string, any>, directory: MemberDirectory): string[] {
  const seen = new Set<string>()
  const result: string[] = []
  const pushId = (raw?: unknown) => {
    const val = typeof raw === 'string' ? raw.trim() : typeof raw === 'number' ? String(raw) : ''
    if (!val || seen.has(val)) return
    seen.add(val)
    result.push(val)
  }

  if (Array.isArray(item.memberIds) && item.memberIds.length > 0) {
    item.memberIds.forEach(pushId)
    if (result.length > 0) return result
  }

  if (Array.isArray(item.coAwardees) && item.coAwardees.length > 0) {
    for (const awardee of item.coAwardees) {
      if (awardee && typeof awardee === 'object') {
        if (awardee.id) {
          pushId(awardee.id)
        } else if (typeof awardee.name === 'string') {
          const matched = directory.byName.get(awardee.name.trim().toLowerCase())
          if (matched) pushId(matched.id)
        }
      }
    }
    if (result.length > 0) return result
  }

  const rawId = item.id !== undefined && item.id !== null ? String(item.id).trim() : ''
  if (rawId && directory.byId.has(rawId)) {
    pushId(directory.byId.get(rawId)!.id)
    return result
  }

  if (typeof item.name === 'string' && item.name.trim()) {
    const parts = item.name
      .split(/\s*(?:&|,|\band\b)\s*/i)
      .map(s => s.trim())
      .filter(Boolean)
    for (const part of parts) {
      const matched = directory.byName.get(part.toLowerCase())
      if (matched) pushId(matched.id)
    }
  }

  return result
}

export function enrichPerformerRecord(
  item: Record<string, any>,
  directory: MemberDirectory,
  options?: { omitBase64Avatars?: boolean }
): Record<string, any> {
  const memberIds = resolveMemberIdsFromRecord(item, directory)
  const existingAwardees = new Map<string, Record<string, any>>()
  if (Array.isArray(item.coAwardees)) {
    for (const c of item.coAwardees) {
      if (c && typeof c === 'object' && c.id) {
        existingAwardees.set(String(c.id).trim(), c)
      }
    }
  }

  const hasExplicitNotes =
    item.memberNotes !== undefined &&
    item.memberNotes !== null &&
    typeof item.memberNotes === 'object' &&
    !Array.isArray(item.memberNotes)
  const rawNotes = hasExplicitNotes ? (item.memberNotes as Record<string, unknown>) : {}

  const resolvedAwardees: Record<string, any>[] = []
  const cleanedNotes: Record<string, string> = {}

  for (const id of memberIds) {
    const member = directory.byId.get(id)
    const fallback = existingAwardees.get(id)
    const noteRaw = hasExplicitNotes
      ? typeof rawNotes[id] === 'string'
        ? rawNotes[id]
        : ''
      : typeof fallback?.note === 'string'
        ? fallback.note
        : ''
    const note = noteRaw.trim()
    if (note) {
      cleanedNotes[id] = note
    }

    if (member) {
      const avatar =
        options?.omitBase64Avatars && member.avatar?.startsWith('data:image')
          ? undefined
          : member.avatar
      resolvedAwardees.push({
        id: member.id,
        name: member.name,
        role: member.role,
        category: member.category,
        categoryTab: member.categoryTab,
        ...(member.department ? { department: member.department } : {}),
        ...(member.researchFocus ? { researchFocus: member.researchFocus } : {}),
        ...(member.email ? { email: member.email } : {}),
        ...(member.linkedin ? { linkedin: member.linkedin } : {}),
        ...(member.cvUrl ? { cvUrl: member.cvUrl } : {}),
        ...(avatar ? { avatar } : {}),
        ...(note ? { note } : {}),
      })
    } else if (fallback) {
      resolvedAwardees.push({
        ...fallback,
        ...(note ? { note } : {}),
      })
    }
  }

  if (resolvedAwardees.length === 0) {
    return item
  }

  const derivedName = formatAwardeeNames(resolvedAwardees.map(a => String(a.name || '')))
  const derivedRole = formatAwardeeRole(resolvedAwardees.map(a => String(a.role || '')))
  const derivedDepartment = Array.from(
    new Set(resolvedAwardees.map(a => String(a.department || '').trim()).filter(Boolean))
  ).join(' · ')

  const canonicalIds = resolvedAwardees.map(a => String(a.id)).filter(Boolean)
  const first = resolvedAwardees[0]

  const enriched: Record<string, any> = {
    ...item,
    memberIds: canonicalIds,
    memberNotes: cleanedNotes,
    name: derivedName || item.name,
    role: derivedRole || item.role,
    department: derivedDepartment || item.department,
    categoryTab: first?.categoryTab || item.categoryTab || 'interns',
    coAwardees: resolvedAwardees,
  }

  if (resolvedAwardees.length === 1) {
    enriched.email = first.email || ''
    enriched.linkedin = first.linkedin || ''
    enriched.cvUrl = first.cvUrl || ''
    if (first.avatar) enriched.avatar = first.avatar
    else enriched.avatar = ''
  } else {
    enriched.email = ''
    enriched.linkedin = ''
    enriched.cvUrl = ''
    enriched.avatar = ''
  }

  return enriched
}

export async function enrichPerformersList(
  items: Record<string, any>[],
  options?: { includeUnpublished?: boolean; externalizeAvatars?: boolean }
): Promise<Record<string, any>[]> {
  if (!Array.isArray(items) || items.length === 0) return items
  try {
    const directory = await buildMemberDirectory({
      includeUnpublished: options?.includeUnpublished,
      externalizeAvatars: options?.externalizeAvatars,
    })
    return items.map(item => enrichPerformerRecord(item, directory))
  } catch {
    return items
  }
}

export async function preparePerformerWritePayload(
  clean: Record<string, unknown>
): Promise<Record<string, unknown>> {
  const next = { ...clean }
  const directory = await buildMemberDirectory({
    includeUnpublished: true,
    externalizeAvatars: false,
  })

  const enriched = enrichPerformerRecord(next, directory, { omitBase64Avatars: true })

  // Ensure name is always present for schema/display consistency
  if (!String(enriched.name || '').trim()) {
    enriched.name =
      String(enriched.title || '').trim() ||
      String(enriched.month || '').trim() ||
      'Performer of the Month'
  }

  return enriched
}
