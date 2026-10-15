export interface Grant {
  id: string
  title: string
  funder: string
  programTitle?: string
  amount?: string
  duration: string
  status: 'Active' | 'Completed' | 'Pending'
  leadInvestigator?: string
  description?: string
  url?: string
  image?: string
  placeholder?: boolean
}

export interface Sponsor {
  id: string
  name: string
  type: string
  logo?: string
  url?: string
  tier?: 'Academic' | 'Strategic Compute' | 'Government & National'
  placeholder?: boolean
}

export interface ProjectItem {
  id: number
  title: string
  category: 'Funded' | 'R&D' | 'Undergraduate' | 'Postgraduate'
  description: string
  funding: string
  grantId?: string
  grantSupplier?: string
  grantAmount?: string
  pi?: string
  funderUrl?: string
  teamMembers?: string[]
  timeTaken?: string
  status: 'Ongoing' | 'Finished'
  startDate: string
  endDate?: string
  coverImage: string
  images: string[]
  tags?: string[]
  memberIds?: string[]
  placeholder?: boolean
}

export interface TeamMemberData {
  id: string
  name: string
  role: string
  category: 'Faculty' | 'Research Interns' | 'Alumni' | 'Postgraduate' | 'Undergraduate'
  image: string
  email?: string
  linkedin?: string
  cvUrl?: string
  designation?: string
  qualifications?: string[]
  phone?: string
  isLead?: boolean
  tenure?: string
  startDate?: string
  endDate?: string
  department?: string
  researchFocus?: string
  tags?: string[]
  term?: string
  year?: number
  order?: number
  placeholder?: boolean
}

export interface PublicationItem {
  id: number
  title: string
  authors: string
  venue: string
  type: 'Journal' | 'Conference' | 'Preprint'
  year: number
  month?: string
  link?: string
  doi?: string
  pdf?: string
  impactFactor?: string
  tags: string[]
  abstract?: string
  placeholder?: boolean
}
