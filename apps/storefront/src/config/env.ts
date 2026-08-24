/**
 * Centralized Environment Configuration
 *
 * Exposes strongly-typed, validated environment variables separating
 * client-accessible public values (NEXT_PUBLIC_*) from server-only secrets.
 */

export interface PublicEnvConfig {
  siteUrl: string;
  siteName: string;
  medusaUrl: string;
  medusaPublishableKey: string;
  strapiUrl: string;
  razorpayKeyId: string;
  nodeEnv: string;
  isDevelopment: boolean;
  isProduction: boolean;
  isTest: boolean;
}

export interface ServerEnvConfig extends PublicEnvConfig {
  strapiApiToken?: string;
  medusaServerPublishableKey?: string;
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || 'EcomFashion';
const MEDUSA_BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'http://localhost:9000';
const MEDUSA_PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY ||
  'pk_962772bcd68f09b11833d76684644ae47e3f46059f995ff0c5eeba74d0cc01e3';
const STRAPI_URL =
  process.env.NEXT_PUBLIC_STRAPI_URL ||
  process.env.NEXT_PUBLIC_STRAPI_API_URL ||
  'http://localhost:1337';
const RAZORPAY_KEY_ID = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_placeholder';

const NODE_ENV = process.env.NODE_ENV || 'development';
const isDevelopment = NODE_ENV === 'development';
const isProduction = NODE_ENV === 'production';
const isTest = NODE_ENV === 'test';

export const env: ServerEnvConfig = {
  siteUrl: SITE_URL,
  siteName: SITE_NAME,
  medusaUrl: MEDUSA_BACKEND_URL,
  medusaPublishableKey: MEDUSA_PUBLISHABLE_KEY,
  strapiUrl: STRAPI_URL,
  razorpayKeyId: RAZORPAY_KEY_ID,
  nodeEnv: NODE_ENV,
  isDevelopment,
  isProduction,
  isTest,
  // Server-only secrets: Never exposed in browser runtime
  strapiApiToken: typeof window === 'undefined' ? process.env.STRAPI_API_TOKEN : undefined,
  medusaServerPublishableKey:
    typeof window === 'undefined' ? process.env.MEDUSA_PUBLISHABLE_KEY : undefined,
};

/**
 * Validates availability of required environment variables for the current environment.
 */
export function validateEnvironment(): { isValid: boolean; missing: string[] } {
  const missing: string[] = [];

  if (!SITE_URL) missing.push('NEXT_PUBLIC_SITE_URL');
  if (!MEDUSA_BACKEND_URL) missing.push('NEXT_PUBLIC_MEDUSA_BACKEND_URL');
  if (!STRAPI_URL) missing.push('NEXT_PUBLIC_STRAPI_URL');

  return {
    isValid: missing.length === 0,
    missing,
  };
}
