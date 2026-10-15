// Shared state for the officer area's inactivity sign-out.

export const IDLE_LIMIT_MS = 5 * 60 * 1000
export const WARNING_MS = 60 * 1000

const LAST_ACTIVITY_KEY = 'ucfca-admin-last-activity'
const PAUSED_UNTIL_KEY = 'ucfca-admin-idle-paused-until'
const REASON_KEY = 'ucfca-admin-signout-reason'

// Last activity is kept in localStorage so every open admin tab shares it.
export function readLastActivity() {
  try {
    return Number(localStorage.getItem(LAST_ACTIVITY_KEY)) || 0
  } catch {
    return 0
  }
}

export function writeLastActivity(time = Date.now()) {
  try {
    localStorage.setItem(LAST_ACTIVITY_KEY, String(time))
  } catch {
    // Storage blocked: each tab then only tracks its own activity.
  }
}

// Screens that must stay up untouched (the QR check-in display) pause the timer.
// The pausing tab also publishes a short-lived marker so other admin tabs hold off too.
let pauses = 0
export function pauseIdleSignOut() {
  pauses++
  idlePaused() // publish the marker straight away, not on the next tick
  writeLastActivity()
  return () => {
    pauses--
    writeLastActivity()
  }
}

export function idlePaused() {
  if (pauses > 0) {
    try {
      localStorage.setItem(PAUSED_UNTIL_KEY, String(Date.now() + 5000))
    } catch {
      // This tab still pauses itself.
    }
    return true
  }
  try {
    return Number(localStorage.getItem(PAUSED_UNTIL_KEY)) > Date.now()
  } catch {
    return false
  }
}

// Tells the login page why the officer was signed out.
export function setSignOutReason(reason) {
  try {
    sessionStorage.setItem(REASON_KEY, reason)
  } catch {
    // Only affects the message shown.
  }
}

export function takeSignOutReason() {
  try {
    const reason = sessionStorage.getItem(REASON_KEY)
    sessionStorage.removeItem(REASON_KEY)
    return reason
  } catch {
    return null
  }
}
