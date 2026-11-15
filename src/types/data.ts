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
  shortName?: string
  type: string
  logo?: string
  url?: string
  tier?: string
  placeholder?: boolean
}

export interface ProjectItem {
  id: number | string
  title: string
  category: 'Funded' | 'R&D' | 'Undergraduate' | 'Postgraduate' | string
  programTitle?: string
  areas?: string[]
  description: string
  funding: string
  grantId?: string
  grantSupplier?: string
  grantAmount?: string
  pi?: string
  industryAdvisor?: string
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
  id: number | string
  title: string
  authors: string
  date?: string
  citation?: string
  link?: string
  venue?: string
  type?: 'Journal' | 'Conference' | 'Preprint'
  year?: number
  month?: string
  doi?: string
  pdf?: string
  impactFactor?: string
  tags?: string[]
  abstract?: string
  placeholder?: boolean
}

export interface CollaborationItem {
  id: string
  partner: string
  type?: string
  grantAmount?: string
  period?: string
  focus?: string
  description?: string
  outcomes?: string[]
  image?: string
}

export interface GalleryPhoto {
  url: string
  caption?: string
}

export interface GalleryItem {
  id: string
  _id?: string
  title: string
  cat?: string
  date?: string
  desc?: string
  url?: string
  images?: Array<GalleryPhoto | string>
  span?: string
}

export interface InternItem {
  id: string
  name: string
  term?: string
  project?: string
  university?: string
  currentRole?: string
  quote?: string
  paper?: string
  image?: string
}

export interface CoAwardeeInfo {
  id: string
  name: string
  researchFocus?: string
  email?: string
  linkedin?: string
  cvUrl?: string
  categoryTab?: string
  note?: string
}

export interface PerformerItem {
  id: string
  _id?: string
  name: string
  role: string
  department?: string
  month: string
  rank?: number
  title?: string
  achievement?: string
  researchFocus?: string
  email?: string
  linkedin?: string
  cvUrl?: string
  avatar?: string
  tags?: string[]
  image?: string
  categoryTab?: string
  photos?: Array<string | GalleryPhoto>
  coAwardees?: CoAwardeeInfo[]
}
