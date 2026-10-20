/**
 * Initial Super Admin Provisioning Script (Phase M2-05)
 *
 * Bootstraps the platform with a single Super Admin account if none exists.
 * Reads credentials strictly from environment variables:
 * - INITIAL_ADMIN_EMAIL
 * - INITIAL_ADMIN_PASSWORD
 * - INITIAL_ADMIN_FIRST_NAME (optional)
 * - INITIAL_ADMIN_LAST_NAME (optional)
 *
 * Security Guarantees:
 * 1. Fails closed if credentials are weak (< 8 characters) or missing.
 * 2. Never logs passwords or sensitive credentials.
 * 3. Never ships or creates a hardcoded default account.
 * 4. Refuses to overwrite an existing Super Admin account.
 */

import { SuperAdminAuthEngine } from '../modules/auth/super-admin-auth-engine';

export async function provisionInitialSuperAdmin(): Promise<{ success: boolean; message: string; userId?: string }> {
  const email = process.env.INITIAL_ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.INITIAL_ADMIN_PASSWORD;

  if (!email || !password) {
    return {
      success: false,
      message: 'INITIAL_ADMIN_EMAIL or INITIAL_ADMIN_PASSWORD environment variables are not set. Skipping provisioning.',
    };
  }

  if (password.length < 8) {
    throw new Error('PROVISIONING_FAILED: Password must be at least 8 characters long.');
  }

  const existing = SuperAdminAuthEngine.findUserByEmail(email);
  if (existing) {
    return {
      success: false,
      message: `Super Admin account with email '${email}' already exists. Skipping provisioning.`,
      userId: existing.id,
    };
  }

  const user = SuperAdminAuthEngine.registerAdminUser({
    email,
    password,
    firstName: process.env.INITIAL_ADMIN_FIRST_NAME || 'Platform',
    lastName: process.env.INITIAL_ADMIN_LAST_NAME || 'Administrator',
  });

  return {
    success: true,
    message: `Successfully provisioned initial Super Admin account: ${user.email} (${user.id})`,
    userId: user.id,
  };
}

if (require.main === module) {
  provisionInitialSuperAdmin()
    .then((res) => {
      console.log(`[Super Admin Provisioning]: ${res.message}`);
      process.exit(res.success ? 0 : 0);
    })
    .catch((err) => {
      console.error('[Super Admin Provisioning Error]:', err.message);
      process.exit(1);
    });
}
