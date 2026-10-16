/**
 * Single source of truth for every editable content collection on the website.
 *
 * Each entry describes its fields once; from that we derive:
 *   • the Mongoose schema            (models/content.ts)
 *   • the seed mapping from JSON     (scripts/seed.ts)
 *   • (later) the admin panel forms  (served via /api/admin/schema)
 *
 * Field names intentionally match the existing src/data/*.json files and
 * src/types/data.ts so the frontend needs no shape changes.
 */

export type FieldType =
  | 'string' // single-line text
  | 'text' // multi-line text
  | 'number'
  | 'boolean'
  | 'url'
  | 'image' // stored as a URL/path string; admin UI shows an uploader
  | 'file' // e.g. CV PDF; stored as URL/path string
  | 'date' // kept as free-form string (existing data uses "2024", "Jan 2025", …)
  | 'enum'
  | 'stringList' // string[]

export interface FieldDef {
  type: FieldType
  label?: string
  required?: boolean
  /** Allowed values for `enum` fields. */
  options?: readonly string[]
  /** Show this field as a column in the admin table. */
  listed?: boolean
}

export interface CollectionDef {
  /** URL slug: /api/content/:slug */
  slug: string
  /** Human label for the admin sidebar. */
  label: string
  /** File in src/data used for the initial seed. */
  seedFile: string
  /** Field used as the display title in admin lists. */
  titleField: string
  /** Default sort applied to public reads (after `order`). */
  defaultSort?: Record<string, 1 | -1>
  fields: Record<string, FieldDef>
}

