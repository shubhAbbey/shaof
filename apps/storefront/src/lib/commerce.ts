export interface StorefrontProduct {
  id: string;
  title: string;
  handle: string;
  thumbnail?: string | null;
  categoryName?: string;
  brand?: string;
  price: number;
  originalPrice?: number;
  discountPercentage?: number;
  isNew?: boolean;
  isHot?: boolean;
  inStock?: boolean;
  hasMultipleVariants?: boolean;
  variantsCount?: number;
}

export interface CategoryContext {
  id: string;
  name: string;
  handle: string;
  description?: string;
}

export interface CollectionContext {
  id: string;
  title: string;
  handle: string;
  description?: string;
}

const MEDUSA_BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'http://localhost:9000';
const PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY ||
  'pk_962772bcd68f09b11833d76684644ae47e3f46059f995ff0c5eeba74d0cc01e3';

export interface FetchProductsOptions {
  collectionHandle?: string;
  collectionId?: string;
  categoryHandle?: string;
  categoryId?: string;
  brand?: string;
  onSaleOnly?: boolean;
  limit?: number;
  offset?: number;
  tags?: string[];
}

function getMedusaHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (PUBLISHABLE_KEY) {
    headers['x-publishable-api-key'] = PUBLISHABLE_KEY;
  }
  return headers;
}

/**
 * Resolves a product category by its unique URL handle from Medusa v2 Store API.
 */
export async function fetchCategoryByHandle(handle: string): Promise<CategoryContext | null> {
  try {
    const url = `${MEDUSA_BACKEND_URL}/store/product-categories?handle=${encodeURIComponent(handle)}`;
    const res = await fetch(url, {
      headers: getMedusaHeaders(),
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    const category = data.product_categories?.[0];
    if (!category) {
      return null;
    }

    return {
      id: category.id,
      name: category.name,
      handle: category.handle,
      description: category.description || undefined,
    };
  } catch (err) {
    console.error(`Error resolving category by handle "${handle}":`, err);
    return null;
  }
}

/**
 * Resolves a product collection by its unique URL handle from Medusa v2 Store API.
 */
export async function fetchCollectionByHandle(handle: string): Promise<CollectionContext | null> {
  try {
    const url = `${MEDUSA_BACKEND_URL}/store/collections?handle=${encodeURIComponent(handle)}`;
    const res = await fetch(url, {
      headers: getMedusaHeaders(),
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    const collection = data.collections?.[0];
    if (!collection) {
      return null;
    }

    return {
      id: collection.id,
      title: collection.title,
      handle: collection.handle,
      description: collection.metadata?.description as string | undefined,
    };
  } catch (err) {
    console.error(`Error resolving collection by handle "${handle}":`, err);
    return null;
  }
}

/**
 * Fetches live products from Medusa v2 Store API with Next.js revalidation.
 */
export async function fetchCommerceProducts(
  options: FetchProductsOptions = {}
): Promise<StorefrontProduct[]> {
  const {
    limit = 24,
    offset = 0,
    collectionHandle,
    collectionId,
    categoryHandle,
    categoryId,
    brand,
    onSaleOnly,
  } = options;

  let resolvedCategoryId = categoryId;
  if (!resolvedCategoryId && categoryHandle) {
    const cat = await fetchCategoryByHandle(categoryHandle);
    if (cat) {
      resolvedCategoryId = cat.id;
    } else {
      // If handle specifically requested but not found, return empty results
      return [];
    }
  }

  let resolvedCollectionId = collectionId;
  if (!resolvedCollectionId && collectionHandle) {
    const col = await fetchCollectionByHandle(collectionHandle);
    if (col) {
      resolvedCollectionId = col.id;
    } else {
      // If collection specifically requested but not found, return empty results
      return [];
    }
  }

  const queryParams = new URLSearchParams({
    limit: limit.toString(),
    offset: offset.toString(),
    fields: '*variants,*categories,*collection,*metadata',
  });

  if (resolvedCollectionId) {
    queryParams.append('collection_id', resolvedCollectionId);
  }
  if (resolvedCategoryId) {
    queryParams.append('category_id', resolvedCategoryId);
  }

  const url = `${MEDUSA_BACKEND_URL}/store/products?${queryParams.toString()}`;

  try {
    const res = await fetch(url, {
      headers: getMedusaHeaders(),
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      return [];
    }

    const data = await res.json();
    const rawProducts = data.products || [];

    let mappedProducts: StorefrontProduct[] = rawProducts.map((p: any) => {
      const firstVariant = p.variants?.[0];
      const calcPrice = firstVariant?.calculated_price;
      const rawPrice = firstVariant?.prices?.[0]?.amount;
      
      const price = calcPrice?.calculated_amount ?? rawPrice ?? 1499;
      const originalPrice =
        calcPrice?.original_amount ??
        (p.metadata?.original_price ? Number(p.metadata.original_price) : undefined);

      const discountPercentage =
        originalPrice && originalPrice > price
          ? Math.round(((originalPrice - price) / originalPrice) * 100)
          : undefined;

      const productBrand =
        (p.metadata?.brand as string) ||
        (p.tags?.find((t: any) => t.value?.startsWith('brand:'))?.value?.replace('brand:', '')) ||
        undefined;

      const isNew = Boolean(p.metadata?.is_new);
      const isHot = Boolean(p.metadata?.is_hot);
      const variantsCount = p.variants?.length || 1;
      const hasMultipleVariants = variantsCount > 1;

      return {
        id: p.id,
        title: p.title,
        handle: p.handle,
        thumbnail: p.thumbnail || p.images?.[0]?.url || null,
        categoryName: p.categories?.[0]?.name,
        brand: productBrand,
        price,
        originalPrice,
        discountPercentage,
        isNew,
        isHot,
        inStock: true,
        hasMultipleVariants,
        variantsCount,
      };
    });

    // Optional Brand filter if filtered client-side / metadata
    if (brand) {
      const normalizedBrand = brand.toLowerCase().replace(/-/g, ' ');
      mappedProducts = mappedProducts.filter(
        (p) =>
          p.brand &&
          (p.brand.toLowerCase() === normalizedBrand ||
            p.brand.toLowerCase().replace(/[^a-z0-9]/g, '') ===
              brand.toLowerCase().replace(/[^a-z0-9]/g, ''))
      );
    }

    // Optional Sale filter: products with explicit discounts
    if (onSaleOnly) {
      mappedProducts = mappedProducts.filter(
        (p) => (p.discountPercentage && p.discountPercentage > 0) || (p.originalPrice && p.originalPrice > p.price)
      );
    }

    return mappedProducts;
  } catch (err) {
    console.error('Error fetching commerce products:', err);
    return [];
  }
}
