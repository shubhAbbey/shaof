export interface StorefrontProduct {
  id: string;
  title: string;
  handle: string;
  thumbnail?: string | null;
  categoryName?: string;
  categoryHandle?: string;
  brand?: string;
  price: number;
  originalPrice?: number;
  discountPercentage?: number;
  isNew?: boolean;
  isHot?: boolean;
  inStock?: boolean;
  hasMultipleVariants?: boolean;
  variantsCount?: number;
  sizes?: string[];
  colors?: string[];
  createdAt?: string;
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

export interface FacetItem {
  value: string;
  label: string;
  count?: number;
}

export interface ProductFacets {
  brands: FacetItem[];
  sizes: FacetItem[];
  colors: FacetItem[];
  categories?: FacetItem[];
  priceRange: { min: number; max: number };
}

export interface PlpFilterOptions {
  categoryHandle?: string;
  categoryId?: string;
  collectionHandle?: string;
  collectionId?: string;
  brands?: string[];
  brand?: string;
  sizes?: string[];
  size?: string;
  colors?: string[];
  color?: string;
  priceMin?: number;
  priceMax?: number;
  inStock?: boolean;
  onSaleOnly?: boolean;
  sort?: 'relevance' | 'price_asc' | 'price_desc' | 'newest';
  limit?: number;
  offset?: number;
}

export interface FetchPlpResult {
  products: StorefrontProduct[];
  totalCount: number;
  hasMore: boolean;
  nextOffset?: number;
  facets: ProductFacets;
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
 * Helper to map raw Medusa product entity to unified StorefrontProduct DTO.
 */
function mapMedusaProductToStorefront(p: any): StorefrontProduct {
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

  // Extract all sizes and colors across options and variants
  const sizesSet = new Set<string>();
  const colorsSet = new Set<string>();

  // Check product options
  if (Array.isArray(p.options)) {
    for (const opt of p.options) {
      const optTitle = (opt.title || '').toLowerCase();
      const vals =
        opt.values?.map((v: any) => (typeof v === 'string' ? v : v.value || v.title || '')) || [];
      if (optTitle.includes('size')) {
        vals.forEach((v: string) => v && sizesSet.add(v));
      } else if (optTitle.includes('color') || optTitle.includes('shade')) {
        vals.forEach((v: string) => v && colorsSet.add(v));
      }
    }
  }

  // Check variant options
  if (Array.isArray(p.variants)) {
    for (const variant of p.variants) {
      if (variant.options) {
        if (typeof variant.options === 'object') {
          for (const [key, val] of Object.entries(variant.options)) {
            const k = key.toLowerCase();
            const strVal = String(val);
            if (k.includes('size')) sizesSet.add(strVal);
            if (k.includes('color') || k.includes('shade')) colorsSet.add(strVal);
          }
        }
      }
    }
  }

  return {
    id: p.id,
    title: p.title,
    handle: p.handle,
    thumbnail: p.thumbnail || p.images?.[0]?.url || null,
    categoryName: p.categories?.[0]?.name,
    categoryHandle: p.categories?.[0]?.handle,
    brand: productBrand,
    price,
    originalPrice,
    discountPercentage,
    isNew,
    isHot,
    inStock: true,
    hasMultipleVariants,
    variantsCount,
    sizes: Array.from(sizesSet),
    colors: Array.from(colorsSet),
    createdAt: p.created_at,
  };
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
      return [];
    }
  }

  let resolvedCollectionId = collectionId;
  if (!resolvedCollectionId && collectionHandle) {
    const col = await fetchCollectionByHandle(collectionHandle);
    if (col) {
      resolvedCollectionId = col.id;
    } else {
      return [];
    }
  }

  const queryParams = new URLSearchParams({
    limit: limit.toString(),
    offset: offset.toString(),
    fields: '*variants.prices,*categories,*collection,+metadata,*tags,*options.values',
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

    let mappedProducts: StorefrontProduct[] = rawProducts.map(mapMedusaProductToStorefront);

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

/**
 * Advanced PLP product querying with faceted filtering, multi-criteria sorting, and pagination.
 */
export async function fetchPlpProducts(
  options: PlpFilterOptions = {}
): Promise<FetchPlpResult> {
  const {
    limit = 24,
    offset = 0,
    collectionHandle,
    collectionId,
    categoryHandle,
    categoryId,
    brands = [],
    brand,
    sizes = [],
    size,
    colors = [],
    color,
    priceMin,
    priceMax,
    inStock,
    onSaleOnly,
    sort = 'relevance',
  } = options;

  let resolvedCategoryId = categoryId;
  if (!resolvedCategoryId && categoryHandle) {
    const cat = await fetchCategoryByHandle(categoryHandle);
    if (cat) {
      resolvedCategoryId = cat.id;
    } else {
      return {
        products: [],
        totalCount: 0,
        hasMore: false,
        facets: { brands: [], sizes: [], colors: [], priceRange: { min: 0, max: 0 } },
      };
    }
  }

  let resolvedCollectionId = collectionId;
  if (!resolvedCollectionId && collectionHandle) {
    const col = await fetchCollectionByHandle(collectionHandle);
    if (col) {
      resolvedCollectionId = col.id;
    } else {
      return {
        products: [],
        totalCount: 0,
        hasMore: false,
        facets: { brands: [], sizes: [], colors: [], priceRange: { min: 0, max: 0 } },
      };
    }
  }

  // Fetch all candidate products for the context (category/collection) to compute facets & filter
  const queryParams = new URLSearchParams({
    limit: '100',
    offset: '0',
    fields: '*variants.prices,*categories,*collection,+metadata,*tags,*options.values',
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
      return {
        products: [],
        totalCount: 0,
        hasMore: false,
        facets: { brands: [], sizes: [], colors: [], priceRange: { min: 0, max: 0 } },
      };
    }

    const data = await res.json();
    const rawProducts = data.products || [];
    const allCandidates: StorefrontProduct[] = rawProducts.map(mapMedusaProductToStorefront);

    // Compute dynamic facets from the candidates
    const brandCounts = new Map<string, number>();
    const sizeCounts = new Map<string, number>();
    const colorCounts = new Map<string, number>();
    let minPrice = Infinity;
    let maxPrice = 0;

    for (const p of allCandidates) {
      if (p.brand) {
        brandCounts.set(p.brand, (brandCounts.get(p.brand) || 0) + 1);
      }
      if (p.sizes) {
        for (const s of p.sizes) {
          sizeCounts.set(s, (sizeCounts.get(s) || 0) + 1);
        }
      }
      if (p.colors) {
        for (const c of p.colors) {
          colorCounts.set(c, (colorCounts.get(c) || 0) + 1);
        }
      }
      if (p.price < minPrice) minPrice = p.price;
      if (p.price > maxPrice) maxPrice = p.price;
    }

    const facets: ProductFacets = {
      brands: Array.from(brandCounts.entries()).map(([value, count]) => ({
        value,
        label: value,
        count,
      })),
      sizes: Array.from(sizeCounts.entries()).map(([value, count]) => ({
        value,
        label: value,
        count,
      })),
      colors: Array.from(colorCounts.entries()).map(([value, count]) => ({
        value,
        label: value,
        count,
      })),
      priceRange: {
        min: minPrice === Infinity ? 0 : minPrice,
        max: maxPrice === 0 ? 10000 : maxPrice,
      },
    };

    // Normalize active filter arrays
    const activeBrands = [...brands, ...(brand ? [brand] : [])].map((b) => b.toLowerCase().trim());
    const activeSizes = [...sizes, ...(size ? [size] : [])].map((s) => s.toLowerCase().trim());
    const activeColors = [...colors, ...(color ? [color] : [])].map((c) => c.toLowerCase().trim());

    // Apply Filter Pipeline
    let filtered = allCandidates.filter((p) => {
      // 1. Brand Filter
      if (activeBrands.length > 0) {
        if (!p.brand) return false;
        const normBrand = p.brand.toLowerCase();
        const brandMatch = activeBrands.some(
          (b) =>
            normBrand === b ||
            normBrand === b.replace(/-/g, ' ') ||
            normBrand.replace(/[^a-z0-9]/g, '') === b.replace(/[^a-z0-9]/g, '')
        );
        if (!brandMatch) return false;
      }

      // 2. Size Filter
      if (activeSizes.length > 0) {
        if (!p.sizes || p.sizes.length === 0) return false;
        const sizeMatch = p.sizes.some((s) => activeSizes.includes(s.toLowerCase().trim()));
        if (!sizeMatch) return false;
      }

      // 3. Color Filter
      if (activeColors.length > 0) {
        if (!p.colors || p.colors.length === 0) return false;
        const colorMatch = p.colors.some((c) =>
          activeColors.some((ac) => c.toLowerCase().includes(ac) || ac.includes(c.toLowerCase()))
        );
        if (!colorMatch) return false;
      }

      // 4. Price Min/Max Filter
      if (priceMin !== undefined && p.price < priceMin) return false;
      if (priceMax !== undefined && p.price > priceMax) return false;

      // 5. In Stock Filter
      if (inStock !== undefined && inStock && p.inStock === false) return false;

      // 6. On Sale Only Filter
      if (onSaleOnly) {
        const isDiscounted = (p.discountPercentage && p.discountPercentage > 0) || (p.originalPrice && p.originalPrice > p.price);
        if (!isDiscounted) return false;
      }

      return true;
    });

    // Apply Sorting
    filtered.sort((a, b) => {
      if (sort === 'price_asc') {
        return a.price - b.price;
      }
      if (sort === 'price_desc') {
        return b.price - a.price;
      }
      if (sort === 'newest') {
        if (a.isNew && !b.isNew) return -1;
        if (!a.isNew && b.isNew) return 1;
        return (b.createdAt || '').localeCompare(a.createdAt || '');
      }
      // 'relevance' (default)
      if (a.isHot && !b.isHot) return -1;
      if (!a.isHot && b.isHot) return 1;
      return 0;
    });

    const totalCount = filtered.length;
    const pageProducts = filtered.slice(offset, offset + limit);
    const hasMore = offset + limit < totalCount;
    const nextOffset = hasMore ? offset + limit : undefined;

    return {
      products: pageProducts,
      totalCount,
      hasMore,
      nextOffset,
      facets,
    };
  } catch (err) {
    console.error('Error in fetchPlpProducts:', err);
    return {
      products: [],
      totalCount: 0,
      hasMore: false,
      facets: { brands: [], sizes: [], colors: [], priceRange: { min: 0, max: 0 } },
    };
  }
}
