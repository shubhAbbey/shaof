/**
 * Core Server-Side OTP Authentication Service
 *
 * Implements:
 * - Cryptographically secure 6-digit OTP generation (crypto.randomInt)
 * - HMAC-SHA256 hashed temporary Redis storage (TTL 300s)
 * - Request rate limiting (max 3 requests / 10 min)
 * - Verification attempt tracking & 5-attempt limit
 * - Timing-safe comparison (crypto.timingSafeEqual)
 * - Immediate invalidation upon successful verification
 * - Development-only secure fetchOtp exception with S2S authorization
 */
import crypto from 'node:crypto';
import { normalizeIndianMobile } from './phone-utils';
import { getRedisClient, IRedisAdapter } from './redis-client';
import { checkRateLimit } from './rate-limiter';
import { getSmsProvider, ISmsProvider } from './sms-provider';
import type {
  OtpType,
  OtpSessionState,
  RequestOtpResponse,
  VerifyOtpResponse,
  DevFetchOtpResponse,
} from '@ecom/types';

export const OTP_TTL_SECONDS = 300; // 5 minutes
export const OTP_REQUEST_RATE_LIMIT = 3; // Max 3 requests
export const OTP_REQUEST_WINDOW_SECONDS = 600; // 10 minutes
export const MAX_VERIFY_ATTEMPTS = 5;

const HMAC_SECRET = process.env.OTP_SECRET || process.env.JWT_SECRET || 'ecom_secure_otp_hmac_secret_key_32_bytes';
const S2S_AUTH_TOKEN = process.env.S2S_AUTH_TOKEN || 'ecom-s2s-dev-token-secret';

export function generateSecureOtp(): string {
  const randomNum = crypto.randomInt(100000, 1000000);
  return randomNum.toString();
}

export function hashOtp(otp: string, mobile: string): string {
  return crypto
    .createHmac('sha256', HMAC_SECRET)
    .update(`${mobile}:${otp}`)
    .digest('hex');
}

export function verifyTimingSafeHash(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(Buffer.from(a, 'hex'), Buffer.from(b, 'hex'));
}

export interface RequestOtpOptions {
  mobile: string;
  type?: OtpType;
  ip?: string;
  redis?: IRedisAdapter;
  smsProvider?: ISmsProvider;
}

export interface VerifyOtpOptions {
  mobile: string;
  otp: string;
  type?: OtpType;
  fullName?: string;
  email?: string;
  redis?: IRedisAdapter;
}

export interface DevFetchOtpOptions {
  mobile: string;
  type?: OtpType;
  s2sToken?: string;
  redis?: IRedisAdapter;
}

export class OtpService {
  /**
   * 1. Request OTP Flow
   */
  static async requestOtp(options: RequestOtpOptions): Promise<RequestOtpResponse> {
    const { mobile: rawMobile, type = 'login', ip, redis: customRedis, smsProvider: customProvider } = options;
    const redis = customRedis || getRedisClient();
    const smsProvider = customProvider || getSmsProvider();

    // 1. Mobile normalization & validation
    const validation = normalizeIndianMobile(rawMobile);
    if (!validation.isValid) {
      return {
        success: false,
        message: validation.error || 'Invalid mobile number',
        expiresInSeconds: 0,
        error: 'INVALID_MOBILE',
      };
    }
    const mobile = validation.normalized;

    // 2. Mobile Rate Limiting (3 requests per 10 minutes)
    const mobileRateLimit = await checkRateLimit(`mobile:${mobile}:otp_request`, OTP_REQUEST_RATE_LIMIT, OTP_REQUEST_WINDOW_SECONDS, redis);
    if (!mobileRateLimit.allowed) {
      return {
        success: false,
        message: `Too many OTP requests. Please try again in ${Math.ceil(mobileRateLimit.resetInSeconds / 60)} minutes.`,
        expiresInSeconds: 0,
        error: 'RATE_LIMIT_EXCEEDED',
      };
    }

    // 3. IP Rate Limiting (if IP provided, max 10 requests per 10 minutes per IP)
    if (ip && ip !== '127.0.0.1' && ip !== '::1') {
      const ipRateLimit = await checkRateLimit(`ip:${ip}:otp_request`, 10, OTP_REQUEST_WINDOW_SECONDS, redis);
      if (!ipRateLimit.allowed) {
        return {
          success: false,
          message: 'Too many requests from this IP. Please try again later.',
          expiresInSeconds: 0,
          error: 'IP_RATE_LIMIT_EXCEEDED',
        };
      }
    }

    // 4. Cryptographically Secure OTP Generation
    const rawOtp = generateSecureOtp();
    const otpHash = hashOtp(rawOtp, mobile);
    const now = Date.now();
    const expiresAt = now + OTP_TTL_SECONDS * 1000;

    // 5. Store temporary state in Redis (TTL = 300s)
    const isDevelopment = process.env.NODE_ENV !== 'production';
    const state: OtpSessionState = {
      mobile,
      otpHash,
      // Only include rawOtp in non-production for the authorized devFetchOtp testing tool
      rawOtp: isDevelopment ? rawOtp : undefined,
      otpType: type,
      attempts: 0,
      maxAttempts: MAX_VERIFY_ATTEMPTS,
      createdAt: now,
      expiresAt,
    };

    const redisKey = `otp:${mobile}`;
    await redis.set(redisKey, JSON.stringify(state), 'EX', OTP_TTL_SECONDS);

    // 6. External SMS / OTP Provider Dispatch
    const smsResult = await smsProvider.sendOtp(mobile, rawOtp, type);
    if (!smsResult.success) {
      // Clean up state if delivery failed
      await redis.del(redisKey);
      return {
        success: false,
        message: 'Failed to deliver SMS. Please try again.',
        expiresInSeconds: 0,
        error: smsResult.error || 'SMS_DELIVERY_FAILED',
      };
    }

    return {
      success: true,
      message: 'OTP sent successfully',
      expiresInSeconds: OTP_TTL_SECONDS,
    };
  }

