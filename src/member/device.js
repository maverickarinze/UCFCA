// The remembered-phone token from setup or sign-in. Storage can be unavailable
// (private browsing); then the member simply signs in each time.
const KEY = 'ucfca-member-device'

export function getDeviceToken() {
  try {
    return localStorage.getItem(KEY)
  } catch {
    return null
  }
}

export function setDeviceToken(token) {
  try {
    localStorage.setItem(KEY, token)
  } catch {
    // Not persisted; the member will be asked to sign in next time.
  }
}

export function clearDeviceToken() {
  try {
    localStorage.removeItem(KEY)
  } catch {
    // Nothing to clear.
  }
}
