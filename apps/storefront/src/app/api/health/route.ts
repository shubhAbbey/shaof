import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const response = NextResponse.json({
    status: 'ok',
    service: 'storefront',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
  });
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
  return response;
}
