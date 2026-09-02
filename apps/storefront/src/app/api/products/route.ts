import { NextRequest, NextResponse } from 'next/server';
import { fetchPlpProducts } from '../../../lib/commerce';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  const q = searchParams.get('q') || searchParams.get('query') || undefined;
  const categoryHandle = searchParams.get('categoryHandle') || searchParams.get('category') || undefined;
  const collectionHandle = searchParams.get('collectionHandle') || searchParams.get('collection') || undefined;
  const brand = searchParams.get('brand') || undefined;
  const brandsParam = searchParams.get('brands');
  const brands = brandsParam ? brandsParam.split(',').filter(Boolean) : brand ? [brand] : [];

  const size = searchParams.get('size') || undefined;
  const sizesParam = searchParams.get('sizes');
  const sizes = sizesParam ? sizesParam.split(',').filter(Boolean) : size ? [size] : [];

  const color = searchParams.get('color') || undefined;
  const colorsParam = searchParams.get('colors');
  const colors = colorsParam ? colorsParam.split(',').filter(Boolean) : color ? [color] : [];

  const priceMinParam = searchParams.get('price_min') || searchParams.get('priceMin');
  const priceMaxParam = searchParams.get('price_max') || searchParams.get('priceMax');
  const priceMin = priceMinParam ? Number(priceMinParam) : undefined;
  const priceMax = priceMaxParam ? Number(priceMaxParam) : undefined;

  const inStockParam = searchParams.get('in_stock') || searchParams.get('inStock');
  const inStock = inStockParam !== null ? inStockParam === 'true' : undefined;

  const onSaleOnly = searchParams.get('sale') === 'true' || searchParams.get('onSaleOnly') === 'true';
  const sort = (searchParams.get('sort') as any) || 'relevance';

  const limitParam = searchParams.get('limit');
  const limit = limitParam ? Number(limitParam) : 24;

  const offsetParam = searchParams.get('offset');
  const offset = offsetParam ? Number(offsetParam) : 0;

  try {
    const result = await fetchPlpProducts({
      q,
      categoryHandle,
      collectionHandle,
      brands,
      sizes,
      colors,
      priceMin,
      priceMax,
      inStock,
      onSaleOnly,
      sort,
      limit,
      offset,
    });

    const response = NextResponse.json(result);
    response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
    return response;
  } catch (error: any) {
    console.error('API /api/products error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products', message: error?.message || 'Unknown error' },
      { status: 500 }
    );
  }
}
