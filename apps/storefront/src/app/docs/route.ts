import { NextResponse } from 'next/server';

/**
 * GET /docs
 * Redirects developers to the unified Ateevra OpenAPI / Swagger documentation portal.
 */
export async function GET() {
  const backendBase =
    process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'http://localhost:9000';
  const targetUrl = `${backendBase.replace(/\/$/, '')}/docs`;

  return NextResponse.redirect(targetUrl, 307);
}
