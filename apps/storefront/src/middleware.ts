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
     * Match all request paths except for:
     * - /api/* (API routes handle their own authorization)
     * - /_next/static (static files)
     * - /_next/image (image optimization files)
     * - /favicon.ico (favicon file)
     * - Static asset extensions (.svg, .png, .jpg, .jpeg, .gif, .webp, .ico)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
