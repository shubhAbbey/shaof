/**
 * Centralized Storefront Configuration Entry Point
 */

import { env } from './env';
import { apiConfig } from './api';

export { env, validateEnvironment } from './env';
export type { PublicEnvConfig, ServerEnvConfig } from './env';
export { apiConfig } from './api';

export const config = {
  env,
  api: apiConfig,
  site: {
    name: env.siteName,
    url: env.siteUrl,
  },
  medusa: apiConfig.medusa,
  cms: apiConfig.cms,
  storefront: apiConfig.storefront,
};

export default config;
