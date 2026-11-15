import React, { useState, useEffect, useMemo } from 'react'
import {
  Users,
  Briefcase,
  GraduationCap,
  Award,
  FileText,
  Building,
  Plus,
  Trash2,
  LogOut,
  Eye,
  Sparkles,
  Download,
  Upload,
  ImageIcon,
  Lock,
  Shield,
  Settings,
  Medal,
  Handshake,
  Search,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  ClipboardList,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react'
import {
  DEFAULT_VACANCY_SETTINGS,
  invalidateVacancyCache,
  type VacancySettings,
} from '../lib/vacancy'

type FieldType =
  | 'string'
  | 'text'
  | 'number'
  | 'boolean'
  | 'url'
  | 'image'
  | 'imageList'
  | 'file'
  | 'date'
  | 'enum'
  | 'stringList'

interface FieldDef {
  type: FieldType
  label?: string
  required?: boolean
  options?: readonly string[]
  placeholder?: string
}

const COLLECTION_SCHEMAS: Record<string, Record<string, FieldDef>> = {
  team: {
    name: { type: 'string', label: 'Full Name', required: true, placeholder: 'e.g. Dr. Murk Marvi' },
    role: { type: 'string', label: 'Role / Title', required: true, placeholder: 'e.g. Lab Director / Research Intern' },
    category: {
      type: 'enum',
      label: 'Category',
      required: true,
      options: ['Faculty', 'Research Interns', 'Alumni', 'Postgraduate', 'Undergraduate'],
    },
    designation: { type: 'string', label: 'Academic Designation', placeholder: 'e.g. Assistant Professor' },
    department: { type: 'string', label: 'Department', placeholder: 'e.g. Computer Science & IT' },
    email: { type: 'string', label: 'Email Address', placeholder: 'name@neduet.edu.pk' },
    phone: { type: 'string', label: 'Phone Number' },
    linkedin: { type: 'url', label: 'LinkedIn URL', placeholder: 'https://linkedin.com/in/...' },
    cvUrl: { type: 'file', label: 'CV / Resume (PDF or URL)' },
    image: { type: 'image', label: 'Profile Photo' },
    researchFocus: { type: 'text', label: 'Research Focus / Specialty' },
    tags: { type: 'stringList', label: 'Specialty Tags (comma-separated)' },
    qualifications: { type: 'stringList', label: 'Qualifications (comma-separated)' },
    tenure: { type: 'string', label: 'Tenure / Cohort', placeholder: 'e.g. 2024 - Present' },
    isLead: { type: 'boolean', label: 'Faculty / Lab Lead' },
    order: { type: 'number', label: 'Display Order' },
    published: { type: 'boolean', label: 'Published on Website' },
  },
  'previous-interns': {
    name: { type: 'string', label: 'Full Name', required: true },
    tenure: { type: 'string', label: 'Role / Tenure', placeholder: 'e.g. Former Research Intern' },
    department: { type: 'string', label: 'Department', placeholder: 'e.g. Computer Science & IT' },
    email: { type: 'string', label: 'Email Address' },
    linkedin: { type: 'url', label: 'LinkedIn URL' },
    order: { type: 'number', label: 'Display Order' },
    published: { type: 'boolean', label: 'Published on Website' },
  },
  interns: {
    name: { type: 'string', label: 'Full Name', required: true },
    term: { type: 'string', label: 'Cohort / Term', placeholder: 'e.g. Summer 2025' },
    project: { type: 'string', label: 'Research Project' },
    university: { type: 'string', label: 'University', placeholder: 'NED University' },
    currentRole: { type: 'string', label: 'Current Role / Destination' },
    paper: { type: 'string', label: 'Publication / Output' },
    quote: { type: 'text', label: 'Testimonial / Quote' },
    image: { type: 'image', label: 'Profile Photo' },
    order: { type: 'number', label: 'Display Order' },
    published: { type: 'boolean', label: 'Published on Website' },
  },
  performers: {
    name: { type: 'string', label: 'Researcher Name', required: true },
    month: { type: 'string', label: 'Recognition Month', required: true, placeholder: 'e.g. October 2025' },
    role: { type: 'string', label: 'Role in Lab', placeholder: 'e.g. Undergraduate Research Fellow' },
    title: { type: 'string', label: 'Award / Spotlight Title' },
    achievement: { type: 'text', label: 'Achievement Summary' },
    rank: { type: 'number', label: 'Rank (1 = Top)' },
    tags: { type: 'stringList', label: 'Research Tags (comma-separated)' },
    image: { type: 'image', label: 'Ceremony / Profile Photo' },
    order: { type: 'number', label: 'Display Order' },
    published: { type: 'boolean', label: 'Published on Website' },
  },
  projects: {
    title: { type: 'string', label: 'Project Title', required: true },
    category: {
      type: 'enum',
      label: 'Category',
      required: true,
      options: ['Funded', 'R&D', 'Undergraduate', 'Postgraduate'],
    },
    status: {
      type: 'enum',
      label: 'Status',
      required: true,
      options: ['Ongoing', 'Finished'],
    },
    description: { type: 'text', label: 'Project Description', required: true },
    programTitle: { type: 'string', label: 'Grant Program Title' },
    grantSupplier: { type: 'string', label: 'Grant Supplier / Funder' },
    grantAmount: { type: 'string', label: 'Grant Amount', placeholder: 'e.g. PKR 14.5 Million' },
    funding: { type: 'string', label: 'Funding Source Label' },
    funderUrl: { type: 'url', label: 'Funder Website URL' },
    startDate: { type: 'date', label: 'Timeline', placeholder: 'e.g. June 26 - Present or 2024 - 2026' },
    coverImage: { type: 'image', label: 'Cover Image' },
    order: { type: 'number', label: 'Display Order' },
    published: { type: 'boolean', label: 'Published on Website' },
  },
  grants: {
    title: { type: 'string', label: 'Grant / Project Title', required: true },
    funder: { type: 'string', label: 'Funding Agency / Supplier', required: true },
    programTitle: { type: 'string', label: 'Program Title' },
    amount: { type: 'string', label: 'Granted Amount', placeholder: 'e.g. PKR 14,500,000' },
    duration: { type: 'string', label: 'Duration / Timeline', required: true, placeholder: 'e.g. 2024 - 2026' },
    status: {
      type: 'enum',
      label: 'Status',
      required: true,
      options: ['Active', 'Completed', 'Pending'],
    },
    leadInvestigator: { type: 'string', label: 'Lead Investigator (PI)' },
    description: { type: 'text', label: 'Description' },
    url: { type: 'url', label: 'Funder / Project URL' },
    image: { type: 'image', label: 'Grant Image' },
    order: { type: 'number', label: 'Display Order' },
    published: { type: 'boolean', label: 'Published on Website' },
  },
  publications: {
    title: {
      type: 'string',
      label: 'Title of the Research Paper',
      required: true,
      placeholder: 'e.g. Attention Is All You Still Need: Revisiting Transformers for Urdu NLP',
    },
    authors: {
      type: 'string',
      label: 'Author(s)',
      required: true,
      placeholder: 'e.g. Dr. Murk Marvi, A. Khan, et al.',
    },
    date: {
      type: 'date',
      label: 'Publication Date',
      required: true,
      placeholder: 'e.g. November 2026 or 2026-11-15',
    },
    citation: {
      type: 'text',
      label: 'Citation',
      required: true,
      placeholder: 'e.g. Marvi, M., Khan, A., et al. (2026). "Paper Title," IEEE Transactions..., vol. 12, pp. 1-10.',
    },
    link: {
      type: 'url',
      label: 'Link to Research Paper',
      required: true,
      placeholder: 'https://doi.org/... or https://ieeexplore.ieee.org/...',
    },
    order: { type: 'number', label: 'Display Order' },
    published: { type: 'boolean', label: 'Published on Website' },
  },
  sponsors: {
    name: { type: 'string', label: 'Sponsor / Partner Name', required: true },
    type: { type: 'string', label: 'Partner Type', required: true, placeholder: 'e.g. National Funding Agency' },
    tier: {
      type: 'enum',
      label: 'Tier',
      options: ['Academic', 'Strategic Compute', 'Government & National'],
    },
    logo: { type: 'image', label: 'Partner Logo' },
    url: { type: 'url', label: 'Website URL' },
    order: { type: 'number', label: 'Display Order' },
    published: { type: 'boolean', label: 'Published on Website' },
  },
  collaborations: {
    partner: { type: 'string', label: 'Partner Institution / Company', required: true },
    type: { type: 'string', label: 'Collaboration Type', placeholder: 'e.g. Joint Research Lab / Industry MoU' },
    focus: { type: 'string', label: 'Research Focus' },
    period: { type: 'string', label: 'Period', placeholder: 'e.g. 2024 - Present' },
    grantAmount: { type: 'string', label: 'Funding / Support Value' },
    description: { type: 'text', label: 'Description' },
    outcomes: { type: 'stringList', label: 'Key Outcomes (comma-separated)' },
    logo: { type: 'image', label: 'Partner Logo' },
    image: { type: 'image', label: 'Banner / Photo' },
    order: { type: 'number', label: 'Display Order' },
    published: { type: 'boolean', label: 'Published on Website' },
  },
  gallery: {
    title: {
      type: 'string',
      label: 'Event / Album Title',
      required: true,
      placeholder: 'e.g. PyTorch Bootcamp or HEC Campus Visit',
    },
    cat: {
      type: 'enum',
      label: 'Category',
      required: true,
      options: ['Lab', 'Visit', 'Session', 'Mentoring'],
    },
    date: { type: 'date', label: 'Date', placeholder: 'e.g. Oct 2026' },
    desc: { type: 'text', label: 'Event Description (default caption)' },
    images: { type: 'imageList', label: 'Photos (1 or more)', required: true },
    order: { type: 'number', label: 'Display Order' },
    published: { type: 'boolean', label: 'Published on Website' },
  },
  blogs: {
    image: { type: 'image', label: 'Blog Cover Image' },
    title: {
      type: 'string',
      label: 'Title of Blog',
      required: true,
      placeholder: 'e.g. Building Low-Resource Multilingual LLMs at AIR Lab',
    },
    author: {
      type: 'string',
      label: 'Author Name',
      required: true,
      placeholder: 'e.g. Dr. Murk Marvi / AIR Lab Editorial',
    },
    link: {
      type: 'url',
      label: 'Link to Blog',
      required: true,
      placeholder: 'https://medium.com/... or https://...',
    },
    date: {
      type: 'date',
      label: 'Date',
      required: true,
      placeholder: 'e.g. November 16, 2026 or 2026-11-16',
    },
    order: { type: 'number', label: 'Display Order' },
    published: { type: 'boolean', label: 'Published on Website' },
  },
}

function buildDefaultItem(slug: string, nextOrder: number): Record<string, any> {
  const schema = COLLECTION_SCHEMAS[slug] || {}
  const item: Record<string, any> = {}
  for (const [key, def] of Object.entries(schema)) {
    if (key === 'published') {
      item.published = true
    } else if (key === 'order') {
      item.order = nextOrder
    } else if (def.type === 'boolean') {
      item[key] = false
    } else if (def.type === 'number') {
      item[key] = key === 'year' ? new Date().getFullYear() : 0
    } else if (def.type === 'stringList' || def.type === 'imageList') {
      item[key] = []
    } else if (def.type === 'enum' && def.options?.length) {
      item[key] = def.options[0]
    } else {
      item[key] = ''
    }
  }
  if (item.published === undefined) item.published = true
  if (item.order === undefined) item.order = nextOrder
  return item
}

interface GalleryPhotoEntry {
  url: string
  caption?: string
}

function normalizeGalleryImages(raw: unknown, fallbackUrl?: string): GalleryPhotoEntry[] {
  const list: GalleryPhotoEntry[] = []
  if (Array.isArray(raw)) {
    for (const entry of raw) {
      if (typeof entry === 'string' && entry.trim()) {
        list.push({ url: entry.trim(), caption: '' })
      } else if (entry && typeof entry === 'object' && typeof (entry as any).url === 'string' && (entry as any).url.trim()) {
        list.push({
          url: (entry as any).url.trim(),
          caption: typeof (entry as any).caption === 'string' ? (entry as any).caption : '',
        })
      }
    }
  }
  if (list.length === 0 && typeof fallbackUrl === 'string' && fallbackUrl.trim()) {
    list.push({ url: fallbackUrl.trim(), caption: '' })
  }
  return list
}

function compressImageFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (file.size > 5 * 1024 * 1024) {
      reject(new Error(`"${file.name}" exceeds the 5MB limit. Please upload a smaller image.`))
      return
    }
    const reader = new FileReader()
    reader.onerror = () => reject(new Error(`Failed to read "${file.name}".`))
    reader.onload = ev => {
      const dataUrl = ev.target?.result as string
      if (file.type === 'image/svg+xml') {
        resolve(dataUrl)
        return
      }
      const img = new Image()
      img.onload = () => {
        const maxDim = 800
        let { width, height } = img
        if (width > maxDim || height > maxDim) {
          const scale = Math.min(maxDim / width, maxDim / height)
          width = Math.round(width * scale)
          height = Math.round(height * scale)
        }
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          resolve(dataUrl)
          return
        }
        ctx.drawImage(img, 0, 0, width, height)
        const compressed = canvas.toDataURL('image/webp', 0.75)
        resolve(compressed.length < dataUrl.length ? compressed : dataUrl)
      }
      img.onerror = () => resolve(dataUrl)
      img.src = dataUrl
    }
    reader.readAsDataURL(file)
  })
}

