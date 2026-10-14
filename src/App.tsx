import { HashRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './components/ThemeProvider'
import Layout from './components/Layout'
import Home from './pages/Home'
import Team from './pages/Team'
import Projects from './pages/Projects'
import Publications from './pages/Publications'
import Grants from './pages/Grants'
import Contact from './pages/Contact'
import Gallery from './pages/Gallery'
import Performers from './pages/Performers'
import Interns from './pages/Interns'

export default function App() {
  return (
    <ThemeProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="about" element={<Home />} />
            <Route path="team" element={<Team />} />
            <Route path="projects" element={<Projects />} />
            <Route path="grants" element={<Grants />} />
            <Route path="publications" element={<Publications />} />
            <Route path="contact" element={<Contact />} />
            <Route path="gallery" element={<Gallery />} />
            <Route path="performers" element={<Performers />} />
            <Route path="collaborations" element={<Home />} />
            <Route path="interns" element={<Interns />} />
            <Route path="*" element={<Home />} />
          </Route>
        </Routes>
      </HashRouter>
    </ThemeProvider>
  )
}
