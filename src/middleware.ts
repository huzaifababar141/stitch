import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const url = request.nextUrl.pathname
  const isAuthRoute = url.startsWith('/login') || url.startsWith('/register')
  const isPublicRoute = url === '/' || url.startsWith('/api/webhooks') || url.startsWith('/track')
  const isProtectedRoute = !isPublicRoute && !isAuthRoute

  // 1. Unauthenticated users trying to access protected routes
  if (!user && isProtectedRoute) {
    return NextResponse.redirect(new URL(`/login?redirect=${encodeURIComponent(url)}`, request.url))
  }

  // 2. Authenticated users shouldn't access login/register
  if (user && isAuthRoute) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // 3. Role-based route protection
  if (user && isProtectedRoute) {
    const role = user.user_metadata?.role || 'customer'
    
    // Admin routes
    if (url.startsWith('/admin') && role !== 'super_admin' && role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    
    // Tailor routes
    if (url.startsWith('/tailor') && role !== 'tailor' && role !== 'super_admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    
    // QC routes
    if (url.startsWith('/qc') && role !== 'qc_inspector' && role !== 'super_admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    
    // Delivery routes
    if (url.startsWith('/delivery') && role !== 'delivery_agent' && role !== 'super_admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
