import { Link } from 'react-router-dom'
import Brand from '../components/Brand'
import useNoIndex from '../utils/useNoIndex'
import usePageMeta from '../utils/usePageMeta'
import CheckIn from './CheckIn'
import MyAttendance from './MyAttendance'
import Setup from './Setup'
import './member.css'

const PAGES = {
  checkin: ['Check in', CheckIn],
  setup: ['Set up check-in', Setup],
  me: ['My attendance', MyAttendance],
}

// Member-facing attendance pages: short, phone-first, no site navigation.
export default function MemberApp({ page }) {
  const [title, Page] = PAGES[page]
  usePageMeta(title)
  useNoIndex()
  return (
    <div className="member">
      <header className="member-header">
        <Link className="brand" to="/">
          <Brand />
        </Link>
      </header>
      <main id="main" className="member-main">
        <Page />
      </main>
    </div>
  )
}
