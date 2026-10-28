import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export interface AdminSession {
  userId: string;
  email: string;
  role: string;
  authBoundary: string;
  isMfaVerified: boolean;
}

export interface MerchantSession {
  userId: string;
  merchantId: string;
  email: string;
  role: string;
  authBoundary: string;
  membershipStatus: string;
  merchantStatus: string;
  permissions: string[];
}

/**
 * Server-side authorization gate for Super Admin routes.
 * Must be called in React Server Components before any protected UI is rendered.
 * Enforces:
 * 1. Valid ecom_admin_sess cookie
 * 2. Backend-verified active session
 * 3. role === 'super_admin' and authBoundary === 'admin'
 * 4. isMfaVerified === true (MFA completion mandatory)
 *
 * If any check fails, immediately redirects to /admin/login before emitting any HTML or RSC payload.
 */
export async function requireSuperAdminServerSession(currentPath: string): Promise<AdminSession> {
  const cookieStore = cookies();
  const token = cookieStore.get('ecom_admin_sess')?.value;
  if (!token) {
    redirect(`/admin/login?redirect=${encodeURIComponent(currentPath)}`);
  }

  const backendUrl = process.env.MEDUSA_BACKEND_URL || 'http://127.0.0.1:9000';
  let res: Response | null = null;
  try {
    res = await fetch(`${backendUrl}/admin/auth/session`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Cookie: `ecom_admin_sess=${token}`,
      },
      cache: 'no-store',
    });
  } catch {
    redirect(`/admin/login?redirect=${encodeURIComponent(currentPath)}`);
  }

  if (!res || !res.ok) {
    redirect(`/admin/login?redirect=${encodeURIComponent(currentPath)}`);
  }

  const data = await res.json().catch(() => null);
  if (
    !data?.authenticated ||
    !data?.session?.isMfaVerified ||
    data?.session?.role !== 'super_admin' ||
    data?.session?.authBoundary !== 'admin'
  ) {
    redirect(`/admin/login?redirect=${encodeURIComponent(currentPath)}`);
  }

  return data.session;
}

/**
 * Server-side authorization gate for Merchant routes.
 * Must be called in React Server Components before any protected UI is rendered.
 * Enforces:
 * 1. Valid ecom_merchant_sess cookie
 * 2. Backend-verified active session
 * 3. authBoundary === 'merchant'
 * 4. membershipStatus === 'active'
 * 5. merchantStatus !== 'suspended'
 * 6. Optional role/permission checks (e.g. for team management)
 *
 * If any check fails, immediately redirects to /merchant/login before emitting any HTML or RSC payload.
 */
export async function requireMerchantServerSession(
  currentPath: string,
  options?: { requireRole?: Array<'owner' | 'admin'>; requirePermission?: string }
): Promise<MerchantSession> {
  const cookieStore = cookies();
  const token = cookieStore.get('ecom_merchant_sess')?.value;
  if (!token) {
    redirect(`/merchant/login?redirect=${encodeURIComponent(currentPath)}`);
  }

  const backendUrl = process.env.MEDUSA_BACKEND_URL || 'http://127.0.0.1:9000';
  let res: Response | null = null;
  try {
    res = await fetch(`${backendUrl}/merchant/auth/session`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Cookie: `ecom_merchant_sess=${token}`,
      },
      cache: 'no-store',
    });
  } catch {
    redirect(`/merchant/login?redirect=${encodeURIComponent(currentPath)}`);
  }

  if (!res || !res.ok) {
    redirect(`/merchant/login?redirect=${encodeURIComponent(currentPath)}`);
  }

  const data = await res.json().catch(() => null);
  if (
    !data?.authenticated ||
    data?.session?.authBoundary !== 'merchant' ||
    data?.session?.membershipStatus !== 'active'
  ) {
    redirect(`/merchant/login?redirect=${encodeURIComponent(currentPath)}`);
  }

  if (data?.session?.merchantStatus === 'suspended') {
    redirect('/merchant/login?status=suspended');
  }

  const session: MerchantSession = data.session;
  if (options?.requireRole && !options.requireRole.includes(session.role as any)) {
    if (options?.requirePermission && session.permissions.includes(options.requirePermission)) {
      // Permission explicitly granted
    } else {
      redirect('/merchant/products?error=forbidden');
    }
  }

  return session;
}
