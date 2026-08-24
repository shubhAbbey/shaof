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

