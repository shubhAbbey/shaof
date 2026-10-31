import { MedusaRequest, MedusaResponse } from '@medusajs/framework/http';
import {
  AuthBoundary,
  AuthenticatedSessionDto,
  MarketplacePermission,
  MerchantRole,
} from '@ecom/types';
import { BackendMarketplaceGuard } from '../../modules/marketplace/ownership-guard';
import { MARKETPLACE_MODULE } from '../../modules/marketplace/index';
import { SuperAdminAuthEngine } from '../../modules/auth/super-admin-auth-engine';
import { MerchantAuthEngine } from '../../modules/auth/merchant-auth-engine';

export interface TenantAuthOptions {
  boundary: AuthBoundary;
  requiredPermission?: MarketplacePermission;
  requireMfa?: boolean;
  requireStepUp?: boolean;
  allowInactiveMerchant?: boolean;
}

export type TenantRouteHandler = (
  req: MedusaRequest & { tenantContext: AuthenticatedSessionDto },
  res: MedusaResponse
) => Promise<void>;

export function isTestMockAllowed(): boolean {
  if (process.env.NODE_ENV === 'test') return true;
  if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'development') return false;
  if (process.execArgv.some((a) => a.includes('--test'))) return true;
  if (process.argv.some((arg) => arg.includes('--test') || arg.endsWith('.test.js') || arg.endsWith('.test.ts'))) {
    return true;
  }
  return false;
}

/**
 * Resolves session token to an AuthenticatedSessionDto.
 * Supports:
 * 1. SuperAdminAuthEngine sessions (sess_admin_*)
 * 2. MerchantAuthEngine sessions (sess_merch_*)
 * 3. JSON test tokens (for unit/integration testing)
 * 4. Base64-encoded session tokens
 * 5. Structured test prefixes (admin_token_*, merchant_token_*, customer_token_*, sess_*)
 */
export async function resolveSessionFromToken(token: string | null): Promise<AuthenticatedSessionDto | null> {
  if (!token) return null;

  // 1. Live Super Admin Auth Engine sessions
  if (token.startsWith('sess_admin_')) {
    return await SuperAdminAuthEngine.resolveSession(token);
  }

  // 2. Live Merchant Auth Engine sessions
  if (token.startsWith('sess_merch_')) {
    return await MerchantAuthEngine.resolveSession(token);
  }

  // ONLY permit simulated / test token formats in automated test environment
  if (isTestMockAllowed()) {
    // 3. JSON string test tokens
    if (token.startsWith('{') && token.endsWith('}')) {
      try {
        return JSON.parse(token);
      } catch {
        return null;
      }
    }

    // 4. Base64 encoded JSON session tokens
    if (token.startsWith('ey') || token.startsWith('sess_b64_')) {
      try {
        const b64 = token.startsWith('sess_b64_') ? token.substring(9) : token;
        const json = Buffer.from(b64, 'base64').toString('utf-8');
        if (json.startsWith('{') && json.endsWith('}')) {
          return JSON.parse(json);
        }
      } catch {
        // Fall through to next parser
      }
    }

    // 5. Prefix-based simulated session tokens (strictly test runners only)
    if (token.startsWith('admin_token:') || token.startsWith('admin_token_')) {
      const id = token.startsWith('admin_token:') ? token.substring(12) : token.substring(12);
      return {
        userId: id.startsWith('usr_') ? id : 'usr_admin_' + id,
        actorType: 'super_admin',
        authBoundary: 'admin',
        role: 'super_admin',
        isMfaVerified: true,
      };
    }

    if (token.startsWith('merchant_token:') || token.startsWith('merchant_token_')) {
      const isColon = token.startsWith('merchant_token:');
      const delimiter = isColon ? ':' : token.includes(':') ? ':' : token.includes('#') ? '#' : '_';
      const rest = token.substring(15);
      if (!rest || rest.trim() === '') {
        return null;
      }
      const parts = rest.split(delimiter);
      if (parts.length < 2 || !parts[0] || !parts[1]) {
        return null;
      }
      const userId = parts[0];
      const merchantId = parts[1];
      const role = parts[2] ? (parts[2] as any) : undefined;
      const membershipStatus = (parts[3] as any) || 'active';
      const merchantStatus = (parts[4] as any) || 'active';
      return {
        userId,
        merchantId,
        actorType: 'merchant_user',
        authBoundary: 'merchant',
        membershipStatus,
        merchantStatus,
        role,
        permissions:
          role === 'owner'
            ? [
                'catalog:read',
                'catalog:write',
                'catalog:delete',
                'inventory:read',
                'inventory:adjust',
                'orders:read',
                'orders:fulfill',
                'returns:read',
                'returns:process',
                'financials:view',
                'financials:payout',
                'team:manage',
                'settings:manage',
              ]
            : role === 'admin'
            ? [
                'catalog:read',
                'catalog:write',
                'catalog:delete',
                'inventory:read',
                'inventory:adjust',
                'orders:read',
                'orders:fulfill',
                'returns:read',
                'returns:process',
                'team:manage',
              ]
            : role === 'manager'
            ? [
                'catalog:read',
                'catalog:write',
                'inventory:read',
                'inventory:adjust',
                'orders:read',
                'orders:fulfill',
                'returns:read',
              ]
            : ['catalog:read', 'orders:read', 'orders:fulfill'],
      };
    }

    if (token.startsWith('customer_token:') || token.startsWith('customer_token_') || token.startsWith('sess_')) {
      const isPrefix = token.startsWith('customer_token:') || token.startsWith('customer_token_');
      const id = isPrefix ? token.substring(15) : token.substring(token.indexOf('_') + 1);
      return {
        userId: id.startsWith('cus_') ? id : 'cus_' + id,
        actorType: 'customer',
        authBoundary: 'store',
      };
    }
  }

  // In development and production, fabricated test tokens are rejected
  return null;
}

