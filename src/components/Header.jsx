import { useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import Brand from './Brand'
import { navLinks } from '../data/content'

export default function Header() {
  const { pathname } = useLocation()
  // Remember which page the menu was opened on so it closes after navigating.
  const [openOn, setOpenOn] = useState(null)
  const open = openOn === pathname

  return (
    <>
      <a className="skip" href="#main">
        Skip to content
      </a>
      <header>
        <Link className="brand" to="/" aria-label="UCFCA home">
          <Brand />
        </Link>
        <button
          className="menu"
          onClick={() => setOpenOn(open ? null : pathname)}
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          {open ? <X /> : <Menu />}
        </button>
        <nav className={open ? 'open' : ''}>
          {navLinks.map(({ label, to }) => (
            <NavLink key={to} to={to}>
              {label}
            </NavLink>
          ))}
          <Link className="nav-donate" to="/donate">
            Support Us
          </Link>
        </nav>
      </header>
    </>
  )
}
