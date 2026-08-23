import Medusa from '@medusajs/js-sdk';
import { config } from '../config';

export const sdk = new Medusa({
  baseUrl: config.medusa.baseUrl,
  debug: config.env.isDevelopment,
  publishableKey: config.medusa.publishableKey,
});

export default sdk;
