import { Router, type Request, type Response, type NextFunction } from 'express'
import { env } from '../config/env.js'
import { contentModels } from '../models/content.js'

export const syncRouter = Router()

/**
 * Authentication middleware for Google Sheets extension / webhook sync.
 * Checks for x-sync-secret header, Bearer token, or secret query parameter.
 */
function requireSyncSecret(req: Request, res: Response, next: NextFunction) {
  const secret =
    req.headers['x-sync-secret'] ||
    req.headers.authorization?.replace(/^Bearer\s+/i, '') ||
    req.query.secret

  if (!secret || secret !== env.SHEETS_SYNC_SECRET) {
    return res.status(401).json({
      error: 'Unauthorized: Invalid or missing sync secret.',
      hint: 'Include the secret in x-sync-secret header or Bearer authorization.',
    })
  }
  next()
}

// All sync routes require the secret
syncRouter.use(requireSyncSecret)

// Helper parsers
function parseBool(val: any, defaultVal = false): boolean {
  if (typeof val === 'boolean') return val
  if (typeof val === 'number') return val === 1
  if (typeof val === 'string') {
    const s = val.trim().toLowerCase()
    if (['true', 'yes', '1', 'y', 't'].includes(s)) return true
    if (['false', 'no', '0', 'n', 'f'].includes(s)) return false
  }
  return defaultVal
}

function parseString(val: any): string | undefined {
  if (val === undefined || val === null) return undefined
  const s = String(val).trim()
  if (s === '' || s.toLowerCase() === 'na' || s.toLowerCase() === 'n/a') return undefined
  return s
}

function parseNumber(val: any, defaultVal?: number): number | undefined {
  if (typeof val === 'number' && !isNaN(val)) return val
  if (typeof val === 'string') {
    const n = Number(val.trim().replace(/[^0-9.-]/g, ''))
    if (!isNaN(n)) return n
  }
  return defaultVal
}

function parseStringList(val: any): string[] {
  if (Array.isArray(val)) {
    return val.map((s) => String(s).trim()).filter(Boolean)
  }
  if (typeof val === 'string') {
    // Split by newlines first (e.g. Team Members in a cell), or commas
    const delimiter = val.includes('\n') ? /\r?\n/ : /[,;]/
    return val
      .split(delimiter)
      .map((s) => s.trim())
      .filter((s) => s && s.toLowerCase() !== 'na' && s.toLowerCase() !== 'n/a')
  }
  return []
}

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '')
}

function makeIdFilter(id: any) {
  const strId = String(id).trim()
  const numId = Number(strId)
  if (!isNaN(numId) && String(numId) === strId) {
    return { $or: [{ id: strId }, { id: numId }] }
  }
  return { id: strId }
}

/**
 * Normalizes project status:
 * 'Completed' / 'Finished' -> 'Finished'
 * 'Active' / 'Ongoing' -> 'Ongoing'
 */
function normalizeProjectStatus(raw?: string): 'Ongoing' | 'Finished' {
  if (!raw) return 'Ongoing'
  const lower = raw.trim().toLowerCase()
  if (lower.includes('complete') || lower.includes('finish') || lower.includes('done')) {
    return 'Finished'
  }
  return 'Ongoing'
}

/**
 * GET /api/sync/sheets/export
 */
syncRouter.get('/sheets/export', async (_req, res, next) => {
  try {
    const teamModel = contentModels.get('team')!
    const prevInternsModel = contentModels.get('previous-interns')!
    const pubsModel = contentModels.get('publications')!
    const projectsModel = contentModels.get('projects')!
    const grantsModel = contentModels.get('grants')!

    const [teamDocs, prevInternDocs, pubDocs, projDocs, grantDocs] = await Promise.all([
      teamModel.find({}).sort({ order: 1 }).lean(),
      prevInternsModel.find({}).sort({ order: 1 }).lean(),
      pubsModel.find({}).sort({ order: 1, year: -1 }).lean(),
      projectsModel.find({}).sort({ order: 1 }).lean(),
      grantsModel.find({}).sort({ order: 1 }).lean(),
    ])

    res.json({
      success: true,
      counts: {
        team: teamDocs.length,
        previousInterns: prevInternDocs.length,
        publications: pubDocs.length,
        projects: projDocs.length,
        grants: grantDocs.length,
      },
      team: teamDocs,
      projects: projDocs,
    })
  } catch (err) {
    next(err)
  }
})

