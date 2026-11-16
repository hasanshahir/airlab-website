import { lazy, Suspense, type ComponentType } from 'react'
import { HashRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './components/ThemeProvider'
import Layout from './components/Layout'
import Home from './pages/Home'

/**
 * Robust lazy-load helper that handles new deployments gracefully.
 * If dynamic import of a chunk fails (e.g. after a redeploy changed the chunk hash),
 * it performs a one-time page reload to fetch the latest index.html and assets.
 */
function lazyRetry<T extends ComponentType<any>>(factory: () => Promise<{ default: T }>) {
  return lazy(async () => {
    try {
      return await factory()
    } catch (error: any) {
      const isDynamicImportError =
        error?.message?.includes?.('dynamically imported module') ||
        error?.message?.includes?.('Failed to fetch') ||
        error?.name === 'ChunkLoadError'

      if (isDynamicImportError) {
        const lastReload = sessionStorage.getItem('airlab_chunk_reload')
        const now = Date.now()
        if (!lastReload || now - parseInt(lastReload, 10) > 10000) {
          sessionStorage.setItem('airlab_chunk_reload', now.toString())
          window.location.reload()
          // Return a placeholder while reloading
          return { default: (() => null) as unknown as T }
        }
      }
      throw error
    }
  })
}

const About = lazyRetry(() => import('./pages/About'))
const Team = lazyRetry(() => import('./pages/Team'))
const Projects = lazyRetry(() => import('./pages/Projects'))
const Publications = lazyRetry(() => import('./pages/Publications'))
const Blogs = lazyRetry(() => import('./pages/Blogs'))
const Grants = lazyRetry(() => import('./pages/Grants'))
const Contact = lazyRetry(() => import('./pages/Contact'))
const Gallery = lazyRetry(() => import('./pages/Gallery'))
const Performers = lazyRetry(() => import('./pages/Performers'))
const Interns = lazyRetry(() => import('./pages/Interns'))
const AdminDashboard = lazyRetry(() => import('./pages/Admin'))

export default function App() {
  return (
    <ThemeProvider>
      <HashRouter>
        <Suspense fallback={<div className="min-h-screen bg-[var(--bg-page)]" />}>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="about" element={<About />} />
              <Route path="team" element={<Team />} />
              <Route path="projects" element={<Projects />} />
              <Route path="grants" element={<Grants />} />
              <Route path="publications" element={<Publications />} />
              <Route path="blogs" element={<Blogs />} />
              <Route path="contact" element={<Contact />} />
              <Route path="gallery" element={<Gallery />} />
              <Route path="performers" element={<Performers />} />
              <Route path="interns" element={<Interns />} />
              <Route path="admin" element={<AdminDashboard />} />
              <Route path="*" element={<Home />} />
            </Route>
          </Routes>
        </Suspense>
      </HashRouter>
    </ThemeProvider>
  )
}
