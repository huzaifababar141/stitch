import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Create a Supabase client with the Auth context of the logged in user.
export const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
)
