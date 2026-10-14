export interface TeamMemberData {
  id: string
  name: string
  role: string
  category: string
  image: string
  email?: string
  linkedin?: string
  cvUrl?: string
  designation?: string
  qualifications?: string[]
  phone?: string
  isLead?: boolean
  tenure?: string
  department?: string
  researchFocus?: string
  term?: string
  year?: number
  order?: number
}

/**
 * Object-Oriented Entity representing an AIR Lab member/student.
 * Encapsulates member state, fallback routing, and validation logic.
 */
export class TeamMemberEntity {
  public readonly id: string
  public readonly name: string
  public readonly role: string
  public readonly category: string
  public readonly image: string
  public readonly email?: string
  public readonly linkedin?: string
  public readonly cvUrl?: string
  public readonly designation?: string
  public readonly qualifications?: string[]
  public readonly phone?: string
  public readonly isLead: boolean
  public readonly tenure?: string
  public readonly department: string
  public readonly researchFocus?: string
  public readonly term?: string
  public readonly year: number
  public readonly order: number

  constructor(data: TeamMemberData) {
    this.id = data.id
    this.name = data.name
    this.role = data.role || 'Research Scholar'
    this.category = data.category || 'Research Interns'
    this.image = data.image || './pfp/default.png'
    this.email = data.email
    this.linkedin = data.linkedin
    this.cvUrl = data.cvUrl
    this.designation = data.designation
    this.qualifications = data.qualifications
    this.phone = data.phone
    this.isLead = Boolean(data.isLead || data.id === 'f1')
    this.tenure = data.tenure || 'Current Cohort (2025–2026)'
    this.department = data.department || 'Computer Science & IT (CSIT)'
    this.researchFocus = data.researchFocus
    this.term = data.term || 'Fall 2025 – Present'
    this.year = data.year || 2026
    this.order = data.order || 0
  }

  /**
   * Primary action link: returns LinkedIn URL if present, otherwise direct mailto fallback
   */
  public getPrimaryActionUrl(): string {
    if (this.hasLinkedIn()) {
      return this.linkedin!
    }
    if (this.hasEmail()) {
      return `mailto:${this.email}`
    }
    return '#'
  }

  /**
   * Checks whether the member has a valid external LinkedIn URL
   */
  public hasLinkedIn(): boolean {
    return Boolean(
      this.linkedin &&
      this.linkedin.trim() !== '' &&
      this.linkedin.trim() !== '#' &&
      !this.linkedin.includes('placeholder')
    )
  }

  /**
   * Returns clean LinkedIn URL or null
   */
  public getLinkedInUrl(): string | null {
    if (!this.hasLinkedIn()) return null
    let url = this.linkedin!.trim()
    // Fix common URL prefixes if malformed
    if (url.startsWith('https://cct.neduet.edu.pk/www.linkedin.com')) {
      url = url.replace('https://cct.neduet.edu.pk/www.linkedin.com', 'https://www.linkedin.com')
    }
    return url
  }

  /**
   * Checks whether the member has a registered email address
   */
  public hasEmail(): boolean {
    return Boolean(this.email && this.email.trim() !== '')
  }

  /**
   * Email mailto link used as fallback or secondary contact
   */
  public getEmailFallback(): string | null {
    return this.hasEmail() ? `mailto:${this.email}` : null
  }

  /**
   * Returns true if member is a faculty coordinator or PI
   */
  public isFacultyLead(): boolean {
    return this.isLead || this.category === 'Faculty'
  }

  /**
   * Maps member category to the appropriate sub-tab in Team view
   */
  public getCategoryTab(): 'faculty' | 'interns' | 'postgrad' | 'undergrad' | 'previous' {
    if (this.category === 'Faculty') return 'faculty'
    if (this.category === 'Research Interns') return 'interns'
    if (this.category === 'Postgraduate') return 'postgrad'
    if (this.category === 'Undergraduate') return 'undergrad'
    return 'interns'
  }

  /**
   * Factory method to create entity instance from raw JSON object
   */
  public static fromJson(raw: any): TeamMemberEntity {
    return new TeamMemberEntity(raw)
  }

  /**
   * Factory method to create list of entities from raw array
   */
  public static fromArray(rawList: any[]): TeamMemberEntity[] {
    return rawList.map(item => TeamMemberEntity.fromJson(item))
  }

  /**
   * Sort array of member entities with newest/priority members at top
   */
  public static sortByRecent(list: TeamMemberEntity[]): TeamMemberEntity[] {
    return [...list].sort((a, b) => {
      // Leads/faculty first
      if (a.isLead && !b.isLead) return -1
      if (!a.isLead && b.isLead) return 1
      // Sort by year descending (recent at top)
      if (b.year !== a.year) return b.year - a.year
      return (b.order || 0) - (a.order || 0)
    })
  }
}
