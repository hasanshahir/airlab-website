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
  return s.length > 0 ? s : undefined
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
    return val
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
  }
  return []
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
 * GET /api/sync/sheets/export
 * Dumps all current records formatted for the Google Sheets People & Works tabs.
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

    // Format People sheet items
    const people = [
      ...teamDocs.map((doc: any) => ({
        id: String(doc.id ?? doc._id),
        name: doc.name || '',
        category: doc.category || 'Research Interns',
        role: doc.role || '',
        designation: doc.designation || '',
        department: doc.department || '',
        email: doc.email || '',
        linkedin: doc.linkedin || '',
        image: doc.image || '',
        cvUrl: doc.cvUrl || '',
        researchFocus: doc.researchFocus || '',
        tags: Array.isArray(doc.tags) ? doc.tags.join(', ') : '',
        isLead: Boolean(doc.isLead),
        tenure: doc.tenure || '',
        order: doc.order ?? 0,
        published: doc.published ?? true,
      })),
      ...prevInternDocs.map((doc: any) => ({
        id: String(doc.id ?? doc._id),
        name: doc.name || '',
        category: 'Previous Interns',
        role: 'Alumni / Previous Intern',
        designation: '',
        department: doc.department || '',
        email: doc.email || '',
        linkedin: doc.linkedin || '',
        image: '',
        cvUrl: '',
        researchFocus: '',
        tags: '',
        isLead: false,
        tenure: doc.tenure || '',
        order: doc.order ?? 0,
        published: doc.published ?? true,
      })),
    ]

    // Format Research & Works sheet items
    const works = [
      ...pubDocs.map((doc: any) => ({
        id: String(doc.id ?? doc._id),
        entityType: 'Publication',
        title: doc.title || '',
        category: doc.type || 'Conference',
        status: 'Published',
        authors_or_pi: doc.authors || '',
        venue_or_funder: doc.venue || '',
        year: doc.year || '',
        amount: doc.impactFactor || '',
        link_or_doi: doc.link || doc.doi || '',
        pdf: doc.pdf || '',
        coverImage: '',
        description: doc.abstract || '',
        tags: Array.isArray(doc.tags) ? doc.tags.join(', ') : '',
        order: doc.order ?? 0,
        published: doc.published ?? true,
      })),
      ...projDocs.map((doc: any) => ({
        id: String(doc.id ?? doc._id),
        entityType: 'Project',
        title: doc.title || '',
        category: doc.category || 'Funded',
        status: doc.status || 'Ongoing',
        authors_or_pi: doc.pi || '',
        venue_or_funder: doc.grantSupplier || doc.funding || '',
        year: doc.startDate || '',
        amount: doc.grantAmount || '',
        link_or_doi: doc.funderUrl || '',
        pdf: '',
        coverImage: doc.coverImage || '',
        description: doc.description || '',
        tags: Array.isArray(doc.tags) ? doc.tags.join(', ') : '',
        order: doc.order ?? 0,
        published: doc.published ?? true,
      })),
      ...grantDocs.map((doc: any) => ({
        id: String(doc.id ?? doc._id),
        entityType: 'Grant',
        title: doc.title || '',
        category: 'Grant',
        status: doc.status || 'Active',
        authors_or_pi: doc.leadInvestigator || '',
        venue_or_funder: doc.funder || '',
        year: doc.duration || '',
        amount: doc.amount || '',
        link_or_doi: doc.url || '',
        pdf: '',
        coverImage: doc.image || '',
        description: doc.description || '',
        tags: '',
        order: doc.order ?? 0,
        published: doc.published ?? true,
      })),
    ]

    res.json({
      success: true,
      counts: {
        people: people.length,
        works: works.length,
      },
      people,
      works,
    })
  } catch (err) {
    next(err)
  }
})

/**
 * POST /api/sync/sheets
 * Receives rows from Google Sheets extension and updates/upserts into MongoDB collections.
 */
