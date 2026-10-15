import { useCallback, useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { CircleAlert, CircleCheck, Clock } from 'lucide-react'
import { rpc } from '../lib/rpc'
import { formatTime } from '../lib/time'
import { clearDeviceToken, getDeviceToken } from './device'
import SignInForm from './SignInForm'

const ERRORS = {
  code_expired: ['That code has changed', 'Scan the code on the screen again.'],
  not_open: ['Check-in isn’t open yet', null],
  closed: ['Check-in has closed', 'Check-in for this meeting is over. Speak to the Secretary.'],
  no_meeting: ['Meeting not found', 'Scan the code on the screen again.'],
}

// /checkin?m=<meeting>&c=<code>  Where the QR code on screen leads.
export default function CheckIn() {
  const [params] = useSearchParams()
  const meeting = params.get('m')
  const code = params.get('c')
  const [result, setResult] = useState(null)
  const [needsSignIn, setNeedsSignIn] = useState(() => !getDeviceToken())
  const [justSignedIn, setJustSignedIn] = useState(false)

  const checkIn = useCallback(async () => {
    try {
      const r = await rpc('member_check_in', {
        p_device_token: getDeviceToken(),
        p_meeting_id: meeting,
        p_code: code,
      })
      if (r.error === 'signed_out') {
        clearDeviceToken()
        setNeedsSignIn(true)
      } else setResult(r)
    } catch {
      setResult({ ok: false, error: 'network' })
    }
  }, [meeting, code])

  useEffect(() => {
    // Runs the check-in once the phone is known; state updates once the request resolves.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!needsSignIn) checkIn()
  }, [needsSignIn, checkIn])

  if (needsSignIn)
    return (
      <SignInForm
        intro="Sign in once on this phone to check in. After that, scanning is all you need."
        onSignedIn={() => {
          setJustSignedIn(true)
          setNeedsSignIn(false)
        }}
      />
    )

  if (!result) return <h1 className="member-loading">Checking you in…</h1>

  if (result.ok)
    return (
      <div
        className={
          'member-card member-result ' + (result.status === 'late' ? 'is-late' : 'is-success')
        }
      >
        {result.status === 'late' ? (
          <Clock aria-hidden="true" />
        ) : (
          <CircleCheck aria-hidden="true" />
        )}
        <h1>{result.already ? 'Already checked in' : `You’re checked in, ${result.first_name}`}</h1>
        <p className="member-big">{result.meeting_title}</p>
        <p>
          {result.status === 'late' ? 'Late' : result.status === 'excused' ? 'Excused' : 'On time'}
          {result.checked_in_at && ` · ${formatTime(result.checked_in_at)}`}
        </p>
        <Link className="text-link" to="/me">
          View my attendance
        </Link>
      </div>
    )

  const [title, body] =
    result.error === 'network'
      ? ['No connection', 'Couldn’t reach the server. Check your data connection and scan again.']
      : (ERRORS[result.error] ?? ['Something went wrong', 'Scan the code on the screen again.'])
  return (
    <div className="member-card member-result is-error">
      <CircleAlert aria-hidden="true" />
      <h1>{title}</h1>
      <p>
        {result.error === 'not_open'
          ? `Check-in opens at ${formatTime(result.opens_at)}.`
          : result.error === 'code_expired' && justSignedIn
            ? 'You’re signed in now. The code changed while you did, so scan it once more.'
            : body}
      </p>
    </div>
  )
}
