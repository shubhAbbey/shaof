import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import databaseConfig from '../config/database.js';
import serverConfig from '../config/server.js';
import adminConfig from '../config/admin.js';
import apiConfig from '../config/api.js';
import middlewaresConfig from '../config/middlewares.js';
import pluginsConfig from '../config/plugins.js';

describe('Task 05: Strapi Foundation Configuration', () => {
  const mockEnv: any = (key: string, defaultValue?: any) => defaultValue;
  mockEnv.int = (key: string, defaultValue?: number) => defaultValue || 0;
  mockEnv.array = (key: string, defaultValue?: string[]) => defaultValue || [];
  mockEnv.bool = (key: string, defaultValue?: boolean) => Boolean(defaultValue);

  it('configures PostgreSQL database targeting strapi_db', () => {
    const db = databaseConfig({ env: mockEnv });
    assert.equal(db.connection.client, 'postgres');
    assert.ok(db.connection.connection);
    if ('database' in db.connection.connection) {
      assert.equal(db.connection.connection.database, 'strapi_db');
    }
  });

  it('configures server settings on port 1337', () => {
    const server = serverConfig({ env: mockEnv });
    assert.equal(server.port, 1337);
    assert.equal(server.host, '0.0.0.0');
    assert.ok(Array.isArray(server.app.keys));
    assert.ok(server.app.keys.length >= 2);
  });

  it('configures admin secrets and tokens securely', () => {
    const admin = adminConfig({ env: mockEnv });
    assert.ok(admin.auth.secret);
    assert.ok(admin.apiToken.salt);
    assert.ok(admin.transfer.token.salt);
  });

  it('configures api pagination limits safely', () => {
    assert.equal(apiConfig.rest.defaultLimit, 25);
    assert.equal(apiConfig.rest.maxLimit, 100);
    assert.equal(apiConfig.rest.withCount, true);
  });

  it('configures middlewares with CORS for storefront and CSP for media', () => {
    assert.ok(Array.isArray(middlewaresConfig));
    const corsMiddleware = middlewaresConfig.find(
      (m: any) => typeof m === 'object' && m.name === 'strapi::cors'
    ) as any;
    assert.ok(corsMiddleware);
    assert.ok(corsMiddleware.config.origin.includes('http://localhost:3000'));

    const secMiddleware = middlewaresConfig.find(
      (m: any) => typeof m === 'object' && m.name === 'strapi::security'
    ) as any;
    assert.ok(secMiddleware);
    assert.ok(secMiddleware.config.contentSecurityPolicy);
  });

  it('configures users-permissions plugin JWT secret', () => {
    const plugins = pluginsConfig({ env: mockEnv });
    assert.ok(plugins['users-permissions']);
    assert.ok(plugins['users-permissions'].config.jwtSecret);
  });
});
