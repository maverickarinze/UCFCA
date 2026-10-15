import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, QrCode, Search, Trash2 } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { abujaParts, formatDateTime, formatTime } from '../lib/time'
import CheckinScreen from './CheckinScreen'
import { meetingState } from './meetingState'

const STATUS_LABELS = { present: 'On time', late: 'Late', excused: 'Excused' }

export default function Meeting({ officer }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const canEdit = officer.role === 'recorder'
  const [meeting, setMeeting] = useState(null)
  const [members, setMembers] = useState([])
  const [attendance, setAttendance] = useState({})
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('all')
  const [query, setQuery] = useState('')
  const [showScreen, setShowScreen] = useState(false)
  const [selected, setSelected] = useState(() => new Set())
  const [bulkStatus, setBulkStatus] = useState('excused')
  const [saving, setSaving] = useState(false)
  const [notice, setNotice] = useState('')

  const loadAttendance = useCallback(async () => {
    const { data } = await supabase
      .from('attendance')
      .select('member_id, status, checked_in_at, method')
      .eq('meeting_id', id)
    if (data) setAttendance(Object.fromEntries(data.map((a) => [a.member_id, a])))
  }, [id])

  useEffect(() => {
    let active = true
    Promise.all([
      supabase.from('meetings').select('*').eq('id', id).maybeSingle(),
      supabase
        .from('members')
        .select('id, full_name, joined_on, active')
        .eq('active', true)
        .order('full_name'),
    ]).then(([m, mem]) => {
      if (!active) return
      if (m.error || !m.data) setError(m.error?.message ?? 'Meeting not found.')
      else setMeeting(m.data)
      setMembers(mem.data ?? [])
    })
    // Initial fetch; state updates once the request resolves.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadAttendance()
    return () => {
      active = false
    }
  }, [id, loadAttendance])

  // While check-in is open, keep the list live.
  const state = meeting ? meetingState(meeting) : null
  useEffect(() => {
    if (state !== 'open') return
    const timer = setInterval(loadAttendance, 5000)
    return () => clearInterval(timer)
  }, [state, loadAttendance])

  const closeScreen = useCallback(() => setShowScreen(false), [])

  if (error) return <p className="form-status error">{error}</p>
  if (!meeting) return <p className="admin-muted">Loading…</p>

  const meetingDate = abujaParts(meeting.starts_at).date
  const expected = members.filter((m) => !m.joined_on || m.joined_on <= meetingDate)
  const counts = { present: 0, late: 0, excused: 0 }
  for (const m of expected) if (attendance[m.id]) counts[attendance[m.id].status]++
  const missing = expected.length - counts.present - counts.late - counts.excused
  const missingLabel = state === 'closed' ? 'Absent' : 'Not checked in'

  const visible = expected.filter((m) => {
    const a = attendance[m.id]
    if (filter === 'in' && !(a && a.status !== 'excused')) return false
    if (filter === 'missing' && a) return false
    return !query || m.full_name.toLowerCase().includes(query.toLowerCase())
  })

  // Sets (or clears, when status is '') attendance for several members in one request.
  async function setStatusFor(memberIds, status) {
    const now = new Date().toISOString()
    const { error } = !status
      ? await supabase.from('attendance').delete().eq('meeting_id', id).in('member_id', memberIds)
      : await supabase.from('attendance').upsert(
          memberIds.map((memberId) => ({
            meeting_id: id,
            member_id: memberId,
            status,
            checked_in_at:
              status === 'excused' ? null : (attendance[memberId]?.checked_in_at ?? now),
            method: 'manual',
            recorded_by: officer.user_id,
            updated_at: now,
          })),
        )
    await loadAttendance()
    return error
  }

  async function applyBulk() {
    const ids = [...selected]
    setSaving(true)
    const error = await setStatusFor(ids, bulkStatus)
    setSaving(false)
    if (error) return setNotice(`Couldn’t update: ${error.message}`)
    const label = bulkStatus ? STATUS_LABELS[bulkStatus] : missingLabel
    setNotice(`${ids.length} member${ids.length === 1 ? '' : 's'} marked ${label}.`)
    setSelected(new Set())
  }

  function toggle(memberId) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(memberId)) next.delete(memberId)
      else next.add(memberId)
      return next
    })
  }

  const allShownSelected = visible.length > 0 && visible.every((m) => selected.has(m.id))
  function toggleAllShown() {
    setSelected(allShownSelected ? new Set() : new Set(visible.map((m) => m.id)))
  }

  // Changing the filter or search clears the selection, so hidden rows are never changed by surprise.
  function changeFilter(value) {
    setFilter(value)
    setSelected(new Set())
  }

  async function deleteMeeting() {
    if (!window.confirm(`Delete “${meeting.title}” and all its attendance records?`)) return
    const { error } = await supabase.from('meetings').delete().eq('id', id)
    if (error) setError(error.message)
    else navigate('/admin/meetings')
  }

  return (
    <>
      <Link className="admin-back" to="/admin/meetings">
        <ArrowLeft aria-hidden="true" /> All meetings
      </Link>
      <div className="admin-title-row">
        <div>
          <h1 className="admin-title">{meeting.title}</h1>
          <p className="admin-muted">
            {[formatDateTime(meeting.starts_at), meeting.venue].filter(Boolean).join(' · ')}
          </p>
          <p className="admin-muted">
            Check-in {formatTime(meeting.opens_at)} – {formatTime(meeting.closes_at)} · late after{' '}
            {meeting.grace_minutes} min
            {state === 'open' && <span className="admin-badge is-live">Open now</span>}
            {state === 'closed' && <span className="admin-badge">Closed</span>}
          </p>
        </div>
        {canEdit && state !== 'closed' && (
          <button className="button" onClick={() => setShowScreen(true)}>
            <QrCode aria-hidden="true" /> Show check-in screen
          </button>
        )}
      </div>

      <div className="admin-tally">
        <div>
          <strong>{counts.present}</strong> On time
        </div>
        <div>
          <strong>{counts.late}</strong> Late
        </div>
        <div>
          <strong>{counts.excused}</strong> Excused
        </div>
        <div>
          <strong>{missing}</strong> {missingLabel}
        </div>
      </div>

      <div className="admin-toolbar">
        <label className="admin-search">
          <Search aria-hidden="true" />
          <input
            type="search"
            placeholder="Find a member"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setSelected(new Set())
            }}
            aria-label="Find a member"
          />
        </label>
        <div className="admin-segmented" role="group" aria-label="Show">
          {[
            ['all', 'All'],
            ['in', 'Checked in'],
            ['missing', missingLabel],
          ].map(([value, label]) => (
            <button key={value} aria-pressed={filter === value} onClick={() => changeFilter(value)}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <p className="admin-notice" aria-live="polite">
        {notice}
      </p>
      {canEdit && visible.length > 0 && (
        <label className="admin-check admin-select-all">
          <input type="checkbox" checked={allShownSelected} onChange={toggleAllShown} />
          Select all shown ({visible.length})
        </label>
      )}

      <ul className="admin-list">
        {visible.map((m) => {
          const a = attendance[m.id]
          return (
            <li key={m.id} className={selected.has(m.id) ? 'is-selected' : ''}>
              <div>
                {canEdit && (
                  <input
                    type="checkbox"
                    className="admin-row-check"
                    checked={selected.has(m.id)}
                    onChange={() => toggle(m.id)}
                    aria-label={`Select ${m.full_name}`}
                  />
                )}
                <strong>{m.full_name}</strong>
                <span className={`admin-status is-${a?.status ?? 'none'}`}>
                  {a ? STATUS_LABELS[a.status] : missingLabel}
                </span>
                {a?.checked_in_at && (
                  <span className="admin-muted">
                    {formatTime(a.checked_in_at)}
                    {a.method === 'manual' ? ' · marked by an officer' : ''}
                  </span>
                )}
              </div>
              {canEdit && (
                <div className="admin-row-actions">
                  <select
                    className="admin-select"
                    value={a?.status ?? ''}
                    onChange={(e) => setStatusFor([m.id], e.target.value)}
                    aria-label={`Attendance for ${m.full_name}`}
                  >
                    <option value="">{missingLabel}</option>
                    <option value="present">On time</option>
                    <option value="late">Late</option>
                    <option value="excused">Excused</option>
                  </select>
                </div>
              )}
            </li>
          )
        })}
      </ul>
      {!visible.length && <p className="admin-muted">No members to show.</p>}

      {canEdit && selected.size > 0 && (
        <div className="admin-bulk-bar" role="region" aria-label="Update selected members">
          <strong>{selected.size} selected</strong>
          <label>
            Mark as
            <select
              className="admin-select"
              value={bulkStatus}
              onChange={(e) => setBulkStatus(e.target.value)}
            >
              <option value="present">On time</option>
              <option value="late">Late</option>
              <option value="excused">Excused</option>
              <option value="">{missingLabel}</option>
            </select>
          </label>
          <button className="button" onClick={applyBulk} disabled={saving}>
            {saving ? 'Saving…' : 'Apply'}
          </button>
          <button className="admin-link-button" onClick={() => setSelected(new Set())}>
            Clear selection
          </button>
        </div>
      )}

      {canEdit && (
        <button className="admin-link-button admin-danger" onClick={deleteMeeting}>
          <Trash2 aria-hidden="true" /> Delete meeting
        </button>
      )}

      {showScreen && (
        <CheckinScreen
          meeting={meeting}
          checkedIn={counts.present + counts.late}
          expected={expected.length}
          onClose={closeScreen}
        />
      )}
    </>
  )
}