/**
 * Higher-order route wrapper enforcing server-side tenant authentication and authorization.
 *
 * Rules:
 * 1. Missing or unresolvable session token -> 401 UNAUTHORIZED
 * 2. Mismatched security boundary (e.g. Customer accessing Merchant or Admin) -> 403 FORBIDDEN
 * 3. Merchant user without active membership or inactive merchant account -> 403 FORBIDDEN
 * 4. Client-supplied forged merchant_id differing from verified session -> 403 FORBIDDEN
 * 5. Missing required RBAC permission -> 403 FORBIDDEN
 * 6. Attaches verified tenantContext to req for safe downstream execution
 */
export function requireTenantAuth(options: TenantAuthOptions, handler: TenantRouteHandler) {
  return async (req: MedusaRequest, res: MedusaResponse): Promise<void> => {
    // 0. CORS preflight and headers for cross-origin browser requests
    const origin = (req.headers['origin'] as string) || '';
    if (origin) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
      res.setHeader(
        'Access-Control-Allow-Headers',
        'Content-Type, Authorization, Accept, X-Requested-With'
      );
    }

    if (req.method === 'OPTIONS') {
      res.status(204).end();
      return;
    }

    // 1. Extract token from Authorization header or Cookie (boundary-aware to prevent multi-cookie collisions)
    const authHeader =
      (req.headers['authorization'] as string) || (req.headers['Authorization'] as string);
    const cookieHeader = (req.headers['cookie'] as string) || (req.headers['Cookie'] as string);
    const extracted = BackendMarketplaceGuard.extractAuthToken(
      { authorization: authHeader },
      cookieHeader,
      options.boundary
    );

    if (!extracted.token) {
      res.status(401).json({
        success: false,
        error: 'UNAUTHORIZED',
        message: 'Authentication required. No active session token found.',
      });
      return;
    }

    // 2. Resolve session
    const session = await resolveSessionFromToken(extracted.token);
    if (!session || !session.userId) {
      res.status(401).json({
        success: false,
        error: 'UNAUTHORIZED',
        message: 'Invalid or expired session token.',
      });
      return;
    }

    // 3. Assert security boundary access (Customer vs Merchant vs Super Admin)
    const boundaryAssertion = BackendMarketplaceGuard.assertBoundaryAccess(
      session,
      options.boundary
    );
    if (!boundaryAssertion.allowed) {
      res.status(boundaryAssertion.statusCode).json({
        success: false,
        error: boundaryAssertion.error,
        message: boundaryAssertion.message,
      });
      return;
    }

    // 4. Assert merchant active membership and account status (for merchant boundary)
    if (session.actorType === 'merchant_user') {
      if (!session.merchantId || session.merchantId.trim() === '') {
        res.status(403).json({
          success: false,
          error: 'FORBIDDEN',
          message: 'Active merchant membership required. No merchant associated with session.',
        });
        return;
      }

      // Assert active membership and account status from session claims
      if (session.membershipStatus || session.merchantStatus) {
        if (!options.allowInactiveMerchant) {
          const statusCheck = BackendMarketplaceGuard.assertMerchantActiveMembership({
            membershipStatus: session.membershipStatus || 'active',
            merchantStatus: session.merchantStatus || 'active',
          });
          if (!statusCheck.allowed) {
            res.status(statusCheck.statusCode).json({
              success: false,
              error: statusCheck.error,
              message: statusCheck.message,
            });
            return;
          }
        } else {
          // Inactive merchant exception strictly applies ONLY to draft, pending_approval, and rejected onboarding
          // 1. Membership MUST be active (suspended member cannot access onboarding or application)
          if (session.membershipStatus && session.membershipStatus !== 'active') {
            res.status(403).json({
              success: false,
              error: 'FORBIDDEN',
              message: `Merchant membership is not active (current status: ${session.membershipStatus}). Access denied.`,
            });
            return;
          }
          // 2. Suspended merchant accounts are strictly blocked (never permit suspended store access)
          if (session.merchantStatus && session.merchantStatus === 'suspended') {
            res.status(403).json({
              success: false,
              error: 'FORBIDDEN',
              message: 'Merchant account is suspended. Access denied.',
            });
            return;
          }
        }
      }

      // Check anti-forgery: if client supplied merchant_id in query or body, it must match verified session
      const queryMerchantId = req.query?.merchant_id as string;
      const bodyMerchantId =
        (req.body as any)?.merchant_id || (req.body as any)?.merchantId;
      const clientSupplied = queryMerchantId || bodyMerchantId;

      if (clientSupplied) {
        const antiForgery = BackendMarketplaceGuard.validateClientMerchantId(
          session.merchantId,
          clientSupplied
        );
        if (!antiForgery.allowed) {
          res.status(antiForgery.statusCode).json({
            success: false,
            error: antiForgery.error,
            message: antiForgery.message,
          });
          return;
        }
      }

      // Verify active membership with MarketplaceModuleService if resolvable
      try {
        const marketplaceService: any = req.scope?.resolve(MARKETPLACE_MODULE);
        if (marketplaceService) {
          if (!options.allowInactiveMerchant) {
            // Commercial routes: server-side active membership verification is mandatory
            if (typeof marketplaceService.verifyActiveMembership !== 'function') {
              res.status(403).json({
                success: false,
                error: 'FORBIDDEN',
                message: 'Merchant membership verification is unavailable. Access denied.',
              });
              return;
            }

            const membershipCheck = await marketplaceService.verifyActiveMembership(
              session.userId,
              session.merchantId
            );

            if (!membershipCheck || !membershipCheck.valid) {
              res.status(membershipCheck?.statusCode || 403).json({
                success: false,
                error: membershipCheck?.error || 'FORBIDDEN',
                message:
                  membershipCheck?.message ||
                  'Merchant membership is not active or verified. Access denied.',
              });
              return;
            }
          } else {
            // Onboarding routes: verify merchant existence, eligible status, and member active status
            if (typeof marketplaceService.retrieveMerchant !== 'function') {
              res.status(403).json({
                success: false,
                error: 'FORBIDDEN',
                message: 'Merchant lookup is unavailable. Access denied.',
              });
              return;
            }

            let merchant: any;
            try {
              merchant = await marketplaceService.retrieveMerchant(session.merchantId);
            } catch (mErr: any) {
              res.status(403).json({
                success: false,
                error: 'FORBIDDEN',
                message: `Failed to retrieve merchant record: ${mErr.message || 'Lookup error'}. Access denied.`,
              });
              return;
            }

            if (!merchant || !merchant.id) {
              res.status(403).json({
                success: false,
                error: 'FORBIDDEN',
                message: `Merchant record '${session.merchantId}' does not exist. Access denied.`,
              });
              return;
            }

            if (merchant.status === 'suspended') {
              res.status(403).json({
                success: false,
                error: 'FORBIDDEN',
                message: 'Merchant account is suspended. Access denied.',
              });
              return;
            }

            const PERMITTED_ONBOARDING_STATUSES = ['draft', 'pending_approval', 'rejected', 'active'];
            if (!PERMITTED_ONBOARDING_STATUSES.includes(merchant.status)) {
              res.status(403).json({
                success: false,
                error: 'FORBIDDEN',
                message: `Merchant account status '${merchant.status}' is not eligible for onboarding. Access denied.`,
              });
              return;
            }

            if (typeof marketplaceService.listMerchantMembers !== 'function') {
              res.status(403).json({
                success: false,
                error: 'FORBIDDEN',
                message: 'Merchant membership verification is unavailable. Access denied.',
              });
              return;
            }

            let members: any[];
            try {
              members = await marketplaceService.listMerchantMembers({
                merchant_id: session.merchantId,
                user_id: session.userId,
              });
            } catch (memErr: any) {
              res.status(403).json({
                success: false,
                error: 'FORBIDDEN',
                message: `Failed to verify merchant membership: ${memErr.message || 'Lookup error'}. Access denied.`,
              });
              return;
            }

            if (!members || members.length === 0) {
              res.status(403).json({
                success: false,
                error: 'FORBIDDEN',
                message: 'No active merchant membership found for this user.',
              });
              return;
            }

            const member = members[0];
            if (member.user_id !== session.userId || member.merchant_id !== session.merchantId) {
              res.status(403).json({
                success: false,
                error: 'FORBIDDEN',
                message: 'Merchant membership identity mismatch. Access denied.',
              });
              return;
            }

            if (member.status !== 'active') {
              res.status(403).json({
                success: false,
                error: 'FORBIDDEN',
                message: `Merchant membership is not active (current status: '${member.status}'). Access denied.`,
              });
              return;
            }

            // The effective role MUST derive from verified persisted membership, never from client or token
            const validRoles: MerchantRole[] = ['owner', 'admin', 'manager', 'staff'];
            session.role = (validRoles.includes(member.role) ? member.role : '') as MerchantRole;
          }
        } else if (options.allowInactiveMerchant || !isTestMockAllowed()) {
          res.status(403).json({
            success: false,
            error: 'FORBIDDEN',
            message: 'Marketplace service is unavailable. Cannot verify merchant membership.',
          });
          return;
        }
      } catch (authErr: any) {
        res.status(403).json({
          success: false,
          error: 'FORBIDDEN',
          message: 'Failed to verify merchant membership. Access denied.',
        });
        return;
      }
    }

    // 5. Assert permission (RBAC) if specified
    if (options.requiredPermission) {
      const permAssertion = BackendMarketplaceGuard.assertPermission(
        session,
        options.requiredPermission
      );
      if (!permAssertion.allowed) {
        res.status(permAssertion.statusCode).json({
          success: false,
          error: permAssertion.error,
          message: permAssertion.message,
        });
        return;
      }
    }

    // 6. Assert MFA verification if required (Mandatory for Super Admin boundary by default)
    const requiresMfa = options.requireMfa ?? (options.boundary === 'admin');
    if (requiresMfa && !session.isMfaVerified) {
      res.status(403).json({
        success: false,
        error: 'MFA_REQUIRED',
        message: 'Multi-Factor Authentication verification is required to perform this action.',
      });
      return;
    }

    // 7. Assert Step-Up re-authentication if required
    if (options.requireStepUp) {
      const isStepUpValid =
        session.sessionToken && (await SuperAdminAuthEngine.isStepUpActive(session.sessionToken));
      if (!isStepUpValid) {
        res.status(403).json({
          success: false,
          error: 'STEP_UP_REQUIRED',
          message: 'Step-up re-authentication required for this sensitive action.',
        });
        return;
      }
    }

    // Attach verified tenant context to request
    (req as any).tenantContext = session;

    // Execute downstream handler
    await handler(req as any, res);
  };
}
