import { useCallback, useEffect, useState } from 'react'
import { rpc } from '../lib/rpc'
import { formatMeetingDate, formatTime } from '../lib/time'
import { clearDeviceToken, getDeviceToken } from './device'
import SignInForm from './SignInForm'

const LABELS = {
  present: 'On time',
  late: 'Late',
  excused: 'Excused',
  absent: 'Absent',
  open: 'Open now',
}

// /me  The member's own attendance record.
export default function MyAttendance() {
  const [data, setData] = useState(null)
  const [needsSignIn, setNeedsSignIn] = useState(() => !getDeviceToken())
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    try {
      const r = await rpc('member_my_attendance', { p_device_token: getDeviceToken() })
      if (r.ok) setData(r)
      else {
        clearDeviceToken()
        setNeedsSignIn(true)
      }
    } catch {
      setError('Couldn’t reach the server. Check your connection and reload the page.')
    }
  }, [])

  useEffect(() => {
    // Initial fetch; state updates once the request resolves.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!needsSignIn) load()
  }, [needsSignIn, load])

  async function signOut() {
    await rpc('member_sign_out', { p_device_token: getDeviceToken() }).catch(() => {})
    clearDeviceToken()
    setData(null)
    setNeedsSignIn(true)
  }

  if (needsSignIn) return <SignInForm onSignedIn={() => setNeedsSignIn(false)} />
  if (error) return <p className="form-status error">{error}</p>
  if (!data) return <h1 className="member-loading">Loading your attendance…</h1>

  const held = data.meetings.filter((m) => m.status !== 'open')
  const attended = held.filter((m) => m.status === 'present' || m.status === 'late').length
  const rate = held.length ? Math.round((attended / held.length) * 100) : null

  return (
    <div className="member-card member-record">
      <h1>{data.full_name}</h1>
      <p className="member-muted">Your attendance at UCFCA meetings</p>
      <div className="member-stats">
        <div>
          <strong>{rate === null ? '—' : `${rate}%`}</strong>
          <span>Attendance</span>
        </div>
        <div>
          <strong>
            {attended}/{held.length}
          </strong>
          <span>Meetings attended</span>
        </div>
      </div>
      {data.meetings.length ? (
        <ul className="member-meetings">
          {data.meetings.map((m) => (
            <li key={m.starts_at + m.title}>
              <div>
                <strong>{m.title}</strong>
                <span className="member-muted">
                  {formatMeetingDate(m.starts_at)}
                  {m.checked_in_at && ` · checked in ${formatTime(m.checked_in_at)}`}
                </span>
              </div>
              <span className={`member-status is-${m.status}`}>{LABELS[m.status]}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="member-muted">
          No meetings yet. Your record will appear here after your first meeting.
        </p>
      )}
      <button className="member-signout" onClick={signOut}>
        Sign out of this phone
      </button>
    </div>
  )
}
