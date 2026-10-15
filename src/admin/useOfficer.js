import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

// Who is signed in, and whether they are a UCFCA officer.
// status: loading | signed-out | not-officer | ready
export default function useOfficer() {
  const [state, setState] = useState({ status: 'loading' })

  useEffect(() => {
    let active = true
    async function load(session) {
      if (!session) {
        if (active) setState({ status: 'signed-out' })
        return
      }
      const { data } = await supabase
        .from('officers')
        .select('full_name, role')
        .eq('user_id', session.user.id)
        .maybeSingle()
      if (!active) return
      setState(
        data ? { status: 'ready', session, officer: data } : { status: 'not-officer', session },
      )
    }
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      // Defer: Supabase calls made inside this callback can deadlock the client.
      setTimeout(() => load(session), 0)
    })
    return () => {
      active = false
      listener.subscription.unsubscribe()
    }
  }, [])

  return state
}