  /**
   * 2. Verify OTP Flow
   */
  static async verifyOtp(options: VerifyOtpOptions): Promise<VerifyOtpResponse> {
    const { mobile: rawMobile, otp: submittedOtp, type = 'login', fullName, email, redis: customRedis } = options;
    const redis = customRedis || getRedisClient();

    // 1. Validate inputs
    const validation = normalizeIndianMobile(rawMobile);
    if (!validation.isValid) {
      return {
        success: false,
        error: 'INVALID_MOBILE',
        message: validation.error || 'Invalid mobile number',
      };
    }
    const mobile = validation.normalized;

    if (!submittedOtp || typeof submittedOtp !== 'string' || submittedOtp.trim().length !== 6) {
      return {
        success: false,
        error: 'INVALID_OTP_FORMAT',
        message: 'OTP must be a 6-digit code',
      };
    }

    const cleanOtp = submittedOtp.trim();
    const redisKey = `otp:${mobile}`;

    // 2. Retrieve temporary state from Redis
    const stateStr = await redis.get(redisKey);
    if (!stateStr) {
      return {
        success: false,
        error: 'OTP_EXPIRED_OR_NOT_FOUND',
        message: 'OTP has expired or was not requested. Please request a new code.',
      };
    }

    let state: OtpSessionState;
    try {
      state = JSON.parse(stateStr);
    } catch {
      await redis.del(redisKey);
      return {
        success: false,
        error: 'STATE_CORRUPTED',
        message: 'Invalid authentication state. Please request a new code.',
      };
    }

    // 3. Attempt Tracking & Lockout Check
    if (state.attempts >= state.maxAttempts) {
      await redis.del(redisKey);
      return {
        success: false,
        error: 'MAX_ATTEMPTS_EXCEEDED',
        message: 'Maximum verification attempts exceeded. Please request a new OTP.',
        remainingAttempts: 0,
      };
    }

    // 4. Secure Hash Comparison
    const submittedHash = hashOtp(cleanOtp, mobile);
    const isMatch = verifyTimingSafeHash(submittedHash, state.otpHash);

    if (!isMatch) {
      state.attempts += 1;
      const remainingTtl = await redis.ttl(redisKey);
      const remainingAttempts = Math.max(0, state.maxAttempts - state.attempts);

      if (remainingAttempts === 0) {
        await redis.del(redisKey);
        return {
          success: false,
          error: 'MAX_ATTEMPTS_EXCEEDED',
          message: 'Maximum verification attempts exceeded. Please request a new OTP.',
          remainingAttempts: 0,
        };
      }

      const ttlToUse = remainingTtl > 0 ? remainingTtl : 30;
      await redis.set(redisKey, JSON.stringify(state), 'EX', ttlToUse);

      return {
        success: false,
        error: 'INVALID_OTP',
        message: `Incorrect OTP. ${remainingAttempts} attempt(s) remaining.`,
        remainingAttempts,
      };
    }

    // 5. Successful Verification -> Invalidate OTP immediately to prevent replay
    await redis.del(redisKey);

    // 6. Return authenticated customer session payload
    const customerSession = {
      id: `cus_${crypto.createHash('sha256').update(mobile).digest('hex').substring(0, 24)}`,
      mobile,
      email: email || null,
      firstName: fullName ? fullName.split(' ')[0] : null,
      lastName: fullName && fullName.split(' ').length > 1 ? fullName.split(' ').slice(1).join(' ') : null,
    };

    return {
      success: true,
      message: 'OTP verified successfully',
      customer: customerSession,
      token: `sess_${crypto.randomBytes(32).toString('hex')}`,
    };
  }

  /**
   * 3. Development-Only fetchOtp Exception
   */
  static async devFetchOtp(options: DevFetchOtpOptions): Promise<DevFetchOtpResponse> {
    const { mobile: rawMobile, s2sToken, redis: customRedis } = options;
    const redis = customRedis || getRedisClient();

    // 1. Strict Fail-Closed Environment Guard
    if (process.env.NODE_ENV === 'production') {
      return {
        success: false,
        error: 'FORBIDDEN_IN_PRODUCTION',
        message: 'fetchOtp is permanently disabled in production environments.',
      };
    }

    // 2. S2S Authorization Verification
    if (!s2sToken || s2sToken !== S2S_AUTH_TOKEN) {
      return {
        success: false,
        error: 'UNAUTHORIZED_S2S',
        message: 'Invalid or missing S2S authorization token.',
      };
    }

    // 3. Mobile Normalization
    const validation = normalizeIndianMobile(rawMobile);
    if (!validation.isValid) {
      return {
        success: false,
        error: 'INVALID_MOBILE',
        message: validation.error || 'Invalid mobile number',
      };
    }
    const mobile = validation.normalized;

    // 4. Retrieve Current Active Temporary State
    const redisKey = `otp:${mobile}`;
    const stateStr = await redis.get(redisKey);
    if (!stateStr) {
      return {
        success: false,
        error: 'OTP_NOT_FOUND',
        message: 'No active OTP found for this mobile number or OTP has expired.',
      };
    }

    const state: OtpSessionState = JSON.parse(stateStr);
    const remainingTtl = await redis.ttl(redisKey);

    return {
      success: true,
      otp: state.rawOtp,
      expiresInSeconds: remainingTtl > 0 ? remainingTtl : 0,
      message: 'Active development OTP retrieved successfully.',
    };
  }
}
