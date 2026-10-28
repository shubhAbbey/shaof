import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { ateevraOpenApiDocument } from './api-docs/openapi-spec';
import { GET as getDocsHandler } from './api/docs/route';
import { GET as getOpenApiJsonHandler } from './api/docs/openapi.json/route';
import { GET as getOpenApiAliasHandler } from './api/docs/openapi/route';

/**
 * Helper to create mock MedusaRequest and MedusaResponse objects
 */
function createMockHttp(options: {
  query?: Record<string, any>;
  headers?: Record<string, string>;
  cookies?: Record<string, string>;
  env?: Record<string, string>;
} = {}) {
  let statusCode = 200;
  const headers: Record<string, string> = {};
  let responseBody: any = null;

  const req: any = {
    query: options.query || {},
    headers: options.headers || {},
    cookies: options.cookies || {},
    scope: { resolve: () => ({}) },
  };

  const res: any = {
    status(code: number) {
      statusCode = code;
      return res;
    },
    setHeader(name: string, value: string) {
      headers[name.toLowerCase()] = value;
      return res;
    },
    json(body: any) {
      responseBody = body;
      return res;
    },
    send(body: any) {
      responseBody = body;
      return res;
    },
  };

  return {
    req,
    res,
    getResponse: () => ({
      statusCode,
      headers,
      body: responseBody,
    }),
  };
}

