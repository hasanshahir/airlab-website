import { lazy, Suspense } from 'react'
import { HashRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './components/ThemeProvider'
import Layout from './components/Layout'
import Home from './pages/Home'

const About = lazy(() => import('./pages/About'))
const Team = lazy(() => import('./pages/Team'))
const Projects = lazy(() => import('./pages/Projects'))
const Publications = lazy(() => import('./pages/Publications'))
const Blogs = lazy(() => import('./pages/Blogs'))
const Grants = lazy(() => import('./pages/Grants'))
const Contact = lazy(() => import('./pages/Contact'))
const Gallery = lazy(() => import('./pages/Gallery'))
const Performers = lazy(() => import('./pages/Performers'))
const Interns = lazy(() => import('./pages/Interns'))
const AdminDashboard = lazy(() => import('./pages/Admin'))

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
