import test from 'node:test';
import assert from 'node:assert/strict';
import { validateRequiredEnv, STOREFRONT_REQUIRED_ENV } from './env-validator.js';

test('validateRequiredEnv detects missing environment variables', () => {
  const env = {
    NEXT_PUBLIC_SITE_URL: 'http://localhost:3000',
  };

  const result = validateRequiredEnv(env, STOREFRONT_REQUIRED_ENV);
  assert.equal(result.isValid, false);
  assert.deepEqual(result.missingKeys, [
    'NEXT_PUBLIC_MEDUSA_BACKEND_URL',
    'NEXT_PUBLIC_STRAPI_API_URL',
  ]);
});

test('validateRequiredEnv passes when all variables are present', () => {
  const env = {
    NEXT_PUBLIC_SITE_URL: 'http://localhost:3000',
    NEXT_PUBLIC_MEDUSA_BACKEND_URL: 'http://localhost:9000',
    NEXT_PUBLIC_STRAPI_API_URL: 'http://localhost:1337',
  };

  const result = validateRequiredEnv(env, STOREFRONT_REQUIRED_ENV);
  assert.equal(result.isValid, true);
  assert.equal(result.missingKeys.length, 0);
});
