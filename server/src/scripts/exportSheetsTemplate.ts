import { writeFile, mkdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { connectDB, disconnectDB } from '../db.js'
import { contentModels } from '../models/content.js'

const here = path.dirname(fileURLToPath(import.meta.url))
const OUTPUT_DIR = path.resolve(here, '../../../sheets-templates')

function escapeCsvCell(val: any): string {
  if (val === undefined || val === null) return '""'
  const str = String(val).replace(/"/g, '""')
  return `"${str}"`
}

function toCsv(headers: string[], rows: Record<string, any>[]): string {
  const headerLine = headers.map(escapeCsvCell).join(',')
  const dataLines = rows.map((row) => headers.map((h) => escapeCsvCell(row[h])).join(','))
  return [headerLine, ...dataLines].join('\r\n')
}

async function main() {
  await connectDB()
  await mkdir(OUTPUT_DIR, { recursive: true })

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

  // 1. People Tab
  const peopleHeaders = [
    'id',
    'name',
    'category',
    'role',
    'designation',
    'department',
    'email',
    'linkedin',
    'image',
    'cvUrl',
    'researchFocus',
    'tags',
    'isLead',
    'tenure',
    'order',
    'published',
  ]

  const peopleRows = [
    ...teamDocs.map((doc: any, idx: number) => ({
      id: doc.id || `P-${100 + idx}`,
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
      isLead: doc.isLead ? 'TRUE' : 'FALSE',
      tenure: doc.tenure || '',
      order: doc.order ?? idx + 1,
      published: doc.published !== false ? 'TRUE' : 'FALSE',
    })),
    ...prevInternDocs.map((doc: any, idx: number) => ({
      id: doc.id || `PRI-${100 + idx}`,
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
      isLead: 'FALSE',
      tenure: doc.tenure || '',
      order: doc.order ?? teamDocs.length + idx + 1,
      published: doc.published !== false ? 'TRUE' : 'FALSE',
    })),
  ]

  const peopleCsv = toCsv(peopleHeaders, peopleRows)
  const peoplePath = path.join(OUTPUT_DIR, 'People_Template.csv')
  await writeFile(peoplePath, peopleCsv, 'utf8')
  console.log(`✅ Saved ${peopleRows.length} rows to ${peoplePath}`)

  // 2. Research & Works Tab
  const worksHeaders = [
    'id',
    'entityType',
    'title',
    'category',
    'status',
    'authors_or_pi',
    'venue_or_funder',
    'year',
    'amount',
    'link_or_doi',
    'pdf',
    'coverImage',
    'description',
    'tags',
    'order',
    'published',
  ]

  const worksRows = [
    ...pubDocs.map((doc: any, idx: number) => ({
      id: doc.id ? `PUB-${doc.id}` : `PUB-${200 + idx}`,
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
      order: doc.order ?? idx + 1,
      published: doc.published !== false ? 'TRUE' : 'FALSE',
    })),
    ...projDocs.map((doc: any, idx: number) => ({
      id: doc.id ? `PRJ-${doc.id}` : `PRJ-${300 + idx}`,
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
      order: doc.order ?? pubDocs.length + idx + 1,
      published: doc.published !== false ? 'TRUE' : 'FALSE',
    })),
    ...grantDocs.map((doc: any, idx: number) => ({
      id: doc.id ? `GRT-${doc.id}` : `GRT-${400 + idx}`,
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
      order: doc.order ?? pubDocs.length + projDocs.length + idx + 1,
      published: doc.published !== false ? 'TRUE' : 'FALSE',
    })),
  ]

  const worksCsv = toCsv(worksHeaders, worksRows)
  const worksPath = path.join(OUTPUT_DIR, 'Research_and_Works_Template.csv')
  await writeFile(worksPath, worksCsv, 'utf8')
  console.log(`✅ Saved ${worksRows.length} rows to ${worksPath}`)

  console.log(`\n🎉 Templates generated in: ${OUTPUT_DIR}`)
}

main()
  .catch((err) => {
    console.error('❌ Export failed:', err)
    process.exit(1)
  })
  .finally(() => disconnectDB())

