import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const url = request.nextUrl.pathname;

  // Specific route classification
  const isAdminLogin = url === '/admin/login';
  const isAdminRoute = url.startsWith('/admin') && !isAdminLogin;
  const isCustomerAuthRoute =
    url.startsWith('/login') || url.startsWith('/register');
  const isApiRoute = url.startsWith('/api/');
  const isPublicRoute =
    url === '/' ||
    url.startsWith('/api/webhooks') ||
    url.startsWith('/api/auth') ||
    url.startsWith('/api/health') ||
    url.startsWith('/track') ||
    isAdminLogin;

  const isProtectedRoute = !isPublicRoute && !isCustomerAuthRoute;

  // 1. Unauthenticated users handling
  if (!user) {
    if (isAdminRoute) {
      return NextResponse.redirect(
        new URL(`/admin/login?redirect=${encodeURIComponent(url)}`, request.url)
      );
    }
    // Only redirect page/document navigations to /login, never API routes
    if (isProtectedRoute && !isApiRoute) {
      return NextResponse.redirect(
        new URL(`/login?redirect=${encodeURIComponent(url)}`, request.url)
      );
    }
  }

  // 2. Authenticated users handling
  if (user) {
    // Routing role comes from server-only app_metadata (authoritative source).
    // The real authorization gate is requireRole() on each /api/admin/* call and
    // the admin layout's DB check; this only drives redirects.
    const role = (user.app_metadata?.role as string) || 'customer';
    const isAdmin = role === 'admin' || role === 'super_admin';

    // If logged-in admin tries to open admin login or customer login, send them to admin dashboard
    if ((isAdminLogin || isCustomerAuthRoute) && isAdmin) {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }

    // If logged-in customer tries to open customer login/register, send them to customer dashboard
    if (isCustomerAuthRoute && !isAdmin) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // If logged-in user tries to access admin routes without admin permissions
    if (isAdminRoute && !isAdmin) {
      return NextResponse.redirect(
        new URL('/admin/login?error=forbidden', request.url)
      );
    }

    // Tailor routes
    if (url.startsWith('/tailor') && role !== 'tailor' && !isAdmin) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // QC routes
    if (url.startsWith('/qc') && role !== 'qc_inspector' && !isAdmin) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // Delivery routes
    if (url.startsWith('/delivery') && role !== 'delivery_agent' && !isAdmin) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return supabaseResponse;
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
};