export default function AdminDashboard() {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('airlab_admin_token'))
  const [adminUser, setAdminUser] = useState<{ id: string; email: string; name: string } | null>(null)
  const [authChecking, setAuthChecking] = useState<boolean>(() => Boolean(localStorage.getItem('airlab_admin_token')))
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState<string | null>(null)
  const [loggingIn, setLoggingIn] = useState(false)

  const [activeTab, setActiveTab] = useState<string>('applications')
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [appStatusFilter, setAppStatusFilter] = useState<string>('All')
  const [editingItem, setEditingItem] = useState<any | null>(null)
  const [isNew, setIsNew] = useState(false)
  const [saving, setSaving] = useState(false)
  const [modalError, setModalError] = useState<string | null>(null)
  const [newImageUrl, setNewImageUrl] = useState('')
  const [bannerNotice, setBannerNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Vacancy & Site Settings state
  const [vacancySettings, setVacancySettings] = useState<VacancySettings>(DEFAULT_VACANCY_SETTINGS)
  const [savingVacancy, setSavingVacancy] = useState(false)

  // Security / Change Password state
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [changingPassword, setChangingPassword] = useState(false)

  const handleLogout = () => {
    localStorage.removeItem('airlab_admin_token')
    setToken(null)
    setAdminUser(null)
    setAuthChecking(false)
    setItems([])
    setEditingItem(null)
    setEmail('')
    setPassword('')
    fetch('/api/auth/logout', { method: 'POST', credentials: 'include' }).catch(() => { })
  }

  // Strictly verify authentication token against the backend DB before rendering the dashboard
  useEffect(() => {
    if (!token) {
      setAdminUser(null)
      setAuthChecking(false)
      return
    }

    let active = true
    setAuthChecking(true)
    fetch('/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
      credentials: 'include',
      cache: 'no-store',
    })
      .then(async r => {
        if (!r.ok) throw new Error('Unauthorized')
        return r.json()
      })
      .then(data => {
        if (!active) return
        if (data?.admin?.id && data?.admin?.email) {
          setAdminUser(data.admin)
          setAuthChecking(false)
        } else {
          handleLogout()
        }
      })
      .catch(() => {
        if (active) handleLogout()
      })

    return () => {
      active = false
    }
  }, [token])

  // Load records or settings when activeTab changes (only after adminUser is verified)
  useEffect(() => {
    if (!token || !adminUser) return
    setEditingItem(null)
    setSearchQuery('')
    setBannerNotice(null)

    if (activeTab === 'security') {
      setLoading(false)
      return
    }

    let active = true
    setLoading(true)

    if (activeTab === 'vacancy-settings') {
      fetch('/api/admin/settings/vacancy', {
        headers: { Authorization: `Bearer ${token}` },
        credentials: 'include',
        cache: 'no-store',
      })
        .then(r => {
          if (r.status === 401) {
            handleLogout()
            throw new Error('Session expired')
          }
          if (!r.ok) throw new Error(`HTTP ${r.status}`)
          return r.json()
        })
        .then(data => {
          if (active && data) {
            setVacancySettings({ ...DEFAULT_VACANCY_SETTINGS, ...data })
          }
        })
        .catch(err => {
          if (active) setBannerNotice({ type: 'error', text: `Failed to load settings: ${err.message}` })
        })
        .finally(() => {
          if (active) setLoading(false)
        })
      return
    }

    const url = activeTab === 'applications' ? '/api/applications/admin' : `/api/admin/${activeTab}`
    fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
      credentials: 'include',
      cache: 'no-store',
    })
      .then(r => {
        if (r.status === 401) {
          handleLogout()
          throw new Error('Session expired')
        }
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then(data => {
        if (!active) return
        if (Array.isArray(data)) setItems(data)
        else setItems([])
      })
      .catch(err => {
        if (!active) return
        console.error('Fetch error:', err)
        setItems([])
        setBannerNotice({ type: 'error', text: `Could not load records: ${err.message}` })
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [activeTab, token, adminUser])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoggingIn(true)
    setLoginError(null)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: email.trim(), password }),
      })

      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data.token || !data.admin) {
        throw new Error(data.error || 'Invalid email or password')
      }

      localStorage.setItem('airlab_admin_token', data.token)
      setAdminUser(data.admin)
      setToken(data.token)
      setAuthChecking(false)
      setPassword('')
    } catch (err: any) {
      setLoginError(err.message || 'Invalid email or password')
    } finally {
      setLoggingIn(false)
    }
  }

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingItem || !token || !adminUser) return
    setSaving(true)
    setBannerNotice(null)
    setModalError(null)

    try {
      const isCreate = isNew
      const recordId = editingItem._id
      if (!isCreate && !recordId) {
        throw new Error('Record is missing a database _id and cannot be updated.')
      }

      const payload = { ...editingItem }
      if (activeTab === 'gallery') {
        const cleanedImages = normalizeGalleryImages(payload.images).map(img => ({
          url: img.url,
          caption: (img.caption || '').trim(),
        }))
        if (cleanedImages.length === 0) {
          throw new Error('Please upload or add at least 1 photo for this gallery entry.')
        }
        payload.images = cleanedImages
        delete payload.url
      }

      const url = isCreate ? `/api/admin/${activeTab}` : `/api/admin/${activeTab}/${recordId}`
      const method = isCreate ? 'POST' : 'PUT'

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify(payload),
      })

      if (res.status === 401) {
        handleLogout()
        throw new Error('Session expired. Please sign in again.')
      }

      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data.error || `Failed to save record (HTTP ${res.status})`)
      }

      if (isCreate) {
        setItems([data, ...items])
      } else {
        setItems(items.map(it => (it._id === data._id ? data : it)))
      }

      setEditingItem(null)
      setIsNew(false)
      setNewImageUrl('')
      setBannerNotice({
        type: 'success',
        text: isCreate ? 'New record created and published to database.' : 'Record updated in database.',
      })
    } catch (err: any) {
      const msg = err.message || 'Failed to save record'
      setModalError(msg)
      setBannerNotice({ type: 'error', text: msg })
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteItem = async (id: string) => {
    if (!id || !token || !adminUser) return
    if (!confirm('Are you sure you want to permanently delete this record from the database?')) return
    setBannerNotice(null)

    try {
      const url = activeTab === 'applications' ? `/api/applications/admin/${id}` : `/api/admin/${activeTab}/${id}`
      const res = await fetch(url, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
        credentials: 'include',
      })

      if (res.status === 401) {
        handleLogout()
        throw new Error('Session expired. Please sign in again.')
      }

      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data.error || `Delete failed (HTTP ${res.status})`)
      }

      setItems(items.filter(it => it._id !== id))
      setBannerNotice({ type: 'success', text: 'Record deleted from database.' })
    } catch (err: any) {
      setBannerNotice({ type: 'error', text: err.message || 'Could not delete record' })
    }
  }

  const handleStatusChange = async (appId: string, status: string) => {
    if (!token || !adminUser) return
    setBannerNotice(null)

    try {
      const res = await fetch(`/api/applications/admin/${appId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify({ status }),
      })

      if (res.status === 401) {
        handleLogout()
        throw new Error('Session expired. Please sign in again.')
      }

      const updated = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(updated.error || `Failed to update status (HTTP ${res.status})`)
      }

      setItems(items.map(it => (it._id === appId ? { ...it, status: updated.status } : it)))
      setBannerNotice({ type: 'success', text: `Application status updated to "${updated.status}".` })
    } catch (err: any) {
      setBannerNotice({ type: 'error', text: err.message || 'Could not update application status' })
    }
  }

  const handleSaveVacancySettings = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token || !adminUser) return
    setSavingVacancy(true)
    setBannerNotice(null)

    try {
      const res = await fetch('/api/admin/settings/vacancy', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify(vacancySettings),
      })

      if (res.status === 401) {
        handleLogout()
        throw new Error('Session expired. Please sign in again.')
      }

      const updated = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(updated.error || 'Failed to save vacancy settings')
      }

      setVacancySettings(updated)
      invalidateVacancyCache(updated)
      setBannerNotice({
        type: 'success',
        text: 'Vacancy & announcement ribbon settings saved to database.',
      })
    } catch (err: any) {
      setBannerNotice({ type: 'error', text: err.message || 'Failed to save vacancy settings' })
    } finally {
      setSavingVacancy(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token || !adminUser) return
    setBannerNotice(null)

    if (newPassword.length < 8) {
      setBannerNotice({ type: 'error', text: 'New password must be at least 8 characters long.' })
      return
    }
    if (newPassword !== confirmPassword) {
      setBannerNotice({ type: 'error', text: 'New password and confirmation do not match.' })
      return
    }

    setChangingPassword(true)
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify({ currentPassword, newPassword }),
      })

      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data.error || 'Failed to change password')
      }

      if (data.token) {
        localStorage.setItem('airlab_admin_token', data.token)
        setToken(data.token)
      }
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setBannerNotice({
        type: 'success',
        text: data.message || 'Password updated successfully.',
      })
    } catch (err: any) {
      setBannerNotice({ type: 'error', text: err.message || 'Could not update password' })
    } finally {
      setChangingPassword(false)
    }
  }

  const filteredItems = useMemo(() => {
    let list = items
    if (activeTab === 'applications' && appStatusFilter !== 'All') {
      list = list.filter(app => (app.status || 'New') === appStatusFilter)
    }
    const q = searchQuery.trim().toLowerCase()
    if (!q) return list
    return list.filter(item =>
      JSON.stringify(item).toLowerCase().includes(q)
    )
  }, [items, activeTab, appStatusFilter, searchQuery])

  // --- VERIFYING SESSION SCREEN (prevents flashing admin UI before server verification) ---
  if (authChecking) {
    return (
      <div className="min-h-screen bg-[var(--bg-page)] text-[var(--text-primary)] flex items-center justify-center p-4 font-sans">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="w-10 h-10 rounded-full bg-[var(--accent-orange)]/10 text-[var(--accent-orange)] flex items-center justify-center animate-pulse">
            <Shield className="w-5 h-5" />
          </div>
          <div className="text-xs font-medium text-[var(--text-muted)]">
            Verifying administrator credentials...
          </div>
        </div>
      </div>
    )
  }

  // --- LOGIN SCREEN ---
  if (!token || !adminUser) {
    return (
      <div className="min-h-screen bg-[var(--bg-page)] text-[var(--text-primary)] flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-[var(--bg-surface)] border border-[var(--border-hairline)] rounded-[8px] shadow-xl p-8">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-[4px] bg-[var(--accent-orange)]/10 text-[var(--accent-orange)] flex items-center justify-center">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <div className="font-sans text-[10px] tracking-wider uppercase text-[var(--text-muted)] font-semibold">
                AIR Lab System
              </div>
              <h2 className="text-lg font-head font-medium leading-tight">Admin Portal</h2>
            </div>
          </div>

          <p className="text-xs text-[var(--text-muted)] mb-6 leading-relaxed">
            Authorized personnel only. All website records and settings are strictly protected and managed through this portal.
          </p>

          {loginError && (
            <div className="mb-5 p-3 rounded bg-red-500/10 border border-red-500/20 text-red-600 text-xs leading-relaxed">
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium mb-1.5 text-[var(--text-primary)]">Email Address</label>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="name@neduet.edu.pk"
                className="w-full px-3.5 h-10 rounded-[4px] border border-[var(--border-hairline)] bg-[var(--bg-page)] text-sm focus:outline-none focus:border-[var(--accent-orange)]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1.5 text-[var(--text-primary)]">Password</label>
              <input
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-3.5 h-10 rounded-[4px] border border-[var(--border-hairline)] bg-[var(--bg-page)] text-sm focus:outline-none focus:border-[var(--accent-orange)]"
              />
            </div>

            <button
              type="submit"
              disabled={loggingIn}
              className="w-full h-10 mt-2 rounded-[4px] bg-[var(--accent-orange)] hover:bg-[var(--accent-orange-hover)] text-white text-sm font-medium transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>{loggingIn ? 'Authenticating...' : 'Sign In'}</span>
            </button>
          </form>
        </div>
      </div>
    )
  }

  // --- DASHBOARD NAVIGATION ITEMS ---
  const navTabs = [
    { id: 'applications', label: 'Intern Applications', icon: ClipboardList },
    { id: 'vacancy-settings', label: 'Vacancy & Ribbon', icon: Settings },
    { id: 'team', label: 'Faculty & Team', icon: Users },
    { id: 'previous-interns', label: 'Past Interns', icon: GraduationCap },
    { id: 'interns', label: 'Intern Spotlights', icon: GraduationCap },
    { id: 'performers', label: 'Performer of Month', icon: Medal },
    { id: 'projects', label: 'Research Projects', icon: Briefcase },
    { id: 'grants', label: 'Grants & Funding', icon: Award },
    { id: 'publications', label: 'Publications', icon: FileText },
    { id: 'sponsors', label: 'Sponsors & Partners', icon: Building },
    { id: 'collaborations', label: 'Collaborations', icon: Handshake },
    { id: 'gallery', label: 'Lab Gallery', icon: Eye },
    { id: 'blogs', label: 'News & Blogs', icon: Sparkles },
    { id: 'security', label: 'Admin Security', icon: KeyRound },
  ]

  const currentSchema = COLLECTION_SCHEMAS[activeTab] || {}
  const editableFields = editingItem
    ? Object.keys(currentSchema).length > 0
      ? Object.keys(currentSchema)
      : Object.keys(editingItem).filter(k => !['_id', '__v', 'createdAt', 'updatedAt', 'id'].includes(k))
    : []

  return (
    <div className="min-h-screen bg-[var(--bg-page)] text-[var(--text-primary)] flex flex-col md:flex-row font-sans">
      {/* SIDEBAR */}
      <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-[var(--border-hairline)] bg-[var(--bg-surface)] p-5 md:p-6 flex flex-col justify-between shrink-0">
        <div>
          <div className="flex items-center justify-between md:justify-start gap-2 mb-6">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-[var(--accent-orange)] rounded-full"></span>
              <span className="font-head font-medium text-lg">AIR Lab Admin</span>
            </div>
            <button
              onClick={handleLogout}
              className="md:hidden flex items-center gap-1.5 text-xs text-red-500 hover:text-red-600 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>

          <nav className="flex md:flex-col gap-1 overflow-x-auto pb-2 md:pb-0">
            {navTabs.map(tab => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center justify-between px-3 py-2 rounded-[4px] text-xs font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 ${isActive
                      ? 'bg-[var(--accent-orange)]/10 text-[var(--accent-orange)] font-semibold'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-page)]'
                    }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{tab.label}</span>
                  </div>
                </button>
              )
            })}
          </nav>
        </div>

        <div className="hidden md:block pt-6 mt-6 border-t border-[var(--border-hairline)]">
          <div className="text-xs text-[var(--text-muted)] mb-1">
            Signed in as <strong className="text-[var(--text-primary)]">{adminUser.name}</strong>
          </div>
          <div className="text-[11px] text-[var(--text-subtle)] truncate mb-3">{adminUser.email}</div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-xs text-red-500 hover:text-red-600 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 p-6 sm:p-10 overflow-y-auto">
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-[var(--border-hairline)]">
          <div>
            <h1 className="text-2xl font-head font-medium tracking-tight">
              {navTabs.find(t => t.id === activeTab)?.label}
            </h1>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              All website records are managed strictly from this authenticated admin panel.
            </p>
          </div>

          {!['applications', 'vacancy-settings', 'security'].includes(activeTab) && (
            <button
              onClick={() => {
                setModalError(null)
                setNewImageUrl('')
                setEditingItem(buildDefaultItem(activeTab, items.length))
                setIsNew(true)
              }}
              className="inline-flex items-center gap-1.5 px-4 h-9 rounded-[4px] bg-[var(--accent-orange)] hover:bg-[var(--accent-orange-hover)] text-white text-xs font-medium transition-colors cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add New Entry</span>
            </button>
          )}
        </header>

        {bannerNotice && (
          <div
            className={`mb-6 p-3.5 rounded-[4px] border text-xs flex items-center justify-between gap-3 ${bannerNotice.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-700'
                : 'bg-red-500/10 border-red-500/20 text-red-600'
              }`}
          >
            <div className="flex items-center gap-2">
              {bannerNotice.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              <span>{bannerNotice.text}</span>
            </div>
            <button
              onClick={() => setBannerNotice(null)}
              className="text-[11px] underline opacity-75 hover:opacity-100 cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {loading ? (
          <div className="py-20 text-center text-xs text-[var(--text-muted)] font-sans">
            Loading database records...
          </div>
        ) : activeTab === 'vacancy-settings' ? (
          /* VACANCY & ANNOUNCEMENT RIBBON SETTINGS */
          <form
            onSubmit={handleSaveVacancySettings}
            className="max-w-2xl bg-[var(--bg-surface)] border border-[var(--border-hairline)] rounded-[6px] p-6 space-y-5"
          >
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1.5">
                Applications Intake Status
              </label>
              <select
                value={vacancySettings.status}
                onChange={e =>
                  setVacancySettings({
                    ...vacancySettings,
                    status: e.target.value === 'Closed' ? 'Closed' : 'Open',
                  })
                }
                className="w-full px-3.5 h-10 rounded border border-[var(--border-hairline)] bg-[var(--bg-page)] text-xs font-medium"
              >
                <option value="Open">Open (Accepting Applications)</option>
                <option value="Closed">Closed (Form Disabled with Notice)</option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1.5">
                  Top Ribbon Highlight Label
                </label>
                <input
                  type="text"
                  value={vacancySettings.ribbonLabel}
                  onChange={e => setVacancySettings({ ...vacancySettings, ribbonLabel: e.target.value })}
                  placeholder="e.g. AIR Lab NED:"
                  className="w-full px-3.5 h-10 rounded border border-[var(--border-hairline)] bg-[var(--bg-page)] text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1.5">
                  Application Modal Title
                </label>
                <input
                  type="text"
                  value={vacancySettings.title}
                  onChange={e => setVacancySettings({ ...vacancySettings, title: e.target.value })}
                  placeholder="e.g. Application Form"
                  className="w-full px-3.5 h-10 rounded border border-[var(--border-hairline)] bg-[var(--bg-page)] text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1.5">
                Top Announcement Ribbon Text (When Open)
              </label>
              <textarea
                rows={2}
                value={vacancySettings.ribbonText}
                onChange={e => setVacancySettings({ ...vacancySettings, ribbonText: e.target.value })}
                className="w-full p-3 rounded border border-[var(--border-hairline)] bg-[var(--bg-page)] text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1.5">
                Closed Notice Message (Shown When Applications Are Closed)
              </label>
              <textarea
                rows={2}
                value={vacancySettings.closedMessage}
                onChange={e => setVacancySettings({ ...vacancySettings, closedMessage: e.target.value })}
                className="w-full p-3 rounded border border-[var(--border-hairline)] bg-[var(--bg-page)] text-xs"
              />
            </div>

            <div className="pt-3 border-t border-[var(--border-hairline)] flex justify-end">
              <button
                type="submit"
                disabled={savingVacancy}
                className="px-5 h-9 rounded bg-[var(--accent-orange)] hover:bg-[var(--accent-orange-hover)] text-white text-xs font-medium transition-colors cursor-pointer disabled:opacity-50"
              >
                {savingVacancy ? 'Saving...' : 'Save Vacancy & Ribbon Settings'}
              </button>
            </div>
          </form>
        ) : activeTab === 'security' ? (
          /* ADMIN SECURITY & PASSWORD MANAGEMENT */
          <form
            onSubmit={handleChangePassword}
            className="max-w-md bg-[var(--bg-surface)] border border-[var(--border-hairline)] rounded-[6px] p-6 space-y-4"
          >
            <div>
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">Change Administrator Password</h3>
              <p className="text-xs text-[var(--text-muted)] mt-1">
                Updating your password immediately invalidates all other active tokens and sessions.
              </p>
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--text-primary)] mb-1">
                Current Password
              </label>
              <input
                type="password"
                required
                autoComplete="current-password"
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                className="w-full px-3.5 h-10 rounded border border-[var(--border-hairline)] bg-[var(--bg-page)] text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--text-primary)] mb-1">
                New Password (minimum 8 characters)
              </label>
              <input
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className="w-full px-3.5 h-10 rounded border border-[var(--border-hairline)] bg-[var(--bg-page)] text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--text-primary)] mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="w-full px-3.5 h-10 rounded border border-[var(--border-hairline)] bg-[var(--bg-page)] text-xs"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={changingPassword}
                className="px-5 h-9 rounded bg-[var(--accent-orange)] hover:bg-[var(--accent-orange-hover)] text-white text-xs font-medium transition-colors cursor-pointer disabled:opacity-50"
              >
                {changingPassword ? 'Updating Password...' : 'Update Password'}
              </button>
            </div>
          </form>
        ) : activeTab === 'applications' ? (
          /* APPLICATIONS VIEW */
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-1.5">
                {['All', 'New', 'Shortlisted', 'Accepted', 'Rejected'].map(st => (
                  <button
                    key={st}
                    onClick={() => setAppStatusFilter(st)}
                    className={`px-3 py-1.5 rounded text-xs font-medium cursor-pointer border transition-colors ${appStatusFilter === st
                        ? 'bg-[var(--accent-orange)] text-white border-[var(--accent-orange)]'
                        : 'bg-[var(--bg-surface)] text-[var(--text-muted)] border-[var(--border-hairline)] hover:text-[var(--text-primary)]'
                      }`}
                  >
                    {st}
                  </button>
                ))}
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search applicants..."
                  className="w-full pl-8 pr-3 h-8 rounded border border-[var(--border-hairline)] bg-[var(--bg-surface)] text-xs"
                />
              </div>
            </div>

            {filteredItems.length === 0 ? (
              <div className="py-16 text-center border border-dashed border-[var(--border-hairline)] rounded-[4px] text-xs text-[var(--text-muted)]">
                No matching intern applications found.
              </div>
            ) : (
              filteredItems.map(app => (
                <div
                  key={app._id}
                  className="p-5 rounded-[4px] bg-[var(--bg-surface)] border border-[var(--border-hairline)] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-sm">{app.name}</span>
                      {(app.positionTitle || app.designation) && (
                        <span className="text-[11px] px-2 py-0.5 rounded-full font-medium bg-orange-500/10 text-[#ff5500] border border-[#ff5500]/20">
                          {app.positionTitle || app.designation}
                        </span>
                      )}
                      {app.track && (
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-[var(--bg-page)] border border-[var(--border-hairline)] text-[var(--text-muted)]">
                          {app.track}
                        </span>
                      )}
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${app.status === 'Accepted'
                            ? 'bg-green-500/10 text-green-600'
                            : app.status === 'Shortlisted'
                              ? 'bg-blue-500/10 text-blue-600'
                              : app.status === 'Rejected'
                                ? 'bg-red-500/10 text-red-600'
                                : 'bg-yellow-500/10 text-yellow-600'
                          }`}
                      >
                        {app.status || 'New'}
                      </span>
                    </div>

                    <div className="text-xs text-[var(--text-muted)] flex flex-wrap gap-x-4 gap-y-1">
                      <span><strong>Email:</strong> {app.email}</span>
                      <span><strong>Phone:</strong> {app.phone}</span>
                      {app.rollNo && <span><strong>Roll No:</strong> {app.rollNo}</span>}
                      <span><strong>Level:</strong> {app.degreeYear}</span>
                      {app.github && (
                        <a
                          href={app.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[var(--accent-orange)] hover:underline"
                        >
                          Portfolio / GitHub
                        </a>
                      )}
                    </div>

                    {(app.statement || app.coverNote) && (
                      <p className="text-xs text-[var(--text-subtle)] mt-2 italic">
                        "{app.statement || app.coverNote}"
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-3 pt-2 md:pt-0 border-t md:border-t-0 border-[var(--border-hairline)] shrink-0">
                    {app.cv?.key && app.cv.key !== 'attached' && (
                      <a
                        href={app.cv.key}
                        download={app.cv.originalName || 'resume.pdf'}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[3px] border border-[var(--border-hairline)] bg-[var(--bg-page)] hover:border-[var(--accent-orange)] text-xs text-[var(--text-primary)]"
                      >
                        <Download className="w-3.5 h-3.5 text-[var(--accent-orange)]" />
                        <span>Resume</span>
                      </a>
                    )}

                    <select
                      value={app.status || 'New'}
                      onChange={e => handleStatusChange(app._id, e.target.value)}
                      className="text-xs h-8 px-2 rounded-[3px] border border-[var(--border-hairline)] bg-[var(--bg-page)] text-[var(--text-primary)] focus:outline-none"
                    >
                      <option value="New">Status: New</option>
                      <option value="Shortlisted">Shortlisted</option>
                      <option value="Accepted">Accepted</option>
                      <option value="Rejected">Rejected</option>
                    </select>

                    <button
                      onClick={() => handleDeleteItem(app._id)}
                      className="p-1.5 text-red-500 hover:text-red-700 cursor-pointer"
                      title="Delete Application"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          /* CONTENT COLLECTIONS TABLE VIEW */
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div className="text-xs text-[var(--text-muted)]">
                Showing <strong>{filteredItems.length}</strong> of {items.length} records
              </div>
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Filter records..."
                  className="w-full pl-8 pr-3 h-8 rounded border border-[var(--border-hairline)] bg-[var(--bg-surface)] text-xs"
                />
              </div>
            </div>

            <div className="overflow-x-auto border border-[var(--border-hairline)] rounded-[4px] bg-[var(--bg-surface)]">
              <table className="w-full text-left text-xs">
                <thead className="bg-[var(--bg-page)] border-b border-[var(--border-hairline)] text-[var(--text-muted)] uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Title / Name</th>
                    <th className="py-3 px-4">Role / Category / Details</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-hairline)]">
                  {filteredItems.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-12 text-center text-[var(--text-muted)]">
                        No records found in this collection. Click "Add New Entry" to create one.
                      </td>
                    </tr>
                  ) : (
                    filteredItems.map(item => (
                      <tr key={item._id || item.id} className="hover:bg-[var(--bg-page)]/50 transition-colors">
                        <td className="py-3 px-4 font-medium text-[var(--text-primary)]">
                          {item.name || item.title || item.partner || `ID: ${item.id || item._id}`}
                        </td>
                        <td className="py-3 px-4 text-[var(--text-muted)]">
                          {activeTab === 'gallery'
                            ? (() => {
                                const count = normalizeGalleryImages(item.images, item.url).length
                                return `${item.cat || 'Lab'} • ${count} photo${count === 1 ? '' : 's'}`
                              })()
                            : item.tenure && item.department
                              ? `${item.tenure} • ${item.department}`
                              : item.authors ||
                                item.author ||
                                item.role ||
                                item.category ||
                                item.type ||
                                item.term ||
                                item.month ||
                                item.funder ||
                                item.venue ||
                                item.cat ||
                                item.tenure ||
                                item.department ||
                                item.date ||
                                '—'}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] ${item.published !== false
                                ? 'bg-green-500/10 text-green-600'
                                : 'bg-gray-500/10 text-gray-500'
                              }`}
                          >
                            {item.published !== false ? 'Published' : 'Hidden'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right space-x-2 whitespace-nowrap">
                          <button
                            onClick={() => {
                              setModalError(null)
                              setNewImageUrl('')
                              const defaults = buildDefaultItem(activeTab, item.order ?? 0)
                              const next = { ...defaults, ...item }
                              if (activeTab === 'gallery') {
                                next.images = normalizeGalleryImages(item.images, item.url)
                              }
                              setEditingItem(next)
                              setIsNew(false)
                            }}
                            className="px-2.5 py-1 rounded bg-[var(--bg-page)] border border-[var(--border-hairline)] hover:border-[var(--accent-orange)] text-xs cursor-pointer"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteItem(item._id)}
                            className="px-2 py-1 text-red-500 hover:text-red-700 cursor-pointer"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* EDIT / CREATE MODAL */}
            {editingItem && (
              <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
                <div className="w-full max-w-2xl bg-[var(--bg-surface)] border border-[var(--border-hairline)] rounded-[8px] shadow-2xl p-6 max-h-[88vh] overflow-y-auto">
                  <div className="flex items-center justify-between pb-4 mb-4 border-b border-[var(--border-hairline)]">
                    <h3 className="text-lg font-head font-medium">
                      {isNew ? 'Create New Record' : 'Edit Record'} —{' '}
                      {navTabs.find(t => t.id === activeTab)?.label}
                    </h3>
                    <button
                      type="button"
                      onClick={() => setEditingItem(null)}
                      className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
                    >
                      Close
                    </button>
                  </div>

                  <form onSubmit={handleSaveItem} className="space-y-4">
                    {modalError && (
                      <div className="p-3 rounded-[4px] border border-red-500/30 bg-red-500/10 text-red-600 text-xs flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{modalError}</span>
                      </div>
                    )}
                    {editableFields.map(field => {
                      const def: FieldDef | undefined = currentSchema[field]
                      const label = def?.label || field
                      const fieldType: FieldType =
                        def?.type ||
                        (typeof editingItem[field] === 'boolean'
                          ? 'boolean'
                          : typeof editingItem[field] === 'number'
                            ? 'number'
                            : Array.isArray(editingItem[field])
                              ? 'stringList'
                              : /image|photo|avatar|thumbnail|cover|logo/i.test(field)
                                ? 'image'
                                : /description|abstract|quote|achievement|excerpt/i.test(field)
                                  ? 'text'
                                  : 'string')

                      return (
                        <div key={field}>
                          <label className="block text-xs font-sans uppercase font-semibold text-[var(--text-muted)] mb-1">
                            {label} {def?.required && <span className="text-[var(--accent-orange)]">*</span>}
                          </label>

                          {fieldType === 'boolean' ? (
                            <label className="inline-flex items-center gap-2 text-xs cursor-pointer">
                              <input
                                type="checkbox"
                                checked={Boolean(editingItem[field])}
                                onChange={e =>
                                  setEditingItem({ ...editingItem, [field]: e.target.checked })
                                }
                                className="w-4 h-4 rounded border-[var(--border-hairline)] text-[var(--accent-orange)]"
                              />
                              <span>Enabled</span>
                            </label>
                          ) : fieldType === 'enum' && def?.options ? (
                            <select
                              required={def.required}
                              value={editingItem[field] ?? def.options[0]}
                              onChange={e =>
                                setEditingItem({ ...editingItem, [field]: e.target.value })
                              }
                              className="w-full px-3 py-2 text-xs rounded border border-[var(--border-hairline)] bg-[var(--bg-page)]"
                            >
                              {def.options.map(opt => (
                                <option key={opt} value={opt}>
                                  {opt}
                                </option>
                              ))}
                            </select>
                          ) : fieldType === 'text' ? (
                            <textarea
                              rows={3}
                              required={def?.required}
                              placeholder={def?.placeholder}
                              value={editingItem[field] ?? ''}
                              onChange={e =>
                                setEditingItem({ ...editingItem, [field]: e.target.value })
                              }
                              className="w-full px-3 py-2 text-xs rounded border border-[var(--border-hairline)] bg-[var(--bg-page)]"
                            />
                          ) : fieldType === 'number' ? (
                            <input
                              type="number"
                              required={def?.required}
                              value={editingItem[field] ?? 0}
                              onChange={e =>
                                setEditingItem({
                                  ...editingItem,
                                  [field]: e.target.value === '' ? 0 : Number(e.target.value),
                                })
                              }
                              className="w-full px-3 py-2 text-xs rounded border border-[var(--border-hairline)] bg-[var(--bg-page)]"
                            />
                          ) : fieldType === 'stringList' ? (
                            <input
                              type="text"
                              value={
                                Array.isArray(editingItem[field])
                                  ? editingItem[field].join(', ')
                                  : editingItem[field] ?? ''
                              }
                              onChange={e =>
                                setEditingItem({
                                  ...editingItem,
                                  [field]: e.target.value
                                    .split(',')
                                    .map(s => s.trim())
                                    .filter(Boolean),
                                })
                              }
                              placeholder="Comma-separated values"
                              className="w-full px-3 py-2 text-xs rounded border border-[var(--border-hairline)] bg-[var(--bg-page)]"
                            />
                          ) : fieldType === 'imageList' ? (
                            (() => {
                              const photos: GalleryPhotoEntry[] = Array.isArray(editingItem[field])
                                ? editingItem[field]
                                : []
                              const updatePhotos = (next: GalleryPhotoEntry[]) =>
                                setEditingItem((prev: any) => ({ ...prev, [field]: next }))

                              const movePhoto = (idx: number, dir: -1 | 1) => {
                                const target = idx + dir
                                if (target < 0 || target >= photos.length) return
                                const copy = [...photos]
                                ;[copy[idx], copy[target]] = [copy[target], copy[idx]]
                                updatePhotos(copy)
                              }

                              const addUrlPhoto = () => {
                                const trimmed = newImageUrl.trim()
                                if (!trimmed) return
                                updatePhotos([...photos, { url: trimmed, caption: '' }])
                                setNewImageUrl('')
                              }

                              return (
                                <div className="space-y-3">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[3px] bg-[var(--accent-orange)]/10 hover:bg-[var(--accent-orange)]/20 text-[var(--accent-orange)] text-xs font-medium cursor-pointer transition-colors border border-[var(--accent-orange)]/30">
                                      <Upload className="w-3.5 h-3.5" />
                                      <span>Upload Photos</span>
                                      <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        className="hidden"
                                        onChange={async e => {
                                          const files = Array.from(e.target.files || [])
                                          e.target.value = ''
                                          if (!files.length) return
                                          setModalError(null)
                                          try {
                                            const compressed = await Promise.all(files.map(compressImageFile))
                                            setEditingItem((prev: any) => {
                                              const current = Array.isArray(prev?.[field]) ? prev[field] : []
                                              return {
                                                ...prev,
                                                [field]: [
                                                  ...current,
                                                  ...compressed.map(url => ({ url, caption: '' })),
                                                ],
                                              }
                                            })
                                          } catch (err: any) {
                                            setModalError(err.message || 'Failed to process uploaded image(s).')
                                          }
                                        }}
                                      />
                                    </label>
                                    <span className="text-[11px] text-[var(--text-subtle)]">
                                      Select 1 or multiple images ({photos.length} added)
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-2">
                                    <input
                                      type="text"
                                      value={newImageUrl}
                                      onChange={e => setNewImageUrl(e.target.value)}
                                      onKeyDown={e => {
                                        if (e.key === 'Enter') {
                                          e.preventDefault()
                                          addUrlPhoto()
                                        }
                                      }}
                                      placeholder="Or paste an image URL / path and click Add"
                                      className="flex-1 px-3 py-1.5 text-xs rounded border border-[var(--border-hairline)] bg-[var(--bg-page)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-orange)]"
                                    />
                                    <button
                                      type="button"
                                      onClick={addUrlPhoto}
                                      className="px-3 py-1.5 rounded text-xs border border-[var(--border-hairline)] bg-[var(--bg-page)] hover:border-[var(--accent-orange)] cursor-pointer"
                                    >
                                      Add URL
                                    </button>
                                  </div>

                                  {photos.length === 0 ? (
                                    <div className="p-6 rounded border border-dashed border-[var(--border-hairline)] bg-[var(--bg-page)] text-center text-[11px] text-[var(--text-subtle)]">
                                      No photos added yet. Upload 1–10 photos above; each photo will appear as its own card on the Gallery page.
                                    </div>
                                  ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                      {photos.map((photo, idx) => (
                                        <div
                                          key={`${idx}-${photo.url.slice(0, 24)}`}
                                          className="rounded border border-[var(--border-hairline)] bg-[var(--bg-page)] p-2.5 space-y-2"
                                        >
                                          <div className="relative aspect-[16/10] rounded overflow-hidden bg-black/5 border border-[var(--border-hairline)]">
                                            <img
                                              src={photo.url}
                                              alt={photo.caption || `Photo ${idx + 1}`}
                                              className="w-full h-full object-cover"
                                            />
                                            <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/65 text-white text-[10px] font-medium">
                                              #{idx + 1}
                                            </span>
                                            <div className="absolute top-1.5 right-1.5 flex items-center gap-1">
                                              <button
                                                type="button"
                                                disabled={idx === 0}
                                                onClick={() => movePhoto(idx, -1)}
                                                title="Move earlier"
                                                className="w-6 h-6 rounded bg-black/65 text-white flex items-center justify-center disabled:opacity-35 hover:bg-black cursor-pointer"
                                              >
                                                <ChevronLeft className="w-3.5 h-3.5" />
                                              </button>
                                              <button
                                                type="button"
                                                disabled={idx === photos.length - 1}
                                                onClick={() => movePhoto(idx, 1)}
                                                title="Move later"
                                                className="w-6 h-6 rounded bg-black/65 text-white flex items-center justify-center disabled:opacity-35 hover:bg-black cursor-pointer"
                                              >
                                                <ChevronRight className="w-3.5 h-3.5" />
                                              </button>
                                              <button
                                                type="button"
                                                onClick={() => updatePhotos(photos.filter((_, i) => i !== idx))}
                                                title="Remove photo"
                                                className="w-6 h-6 rounded bg-red-600/90 text-white flex items-center justify-center hover:bg-red-700 cursor-pointer"
                                              >
                                                <X className="w-3.5 h-3.5" />
                                              </button>
                                            </div>
                                          </div>
                                          <input
                                            type="text"
                                            value={photo.caption ?? ''}
                                            onChange={e => {
                                              const next = photos.map((p, i) =>
                                                i === idx ? { ...p, caption: e.target.value } : p
                                              )
                                              updatePhotos(next)
                                            }}
                                            placeholder="Optional caption for this photo..."
                                            className="w-full px-2.5 py-1.5 text-[11px] rounded border border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-orange)]"
                                          />
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              )
                            })()
                          ) : fieldType === 'image' ? (
                            <div className="space-y-2">
                              <div className="flex items-center gap-3">
                                {editingItem[field] ? (
                                  <img
                                    src={editingItem[field]}
                                    alt="Preview"
                                    className="w-12 h-12 object-cover rounded border border-[var(--border-hairline)] bg-[var(--bg-surface)] shrink-0"
                                    onError={e => {
                                      ; (e.target as HTMLElement).style.display = 'none'
                                    }}
                                  />
                                ) : (
                                  <div className="w-12 h-12 rounded border border-dashed border-[var(--border-hairline)] flex items-center justify-center bg-[var(--bg-page)] shrink-0 text-[var(--text-subtle)]">
                                    <ImageIcon className="w-5 h-5 opacity-40" />
                                  </div>
                                )}

                                <div className="flex-1 space-y-1.5">
                                  <div className="flex items-center gap-2">
                                    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[3px] bg-[var(--accent-orange)]/10 hover:bg-[var(--accent-orange)]/20 text-[var(--accent-orange)] text-xs font-medium cursor-pointer transition-colors border border-[var(--accent-orange)]/30">
                                      <Upload className="w-3.5 h-3.5" />
                                      <span>Upload Image</span>
                                      <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={async e => {
                                          const file = e.target.files?.[0]
                                          e.target.value = ''
                                          if (!file) return
                                          try {
                                            const result = await compressImageFile(file)
                                            setEditingItem((prev: any) => ({ ...prev, [field]: result }))
                                          } catch (err: any) {
                                            alert(err.message || 'Failed to upload image.')
                                          }
                                        }}
                                      />
                                    </label>
                                    <span className="text-[11px] text-[var(--text-subtle)]">
                                      or enter path/URL below
                                    </span>
                                  </div>

                                  <input
                                    type="text"
                                    required={def?.required}
                                    value={editingItem[field] ?? ''}
                                    onChange={e =>
                                      setEditingItem({ ...editingItem, [field]: e.target.value })
                                    }
                                    placeholder="e.g. ./pfp/member.png or https://..."
                                    className="w-full px-3 py-1.5 text-xs rounded border border-[var(--border-hairline)] bg-[var(--bg-page)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-orange)]"
                                  />
                                </div>
                              </div>
                            </div>
                          ) : (
                            <input
                              type="text"
                              required={def?.required}
                              placeholder={def?.placeholder}
                              value={editingItem[field] ?? ''}
                              onChange={e =>
                                setEditingItem({ ...editingItem, [field]: e.target.value })
                              }
                              className="w-full px-3 py-2 text-xs rounded border border-[var(--border-hairline)] bg-[var(--bg-page)]"
                            />
                          )}
                        </div>
                      )
                    })}

                    <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border-hairline)]">
                      <button
                        type="button"
                        onClick={() => setEditingItem(null)}
                        className="px-4 py-2 rounded text-xs border border-[var(--border-hairline)] hover:bg-[var(--bg-page)] cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={saving}
                        className="px-5 py-2 rounded bg-[var(--accent-orange)] hover:bg-[var(--accent-orange-hover)] text-white text-xs font-medium transition-colors cursor-pointer disabled:opacity-50"
                      >
                        {saving ? 'Saving...' : 'Save to Database'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
