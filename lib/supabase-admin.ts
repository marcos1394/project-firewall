import { createClient } from '@supabase/supabase-js'

// Nota: Usamos la SERVICE_ROLE_KEY, no la Anon Key.
// Esto permite saltarse las reglas RLS (Row Level Security)
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)