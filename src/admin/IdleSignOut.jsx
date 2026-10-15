import { useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'
import {
  IDLE_LIMIT_MS,
  WARNING_MS,
  idlePaused,
  readLastActivity,
  setSignOutReason,
  writeLastActivity,
} from './idle'

const ACTIVITY_EVENTS = ['pointerdown', 'pointermove', 'keydown', 'wheel', 'scroll', 'touchstart']

// Signs the officer out after 5 minutes without activity, with a 1-minute warning.
// Uses timestamps rather than a single timer, so a laptop that slept still signs out on waking.
export default function IdleSignOut() {
  const [secondsLeft, setSecondsLeft] = useState(null)
  const lastWrite = useRef(0)

  useEffect(() => {
    writeLastActivity()
    const onActivity = () => {
      // Write at most every few seconds; mouse movement fires constantly.
      if (Date.now() - lastWrite.current < 3000) return
      lastWrite.current = Date.now()
      writeLastActivity()
    }
    for (const e of ACTIVITY_EVENTS) window.addEventListener(e, onActivity, { passive: true })

    const tick = setInterval(() => {
      if (idlePaused()) {
        writeLastActivity()
        setSecondsLeft(null)
        return
      }
      const idle = Date.now() - readLastActivity()
      if (idle >= IDLE_LIMIT_MS) {
        clearInterval(tick)
        setSignOutReason('idle')
        supabase.auth.signOut()
      } else if (idle >= IDLE_LIMIT_MS - WARNING_MS) {
        setSecondsLeft(Math.ceil((IDLE_LIMIT_MS - idle) / 1000))
      } else {
        setSecondsLeft(null)
      }
    }, 1000)

    return () => {
      clearInterval(tick)
      for (const e of ACTIVITY_EVENTS) window.removeEventListener(e, onActivity)
    }
  }, [])

  if (secondsLeft === null) return null
  const minutes = Math.floor(secondsLeft / 60)
  const seconds = String(secondsLeft % 60).padStart(2, '0')
  return (
    <div
      className="admin-idle"
      role="alertdialog"
      aria-labelledby="idle-title"
      aria-describedby="idle-text"
    >
      <p id="idle-title">
        <strong>Still there?</strong>
      </p>
      <p id="idle-text">
        For security, you’ll be signed out in {minutes}:{seconds} because of inactivity.
      </p>
      <button
        className="button"
        autoFocus
        onClick={() => {
          lastWrite.current = Date.now()
          writeLastActivity()
          setSecondsLeft(null)
        }}
      >
        Stay signed in
      </button>
    </div>
  )
}
