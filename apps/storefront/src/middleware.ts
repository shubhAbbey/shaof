import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { sanitizeRedirectPath, PROTECTED_ROUTE_PREFIXES, AUTH_ENTRY_ROUTE_PREFIXES } from '@ecom/types';

const SESSION_COOKIE_NAME = 'ecom_session_token';
const ADMIN_COOKIE_NAME = 'ecom_admin_sess';
const MERCHANT_COOKIE_NAME = 'ecom_merchant_sess';

const BACKEND_INTERNAL_URL = process.env.MEDUSA_BACKEND_URL || 'http://127.0.0.1:9000';

/**
 * Checks if the request pathname matches any of the given route prefixes.
 */
function matchesRoutePrefixes(pathname: string, prefixes: readonly string[]): boolean {
  return prefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

/**
 * Helper to fetch with a strict timeout to prevent slow middleware processing.
 */
async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs = 2000): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    return res;
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  // 0. CORS handling for /api routes
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

  // ==========================================
  // 1. SUPER ADMIN BOUNDARY PROTECTION (/admin/*)
  // ==========================================
  if (pathname.startsWith('/admin')) {
    const isAdminLogin = pathname === '/admin/login';
    const isAdminAuthApi = pathname.startsWith('/admin/auth');
    const adminCookie = req.cookies.get(ADMIN_COOKIE_NAME)?.value;

    // Public admin auth API endpoints (login, MFA verification) must pass through to backend rewrite
    if (isAdminAuthApi) {
      return NextResponse.next();
    }

    if (isAdminLogin) {
      // If admin already has an active, MFA-verified session, redirect to admin console
      if (adminCookie) {
        try {
          const verifyRes = await fetchWithTimeout(`${BACKEND_INTERNAL_URL}/admin/auth/session`, {
            headers: {
              Cookie: `${ADMIN_COOKIE_NAME}=${adminCookie}`,
              Authorization: `Bearer ${adminCookie}`,
            },
            cache: 'no-store',
          });
          if (verifyRes.ok) {
            const data = await verifyRes.json();
            if (data.authenticated && data.session?.isMfaVerified && data.session?.role === 'super_admin') {
              const rawRedirect = req.nextUrl.searchParams.get('redirect') || '/admin/merchants';
              const target = rawRedirect.startsWith('/admin') && rawRedirect !== '/admin/login' ? rawRedirect : '/admin/merchants';
              return NextResponse.redirect(new URL(target, req.url), { status: 307 });
            }
          }
        } catch {
          // Fall through to render login
        }
      }
      return NextResponse.next();
    }

    // Protected Admin Routes (/admin/merchants, /admin/products, /admin/moderation, etc.)
    const fullTarget = `${pathname}${search}`;
    const loginRedirectUrl = new URL('/admin/login', req.url);
    loginRedirectUrl.searchParams.set('redirect', fullTarget);

    if (!adminCookie || adminCookie.trim().length === 0) {
      // Immediate server-side redirect before any HTML/RSC payload is generated
      return NextResponse.redirect(loginRedirectUrl, { status: 307 });
    }

    // Verify session authenticity, MFA completion, and role with Medusa backend
    try {
      const verifyRes = await fetchWithTimeout(`${BACKEND_INTERNAL_URL}/admin/auth/session`, {
        headers: {
          Cookie: `${ADMIN_COOKIE_NAME}=${adminCookie}`,
          Authorization: `Bearer ${adminCookie}`,
        },
        cache: 'no-store',
      });

      if (!verifyRes.ok) {
        const redirectRes = NextResponse.redirect(loginRedirectUrl, { status: 307 });
        redirectRes.cookies.delete(ADMIN_COOKIE_NAME);
        return redirectRes;
      }

      const data = await verifyRes.json();
      if (
        !data.authenticated ||
        !data.session?.isMfaVerified ||
        data.session?.role !== 'super_admin' ||
        data.session?.authBoundary !== 'admin'
      ) {
        return NextResponse.redirect(loginRedirectUrl, { status: 307 });
      }

      // Valid MFA-completed Super Admin session
      return NextResponse.next();
    } catch {
      // Fail closed on backend connection error
      return NextResponse.redirect(loginRedirectUrl, { status: 307 });
    }
  }

  // ==========================================
  // 2. MERCHANT BOUNDARY PROTECTION (/merchant/*)
  // ==========================================
  if (pathname.startsWith('/merchant')) {
    const isMerchantLogin = pathname === '/merchant/login';
    const isMerchantOnboarding = pathname === '/merchant/onboarding';
    const isMerchantAuthApi = pathname.startsWith('/merchant/auth');
    const merchantCookie = req.cookies.get(MERCHANT_COOKIE_NAME)?.value;

    // Public merchant routes: login, onboarding, and auth endpoints
    if (isMerchantOnboarding || isMerchantAuthApi) {
      return NextResponse.next();
    }

    if (isMerchantLogin) {
      // If merchant already has an active session, redirect to merchant products
      if (merchantCookie) {
        try {
          const verifyRes = await fetchWithTimeout(`${BACKEND_INTERNAL_URL}/merchant/auth/session`, {
            headers: {
              Cookie: `${MERCHANT_COOKIE_NAME}=${merchantCookie}`,
              Authorization: `Bearer ${merchantCookie}`,
            },
            cache: 'no-store',
          });
          if (verifyRes.ok) {
            const data = await verifyRes.json();
            if (data.authenticated && data.session?.authBoundary === 'merchant' && data.session?.membershipStatus === 'active') {
              const rawRedirect = req.nextUrl.searchParams.get('redirect') || '/merchant/products';
              const target = rawRedirect.startsWith('/merchant') && rawRedirect !== '/merchant/login' ? rawRedirect : '/merchant/products';
              return NextResponse.redirect(new URL(target, req.url), { status: 307 });
            }
          }
        } catch {
          // Fall through to render login
        }
      }
      return NextResponse.next();
    }

    // Protected Merchant Routes (/merchant/products, /merchant/team, etc.)
    const fullTarget = `${pathname}${search}`;
    const loginRedirectUrl = new URL('/merchant/login', req.url);
    loginRedirectUrl.searchParams.set('redirect', fullTarget);

    if (!merchantCookie || merchantCookie.trim().length === 0) {
      // Immediate server-side redirect before any HTML/RSC payload is generated
      return NextResponse.redirect(loginRedirectUrl, { status: 307 });
    }

    // Verify session authenticity, tenant isolation, and status with Medusa backend
    try {
      const verifyRes = await fetchWithTimeout(`${BACKEND_INTERNAL_URL}/merchant/auth/session`, {
        headers: {
          Cookie: `${MERCHANT_COOKIE_NAME}=${merchantCookie}`,
          Authorization: `Bearer ${merchantCookie}`,
        },
        cache: 'no-store',
      });

      if (!verifyRes.ok) {
        const redirectRes = NextResponse.redirect(loginRedirectUrl, { status: 307 });
        redirectRes.cookies.delete(MERCHANT_COOKIE_NAME);
        return redirectRes;
      }

      const data = await verifyRes.json();
      if (
        !data.authenticated ||
        data.session?.authBoundary !== 'merchant' ||
        data.session?.membershipStatus !== 'active'
      ) {
        return NextResponse.redirect(loginRedirectUrl, { status: 307 });
      }

      // Check merchant status: suspended merchants cannot access operational pages
      if (data.session?.merchantStatus === 'suspended') {
        const suspendedRedirect = new URL('/merchant/login', req.url);
        suspendedRedirect.searchParams.set('status', 'suspended');
        return NextResponse.redirect(suspendedRedirect, { status: 307 });
      }

      // Team management route check (/merchant/team requires owner or admin role)
      if (pathname.startsWith('/merchant/team')) {
        const role = data.session?.role;
        const permissions = data.session?.permissions || [];
        if (role !== 'owner' && role !== 'admin' && !permissions.includes('team:manage')) {
          const forbiddenRedirect = new URL('/merchant/products', req.url);
          forbiddenRedirect.searchParams.set('error', 'forbidden');
          return NextResponse.redirect(forbiddenRedirect, { status: 307 });
        }
      }

      // Valid active merchant session
      return NextResponse.next();
    } catch {
      // Fail closed on backend connection error
      return NextResponse.redirect(loginRedirectUrl, { status: 307 });
    }
  }

  // ==========================================
  // 3. CUSTOMER BOUNDARY PROTECTION (/account, /wishlist, /checkout)
  // ==========================================
  const customerSessionCookie = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  const hasCustomerSessionCookie = Boolean(customerSessionCookie && customerSessionCookie.trim().length > 0);

  if (matchesRoutePrefixes(pathname, PROTECTED_ROUTE_PREFIXES)) {
    if (!hasCustomerSessionCookie) {
      const fullTarget = `${pathname}${search}`;
      const safeTarget = sanitizeRedirectPath(fullTarget, '/account');
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('redirect', safeTarget);
      return NextResponse.redirect(loginUrl, { status: 307 });
    }
    return NextResponse.next();
  }

  if (matchesRoutePrefixes(pathname, AUTH_ENTRY_ROUTE_PREFIXES)) {
    if (hasCustomerSessionCookie) {
      const rawRedirect = req.nextUrl.searchParams.get('redirect');
      let targetPath = sanitizeRedirectPath(rawRedirect, '/account');

      if (matchesRoutePrefixes(targetPath, AUTH_ENTRY_ROUTE_PREFIXES)) {
        targetPath = '/account';
      }

      const destinationUrl = new URL(targetPath, req.url);
      return NextResponse.redirect(destinationUrl, { status: 307 });
    }
    return NextResponse.next();
  }

  // 4. Public catalog, search, cart, and CMS routes
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
