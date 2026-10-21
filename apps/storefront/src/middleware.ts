import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { sanitizeRedirectPath, PROTECTED_ROUTE_PREFIXES, AUTH_ENTRY_ROUTE_PREFIXES } from '@ecom/types';

const SESSION_COOKIE_NAME = 'ecom_session_token';

/**
 * Checks if the request pathname matches any of the given route prefixes.
 */
function matchesRoutePrefixes(pathname: string, prefixes: readonly string[]): boolean {
  return prefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  // 0. CORS handling for /api routes (allows Swagger UI on port 9000 to interact with Storefront BFF)
  if (pathname.startsWith('/api')) {
    const origin = req.headers.get('origin') || '';
    const isAllowedOrigin =
      origin.startsWith('http://localhost:') ||
      origin.startsWith('http://127.0.0.1:') ||
      origin === '';

    if (req.method === 'OPTIONS') {
      const response = new NextResponse(null, { status: 204 });
      if (origin && isAllowedOrigin) {
        response.headers.set('Access-Control-Allow-Origin', origin);
        response.headers.set('Access-Control-Allow-Credentials', 'true');
        response.headers.set('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
        response.headers.set(
          'Access-Control-Allow-Headers',
          'Content-Type, Authorization, Accept, X-Requested-With, X-CSRF-Token, x-s2s-auth-token'
        );
        response.headers.set('Access-Control-Max-Age', '86400');
      }
      return response;
    }

    const res = NextResponse.next();
    if (origin && isAllowedOrigin) {
      res.headers.set('Access-Control-Allow-Origin', origin);
      res.headers.set('Access-Control-Allow-Credentials', 'true');
      res.headers.set('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
      res.headers.set(
        'Access-Control-Allow-Headers',
        'Content-Type, Authorization, Accept, X-Requested-With, X-CSRF-Token, x-s2s-auth-token'
      );
    }
    return res;
  }

  const sessionCookie = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  const hasSessionCookie = Boolean(sessionCookie && sessionCookie.trim().length > 0);

  // 1. Check Protected Routes (/account, /wishlist, /checkout)
  if (matchesRoutePrefixes(pathname, PROTECTED_ROUTE_PREFIXES)) {
    if (!hasSessionCookie) {
      const fullTarget = `${pathname}${search}`;
      const safeTarget = sanitizeRedirectPath(fullTarget, '/account');
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('redirect', safeTarget);
      return NextResponse.redirect(loginUrl, { status: 307 });
    }
    // Session cookie exists -> proceed to Next.js server runtime for backend validation
    return NextResponse.next();
  }

  // 2. Check Auth-Entry Routes (/login, /register)
  if (matchesRoutePrefixes(pathname, AUTH_ENTRY_ROUTE_PREFIXES)) {
    if (hasSessionCookie) {
      const rawRedirect = req.nextUrl.searchParams.get('redirect');
      let targetPath = sanitizeRedirectPath(rawRedirect, '/account');

      // Prevent redirect loop if redirect points back to /login or /register
      if (matchesRoutePrefixes(targetPath, AUTH_ENTRY_ROUTE_PREFIXES)) {
        targetPath = '/account';
      }

      const destinationUrl = new URL(targetPath, req.url);
      return NextResponse.redirect(destinationUrl, { status: 307 });
    }
    return NextResponse.next();
  }

  // 3. Allow all public routes (catalog, PDP, PLP, search, cart, CMS pages)
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for static files:
     * - /_next/static (static files)
     * - /_next/image (image optimization files)
     * - /favicon.ico (favicon file)
     * - Static asset extensions (.svg, .png, .jpg, .jpeg, .gif, .webp, .ico)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
