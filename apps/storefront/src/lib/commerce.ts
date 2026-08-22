export interface StorefrontProduct {
  id: string;
  title: string;
  handle: string;
  thumbnail?: string | null;
  categoryName?: string;
  price: number;
  originalPrice?: number;
  discountPercentage?: number;
  isNew?: boolean;
  isHot?: boolean;
}

const MEDUSA_BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'http://localhost:9000';
const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY;

export interface FetchProductsOptions {
  collectionHandle?: string;
  categoryHandle?: string;
  limit?: number;
  tags?: string[];
}

/**
 * Fetches live products from Medusa v2 Store API with Next.js revalidation.
 */
export async function fetchCommerceProducts(
  options: FetchProductsOptions = {}
): Promise<StorefrontProduct[]> {
  const { limit = 8, collectionHandle, categoryHandle } = options;

  const queryParams = new URLSearchParams({
    limit: limit.toString(),
    fields: 'id,title,handle,thumbnail,categories.name,variants.calculated_price',
  });

  if (collectionHandle) {
    queryParams.append('collection_id', collectionHandle);
  }
  if (categoryHandle) {
    queryParams.append('category_id', categoryHandle);
  }

  const url = `${MEDUSA_BACKEND_URL}/store/products?${queryParams.toString()}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (PUBLISHABLE_KEY) {
    headers['x-publishable-api-key'] = PUBLISHABLE_KEY;
  }

  try {
    const res = await fetch(url, {
      headers,
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      // Fallback gracefully on Medusa unseeded or missing publishable key without throwing
      return [];
    }

    const data = await res.json();
    const rawProducts = data.products || [];

    return rawProducts.map((p: any) => {
      const firstVariant = p.variants?.[0];
      const calcPrice = firstVariant?.calculated_price;
      const price = calcPrice?.calculated_amount ?? 1499;
      const originalPrice = calcPrice?.original_amount;
      const discountPercentage =
        originalPrice && originalPrice > price
          ? Math.round(((originalPrice - price) / originalPrice) * 100)
          : undefined;

      return {
        id: p.id,
        title: p.title,
        handle: p.handle,
        thumbnail: p.thumbnail || p.images?.[0]?.url || null,
        categoryName: p.categories?.[0]?.name,
        price,
        originalPrice,
        discountPercentage,
      };
    });
  } catch {
    // Return empty array on network/connection failure for error isolation
    return [];
  }
}
