import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { CircleCheck } from 'lucide-react'
import { rpc } from '../lib/rpc'
import { setDeviceToken } from './device'

// /setup?token=…  First-time PIN setup from the link the Secretary sends.
export default function Setup() {
  const [params] = useSearchParams()
  const token = params.get('token') ?? ''
  const [info, setInfo] = useState(null) // { ok, first_name, has_pin } | { ok: false }
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState('')
  const [done, setDone] = useState(null)

  useEffect(() => {
    rpc('member_setup_info', { p_token: token })
      .then(setInfo)
      .catch(() => setInfo({ ok: false, error: 'network' }))
  }, [token])

  async function handleSubmit(e) {
    e.preventDefault()
    const { pin, confirm } = Object.fromEntries(new FormData(e.currentTarget))
    if (pin !== confirm) {
      setStatus('error')
      setError('The two PINs don’t match.')
      return
    }
    setStatus('busy')
    try {
      const result = await rpc('member_complete_setup', { p_token: token, p_pin: pin })
      if (result.ok) {
        setDeviceToken(result.device_token)
        setDone(result)
        return
      }
      setError(
        result.error === 'invalid_pin'
          ? 'Your PIN must be exactly 4 digits.'
          : 'This link has already been used or has expired. Ask the Secretary for a new one.',
      )
    } catch {
      setError('Couldn’t reach the server. Check your connection and try again.')
    }
    setStatus('error')
  }

  if (!info) return <h1 className="member-loading">Checking your link…</h1>

  if (done)
    return (
      <div className="member-card member-result is-success">
        <CircleCheck aria-hidden="true" />
        <h1>You’re all set, {done.first_name}</h1>
        <p>This phone is now remembered. At each meeting, scan the code on screen to check in.</p>
        <Link className="button" to="/me">
          View my attendance
        </Link>
      </div>
    )

  if (!info.ok)
    return (
      <div className="member-card member-result is-error">
        <h1>This link doesn’t work</h1>
        <p>
          {info.error === 'network'
            ? 'Couldn’t reach the server. Check your connection and reload the page.'
            : 'It may have been used already or expired (links last 14 days). Ask the Secretary for a new one.'}
        </p>
      </div>
    )

  return (
    <form className="form member-card" onSubmit={handleSubmit}>
      <h1>Hi {info.first_name}</h1>
      <p className="member-muted">
        {info.has_pin
          ? 'Choose a new 4-digit PIN. Your old PIN will stop working.'
          : 'Choose a 4-digit PIN for checking in at UCFCA meetings. You’ll only need it if you change phones.'}
      </p>
      <label>
        New PIN
        <input
          name="pin"
          type="password"
          inputMode="numeric"
          pattern="\d{4}"
          maxLength="4"
          autoComplete="new-password"
          required
        />
      </label>
      <label>
        Type it again
        <input
          name="confirm"
          type="password"
          inputMode="numeric"
          pattern="\d{4}"
          maxLength="4"
          autoComplete="new-password"
          required
        />
      </label>
      <button className="button" type="submit" disabled={status === 'busy'}>
        {status === 'busy' ? 'Saving…' : 'Save PIN'}
      </button>
      <div aria-live="polite">
        {status === 'error' && <p className="form-status error">{error}</p>}
      </div>
      <p className="member-muted member-small">
        UCFCA records when you check in to meetings. Only you and the club’s officers can see your
        attendance.
      </p>
    </form>
  )
}