syncRouter.post('/sheets', async (req, res, next) => {
  try {
    const { people, works, dryRun = false } = req.body

    const stats = {
      people: { processed: 0, updated: 0, created: 0, errors: [] as string[] },
      works: { processed: 0, updated: 0, created: 0, errors: [] as string[] },
    }

    // 1. Process People rows
    if (Array.isArray(people)) {
      const teamModel = contentModels.get('team')!
      const prevInternsModel = contentModels.get('previous-interns')!

      for (const row of people) {
        if (!row || typeof row !== 'object') continue
        const rawId = parseString(row.id)
        const name = parseString(row.name)

        if (!rawId || !name) {
          stats.people.errors.push(`Skipped row: missing required 'id' or 'name' (${JSON.stringify(row)})`)
          continue
        }

        stats.people.processed++
        const category = parseString(row.category) || 'Research Interns'
        const isPrevious = category.toLowerCase().includes('previous')
        const targetModel = isPrevious ? prevInternsModel : teamModel

        const docData: Record<string, any> = {
          id: rawId,
          name,
          email: parseString(row.email),
          linkedin: parseString(row.linkedin),
          department: parseString(row.department),
          tenure: parseString(row.tenure),
          order: parseNumber(row.order, 0),
          published: parseBool(row.published, true),
        }

        if (!isPrevious) {
          docData.role = parseString(row.role) || 'Researcher'
          docData.category = category
          docData.designation = parseString(row.designation)
          docData.image = parseString(row.image)
          docData.cvUrl = parseString(row.cvUrl)
          docData.researchFocus = parseString(row.researchFocus)
          docData.tags = parseStringList(row.tags)
          docData.isLead = parseBool(row.isLead, false)
          docData.term = parseString(row.term)
          if (row.year) docData.year = parseNumber(row.year)
        }

        if (!dryRun) {
          const filter = makeIdFilter(rawId)
          const existing = await targetModel.findOne(filter)
          if (existing) {
            await targetModel.updateOne(filter, { $set: docData })
            stats.people.updated++
          } else {
            await targetModel.create(docData)
            stats.people.created++
          }
        }
      }
    }

    // 2. Process Research & Works rows
    if (Array.isArray(works)) {
      const pubsModel = contentModels.get('publications')!
      const projectsModel = contentModels.get('projects')!
      const grantsModel = contentModels.get('grants')!

      for (const row of works) {
        if (!row || typeof row !== 'object') continue
        const rawId = parseString(row.id)
        const title = parseString(row.title)
        const entityType = (parseString(row.entityType) || '').toLowerCase()

        if (!rawId || !title) {
          stats.works.errors.push(`Skipped row: missing required 'id' or 'title' (${JSON.stringify(row)})`)
          continue
        }

        stats.works.processed++

        if (entityType === 'publication') {
          const docData: Record<string, any> = {
            id: rawId,
            title,
            authors: parseString(row.authors_or_pi || row.authors) || 'AIR Lab',
            venue: parseString(row.venue_or_funder || row.venue) || 'Conference',
            type: parseString(row.category || row.type) || 'Conference',
            year: parseNumber(row.year, new Date().getFullYear()),
            link: parseString(row.link_or_doi || row.link),
            doi: parseString(row.link_or_doi || row.doi),
            pdf: parseString(row.pdf),
            impactFactor: parseString(row.amount || row.impactFactor),
            abstract: parseString(row.description || row.abstract),
            tags: parseStringList(row.tags),
            order: parseNumber(row.order, 0),
            published: parseBool(row.published, true),
          }

          if (!dryRun) {
            const filter = makeIdFilter(rawId)
            const existing = await pubsModel.findOne(filter)
            if (existing) {
              await pubsModel.updateOne(filter, { $set: docData })
              stats.works.updated++
            } else {
              await pubsModel.create(docData)
              stats.works.created++
            }
          }
        } else if (entityType === 'grant') {
          const docData: Record<string, any> = {
            id: rawId,
            title,
            funder: parseString(row.venue_or_funder || row.funder) || 'Funding Agency',
            amount: parseString(row.amount),
            duration: parseString(row.year || row.duration) || 'Active',
            status: parseString(row.status) || 'Active',
            leadInvestigator: parseString(row.authors_or_pi || row.leadInvestigator),
            description: parseString(row.description),
            url: parseString(row.link_or_doi || row.url),
            image: parseString(row.coverImage || row.image),
            order: parseNumber(row.order, 0),
            published: parseBool(row.published, true),
          }

          if (!dryRun) {
            const filter = makeIdFilter(rawId)
            const existing = await grantsModel.findOne(filter)
            if (existing) {
              await grantsModel.updateOne(filter, { $set: docData })
              stats.works.updated++
            } else {
              await grantsModel.create(docData)
              stats.works.created++
            }
          }
        } else {
          // Default to Project (covers 'project', 'projects', or undefined)
          const docData: Record<string, any> = {
            id: rawId,
            title,
            category: parseString(row.category) || 'Funded',
            status: parseString(row.status) || 'Ongoing',
            description: parseString(row.description) || '',
            pi: parseString(row.authors_or_pi || row.pi),
            grantSupplier: parseString(row.venue_or_funder || row.grantSupplier),
            funding: parseString(row.venue_or_funder || row.funding),
            grantAmount: parseString(row.amount || row.grantAmount),
            funderUrl: parseString(row.link_or_doi || row.funderUrl),
            startDate: parseString(row.year || row.startDate),
            coverImage: parseString(row.coverImage || row.image),
            tags: parseStringList(row.tags),
            order: parseNumber(row.order, 0),
            published: parseBool(row.published, true),
          }

          if (!dryRun) {
            const filter = makeIdFilter(rawId)
            const existing = await projectsModel.findOne(filter)
            if (existing) {
              await projectsModel.updateOne(filter, { $set: docData })
              stats.works.updated++
            } else {
              await projectsModel.create(docData)
              stats.works.created++
            }
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

