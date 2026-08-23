import { NextRequest, NextResponse } from 'next/server';
import { fetchProductByHandle } from '../../../../lib/commerce';

export async function GET(
  request: NextRequest,
  { params }: { params: { handle: string } }
) {
  const { handle } = params;

  if (!handle) {
    return NextResponse.json(
      { error: 'Product handle is required' },
      { status: 400 }
    );
  }

  try {
    const product = await fetchProductByHandle(handle);

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found', handle },
        { status: 404 }
      );
    }

    return NextResponse.json(product);
  } catch (error: any) {
    console.error(`API /api/products/${handle} error:`, error);
    return NextResponse.json(
      { error: 'Failed to fetch product detail', message: error?.message || 'Unknown error' },
      { status: 500 }
    );
  }
}
