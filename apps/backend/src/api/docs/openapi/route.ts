import { MedusaRequest, MedusaResponse } from '@medusajs/framework/http';
import { ateevraOpenApiDocument } from '../../../api-docs/openapi-spec';
import { isDocsAccessAllowed } from '../route';

/**
 * GET /docs/openapi
 * Alias endpoint for OpenAPI 3.1.0 specification.
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

  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=300');
  res.status(200).json(ateevraOpenApiDocument);
}
