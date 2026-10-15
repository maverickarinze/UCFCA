import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, CalendarCheck, UsersRound } from 'lucide-react'
import { supabase } from '../lib/supabase'

export default function Dashboard({ officer }) {
  const [counts, setCounts] = useState(null)

  useEffect(() => {
    supabase
      .from('members')
      .select('active')
      .then(({ data }) => {
        if (data) setCounts({ total: data.length, active: data.filter((m) => m.active).length })
      })
  }, [])

  return (
    <>
      <h1 className="admin-title">Welcome, {officer.full_name.split(' ')[0]}</h1>
      <div className="admin-cards">
        <Link className="admin-card" to="/admin/members">
          <UsersRound aria-hidden="true" />
          <strong>{counts ? counts.active : '…'}</strong>
          <span>
            Active members
            {counts && counts.total !== counts.active ? ` (${counts.total} in total)` : ''}
          </span>
          <em>
            Manage members <ArrowRight aria-hidden="true" />
          </em>
        </Link>
        <div className="admin-card disabled">
          <CalendarCheck aria-hidden="true" />
          <strong>Meetings</strong>
          <span>QR check-in and attendance reports are coming in the next update.</span>
        </div>
      </div>
    </>
  )
}
