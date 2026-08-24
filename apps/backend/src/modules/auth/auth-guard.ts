/**
 * Medusa Backend Authorization & Resource Ownership Assertion Utilities
 */
import { sanitizeRedirectPath } from '@ecom/types';

export interface OwnershipValidationResult {
  allowed: boolean;
  statusCode: 200 | 401 | 403;
  error?: 'UNAUTHORIZED' | 'FORBIDDEN';
  message?: string;
}

export class BackendAuthGuard {
  /**
   * Asserts whether a requesting customer identity matches the owner of a commerce resource (orders, addresses, returns).
   *
   * Rules:
   * 1. If session customer ID is missing/empty -> 401 UNAUTHORIZED
   * 2. If session customer ID does not match resource owner ID -> 403 FORBIDDEN
   * 3. If matching -> 200 OK
   */
  static validateResourceOwnership(
    sessionCustomerId: string | null | undefined,
    resourceCustomerId: string | null | undefined
  ): OwnershipValidationResult {
    if (!sessionCustomerId || typeof sessionCustomerId !== 'string' || sessionCustomerId.trim() === '') {
      return {
        allowed: false,
        statusCode: 401,
        error: 'UNAUTHORIZED',
        message: 'Authentication required. No active customer session found.',
      };
    }

    if (!resourceCustomerId || typeof resourceCustomerId !== 'string' || resourceCustomerId.trim() === '') {
      return {
        allowed: false,
        statusCode: 403,
        error: 'FORBIDDEN',
        message: 'Resource owner could not be determined.',
      };
    }

    if (sessionCustomerId.trim() !== resourceCustomerId.trim()) {
      return {
        allowed: false,
        statusCode: 403,
        error: 'FORBIDDEN',
        message: 'Access denied: Customer does not own this resource.',
      };
    }

    return {
      allowed: true,
      statusCode: 200,
    };
  }

  /**
   * Sanitizes redirect destinations to prevent open redirect vulnerabilities.
   */
  static sanitizeRedirect(url: string | null | undefined, fallback: string = '/account'): string {
    return sanitizeRedirectPath(url, fallback);
  }
}

export default BackendAuthGuard;