export const collections = [
  {
    slug: 'team',
    label: 'Team & Faculty',
    seedFile: 'team.json',
    titleField: 'name',
    fields: {
      name: { type: 'string', required: true, listed: true },
      role: { type: 'string', required: true, listed: true },
      category: {
        type: 'enum',
        required: true,
        listed: true,
        options: ['Faculty', 'Research Interns', 'Alumni', 'Postgraduate', 'Undergraduate'],
      },
      designation: { type: 'string' },
      image: { type: 'image' },
      email: { type: 'string' },
      phone: { type: 'string' },
      linkedin: { type: 'url' },
      cvUrl: { type: 'file', label: 'CV' },
      department: { type: 'string' },
      researchFocus: { type: 'text' },
      qualifications: { type: 'stringList' },
      tags: { type: 'stringList' },
      isLead: { type: 'boolean', label: 'Lab lead' },
      tenure: { type: 'string' },
      term: { type: 'string' },
      year: { type: 'number' },
      startDate: { type: 'date' },
      endDate: { type: 'date' },
    },
  },
  {
    slug: 'previous-interns',
    label: 'Previous Interns',
    seedFile: 'previous_interns.json',
    titleField: 'name',
    fields: {
      name: { type: 'string', required: true, listed: true },
      email: { type: 'string' },
      linkedin: { type: 'url' },
      tenure: { type: 'string', listed: true },
      department: { type: 'string', listed: true },
    },
  },
  {
    slug: 'interns',
    label: 'Intern Spotlights',
    seedFile: 'interns.json',
    titleField: 'name',
    fields: {
      name: { type: 'string', required: true, listed: true },
      term: { type: 'string', listed: true },
      project: { type: 'string', listed: true },
      university: { type: 'string' },
      currentRole: { type: 'string' },
      quote: { type: 'text' },
      paper: { type: 'string' },
      image: { type: 'image' },
    },
  },
  {
    slug: 'projects',
    label: 'Projects',
    seedFile: 'projects.json',
    titleField: 'title',
    fields: {
      title: { type: 'string', required: true, listed: true },
      category: {
        type: 'enum',
        required: true,
        listed: true,
        options: ['Funded', 'R&D', 'Undergraduate', 'Postgraduate'],
      },
      status: { type: 'enum', required: true, listed: true, options: ['Ongoing', 'Finished'] },
      description: { type: 'text', required: true },
      funding: { type: 'string' },
      programTitle: { type: 'string' },
      grantId: { type: 'string' },
      grantSupplier: { type: 'string' },
      grantAmount: { type: 'string' },
      pi: { type: 'string', label: 'Principal Investigator' },
      funderUrl: { type: 'url' },
      timeTaken: { type: 'string' },
      startDate: { type: 'date' },
      endDate: { type: 'date' },
      coverImage: { type: 'image' },
      images: { type: 'stringList' },
      tags: { type: 'stringList' },
      memberIds: { type: 'stringList', label: 'Team member IDs' },
      teamMembers: { type: 'stringList' },
    },
  },
  {
    slug: 'publications',
    label: 'Publications',
    seedFile: 'publications.json',
    titleField: 'title',
    defaultSort: { year: -1 },
    fields: {
      title: { type: 'string', required: true, listed: true },
      authors: { type: 'string', required: true },
      venue: { type: 'string', required: true, listed: true },
      type: { type: 'enum', required: true, listed: true, options: ['Journal', 'Conference', 'Preprint'] },
      year: { type: 'number', required: true, listed: true },
      month: { type: 'string' },
      link: { type: 'url' },
      doi: { type: 'string' },
      pdf: { type: 'file' },
      impactFactor: { type: 'string' },
      tags: { type: 'stringList' },
      abstract: { type: 'text' },
    },
  },
  {
    slug: 'grants',
    label: 'Grants',
    seedFile: 'grants.json',
    titleField: 'title',
    fields: {
      title: { type: 'string', required: true, listed: true },
      funder: { type: 'string', required: true, listed: true },
      programTitle: { type: 'string' },
      amount: { type: 'string' },
      duration: { type: 'string', required: true },
      status: { type: 'enum', required: true, listed: true, options: ['Active', 'Completed', 'Pending'] },
      leadInvestigator: { type: 'string' },
      description: { type: 'text' },
      url: { type: 'url' },
      image: { type: 'image' },
    },
  },
  {
    slug: 'sponsors',
    label: 'Sponsors',
    seedFile: 'sponsors.json',
    titleField: 'name',
    fields: {
      name: { type: 'string', required: true, listed: true },
      type: { type: 'string', required: true, listed: true },
      tier: {
        type: 'enum',
        listed: true,
        options: ['Academic', 'Strategic Compute', 'Government & National'],
      },
      logo: { type: 'image' },
      url: { type: 'url' },
    },
  },
  {
    slug: 'collaborations',
    label: 'Collaborations',
    seedFile: 'collaborations.json',
    titleField: 'partner',
    fields: {
      partner: { type: 'string', required: true, listed: true },
      type: { type: 'string', listed: true },
      focus: { type: 'string' },
      period: { type: 'string', listed: true },
      description: { type: 'text' },
      grantAmount: { type: 'string' },
      logo: { type: 'image' },
      image: { type: 'image' },
      outcomes: { type: 'stringList' },
    },
  },
  {
    slug: 'gallery',
    label: 'Gallery',
    seedFile: 'gallery.json',
    titleField: 'title',
    fields: {
      title: { type: 'string', required: true, listed: true },
      cat: { type: 'string', label: 'Category', listed: true },
      date: { type: 'date', listed: true },
      desc: { type: 'text', label: 'Description' },
      url: { type: 'image', label: 'Image', required: true },
      span: { type: 'string', label: 'Grid span' },
    },
  },
  {
    slug: 'performers',
    label: 'Top Performers',
    seedFile: 'performers.json',
    titleField: 'name',
    fields: {
      name: { type: 'string', required: true, listed: true },
      rank: { type: 'number', listed: true },
      role: { type: 'string' },
      month: { type: 'string', listed: true },
      title: { type: 'string' },
      achievement: { type: 'text' },
      // `metrics` is a free-form object in the current JSON; stored as-is (see strict:false in model).
      tags: { type: 'stringList' },
      image: { type: 'image' },
    },
  },
  {
    slug: 'blogs',
    label: 'Blog Posts',
    seedFile: 'blogs.json',
    titleField: 'title',
    fields: {
      title: { type: 'string', required: true, listed: true },
      author: { type: 'string', listed: true },
      date: { type: 'date', listed: true },
      excerpt: { type: 'text' },
      tag: { type: 'string' },
    },
  },
] as const satisfies readonly CollectionDef[]

export type CollectionSlug = (typeof collections)[number]['slug']

export const collectionBySlug = new Map<string, CollectionDef>(collections.map((c) => [c.slug, c]))
