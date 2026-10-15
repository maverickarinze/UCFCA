import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Plus } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { abujaTime, formatDateTime, nextFirstSunday } from '../lib/time'
import { meetingState } from './meetingState'

const LAST_START_KEY = 'ucfca-last-meeting-start'

function lastStartTime() {
  try {
    return localStorage.getItem(LAST_START_KEY) || '14:00'
  } catch {
    return '14:00'
  }
}

function NewMeetingForm({ officer, onCreated, onCancel }) {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    const f = Object.fromEntries(new FormData(e.currentTarget))
    const start = new Date(abujaTime(f.date, f.time))
    setSaving(true)
    const { data, error } = await supabase
      .from('meetings')
      .insert({
        title: f.title.trim(),
        venue: f.venue.trim() || null,
        starts_at: start.toISOString(),
        grace_minutes: Number(f.grace),
        opens_at: new Date(start.getTime() - 30 * 60 * 1000).toISOString(),
        closes_at: new Date(start.getTime() + 2 * 60 * 60 * 1000).toISOString(),
        created_by: officer.user_id,
      })
      .select('id')
      .single()
    setSaving(false)
    if (error) return setError(error.message)
    try {
      localStorage.setItem(LAST_START_KEY, f.time)
    } catch {
      // Only a convenience for next time.
    }
    onCreated(data.id)
  }

  return (
    <section className="admin-panel">
      <h2>New meeting</h2>
      <form className="admin-member-form" onSubmit={handleSubmit}>
        <label className="admin-span">
          Title
          <input name="title" defaultValue="General Meeting" required />
        </label>
        <label>
          Date
          <input name="date" type="date" defaultValue={nextFirstSunday()} required />
        </label>
        <label>
          Start time (Abuja)
          <input name="time" type="time" defaultValue={lastStartTime()} required />
        </label>
        <label>
          Venue <span className="optional">(optional)</span>
          <input name="venue" />
        </label>
        <label>
          Grace period
          <select name="grace" defaultValue="15">
            {[0, 5, 10, 15, 20, 30].map((m) => (
              <option key={m} value={m}>
                {m} minutes
              </option>
            ))}
          </select>
        </label>
        <p className="admin-muted admin-span">
          Check-in opens 30 minutes before the start and closes 2 hours after it. Members who check
          in after the grace period are marked late.
        </p>
        <div className="admin-form-actions">
          <button className="button" type="submit" disabled={saving}>
            {saving ? 'Creating…' : 'Create meeting'}
          </button>
          <button className="button ghost" type="button" onClick={onCancel}>
            Cancel
          </button>
        </div>
        {error && <p className="form-status error">{error}</p>}
      </form>
    </section>
  )
}

export default function Meetings({ officer }) {
  const canEdit = officer.role === 'recorder'
  const navigate = useNavigate()
  const [meetings, setMeetings] = useState(null)
  const [counts, setCounts] = useState({})
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    const [{ data, error }, { data: rows }] = await Promise.all([
      supabase
        .from('meetings')
        .select('id, title, venue, starts_at, opens_at, closes_at')
        .order('starts_at', { ascending: false }),
      supabase.from('attendance').select('meeting_id, status'),
    ])
    if (error) return setError(error.message)
    const byMeeting = {}
    for (const r of rows ?? []) {
      byMeeting[r.meeting_id] ??= { attended: 0, excused: 0 }
      if (r.status === 'excused') byMeeting[r.meeting_id].excused++
      else byMeeting[r.meeting_id].attended++
    }
    setCounts(byMeeting)
    setMeetings(data)
  }, [])

  useEffect(() => {
    // Initial fetch; state updates once the requests resolve.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load()
  }, [load])

  const upcoming = (meetings ?? []).filter((m) => meetingState(m) !== 'closed').reverse()
  const past = (meetings ?? []).filter((m) => meetingState(m) === 'closed')

  const row = (m) => {
    const state = meetingState(m)
    const c = counts[m.id]
    return (
      <li key={m.id}>
        <div>
          <strong>{m.title}</strong>
          {state === 'open' && <span className="admin-badge is-live">Check-in open</span>}
          <span className="admin-muted">
            {[formatDateTime(m.starts_at), m.venue].filter(Boolean).join(' · ')}
          </span>
          {c && (
            <span className="admin-muted admin-address">
              {c.attended} checked in{c.excused ? ` · ${c.excused} excused` : ''}
            </span>
          )}
        </div>
        <div className="admin-row-actions">
          <Link className="admin-link-button" to={`/admin/meetings/${m.id}`}>
            Open <ArrowRight aria-hidden="true" />
          </Link>
        </div>
      </li>
    )
  }

  return (
    <>
      <div className="admin-title-row">
        <h1 className="admin-title">Meetings</h1>
        {canEdit && !adding && (
          <button className="button" onClick={() => setAdding(true)}>
            <Plus aria-hidden="true" /> New meeting
          </button>
        )}
      </div>
      {error && <p className="form-status error">Couldn’t load meetings: {error}</p>}
      {adding && (
        <NewMeetingForm
          officer={officer}
          onCancel={() => setAdding(false)}
          onCreated={(id) => navigate(`/admin/meetings/${id}`)}
        />
      )}
      {meetings && !meetings.length && !adding && (
        <p className="admin-muted">No meetings yet. Create one before your next general meeting.</p>
      )}
      {upcoming.length > 0 && (
        <>
          <h2 className="admin-subtitle">Upcoming</h2>
          <ul className="admin-list">{upcoming.map(row)}</ul>
        </>
      )}
      {past.length > 0 && (
        <>
          <h2 className="admin-subtitle">Past</h2>
          <ul className="admin-list">{past.map(row)}</ul>
        </>
      )}
    </>
  )
}
