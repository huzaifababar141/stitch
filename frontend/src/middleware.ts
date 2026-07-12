import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('refreshToken');
  const path = request.nextUrl.pathname;

  const isPublic = ['/login', '/register', '/verify-otp'].some((route) => path.startsWith(route));

  if (!isPublic && !token && !path.startsWith('/track')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (token) {
    if (path === '/login' || path === '/register') {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
