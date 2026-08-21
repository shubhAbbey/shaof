export interface EnvValidationResult {
  isValid: boolean;
  missingKeys: string[];
}

export function validateRequiredEnv(
  env: Record<string, string | undefined>,
  requiredKeys: string[]
): EnvValidationResult {
  const missingKeys = requiredKeys.filter((key) => !env[key] || env[key]?.trim() === '');
  return {
    isValid: missingKeys.length === 0,
    missingKeys,
  };
}

export const STOREFRONT_REQUIRED_ENV = [
  'NEXT_PUBLIC_SITE_URL',
  'NEXT_PUBLIC_MEDUSA_BACKEND_URL',
  'NEXT_PUBLIC_STRAPI_API_URL',
];

export const BACKEND_REQUIRED_ENV = ['DATABASE_URL', 'JWT_SECRET', 'COOKIE_SECRET'];

export const CMS_REQUIRED_ENV = [
  'STRAPI_DATABASE_URL',
  'APP_KEYS',
  'API_TOKEN_SALT',
  'ADMIN_JWT_SECRET',
];
