import { useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'
import QRCode from 'qrcode'
import { supabase } from '../lib/supabase'
import { formatTime } from '../lib/time'

// Full-screen rotating QR code for members to scan. Keeps the screen awake while open.
export default function CheckinScreen({ meeting, checkedIn, expected, onClose }) {
  const [code, setCode] = useState(null) // { state, code, seconds_left, opens_at }
  const [secondsLeft, setSecondsLeft] = useState(0)
  const [qr, setQr] = useState('')
  const [error, setError] = useState('')
  const fetchedAt = useRef(0)

  useEffect(() => {
    let active = true
    let timer
    async function refresh() {
      const { data, error } = await supabase.rpc('officer_meeting_code', {
        p_meeting_id: meeting.id,
      })
      if (!active) return
      if (error) setError(error.message)
      else {
        setError('')
        setCode(data)
        fetchedAt.current = Date.now()
        setSecondsLeft(data.seconds_left ?? 0)
      }
      // Fetch again just after the code rotates, and at least every 10 seconds.
      const wait = data?.state === 'open' ? Math.min(data.seconds_left, 10) * 1000 + 300 : 10000
      timer = setTimeout(refresh, wait)
    }
    refresh()
    return () => {
      active = false
      clearTimeout(timer)
    }
  }, [meeting.id])

  // Smooth per-second countdown between fetches.
  useEffect(() => {
    const tick = setInterval(() => {
      if (code?.state !== 'open') return
      const elapsed = Math.floor((Date.now() - fetchedAt.current) / 1000)
      setSecondsLeft(Math.max(0, code.seconds_left - elapsed))
    }, 250)
    return () => clearInterval(tick)
  }, [code])

  useEffect(() => {
    if (code?.state !== 'open') return
    const url = `${window.location.origin}/checkin?m=${meeting.id}&c=${code.code}`
    QRCode.toDataURL(url, { width: 640, margin: 1, errorCorrectionLevel: 'M' }).then(setQr)
  }, [code, meeting.id])

  // Keep a tablet or laptop from dimming during check-in.
  useEffect(() => {
    let lock
    navigator.wakeLock
      ?.request('screen')
      .then((l) => (lock = l))
      .catch(() => {})
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => {
      lock?.release().catch(() => {})
      window.removeEventListener('keydown', onKey)
    }
  }, [onClose])

  return (
    <div className="checkin-screen" role="dialog" aria-modal="true" aria-label="Check-in code">
      <button className="checkin-close" onClick={onClose}>
        <X aria-hidden="true" />
        <span className="sr-only">Close check-in screen</span>
      </button>
      <p className="checkin-eyebrow">UCFCA · {meeting.title}</p>
      {code?.state === 'open' ? (
        <>
          <h1>Scan to check in</h1>
          <div className="checkin-qr">{qr && <img src={qr} alt="Check-in QR code" />}</div>
          <div className="checkin-timer" aria-hidden="true">
            <span style={{ width: `${(secondsLeft / 30) * 100}%` }} />
          </div>
          <p className="checkin-note">
            Point your phone camera at the code. It changes every 30 seconds.
          </p>
        </>
      ) : code?.state === 'not-open' ? (
        <h1>Check-in opens at {formatTime(code.opens_at)}</h1>
      ) : code?.state === 'closed' ? (
        <h1>Check-in has closed</h1>
      ) : (
        <h1>{error ? 'Can’t load the code' : 'Loading…'}</h1>
      )}
      {error && <p className="checkin-note">{error}</p>}
      <p className="checkin-count">
        <strong>{checkedIn}</strong> of {expected} checked in
      </p>
    </div>
  )
}
