import { NextRequest, NextResponse } from 'next/server';
import { SessionService, SESSION_COOKIE_NAME } from './session-service';
import { sanitizeRedirectPath, type CustomerSession } from '@ecom/types';

export interface RequireAuthSuccess {
  authorized: true;
  customer: CustomerSession;
  token: string;
}

export interface RequireAuthFailure {
  authorized: false;
  response: NextResponse;
}

export type RequireAuthResult = RequireAuthSuccess | RequireAuthFailure;

/**
 * Extract session token from cookie or Authorization header
 */
export function extractSessionToken(req: NextRequest): string | null {
  const tokenFromCookie = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (tokenFromCookie && tokenFromCookie.startsWith('sess_')) {
    return tokenFromCookie;
  }
  const authHeader = req.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const headerToken = authHeader.substring(7).trim();
    if (headerToken.startsWith('sess_')) {
      return headerToken;
    }
  }
  return null;
}

/**
 * Get authenticated customer session if valid, otherwise null
 */
export async function getAuthenticatedCustomer(
  req: NextRequest
): Promise<{ customer: CustomerSession | null; token: string | null }> {
  const token = extractSessionToken(req);
  if (!token) {
    return { customer: null, token: null };
  }

  const customer = await SessionService.getSession(token);
  if (!customer) {
    return { customer: null, token: null };
  }

  return { customer, token };
}

/**
 * Server-side BFF API route guard: Enforces active session validation.
 * Returns 401 Unauthorized if missing, expired, or invalid.
 */
export async function requireAuth(req: NextRequest): Promise<RequireAuthResult> {
  const { customer, token } = await getAuthenticatedCustomer(req);

  if (!customer || !token) {
    return {
      authorized: false,
      response: NextResponse.json(
        {
          success: false,
          error: 'UNAUTHORIZED',
          message: 'Authentication required. Please sign in to continue.',
        },
        { status: 401 }
      ),
    };
  }

  return {
    authorized: true,
    customer,
    token,
  };
}

/**
 * Validates whether the authenticated customer matches the resource's owner ID.
 */
export function assertCustomerOwnership(
  customer: CustomerSession,
  ownerCustomerId: string
): boolean {
  if (!customer || !customer.id || !ownerCustomerId) return false;
  return customer.id === ownerCustomerId;
}

/**
 * Server-side API guard that enforces both authentication AND customer ownership.
 * Returns:
 * - 401 UNAUTHORIZED if not authenticated
 * - 403 FORBIDDEN if authenticated but customer ID does not match ownerCustomerId
 */
export async function requireCustomerOwnership(
  req: NextRequest,
  ownerCustomerId: string
): Promise<RequireAuthResult> {
  const authResult = await requireAuth(req);
  if (!authResult.authorized) {
    return authResult;
  }

  const isOwner = assertCustomerOwnership(authResult.customer, ownerCustomerId);
  if (!isOwner) {
    return {
      authorized: false,
      response: NextResponse.json(
        {
          success: false,
          error: 'FORBIDDEN',
          message: 'Access denied: You do not have permission to access or modify this resource.',
        },
        { status: 403 }
      ),
    };
  }

  return authResult;
}

export { sanitizeRedirectPath };
