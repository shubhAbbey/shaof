export type OtpType = 'login' | 'register' | 'profile' | 'checkout';

export interface RequestOtpPayload {
  mobile: string;
  type?: OtpType;
}

export interface RequestOtpResponse {
  success: boolean;
  message: string;
  isExistingCustomer?: boolean;
  expiresInSeconds: number;
  error?: string;
}

export interface VerifyOtpPayload {
  mobile: string;
  otp: string;
  type?: OtpType;
  fullName?: string;
  email?: string;
}

export type GenderType = 'male' | 'female' | 'other' | 'prefer_not_to_say';

export interface CustomerRegistrationPayload {
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  gender?: GenderType;
  dateOfBirth?: string;
}

export interface CustomerLookupPayload {
  mobile: string;
}

export interface CustomerLookupResponse {
  success: boolean;
  exists: boolean;
  mobile: string;
  message?: string;
  error?: string;
}

export interface CustomerSession {
  id: string;
  mobile: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  gender?: GenderType | null;
  dateOfBirth?: string | null;
  createdAt?: string | null;
}

export interface SessionResponse {
  success: boolean;
  isAuthenticated: boolean;
  customer: CustomerSession | null;
  token?: string | null;
  error?: string;
}

export interface VerifyOtpResponse {
  success: boolean;
  message?: string;
  customer?: CustomerSession;
  token?: string;
  error?: string;
  remainingAttempts?: number;
}

export interface AuthResponse {
  success: boolean;
  customer?: CustomerSession;
  token?: string;
  error?: string;
}

export interface SmsSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
  provider?: string;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetInSeconds: number;
  limit: number;
}

export interface DevFetchOtpResponse {
  success: boolean;
  otp?: string;
  expiresInSeconds?: number;
  message?: string;
  error?: string;
}

export interface OtpSessionState {
  mobile: string;
  otpHash: string;
  rawOtp?: string; // Stored temporarily only in non-production for dev-fetch
  otpType: OtpType;
  attempts: number;
  maxAttempts: number;
  createdAt: number;
  expiresAt: number;
}

export interface MobileValidationResult {
  isValid: boolean;
  normalized: string;
  error?: string;
}

export function normalizeIndianMobile(rawMobile: string | null | undefined): MobileValidationResult {
  if (!rawMobile || typeof rawMobile !== 'string') {
    return {
      isValid: false,
      normalized: '',
      error: 'Mobile number is required',
    };
  }

  const cleaned = rawMobile.trim().replace(/[\s\-().]/g, '');

  let raw10 = cleaned;
  if (cleaned.startsWith('+91')) {
    raw10 = cleaned.slice(3);
  } else if (cleaned.startsWith('91') && cleaned.length === 12) {
    raw10 = cleaned.slice(2);
  } else if (cleaned.startsWith('0') && cleaned.length === 11) {
    raw10 = cleaned.slice(1);
  }

  if (!/^\d{10}$/.test(raw10)) {
    return {
      isValid: false,
      normalized: '',
      error: 'Mobile number must be a valid 10-digit number',
    };
  }

  if (!/^[6-9]/.test(raw10)) {
    return {
      isValid: false,
      normalized: '',
      error: 'Invalid Indian mobile number prefix (must begin with 6, 7, 8, or 9)',
    };
  }

  return {
    isValid: true,
    normalized: `+91${raw10}`,
  };
}

/**
 * Strict internal URL sanitizer to prevent open redirect vulnerabilities
 */
export function sanitizeRedirectPath(url: string | null | undefined, fallback: string = '/account'): string {
  if (!url || typeof url !== 'string') return fallback;
  const trimmed = url.trim();
  if (
    trimmed.startsWith('/') &&
    !trimmed.startsWith('//') &&
    !trimmed.includes('\\') &&
    !trimmed.includes(':')
  ) {
    return trimmed;
  }
  return fallback;
}

export interface UnauthorizedErrorResponse {
  success: false;
  error: 'UNAUTHORIZED';
  message: string;
}

export interface ForbiddenErrorResponse {
  success: false;
  error: 'FORBIDDEN';
  message: string;
}

export type AuthGuardErrorResponse = UnauthorizedErrorResponse | ForbiddenErrorResponse;

export interface AuthGuardSuccess {
  authorized: true;
  customer: CustomerSession;
  token: string;
}

export interface AuthGuardFailure {
  authorized: false;
  error: 'UNAUTHORIZED' | 'FORBIDDEN';
  statusCode: 401 | 403;
  message: string;
}

export type AuthGuardResult = AuthGuardSuccess | AuthGuardFailure;

export const PROTECTED_ROUTE_PREFIXES = ['/account', '/wishlist', '/checkout'] as const;
export const AUTH_ENTRY_ROUTE_PREFIXES = ['/login', '/register'] as const;

// ==========================================
// Super Admin Authentication & MFA Types (M2-05)
// ==========================================

export interface SuperAdminLoginPayload {
  email: string;
  password: string;
  totpCode?: string;
  backupCode?: string;
}

export interface SuperAdminLoginResponse {
  success: boolean;
  mfaRequired?: boolean;
  mfaChallengeToken?: string;
  session?: {
    userId: string;
    email: string;
    role: 'super_admin';
    authBoundary: 'admin';
    actorType: 'super_admin';
    isMfaVerified: boolean;
    expiresAt?: string;
    lastMfaVerifiedAt?: string;
  };
  token?: string;
  error?: string;
  message?: string;
}

export interface MfaSetupResponse {
  success: boolean;
  secret: string; // Base32 TOTP secret (shown only once)
  otpauthUri: string;
  backupCodes: string[]; // Plaintext backup codes (shown only once)
  pendingConfirmation?: boolean;
  error?: string;
  message?: string;
}

export interface MfaVerifyPayload {
  code?: string; // 6-digit TOTP code
  backupCode?: string; // Backup scratch code
  mfaChallengeToken?: string; // If verifying during 2-stage login
}

export interface MfaVerifyResponse {
  success: boolean;
  isMfaVerified: boolean;
  token?: string;
  backupCodeUsed?: boolean;
  remainingBackupCodesCount?: number;
  error?: string;
  message?: string;
}

export interface StepUpPayload {
  password?: string;
  totpCode?: string;
}

export interface StepUpResponse {
  success: boolean;
  stepUpVerified: boolean;
  expiresAt: string;
  error?: string;
  message?: string;
}

export type AdminAuthAction =
  | 'admin.login.success'
  | 'admin.login.failed'
  | 'admin.login.locked'
  | 'admin.mfa.setup'
  | 'admin.mfa.enrolled'
  | 'admin.mfa.verified'
  | 'admin.mfa.failed'
  | 'admin.backup_code.used'
  | 'admin.logout'
  | 'admin.session.revoked'
  | 'admin.step_up.success'
  | 'admin.step_up.failed';

export interface AdminAuthAuditEvent {
  eventId: string;
  action: AdminAuthAction;
  userId?: string;
  email?: string;
  ip?: string;
  userAgent?: string;
  timestamp: string;
  outcome: 'success' | 'failure';
  reason?: string;
}

export interface AdminSessionRecord {
  token: string;
  userId: string;
  email: string;
  role: 'super_admin';
  actorType: 'super_admin';
  authBoundary: 'admin';
  isMfaVerified: boolean;
  createdAt: number;
  lastActivityAt: number;
  expiresAt: number;
  lastMfaVerifiedAt?: number;
  ip?: string;
  userAgent?: string;
}

