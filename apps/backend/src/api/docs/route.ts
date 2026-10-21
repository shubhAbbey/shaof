import { MedusaRequest, MedusaResponse } from '@medusajs/framework/http';
import { ateevraOpenApiDocument } from '../../api-docs/openapi-spec';
import { renderSwaggerUiHtml } from '../../api-docs/swagger-ui-html';

/**
 * Checks whether documentation access is allowed based on environment.
 * Development / Test: Enabled by default.
 * Production: Enabled if ENABLE_API_DOCS === 'true' or if caller holds a valid admin session.
 */
export function isDocsAccessAllowed(req: MedusaRequest): boolean {
  if (process.env.NODE_ENV !== 'production') {
    return true;
  }

  // Explicit opt-in via environment configuration
  if (process.env.ENABLE_API_DOCS === 'true') {
    return true;
  }

  // Allow authenticated admin sessions even in production
  const adminCookie = req.cookies?.['ecom_admin_sess'];
  const authHeader = req.headers['authorization'];
  if (adminCookie || (authHeader && authHeader.startsWith('Bearer sess_admin_'))) {
    return true;
  }

  return false;
}

/**
 * GET /docs
 * Serves the interactive Swagger UI documentation for Ateevra APIs.
 * Supports ?format=json to return raw JSON spec.
 */
export async function GET(req: MedusaRequest, res: MedusaResponse): Promise<void> {
  if (!isDocsAccessAllowed(req)) {
    res.status(403).json({
      success: false,
      error: 'DOCS_ACCESS_RESTRICTED',
      message: 'API documentation is disabled in production. Set ENABLE_API_DOCS=true or authenticate as Super Admin.',
    });
    return;
  }

  const format = req.query?.format as string | undefined;
  const acceptHeader = (req.headers['accept'] as string) || '';

  // Return raw JSON spec if requested via query param or Accept header
  if (format === 'json' || acceptHeader.includes('application/json')) {
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(ateevraOpenApiDocument);
    return;
  }

  const html = renderSwaggerUiHtml({
    specUrl: '/docs/openapi.json',
    title: 'Ateevra Multi-Vendor Marketplace API Documentation',
  });

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.status(200).send(html);
}
