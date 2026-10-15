import { useState } from 'react'
import { rpc } from '../lib/rpc'
import { setDeviceToken } from './device'

const MESSAGES = {
  invalid_credentials: 'That phone number or email and PIN don’t match. Check both and try again.',
  locked: (minutes) =>
    `Too many wrong PINs. Try again in ${minutes} minute${minutes == 1 ? '' : 's'}, or ask the Secretary for a new setup link.`,
}

// Signs a member in on a new phone (phone number or email, plus PIN).
export default function SignInForm({ intro, onSignedIn }) {
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    const { identifier, pin } = Object.fromEntries(new FormData(e.currentTarget))
    setStatus('busy')
    try {
      const result = await rpc('member_sign_in', { p_identifier: identifier, p_pin: pin })
      if (result.ok) {
        setDeviceToken(result.device_token)
        onSignedIn(result)
        return
      }
      setError(
        result.error === 'locked' ? MESSAGES.locked(result.minutes) : MESSAGES.invalid_credentials,
      )
    } catch {
      setError('Couldn’t reach the server. Check your connection and try again.')
    }
    setStatus('error')
  }

  return (
    <form className="form member-card" onSubmit={handleSubmit}>
      <h1>Sign in</h1>
      <p className="member-muted">
        {intro ?? 'Use the phone number or email the club has for you, and your 4-digit PIN.'}
      </p>
      <label>
        Phone number or email
        <input name="identifier" autoComplete="username" required />
      </label>
      <label>
        PIN
        <input
          name="pin"
          type="password"
          inputMode="numeric"
          pattern="\d{4}"
          maxLength="4"
          autoComplete="current-password"
          required
        />
      </label>
      <button className="button" type="submit" disabled={status === 'busy'}>
        {status === 'busy' ? 'Signing in…' : 'Sign in'}
      </button>
      <div aria-live="polite">
        {status === 'error' && <p className="form-status error">{error}</p>}
      </div>
      <p className="member-muted member-small">
        No PIN yet, or forgot it? Ask the Secretary to send you a setup link.
      </p>
    </form>
  )
}
