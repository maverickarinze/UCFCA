import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import About from './pages/About'
import Committees from './pages/Committees'
import Constitution from './pages/Constitution'
import Contact from './pages/Contact'
import Donate from './pages/Donate'
import Executives from './pages/Executives'
import History from './pages/History'
import Home from './pages/Home'
import Membership from './pages/Membership'
import NotFound from './pages/NotFound'
import Placeholder from './pages/Placeholder'
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
        <Route
          path="events"
          element={
            <Placeholder
              eyebrow="Events"
              title="Upcoming and past events"
              message="No upcoming events have been announced yet."
            />
          }
        />
        <Route
          path="gallery"
          element={
            <Placeholder
              eyebrow="Gallery"
              title="Moments of friendship and service"
              message="Photographs and video albums will be added when supplied."
            />
          }
        />
        <Route
          path="news"
          element={
            <Placeholder
              eyebrow="News & announcements"
              title="The latest from UCFCA"
              message="No announcements have been published yet."
            />
          }
        />
        <Route path="contact" element={<Contact />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
