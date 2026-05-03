import { createBrowserClient, SupabaseClient } from '@supabase/ssr'

// Dummy client for build-time to prevent prerender errors
const dummyClient = {
  from: () => ({
    select: () => ({ data: null, error: null }),
    insert: () => ({ data: null, error: null }),
    update: () => ({ data: null, error: null }),
    delete: () => ({ data: null, error: null }),
    eq: () => ({ data: null, error: null }),
    order: () => ({ data: null, error: null }),
    single: () => ({ data: null, error: null }),
  }),
  auth: {
    getUser: () => Promise.resolve({ data: { user: null }, error: null }),
    getSession: () => Promise.resolve({ data: { session: null }, error: null }),
  },
} as unknown as SupabaseClient

export function createClient(): SupabaseClient {
  // During build/prerender, return dummy client
  if (typeof window === 'undefined') {
    return dummyClient
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!url || !key) {
    throw new Error('@supabase/ssr: Your project\'s URL and API key are required to create a Supabase client!')
  }
  
  return createBrowserClient(url, key)
}
