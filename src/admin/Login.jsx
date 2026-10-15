import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { takeSignOutReason } from './idle'

export default function Login() {
  const [status, setStatus] = useState('idle') // idle | signing-in | error
  const [error, setError] = useState('')
  const [reason] = useState(takeSignOutReason)

  async function handleSubmit(e) {
    e.preventDefault()
    const { email, password } = Object.fromEntries(new FormData(e.currentTarget))
    setStatus('signing-in')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setStatus('error')
      setError(
        error.message === 'Invalid login credentials'
          ? 'That email and password don’t match an officer account.'
          : error.message,
      )
    }
  }

  return (
    <div className="admin-login">
      <form className="form" onSubmit={handleSubmit}>
        <h1>Officer sign in</h1>
        <p className="admin-muted">For UCFCA officers managing members and attendance.</p>
        {reason === 'idle' && (
          <p className="admin-signed-out" role="status">
            You were signed out after 5 minutes of inactivity. Sign in again to continue.
          </p>
        )}
        <label>
          Email address
          <input name="email" type="email" autoComplete="email" required />
        </label>
        <label>
          Password
          <input name="password" type="password" autoComplete="current-password" required />
        </label>
        <button className="button" type="submit" disabled={status === 'signing-in'}>
          {status === 'signing-in' ? 'Signing in…' : 'Sign in'}
        </button>
        <div aria-live="polite">
          {status === 'error' && <p className="form-status error">{error}</p>}
        </div>
      </form>
    </div>
  )
}
