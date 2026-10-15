import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from './config'

// Calls a database function anonymously. Member pages use this instead of the
// full Supabase client to keep what members' phones download small.
export async function rpc(fn, args) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${fn}`, {
    method: 'POST',
    headers: { apikey: SUPABASE_PUBLISHABLE_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify(args),
  })
  if (!res.ok) throw new Error(`Request failed (${res.status})`)
  return res.json()
}
