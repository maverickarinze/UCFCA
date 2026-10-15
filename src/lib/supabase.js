import { createClient } from '@supabase/supabase-js'

// Public by design: the publishable key only grants what the database's
// row-level security policies allow (see supabase/migrations).
const SUPABASE_URL = 'https://wjegoolpinuupgjeexzs.supabase.co'
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_2IsTWQBuj7ixv6rkkeojeg_UBFunvjj'

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY)
