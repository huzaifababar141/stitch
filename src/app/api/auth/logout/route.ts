import { NextRequest } from 'next/server'
import { apiSuccess } from '@/lib/utils/response'
import { handleApiError } from '@/lib/utils/errors'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // Clear Supabase session cookie
    await supabase.auth.signOut()

    return apiSuccess(null, 200, { message: 'Logged out successfully' })
  } catch (error) {
    return handleApiError(error)
  }
}
