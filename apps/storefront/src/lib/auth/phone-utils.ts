/**
 * Mobile Number Normalization & Validation Utility
 *
 * India-first canonical mobile representation:
 * - 10-digit Indian mobile number starting with 6, 7, 8, or 9
 * - Normalized to canonical E.164-style string: +91XXXXXXXXXX
 */

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

  // Remove spaces, hyphens, parentheses, dots
  let cleaned = rawMobile.trim().replace(/[\s\-().]/g, '');

  // Handle leading +91 or 91 or 0
  if (cleaned.startsWith('+91')) {
    cleaned = cleaned.slice(3);
  } else if (cleaned.startsWith('91') && cleaned.length === 12) {
    cleaned = cleaned.slice(2);
  } else if (cleaned.startsWith('0') && cleaned.length === 11) {
    cleaned = cleaned.slice(1);
  }

  // Check if exactly 10 digits
  if (!/^\d{10}$/.test(cleaned)) {
    return {
      isValid: false,
      normalized: '',
      error: 'Mobile number must be a valid 10-digit number',
    };
  }

  // Indian mobile numbers must start with 6, 7, 8, or 9
  if (!/^[6-9]/.test(cleaned)) {
    return {
      isValid: false,
      normalized: '',
      error: 'Invalid Indian mobile number prefix (must begin with 6, 7, 8, or 9)',
    };
  }

  return {
    isValid: true,
    normalized: `+91${cleaned}`,
  };
}
