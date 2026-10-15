import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, CalendarCheck, KeyRound, UsersRound } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { formatDateTime } from '../lib/time'

export default function Dashboard({ officer }) {
  const [stats, setStats] = useState(null)

  useEffect(() => {
    Promise.all([
      supabase.from('members').select('id, active'),
      supabase
        .from('meetings')
        .select('id, title, starts_at, opens_at, closes_at')
        .gte('closes_at', new Date().toISOString())
        .order('starts_at')
        .limit(1),
      supabase.rpc('officer_member_access'),
    ]).then(([members, meetings, access]) => {
      const active = (members.data ?? []).filter((m) => m.active)
      const activeIds = new Set(active.map((m) => m.id))
      setStats({
        total: members.data?.length ?? 0,
        active: active.length,
        withPin: (access.data ?? []).filter((a) => a.has_pin && activeIds.has(a.member_id)).length,
        next: meetings.data?.[0] ?? null,
        nextIsOpen: !!meetings.data?.[0] && Date.now() >= Date.parse(meetings.data[0].opens_at),
      })
    })
  }, [])

  const next = stats?.next
  const nextIsOpen = stats?.nextIsOpen

  return (
    <>
      <h1 className="admin-title">Welcome, {officer.full_name.split(' ')[0]}</h1>
      <div className="admin-cards">
        <Link className="admin-card" to={next ? `/admin/meetings/${next.id}` : '/admin/meetings'}>
          <CalendarCheck aria-hidden="true" />
          <strong>{next ? (nextIsOpen ? 'Check-in open' : 'Next meeting') : 'Meetings'}</strong>
          <span>
            {next
              ? `${next.title} · ${formatDateTime(next.starts_at)}`
              : stats
                ? 'No upcoming meeting. Create one before the next general meeting.'
                : '…'}
          </span>
          <em>
            {next ? 'Open meeting' : 'Go to meetings'} <ArrowRight aria-hidden="true" />
          </em>
        </Link>
        <Link className="admin-card" to="/admin/members">
          <UsersRound aria-hidden="true" />
          <strong>{stats ? stats.active : '…'}</strong>
          <span>
            Active members
            {stats && stats.total !== stats.active ? ` (${stats.total} in total)` : ''}
          </span>
          <em>
            Manage members <ArrowRight aria-hidden="true" />
          </em>
        </Link>
        <Link className="admin-card" to="/admin/members">
          <KeyRound aria-hidden="true" />
          <strong>{stats ? `${stats.withPin} of ${stats.active}` : '…'}</strong>
          <span>Members set up for check-in</span>
          <em>
            Send setup links <ArrowRight aria-hidden="true" />
          </em>
        </Link>
      </div>
    </>
  )
}
