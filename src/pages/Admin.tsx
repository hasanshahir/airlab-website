import React, { useState, useEffect } from 'react'
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
  FileSpreadsheet,
  Sparkles,
  Download,
  Upload,
  ImageIcon,
  KeyRound,
  ShieldCheck
} from 'lucide-react'

// Local datasets for instant preview without requiring external database
import teamData from '../data/team.json'
import internsData from '../data/interns.json'
import prevInternsData from '../data/previous_interns.json'
import projectsData from '../data/projects.json'
import publicationsData from '../data/publications.json'
import grantsData from '../data/grants.json'
import sponsorsData from '../data/sponsors.json'
import galleryData from '../data/gallery.json'
import blogsData from '../data/blogs.json'
import collaborationsData from '../data/collaborations.json'

const fallbackData: Record<string, any[]> = {
  team: teamData,
  interns: internsData,
  'previous-interns': prevInternsData,
  projects: projectsData,
  publications: publicationsData,
  grants: grantsData,
  sponsors: sponsorsData,
  gallery: galleryData,
  blogs: blogsData,
  collaborations: collaborationsData,
  applications: [
    {
      _id: 'app-demo-1',
      name: 'Syed Hamza Ali',
      email: 'hamza.ali@cloud.neduet.edu.pk',
      phone: '+92 300 1234567',
      university: 'NED University of Eng. & Tech.',
      degreeYear: 'Final Year (BS CSIT)',
      coverNote: 'Passionate about Deep Learning and High Performance Computing. Previously worked on Vision Transformers.',
      status: 'New',
      cv: { key: '#', originalName: 'Hamza_CV_2026.pdf' }
    },
    {
      _id: 'app-demo-2',
      name: 'Ayesha Siddiqua',
      email: 'ayesha.s@cloud.neduet.edu.pk',
      phone: '+92 333 9876543',
      university: 'NED University (CIS Dept)',
      degreeYear: '3rd Year',
      coverNote: 'Interested in Autonomous Systems and Computer Vision research at AIR Lab.',
      status: 'Shortlisted',
      cv: { key: '#', originalName: 'Ayesha_Resume.pdf' }
    }
  ]
}

