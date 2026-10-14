import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import About from './pages/About'
import Committees from './pages/Committees'
import Constitution from './pages/Constitution'
import Contact from './pages/Contact'
import Donate from './pages/Donate'
import Events from './pages/Events'
import Executives from './pages/Executives'
import Gallery from './pages/Gallery'
import History from './pages/History'
import Home from './pages/Home'
import Membership from './pages/Membership'
import News from './pages/News'
import NotFound from './pages/NotFound'
import ProjectDetail from './pages/ProjectDetail'
import Projects from './pages/Projects'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="about" element={<About />} />
        <Route path="history" element={<History />} />
        <Route path="executives" element={<Executives />} />
        <Route path="committees" element={<Committees />} />
        <Route path="projects" element={<Projects />} />
        <Route path="projects/:slug" element={<ProjectDetail />} />
        <Route path="membership" element={<Membership />} />
        <Route path="donate" element={<Donate />} />
        <Route path="constitution" element={<Constitution />} />
        <Route path="events" element={<Events />} />
        <Route path="gallery" element={<Gallery />} />
        <Route path="news" element={<News />} />
        <Route path="contact" element={<Contact />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
