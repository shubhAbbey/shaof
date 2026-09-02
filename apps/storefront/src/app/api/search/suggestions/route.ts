import { NextRequest, NextResponse } from 'next/server';
import { getSearchProvider } from '../../../../lib/search';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const q = searchParams.get('q') || searchParams.get('query') || '';
  const categoryHandle = searchParams.get('categoryHandle') || searchParams.get('category') || undefined;
  const brand = searchParams.get('brand') || undefined;
  const limitParam = searchParams.get('limit');
  const limit = limitParam ? Number(limitParam) : 6;

  try {
    const searchProvider = getSearchProvider();
    const suggestionsResult = await searchProvider.suggestions(q, {
      limit,
      categoryHandle,
      brand,
    });

    const response = NextResponse.json(suggestionsResult);
    response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
    return response;
  } catch (error: any) {
    console.error('API /api/search/suggestions error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch search suggestions', message: error?.message || 'Unknown error' },
      { status: 500 }
    );
  }
}
