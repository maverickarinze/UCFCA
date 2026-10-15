import { useEffect } from 'react'
import { Link, Navigate, NavLink, Route, Routes } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import Brand from '../components/Brand'
import { supabase } from '../lib/supabase'
import usePageMeta from '../utils/usePageMeta'
import Dashboard from './Dashboard'
import Login from './Login'
import Members from './Members'
import useOfficer from './useOfficer'
import './admin.css'

// Keep the private area out of search results.
function useNoIndex() {
  useEffect(() => {
    const tag = document.createElement('meta')
    tag.name = 'robots'
    tag.content = 'noindex, nofollow'
    document.head.append(tag)
    return () => tag.remove()
  }, [])
}

function Shell({ officer, children }) {
  return (
    <div className="admin">
      <header className="admin-header">
        <Link className="brand" to="/admin">
          <Brand />
        </Link>
        {officer && (
          <nav className="admin-nav" aria-label="Admin">
            <NavLink to="/admin" end>
              Overview
            </NavLink>
            <NavLink to="/admin/members">Members</NavLink>
          </nav>
        )}
        {officer && (
          <div className="admin-user">
            <span>
              {officer.full_name}
              <small>{officer.role === 'recorder' ? 'Can edit' : 'View only'}</small>
            </span>
            <button className="admin-icon-button" onClick={() => supabase.auth.signOut()}>
              <LogOut aria-hidden="true" />
              <span className="sr-only">Sign out</span>
            </button>
          </div>
        )}
      </header>
      <main id="main" className="admin-main">
        {children}
      </main>
    </div>
  )
}

export default function AdminApp() {
  usePageMeta('Officers')
  useNoIndex()
  const state = useOfficer()

  if (state.status === 'loading') return <Shell>{null}</Shell>
  if (state.status === 'signed-out')
    return (
      <Shell>
        <Login />
      </Shell>
    )
  if (state.status === 'not-officer')
    return (
      <Shell>
        <div className="admin-login">
          <div className="form">
            <h1>No officer access</h1>
            <p className="admin-muted">
              {state.session.user.email} is signed in but isn’t set up as a UCFCA officer. Ask the
              Secretary to add you.
            </p>
            <button className="button" onClick={() => supabase.auth.signOut()}>
              Sign out
            </button>
          </div>
        </div>
      </Shell>
    )

  return (
    <Shell officer={state.officer}>
      <Routes>
        <Route index element={<Dashboard officer={state.officer} />} />
        <Route path="members" element={<Members officer={state.officer} />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </Shell>
  )
}