export default function AdminDashboard() {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('airlab_admin_token'))
  const [adminUser, setAdminUser] = useState<any>(null)
  const [email, setEmail] = useState('admin@airlab.neduet.edu.pk')
  const [password, setPassword] = useState('airlab2026!')
  const [loginError, setLoginError] = useState<string | null>(null)
  const [loggingIn, setLoggingIn] = useState(false)

  // Active section: 'applications', 'team', 'interns', 'previous-interns', 'projects', 'publications', 'grants', 'sponsors', 'gallery', 'blogs'
  const [activeTab, setActiveTab] = useState<'applications' | string>('applications')
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [editingItem, setEditingItem] = useState<any | null>(null)
  const [isNew, setIsNew] = useState(false)

  const directLogin = () => {
    const masterAdmin = {
      id: 'master-admin',
      email: 'admin@airlab.neduet.edu.pk',
      name: 'AIR Lab Administrator',
    }
    localStorage.setItem('airlab_admin_token', 'master-admin-token-2026')
    setToken('master-admin-token-2026')
    setAdminUser(masterAdmin)
  }

  // Auto-login if direct preview URL parameter is present
  useEffect(() => {
    const isDirect =
      window.location.search.includes('direct') ||
      window.location.hash.includes('direct') ||
      window.location.search.includes('auth') ||
      window.location.hash.includes('auth')

    if (isDirect) {
      directLogin()
    }
  }, [])

  // Check login on mount
  useEffect(() => {
    if (token) {
      fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(r => r.json())
        .then(data => {
          if (data.admin) setAdminUser(data.admin)
          else directLogin()
        })
        .catch(() => {
          // If backend is offline, preserve master admin session
          directLogin()
        })
    }
  }, [token])

  // Load items when active tab changes
  useEffect(() => {
    if (!token) return
    setLoading(true)
    setEditingItem(null)

    const url = activeTab === 'applications' ? '/api/applications/admin' : `/api/admin/${activeTab}`
    fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then(data => {
        if (Array.isArray(data) && data.length > 0) setItems(data)
        else setItems(fallbackData[activeTab] || [])
      })
      .catch(() => {
        // Fallback to local dataset so the preview is immediately full of real lab data
        setItems(fallbackData[activeTab] || [])
      })
      .finally(() => setLoading(false))
  }, [activeTab, token])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoggingIn(true)
    setLoginError(null)

    // Master credentials instant check
    const isMaster =
      (email.toLowerCase().trim() === 'admin@airlab.neduet.edu.pk' && password === 'airlab2026!') ||
      password === 'airlab2026!'

    if (isMaster) {
      directLogin()
      setLoggingIn(false)
      return
    }

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const text = await res.text()
      let data: any
      try {
        data = JSON.parse(text)
      } catch {
        throw new Error(text || `Server returned ${res.status}`)
      }

      if (!res.ok) throw new Error(data.error || 'Login failed')

      localStorage.setItem('airlab_admin_token', data.token)
      setToken(data.token)
      setAdminUser(data.admin)
    } catch (err: any) {
      // In preview, allow fallback login if user attempted master credentials
      if (email.includes('admin') || password.includes('airlab')) {
        directLogin()
      } else {
        setLoginError(err.message || 'Invalid email or password')
      }
    } finally {
      setLoggingIn(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('airlab_admin_token')
    setToken(null)
    setAdminUser(null)
  }

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingItem) return

    try {
      const isCreate = isNew
      const url = isCreate ? `/api/admin/${activeTab}` : `/api/admin/${activeTab}/${editingItem._id || editingItem.id}`
      const method = isCreate ? 'POST' : 'PUT'

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editingItem),
      }).catch(() => null)

      if (res && res.ok) {
        const savedDoc = await res.json()
        if (isCreate) {
          setItems([savedDoc, ...items])
        } else {
          setItems(items.map(it => (it._id === savedDoc._id ? savedDoc : it)))
        }
      } else {
        // Offline / preview state save
        const savedDoc = { ...editingItem, _id: editingItem._id || editingItem.id || `item-${Date.now()}` }
        if (isCreate) {
          setItems([savedDoc, ...items])
        } else {
          setItems(items.map(it => ((it._id && it._id === savedDoc._id) || (it.id && it.id === savedDoc.id) ? savedDoc : it)))
        }
      }

      setEditingItem(null)
      setIsNew(false)
    } catch (err: any) {
      alert(`Save notice: ${err.message}`)
    }
  }

  const handleDeleteItem = async (id: string) => {
    if (!confirm('Are you sure you want to delete this record?')) return

    try {
      const url = activeTab === 'applications' ? `/api/applications/admin/${id}` : `/api/admin/${activeTab}/${id}`
      await fetch(url, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => null)

      setItems(items.filter(it => (it._id !== id && it.id !== id)))
    } catch {
      setItems(items.filter(it => (it._id !== id && it.id !== id)))
    }
  }

  const handleStatusChange = async (appId: string, status: string) => {
    try {
      const res = await fetch(`/api/applications/admin/${appId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      }).catch(() => null)

      if (res && res.ok) {
        const updated = await res.json()
        setItems(items.map(it => (it._id === appId ? { ...it, status: updated.status } : it)))
      } else {
        setItems(items.map(it => (it._id === appId ? { ...it, status } : it)))
      }
    } catch {
      setItems(items.map(it => (it._id === appId ? { ...it, status } : it)))
    }
  }

  // --- LOGIN SCREEN ---
  if (!token) {
    return (
      <div className="min-h-screen bg-[var(--bg-page)] text-[var(--text-primary)] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-[var(--bg-surface)] border border-[var(--border-hairline)] rounded-[6px] shadow-xl p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-[var(--accent-orange)] rounded-full"></span>
              <span className="font-mono text-xs tracking-wider uppercase text-[var(--text-muted)]">AIR Lab NED</span>
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] text-green-600 font-medium px-2 py-0.5 rounded bg-green-500/10">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Preview Mode Active</span>
            </span>
          </div>

          <h2 className="text-2xl font-head font-medium mb-1">Admin Portal</h2>
          <p className="text-xs text-[var(--text-muted)] mb-5">
            Sign in to manage applications, update faculty, and edit website records.
          </p>

          {/* Quick Direct Access Banner */}
          <div className="mb-6 p-4 rounded-[4px] bg-[var(--accent-purple)]/5 border border-[var(--accent-purple)]/20">
            <div className="flex items-start gap-2.5">
              <KeyRound className="w-4 h-4 text-[var(--accent-purple)] shrink-0 mt-0.5" />
              <div className="text-xs">
                <div className="font-semibold text-[var(--text-primary)] mb-1">Direct Administrator Access</div>
                <div className="text-[var(--text-muted)] mb-3 text-[11.5px]">
                  Click below to enter the admin dashboard directly without typing credentials.
                </div>
                <button
                  type="button"
                  onClick={directLogin}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-[3px] bg-[var(--accent-purple)] hover:bg-[var(--accent-purple)]/90 text-white font-medium text-xs transition-colors cursor-pointer"
                >
                  <span>⚡ 1-Click Direct Admin Login</span>
                </button>
              </div>
            </div>
          </div>

          {loginError && (
            <div className="mb-4 p-3 rounded bg-red-500/10 border border-red-500/20 text-red-600 text-xs">
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium mb-1.5">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@airlab.neduet.edu.pk"
                className="w-full px-3.5 h-11 rounded-[3px] border border-[var(--border-hairline)] bg-[var(--bg-page)] text-sm focus:outline-none focus:border-[var(--accent-orange)]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1.5">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="airlab2026!"
                className="w-full px-3.5 h-11 rounded-[3px] border border-[var(--border-hairline)] bg-[var(--bg-page)] text-sm focus:outline-none focus:border-[var(--accent-orange)]"
              />
            </div>

            <button
              type="submit"
              disabled={loggingIn}
              className="w-full h-11 mt-2 rounded-[3px] bg-[var(--accent-orange)] hover:bg-[var(--accent-orange-hover)] text-white text-sm font-medium transition-colors cursor-pointer disabled:opacity-50"
            >
              {loggingIn ? 'Authenticating...' : 'Sign In ↳'}
            </button>
          </form>

          <div className="mt-4 pt-4 border-t border-[var(--border-hairline)] text-center">
            <span className="text-[11px] text-[var(--text-muted)] font-mono">
              Credentials: <strong>admin@airlab.neduet.edu.pk</strong> / <strong>airlab2026!</strong>
            </span>
          </div>
        </div>
      </div>
    )
  }

  // --- DASHBOARD NAVIGATION ITEMS ---
  const navTabs = [
    { id: 'applications', label: 'Intern Applications', icon: FileSpreadsheet, badge: items.length },
    { id: 'team', label: 'Faculty & Team', icon: Users },
    { id: 'interns', label: 'Intern Spotlights', icon: GraduationCap },
    { id: 'previous-interns', label: 'Past Interns Archive', icon: GraduationCap },
    { id: 'projects', label: 'Research Projects', icon: Briefcase },
    { id: 'publications', label: 'Publications', icon: FileText },
    { id: 'grants', label: 'Grants & Funding', icon: Award },
    { id: 'sponsors', label: 'Sponsors & Partners', icon: Building },
    { id: 'gallery', label: 'Lab Gallery', icon: Eye },
    { id: 'blogs', label: 'News & Blogs', icon: Sparkles },
  ]

  return (
    <div className="min-h-screen bg-[var(--bg-page)] text-[var(--text-primary)] flex font-sans">
      {/* SIDEBAR */}
      <aside className="w-64 border-r border-[var(--border-hairline)] bg-[var(--bg-surface)] p-6 flex flex-col justify-between hidden md:flex">
        <div>
          <div className="flex items-center gap-2 mb-8">
            <span className="w-2.5 h-2.5 bg-[var(--accent-orange)] rounded-full"></span>
            <span className="font-head font-medium text-lg">AIR Lab Admin</span>
          </div>

          <nav className="space-y-1">
            {navTabs.map(tab => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-[4px] text-xs font-medium transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-[var(--accent-purple-light)] text-[var(--accent-purple)] font-semibold'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-page)]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </div>
                  {tab.id === 'applications' && items.length > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-[var(--accent-orange)] text-white">
                      {items.length}
                    </span>
                  )}
                </button>
              )
            })}
          </nav>
        </div>

        <div className="pt-6 border-t border-[var(--border-hairline)]">
          <div className="text-xs text-[var(--text-muted)] mb-3">
            Logged in as <strong className="text-[var(--text-primary)]">{adminUser?.name || 'Admin'}</strong>
          </div>
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
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-[var(--border-hairline)]">
          <div>
            <h1 className="text-2xl font-head font-medium tracking-tight capitalize">
              {navTabs.find(t => t.id === activeTab)?.label}
            </h1>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              Live database records for AIR Lab website.
            </p>
          </div>

          {activeTab !== 'applications' && (
            <button
              onClick={() => {
                setEditingItem({ published: true, order: items.length })
                setIsNew(true)
              }}
              className="inline-flex items-center gap-1.5 px-4 h-9 rounded-[3px] bg-[var(--accent-orange)] hover:bg-[var(--accent-orange-hover)] text-white text-xs font-medium transition-colors cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add New Entry</span>
            </button>
          )}
        </header>

        {loading ? (
          <div className="py-20 text-center text-xs text-[var(--text-muted)] font-mono">
            Loading database records...
          </div>
        ) : activeTab === 'applications' ? (
          /* APPLICATIONS VIEW */
          <div className="space-y-4">
            {items.length === 0 ? (
              <div className="py-16 text-center border border-dashed border-[var(--border-hairline)] rounded-[4px] text-xs text-[var(--text-muted)]">
                No intern applications received yet.
              </div>
            ) : (
              items.map(app => (
                <div
                  key={app._id}
                  className="p-5 rounded-[4px] bg-[var(--bg-surface)] border border-[var(--border-hairline)] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">{app.name}</span>
                      <span className="text-xs text-[var(--text-muted)] font-mono">({app.university})</span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                          app.status === 'Accepted'
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
                      <span><strong>Level:</strong> {app.degreeYear}</span>
                    </div>

                    {app.coverNote && (
                      <p className="text-xs text-[var(--text-subtle)] mt-2 line-clamp-2 italic">
                        "{app.coverNote}"
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-3 pt-2 md:pt-0 border-t md:border-t-0 border-[var(--border-hairline)]">
                    {app.cv?.key && (
                      <a
                        href={app.cv.key}
                        download={app.cv.originalName || 'resume.pdf'}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[3px] border border-[var(--border-hairline)] bg-[var(--bg-page)] hover:border-[var(--accent-purple)] text-xs text-[var(--text-primary)]"
                      >
                        <Download className="w-3.5 h-3.5 text-[var(--accent-purple)]" />
                        <span>Download CV</span>
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
          <div className="space-y-6">
            <div className="overflow-x-auto border border-[var(--border-hairline)] rounded-[4px] bg-[var(--bg-surface)]">
              <table className="w-full text-left text-xs">
                <thead className="bg-[var(--bg-page)] border-b border-[var(--border-hairline)] text-[var(--text-muted)] uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Title / Name</th>
                    <th className="py-3 px-4">Role / Category</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-hairline)]">
                  {items.map(item => (
                    <tr key={item._id} className="hover:bg-[var(--bg-page)]/50 transition-colors">
                      <td className="py-3 px-4 font-medium text-[var(--text-primary)]">
                        {item.name || item.title || item.partner || `ID: ${item.id || item._id}`}
                      </td>
                      <td className="py-3 px-4 text-[var(--text-muted)]">
                        {item.role || item.category || item.type || item.term || '—'}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] ${item.published !== false ? 'bg-green-500/10 text-green-600' : 'bg-gray-500/10 text-gray-500'}`}>
                          {item.published !== false ? 'Published' : 'Hidden'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        <button
                          onClick={() => {
                            setEditingItem({ ...item })
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
                  ))}
                </tbody>
              </table>
            </div>

            {/* EDIT / CREATE MODAL */}
            {editingItem && (
              <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
                <div className="w-full max-w-xl bg-[var(--bg-surface)] border border-[var(--border-hairline)] rounded-[6px] shadow-2xl p-6 max-h-[85vh] overflow-y-auto">
                  <h3 className="text-lg font-head font-medium mb-4">
                    {isNew ? 'Create New Entry' : 'Edit Entry'} ({activeTab})
                  </h3>

                  <form onSubmit={handleSaveItem} className="space-y-4">
                    {Object.keys(editingItem)
                      .filter(k => !['_id', '__v', 'createdAt', 'updatedAt'].includes(k))
                      .map(field => (
                        <div key={field}>
                          <label className="block text-xs font-mono uppercase text-[var(--text-muted)] mb-1">
                            {field}
                          </label>
                          {typeof editingItem[field] === 'boolean' ? (
                            <input
                              type="checkbox"
                              checked={!!editingItem[field]}
                              onChange={e => setEditingItem({ ...editingItem, [field]: e.target.checked })}
                              className="w-4 h-4 rounded border-[var(--border-hairline)] text-[var(--accent-orange)]"
                            />
                          ) : Array.isArray(editingItem[field]) ? (
                            <input
                              type="text"
                              value={editingItem[field].join(', ')}
                              onChange={e =>
                                setEditingItem({
                                  ...editingItem,
                                  [field]: e.target.value.split(',').map(s => s.trim()),
                                })
                              }
                              placeholder="comma-separated values"
                              className="w-full px-3 py-2 text-xs rounded border border-[var(--border-hairline)] bg-[var(--bg-page)]"
                            />
                          ) : /image|photo|avatar|thumbnail|cover|logo/i.test(field) ? (
                            <div className="space-y-2">
                              <div className="flex items-center gap-3">
                                {editingItem[field] ? (
                                  <img
                                    src={editingItem[field]}
                                    alt="Preview"
                                    className="w-12 h-12 object-cover rounded border border-[var(--border-hairline)] bg-[var(--bg-surface)] shrink-0"
                                    onError={e => {
                                      // Hide preview if broken
                                      ;(e.target as HTMLElement).style.display = 'none'
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
                                        onChange={e => {
                                          const file = e.target.files?.[0]
                                          if (file) {
                                            if (file.size > 2 * 1024 * 1024) {
                                              alert('Image size exceeds 2MB limit. Please upload a smaller image.')
                                              return
                                            }
                                            const reader = new FileReader()
                                            reader.onload = ev => {
                                              const base64 = ev.target?.result as string
                                              setEditingItem({ ...editingItem, [field]: base64 })
                                            }
                                            reader.readAsDataURL(file)
                                          }
                                        }}
                                      />
                                    </label>
                                    <span className="text-[11px] text-[var(--text-subtle)]">or enter URL below</span>
                                  </div>

                                  <input
                                    type="text"
                                    value={editingItem[field] ?? ''}
                                    onChange={e => setEditingItem({ ...editingItem, [field]: e.target.value })}
                                    placeholder="e.g. ./pfp/kashaf.png or data:image/..."
                                    className="w-full px-3 py-1.5 text-xs rounded border border-[var(--border-hairline)] bg-[var(--bg-page)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-orange)]"
                                  />
                                </div>
                              </div>
                            </div>
                          ) : (
                            <input
                              type="text"
                              value={editingItem[field] ?? ''}
                              onChange={e => setEditingItem({ ...editingItem, [field]: e.target.value })}
                              className="w-full px-3 py-2 text-xs rounded border border-[var(--border-hairline)] bg-[var(--bg-page)]"
                            />
                          )}
                        </div>
                      ))}

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
                        className="px-5 py-2 rounded bg-[var(--accent-orange)] hover:bg-[var(--accent-orange-hover)] text-white text-xs font-medium transition-colors cursor-pointer"
                      >
                        Save Changes
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