/**
 * POST /api/sync/cleanup
 * Wipes out legacy mock/placeholder records across all collections.
 */
syncRouter.post('/cleanup', async (req, res, next) => {
  try {
    const { wipeAll = false } = req.body || {}
    const deleted: Record<string, number> = {}

    for (const [slug, model] of contentModels.entries()) {
      if (wipeAll) {
        const r = await model.deleteMany({})
        deleted[slug] = r.deletedCount
        continue
      }

      const filters: any[] = [
        { placeholder: true },
        { image: { $regex: 'unsplash\\.com', $options: 'i' } },
        { coverImage: { $regex: 'unsplash\\.com', $options: 'i' } },
      ]

      if (slug === 'team') {
        filters.push({ id: { $in: ['ri1', 'ri2', 'ri3', 'ri4', 'ri5', 'ri6', 'ri7', 'ri8', 'ri9', 'ri10'] } })
      }
      if (slug === 'projects') {
        filters.push({ id: { $type: 'number' } })
        filters.push({ id: { $in: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'PRJ-1', 'PRJ-2', 'PRJ-3', 'PRJ-4', 'PRJ-5', 'PRJ-6', 'PRJ-7', 'PRJ-8', 'PRJ-9', 'PRJ-10'] } })
      }
      if (['interns', 'previous-interns', 'gallery', 'collaborations', 'performers', 'blogs', 'grants', 'publications', 'sponsors'].includes(slug)) {
        const r = await model.deleteMany({})
        deleted[slug] = r.deletedCount
        continue
      }

      const r = await model.deleteMany({ $or: filters })
      deleted[slug] = r.deletedCount
    }

    res.json({ success: true, message: 'All mock placeholders removed.', deleted })
  } catch (err) {
    next(err)
  }
})

/**
 * POST /api/sync/sheets
 * Supports:
 *  1. Exact AIR Lab 3-Tab Spreadsheet:
 *     - facultyAndInterns: [{ Name, Role, Email, Linkedin, Specialty, ID? }]
 *     - undergraduateProjects: [{ Title, Status, 'Team Members', 'Grant Supplier', 'Grant Amount', 'Time Taken', Pictures, 'Project Details', ID? }]
 *     - fundedProjects: [{ 'Program Title', 'Project Title', Status, 'Grant Supplier', 'Time Taken', 'Project Details', 'Name of PI', 'Grant Amour', 'Funder Website', ID? }]
 *  2. Universal legacy arrays (people, works).
 */