describe('OpenAPI 3.1 Specification & Documentation Suite', () => {
  describe('1. OpenAPI Specification Structure & Version Compliance', () => {
    it('declares valid OpenAPI 3.1.0 version and essential metadata', () => {
      assert.strictEqual(ateevraOpenApiDocument.openapi, '3.1.0');
      assert.ok(ateevraOpenApiDocument.info);
      assert.strictEqual(ateevraOpenApiDocument.info.title, 'Ateevra Multi-Vendor Marketplace API');
      assert.ok(ateevraOpenApiDocument.info.version);
      assert.ok(ateevraOpenApiDocument.info.description);
    });

    it('declares both Backend and Storefront BFF server environments', () => {
      assert.ok(Array.isArray(ateevraOpenApiDocument.servers));
      assert.strictEqual(ateevraOpenApiDocument.servers.length, 2);

      const serverUrls = ateevraOpenApiDocument.servers.map((s) => s.url);
      assert.ok(serverUrls.includes('http://localhost:9000'), 'Backend server url must be present');
      assert.ok(serverUrls.includes('http://localhost:3000'), 'Storefront BFF server url must be present');
    });

    it('defines comprehensive domain tags', () => {
      assert.ok(Array.isArray(ateevraOpenApiDocument.tags));
      assert.ok(ateevraOpenApiDocument.tags.length >= 10);
      const tagNames = ateevraOpenApiDocument.tags.map((t) => t.name);
      assert.ok(tagNames.includes('Merchant Authentication & Onboarding'));
      assert.ok(tagNames.includes('Merchant Team Management & RBAC'));
      assert.ok(tagNames.includes('Super Admin Authentication'));
      assert.ok(tagNames.includes('Super Admin Marketplace Governance'));
      assert.ok(tagNames.includes('Store — Customer Management (S2S)'));
      assert.ok(tagNames.includes('Storefront BFF — Cart & Checkout'));
    });
  });

  describe('2. Operation ID Uniqueness & Operation Metadata', () => {
    it('ensures every single documented operation has a unique operationId', () => {
      const operationIds = new Set<string>();
      let operationCount = 0;

      for (const [pathKey, pathItem] of Object.entries(ateevraOpenApiDocument.paths)) {
        const methods = ['get', 'post', 'put', 'delete', 'patch'] as const;
        for (const method of methods) {
          const operation = (pathItem as any)[method];
          if (operation) {
            operationCount++;
            assert.ok(operation.operationId, `Operation at ${method.toUpperCase()} ${pathKey} is missing operationId`);
            assert.ok(
              !operationIds.has(operation.operationId),
              `Duplicate operationId found: ${operation.operationId} at ${method.toUpperCase()} ${pathKey}`
            );
            operationIds.add(operation.operationId);

            // Operation must have tags, summary, and responses
            assert.ok(operation.tags && operation.tags.length > 0, `Missing tags at ${operation.operationId}`);
            assert.ok(operation.summary, `Missing summary at ${operation.operationId}`);
            assert.ok(operation.responses, `Missing responses at ${operation.operationId}`);
          }
        }
      }

      assert.strictEqual(
        operationCount,
        98,
        `Expected exactly 98 documented operations (51 custom backend + 42 storefront BFF + 5 Medusa core reference), found ${operationCount}`
      );
    });

    it('specifically documents the four previously omitted operations', () => {
      // 1. POST /admin/marketplace/products
      assert.ok(
        ateevraOpenApiDocument.paths['/admin/marketplace/products']?.post,
        'POST /admin/marketplace/products must be documented'
      );
      assert.strictEqual(
        ateevraOpenApiDocument.paths['/admin/marketplace/products']?.post?.operationId,
        'adminMarketplaceCreateProduct'
      );

      // 2. GET /store/addresses/{id}
      assert.ok(
        ateevraOpenApiDocument.paths['/store/addresses/{id}']?.get,
        'GET /store/addresses/{id} must be documented'
      );
      assert.strictEqual(
        ateevraOpenApiDocument.paths['/store/addresses/{id}']?.get?.operationId,
        'storeGetAddressById'
      );

      // 3. POST /store/addresses/{id}
      assert.ok(
        ateevraOpenApiDocument.paths['/store/addresses/{id}']?.post,
        'POST /store/addresses/{id} must be documented'
      );
      assert.strictEqual(
        ateevraOpenApiDocument.paths['/store/addresses/{id}']?.post?.operationId,
        'storeUpdateAddressPost'
      );

      // 4. PATCH /store/addresses/{id}
      assert.ok(
        ateevraOpenApiDocument.paths['/store/addresses/{id}']?.patch,
        'PATCH /store/addresses/{id} must be documented'
      );
      assert.strictEqual(
        ateevraOpenApiDocument.paths['/store/addresses/{id}']?.patch?.operationId,
        'storeUpdateAddressPatch'
      );

      // Verify DELETE /store/addresses/{id} remains intact
      assert.ok(
        ateevraOpenApiDocument.paths['/store/addresses/{id}']?.delete,
        'DELETE /store/addresses/{id} must be documented'
      );
      // Verify phantom PUT is removed
      assert.strictEqual(
        ateevraOpenApiDocument.paths['/store/addresses/{id}']?.put,
        undefined,
        'Phantom PUT /store/addresses/{id} must not be present'
      );
    });
  });

  describe('3. Schema Reference ($ref) & Security Scheme Integrity', () => {
    it('verifies that all component schema $ref references resolve correctly', () => {
      const definedSchemas = ateevraOpenApiDocument.components?.schemas || {};
      const definedSecurity = ateevraOpenApiDocument.components?.securitySchemes || {};

      assert.ok(Object.keys(definedSchemas).length >= 15, 'Components must define reusable schemas');
      assert.ok(Object.keys(definedSecurity).length >= 5, 'Components must define security schemes');

      // Helper to recursively find all $ref strings
      function checkRefs(node: any, currentPath: string) {
        if (!node || typeof node !== 'object') return;

        if (node.$ref && typeof node.$ref === 'string') {
          const ref = node.$ref;
          if (ref.startsWith('#/components/schemas/')) {
            const schemaName = ref.replace('#/components/schemas/', '');
            assert.ok(
              definedSchemas[schemaName],
              `Unresolved schema $ref: "${ref}" found at ${currentPath}`
            );
          }
        }

        // Check security requirement arrays
        if (node.security && Array.isArray(node.security)) {
          for (const secReq of node.security) {
            for (const schemeName of Object.keys(secReq)) {
              assert.ok(
                definedSecurity[schemeName],
                `Unresolved security scheme "${schemeName}" referenced at ${currentPath}`
              );
            }
          }
        }

        for (const [key, value] of Object.entries(node)) {
          checkRefs(value, `${currentPath}.${key}`);
        }
      }

      checkRefs(ateevraOpenApiDocument.paths, 'paths');
      checkRefs(definedSchemas, 'components.schemas');
    });
  });

  describe('4. Custom Backend Route Coverage Verification', () => {
    it('verifies that every custom API route in apps/backend/src/api is documented', () => {
      const apiRootDir = fs.existsSync(path.resolve(__dirname, '../src/api'))
        ? path.resolve(__dirname, '../src/api')
        : path.join(__dirname, 'api');

      // Recursively collect all custom route files
      function collectRouteFiles(dir: string): string[] {
        let results: string[] = [];
        const entries = fs.readdirSync(dir, { withFileTypes: true });

        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          if (entry.isDirectory()) {
            // Exclude non-route directories
            if (['docs', 'middlewares', '__tests__'].includes(entry.name)) {
              continue;
            }
            results = results.concat(collectRouteFiles(fullPath));
          } else if (entry.name === 'route.ts' || entry.name === 'route.js') {
            results.push(fullPath);
          }
        }
        return results;
      }

      const routeFiles = collectRouteFiles(apiRootDir);
      assert.ok(routeFiles.length >= 20, `Expected at least 20 custom route files, found ${routeFiles.length}`);

      for (const routeFile of routeFiles) {
        // Derive OpenAPI path from file system path
        const relative = path.relative(apiRootDir, routeFile);
        const dirName = path.dirname(relative).replace(/\\/g, '/');
        // Convert [id] or [addressId] to {id} or {addressId}
        const openApiPath = '/' + dirName.replace(/\[(\w+)\]/g, '{$1}');

        const fileContent = fs.readFileSync(routeFile, 'utf8');

        // Check which HTTP methods are exported in this route file
        const methodsToCheck = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'] as const;
        for (const method of methodsToCheck) {
          // Check for `export async function METHOD`, `export const METHOD =`, or compiled `exports.METHOD =`
          const hasMethodExport =
            new RegExp(`export\\s+(async\\s+)?function\\s+${method}\\b`).test(fileContent) ||
            new RegExp(`export\\s+const\\s+${method}\\b`).test(fileContent) ||
            new RegExp(`exports\\.${method}\\s*=`).test(fileContent);

          if (hasMethodExport) {
            const pathItem = (ateevraOpenApiDocument.paths as any)[openApiPath];
            assert.ok(
              pathItem,
              `Route path "${openApiPath}" from file ${relative} is MISSING in OpenAPI specification!`
            );

            const operation = pathItem[method.toLowerCase()];
            assert.ok(
              operation,
              `Method ${method} for path "${openApiPath}" from file ${relative} is MISSING in OpenAPI specification!`
            );
          }
        }
      }
    });
  });

  describe('5. Storefront BFF Route Coverage Verification', () => {
    it('verifies that in-scope Storefront BFF routes in apps/storefront/src/app/api are documented', () => {
      const bffRootDir = path.resolve(__dirname, '../../storefront/src/app/api');

      if (!fs.existsSync(bffRootDir)) {
        // Skip if running in an isolated backend build without storefront source tree
        return;
      }

      function collectBffRoutes(dir: string): string[] {
        let results: string[] = [];
        const entries = fs.readdirSync(dir, { withFileTypes: true });

        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          if (entry.isDirectory()) {
            results = results.concat(collectBffRoutes(fullPath));
          } else if (entry.name === 'route.ts' || entry.name === 'route.js') {
            results.push(fullPath);
          }
        }
        return results;
      }

      const bffRouteFiles = collectBffRoutes(bffRootDir);
      assert.ok(bffRouteFiles.length >= 25, `Expected at least 25 BFF route files, found ${bffRouteFiles.length}`);

      for (const routeFile of bffRouteFiles) {
        const relative = path.relative(bffRootDir, routeFile);
        const dirName = path.dirname(relative).replace(/\\/g, '/');
        const openApiPath = '/api/' + dirName.replace(/\[(\w+)\]/g, '{$1}');

        const fileContent = fs.readFileSync(routeFile, 'utf8');
        const methodsToCheck = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'] as const;

        for (const method of methodsToCheck) {
          const hasMethodExport =
            new RegExp(`export\\s+(async\\s+)?function\\s+${method}\\b`).test(fileContent) ||
            new RegExp(`export\\s+const\\s+${method}\\b`).test(fileContent);

          if (hasMethodExport) {
            const pathItem = (ateevraOpenApiDocument.paths as any)[openApiPath];
            assert.ok(
              pathItem,
              `BFF Route path "${openApiPath}" from file ${relative} is MISSING in OpenAPI specification!`
            );

            const operation = pathItem[method.toLowerCase()];
            assert.ok(
              operation,
              `BFF Method ${method} for path "${openApiPath}" from file ${relative} is MISSING in OpenAPI specification!`
            );
          }
        }
      }
    });
  });

  describe('6. Documentation Route Handlers (/docs & /docs/openapi.json)', () => {
    it('GET /docs returns HTML content with Swagger UI markup and spec URL', async () => {
      const { req, res, getResponse } = createMockHttp({
        headers: { accept: 'text/html' },
      });

      await getDocsHandler(req, res);
      const response = getResponse();

      assert.strictEqual(response.statusCode, 200);
      assert.ok(response.headers['content-type'].includes('text/html'));
      assert.ok(response.body.includes('<div id="swagger-ui"></div>'));
      assert.ok(response.body.includes('/docs/openapi.json'));
      assert.ok(response.body.includes('ATEEVRA MARKETPLACE'));
      assert.ok(response.body.includes('SwaggerUIBundle'));
    });

    it('GET /docs with ?format=json returns raw OpenAPI 3.1 JSON', async () => {
      const { req, res, getResponse } = createMockHttp({
        query: { format: 'json' },
      });

      await getDocsHandler(req, res);
      const response = getResponse();

      assert.strictEqual(response.statusCode, 200);
      assert.ok(response.headers['content-type'].includes('application/json'));
      assert.strictEqual(response.body.openapi, '3.1.0');
      assert.strictEqual(response.body.info.title, 'Ateevra Multi-Vendor Marketplace API');
    });

    it('GET /docs/openapi.json returns raw OpenAPI 3.1 JSON with correct headers', async () => {
      const { req, res, getResponse } = createMockHttp();

      await getOpenApiJsonHandler(req, res);
      const response = getResponse();

      assert.strictEqual(response.statusCode, 200);
      assert.ok(response.headers['content-type'].includes('application/json'));
      assert.ok(response.headers['cache-control']);
      assert.strictEqual(response.body.openapi, '3.1.0');
    });

    it('GET /docs/openapi returns the specification as well', async () => {
      const { req, res, getResponse } = createMockHttp();

      await getOpenApiAliasHandler(req, res);
      const response = getResponse();

      assert.strictEqual(response.statusCode, 200);
      assert.strictEqual(response.body.openapi, '3.1.0');
    });
  });

  describe('7. Security Scheme & Tenant Boundary Verification', () => {
    it('verifies Merchant Team endpoints enforce MerchantCookieAuth or MerchantBearerAuth', () => {
      const teamGet = ateevraOpenApiDocument.paths['/merchant/team']?.get;
      assert.ok(teamGet);
      assert.ok(Array.isArray(teamGet.security));
      const schemes = teamGet.security.flatMap((s) => Object.keys(s));
      assert.ok(schemes.includes('MerchantCookieAuth'));
      assert.ok(schemes.includes('MerchantBearerAuth'));
    });

    it('verifies Super Admin endpoints enforce AdminCookieAuth or AdminBearerAuth', () => {
      const mfaSetup = ateevraOpenApiDocument.paths['/admin/auth/mfa/setup']?.post;
      assert.ok(mfaSetup);
      assert.ok(Array.isArray(mfaSetup.security));
      const schemes = mfaSetup.security.flatMap((s) => Object.keys(s));
      assert.ok(schemes.includes('AdminCookieAuth'));
      assert.ok(schemes.includes('AdminBearerAuth'));
    });

    it('verifies S2S customer mutation requires S2SAuth header', () => {
      const customerPost = ateevraOpenApiDocument.paths['/store/customers']?.post;
      assert.ok(customerPost);
      assert.ok(Array.isArray(customerPost.security));
      const schemes = customerPost.security.flatMap((s) => Object.keys(s));
      assert.ok(schemes.includes('S2SAuth'));
    });

    it('verifies Razorpay webhook requires RazorpayWebhookSignature header', () => {
      const webhookPost = ateevraOpenApiDocument.paths['/api/webhooks/razorpay']?.post;
      assert.ok(webhookPost);
      assert.ok(Array.isArray(webhookPost.security));
      const schemes = webhookPost.security.flatMap((s) => Object.keys(s));
      assert.ok(schemes.includes('RazorpayWebhookSignature'));
    });
  });

  describe('8. Production Access Policy', () => {
    const originalEnv = process.env.NODE_ENV;
    const originalEnable = process.env.ENABLE_API_DOCS;

    it('denies unauthenticated requests in production when ENABLE_API_DOCS is false', async () => {
      process.env.NODE_ENV = 'production';
      delete process.env.ENABLE_API_DOCS;

      const { req, res, getResponse } = createMockHttp();
      await getDocsHandler(req, res);
      const response = getResponse();

      assert.strictEqual(response.statusCode, 403);
      assert.strictEqual(response.body.error, 'DOCS_ACCESS_RESTRICTED');

      // Reset
      process.env.NODE_ENV = originalEnv;
      if (originalEnable) process.env.ENABLE_API_DOCS = originalEnable;
    });

    it('allows access in production if ENABLE_API_DOCS=true', async () => {
      process.env.NODE_ENV = 'production';
      process.env.ENABLE_API_DOCS = 'true';

      const { req, res, getResponse } = createMockHttp();
      await getDocsHandler(req, res);
      const response = getResponse();

      assert.strictEqual(response.statusCode, 200);

      // Reset
      process.env.NODE_ENV = originalEnv;
      if (originalEnable) process.env.ENABLE_API_DOCS = originalEnable;
      else delete process.env.ENABLE_API_DOCS;
    });

    it('allows access in production if authenticated as Super Admin', async () => {
      process.env.NODE_ENV = 'production';
      delete process.env.ENABLE_API_DOCS;

      const { req, res, getResponse } = createMockHttp({
        cookies: { ecom_admin_sess: 'sess_admin_valid12345' },
      });
      await getDocsHandler(req, res);
      const response = getResponse();

      assert.strictEqual(response.statusCode, 200);

      // Reset
      process.env.NODE_ENV = originalEnv;
      if (originalEnable) process.env.ENABLE_API_DOCS = originalEnable;
    });
  });
});