syncRouter.post('/sheets', async (req, res, next) => {
  try {
    const {
      facultyAndInterns,
      undergraduateProjects,
      fundedProjects,
      people,
      works,
      dryRun = false,
      clearBeforeSync = false,
      removePlaceholders = true,
    } = req.body

    const stats = {
      facultyAndInterns: { processed: 0, updated: 0, created: 0, errors: [] as string[] },
      undergraduateProjects: { processed: 0, updated: 0, created: 0, errors: [] as string[] },
      fundedProjects: { processed: 0, updated: 0, created: 0, errors: [] as string[] },
      people: { processed: 0, updated: 0, created: 0, errors: [] as string[] },
      works: { processed: 0, updated: 0, created: 0, errors: [] as string[] },
    }

    const teamModel = contentModels.get('team')!
    const projectsModel = contentModels.get('projects')!

    // =========================================================================
    if (!dryRun) {
      if (clearBeforeSync && Array.isArray(facultyAndInterns)) {
        await teamModel.deleteMany({})
      } else if (removePlaceholders) {
        await teamModel.deleteMany({
          $or: [
            { id: { $in: ['ri1', 'ri2', 'ri3', 'ri4', 'ri5', 'ri6', 'ri7', 'ri8', 'ri9', 'ri10'] } },
            { image: { $regex: 'unsplash\\.com', $options: 'i' } },
            { placeholder: true },
          ],
        })
      }

      if (clearBeforeSync && (Array.isArray(undergraduateProjects) || Array.isArray(fundedProjects))) {
        await projectsModel.deleteMany({})
      } else if (removePlaceholders) {
        await projectsModel.deleteMany({
          $or: [
            { id: { $type: 'number' } },
            { id: { $in: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'PRJ-1', 'PRJ-2', 'PRJ-3', 'PRJ-4', 'PRJ-5', 'PRJ-6', 'PRJ-7', 'PRJ-8', 'PRJ-9', 'PRJ-10'] } },
            { coverImage: { $regex: 'unsplash\\.com', $options: 'i' } },
            { placeholder: true },
          ],
        })
      }
    }

    // 1. Process Tab: Faculty & Interns
    // =========================================================================
    if (Array.isArray(facultyAndInterns)) {
      for (const row of facultyAndInterns) {
        if (!row || typeof row !== 'object') continue
        const name = parseString(row.Name || row.name)
        if (!name) continue

        stats.facultyAndInterns.processed++
        const roleRaw = (parseString(row.Role || row.role) || '').toLowerCase()
        const isFaculty =
          roleRaw.includes('fac') ||
          roleRaw.includes('prof') ||
          roleRaw.includes('dr') ||
          row.category === 'Faculty' ||
          Boolean(row.isLead) ||
          name.toLowerCase().includes('marvi') ||
          name.toLowerCase().includes('mubashir')
        const category = isFaculty ? 'Faculty' : 'Research Interns'
        const role = parseString(row.Role || row.role) || (isFaculty ? 'Faculty Member' : 'Research Intern')
        const isLead = Boolean(row.isLead || name.toLowerCase().includes('marvi') || name.toLowerCase().includes('mubashir'))
        const image = parseString(row.image) || (name.toLowerCase().includes('marvi') ? './pfp/marvi.jpeg' : '')
        const email = parseString(row.Email || row.email)
        const linkedin = parseString(row.Linkedin || row.linkedin)
        const specialty = parseString(row.Specialty || row.specialty || row.tags)
        const tags = specialty ? parseStringList(specialty) : []

        // ID resolution: use explicit ID if provided, otherwise stable slug derived from name
        const rawId = parseString(row.id || row.ID) || (isFaculty ? `fac-${slugify(name)}` : `ri-${slugify(name)}`)

        const docData: Record<string, any> = {
          id: rawId,
          name,
          category,
          role,
          email,
          linkedin,
          researchFocus: specialty,
          tags,
          isLead,
          image,
          published: true,
        }

        if (!dryRun) {
          // Look up by ID, or email, or exact name
          const filter: any = {
            $or: [{ id: rawId }],
          }
          if (email) filter.$or.push({ email })
          if (name) filter.$or.push({ name: new RegExp(`^${name}$`, 'i') })

          const existing = await teamModel.findOne(filter)
          if (existing) {
            await teamModel.updateOne({ _id: existing._id }, { $set: docData })
            stats.facultyAndInterns.updated++
          } else {
            await teamModel.create(docData)
            stats.facultyAndInterns.created++
          }
        }
      }
    }

    // =========================================================================
    // 2. Process Tab: Undergraduate Projects
    // =========================================================================
    if (Array.isArray(undergraduateProjects)) {
      for (const row of undergraduateProjects) {
        if (!row || typeof row !== 'object') continue
        const title = parseString(row.Title || row.title)
        if (!title) continue

        stats.undergraduateProjects.processed++
        const status = normalizeProjectStatus(parseString(row.Status || row.status))
        const teamMembersRaw = row['Team Members'] || row.teamMembers
        const teamMembers = teamMembersRaw ? parseStringList(teamMembersRaw) : []
        const grantSupplier = parseString(row['Grant Supplier'] || row.grantSupplier)
        const grantAmount = parseString(row['Grant Amount'] || row.grantAmount)
        const timeTaken = parseString(row['Time Taken'] || row.timeTaken)
        const pictures = parseString(row.Pictures || row.pictures || row.coverImage)
        const projectDetails = parseString(row['Project Details'] || row.description || row.projectDetails)

        const rawId = parseString(row.id || row.ID) || `ug-${slugify(title).slice(0, 36)}`

        const docData: Record<string, any> = {
          id: rawId,
          title,
          category: 'Undergraduate',
          status,
          teamMembers,
          grantSupplier: grantSupplier || '',
          grantAmount: grantAmount || '',
          funding: grantSupplier || 'Departmental / Self-Funded',
          timeTaken: timeTaken || '',
          startDate: timeTaken || '',
          coverImage: pictures || '',
          description: projectDetails || '',
          published: true,
        }

        if (!dryRun) {
          const filter: any = {
            $or: [{ id: rawId }, { title: new RegExp(`^${title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }],
          }

          const existing = await projectsModel.findOne(filter)
          if (existing) {
            await projectsModel.updateOne({ _id: existing._id }, { $set: docData })
            stats.undergraduateProjects.updated++
          } else {
            await projectsModel.create(docData)
            stats.undergraduateProjects.created++
          }
        }
      }
    }

    // =========================================================================
    // 3. Process Tab: Funded Projects
    // =========================================================================
    if (Array.isArray(fundedProjects)) {
      for (const row of fundedProjects) {
        if (!row || typeof row !== 'object') continue
        const title = parseString(row['Project Title'] || row.title || row.Title)
        if (!title) continue

        stats.fundedProjects.processed++
        const programTitle = parseString(row['Program Title'] || row.programTitle)
        const status = normalizeProjectStatus(parseString(row.Status || row.status))
        const grantSupplier = parseString(row['Grant Supplier'] || row.grantSupplier)
        const timeTaken = parseString(row['Time Taken'] || row.timeTaken)
        const projectDetails = parseString(row['Project Details'] || row.description || row.projectDetails)
        const pi = parseString(row['Name of PI'] || row.pi || row.leadInvestigator)
        const grantAmount = parseString(row['Grant Amour'] || row['Grant Amount'] || row.grantAmount)
        const funderUrl = parseString(row['Funder Website'] || row.funderUrl)

        const rawId = parseString(row.id || row.ID) || `fnd-${slugify(title).slice(0, 36)}`

        const docData: Record<string, any> = {
          id: rawId,
          title,
          category: 'Funded',
          programTitle: programTitle || '',
          status,
          grantSupplier: grantSupplier || '',
          funding: grantSupplier || '',
          timeTaken: timeTaken || '',
          startDate: timeTaken || '',
          description: projectDetails || '',
          pi: pi || '',
          grantAmount: grantAmount || '',
          funderUrl: funderUrl || '',
          published: true,
        }

        if (!dryRun) {
          const filter: any = {
            $or: [{ id: rawId }, { title: new RegExp(`^${title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }],
          }

          const existing = await projectsModel.findOne(filter)
          if (existing) {
            await projectsModel.updateOne({ _id: existing._id }, { $set: docData })
            stats.fundedProjects.updated++
          } else {
            await projectsModel.create(docData)
            stats.fundedProjects.created++
          }
        }
      }
    }

    res.json({
      success: true,
      message: dryRun ? 'Dry run completed successfully.' : 'Google Sheets data synchronized to database.',
      stats,
    })
  } catch (err) {
    next(err)
  }
})
