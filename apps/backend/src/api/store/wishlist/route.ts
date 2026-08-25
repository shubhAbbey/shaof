import { MedusaRequest, MedusaResponse } from '@medusajs/framework/http';
import { WISHLIST_MODULE } from '../../../modules/wishlist';

export async function GET(req: MedusaRequest, res: MedusaResponse): Promise<void> {
  const customerId = (req.query.customer_id as string) || (req.query.customerId as string);
  if (!customerId || customerId.trim() === '') {
    res.status(400).json({ success: false, error: 'CUSTOMER_ID_REQUIRED', message: 'customer_id query param is required' });
    return;
  }

  try {
    const wishlistService: any = req.scope.resolve(WISHLIST_MODULE);
    const items = await wishlistService.listWishlistItems({ customer_id: customerId.trim() });
    const formattedItems = (items || []).map((item: any) => ({
      id: item.id,
      customerId: item.customer_id,
      productId: item.product_id,
      variantId: item.variant_id || undefined,
      title: item.title,
      handle: item.handle || undefined,
      thumbnail: item.thumbnail || undefined,
      price: item.price ? Number(item.price) : undefined,
      originalPrice: item.original_price ? Number(item.original_price) : undefined,
      currencyCode: item.currency_code || 'inr',
      inStock: item.in_stock !== false,
      options: item.options || undefined,
      createdAt: item.created_at ? new Date(item.created_at).toISOString() : new Date().toISOString(),
    }));

    res.status(200).json({
      success: true,
      wishlist: {
        customerId: customerId.trim(),
        items: formattedItems,
        itemCount: formattedItems.length,
        updatedAt: new Date().toISOString(),
      },
    });
  } catch (err: any) {
    console.error('[Medusa Store API] GET /store/wishlist error:', err.message);
    res.status(500).json({ success: false, error: 'WISHLIST_QUERY_FAILED', message: err.message });
  }
}

export async function POST(req: MedusaRequest, res: MedusaResponse): Promise<void> {
  const body = req.body as any;
  const customerId = body.customer_id || body.customerId;
  const productId = body.product_id || body.productId;
  const variantId = body.variant_id || body.variantId;

  if (!customerId || typeof customerId !== 'string' || customerId.trim() === '') {
    res.status(400).json({ success: false, error: 'CUSTOMER_ID_REQUIRED', message: 'customer_id is required' });
    return;
  }
  if (!productId || typeof productId !== 'string' || productId.trim() === '') {
    res.status(400).json({ success: false, error: 'PRODUCT_ID_REQUIRED', message: 'product_id is required' });
    return;
  }
  if (!variantId || typeof variantId !== 'string' || variantId.trim() === '') {
    res.status(400).json({ success: false, error: 'VARIANT_ID_REQUIRED', message: 'variant_id is required' });
    return;
  }
  if (variantId.startsWith('prod_')) {
    res.status(400).json({ success: false, error: 'INVALID_VARIANT_ID', message: 'variant_id cannot be a product ID' });
    return;
  }

  try {
    const wishlistService: any = req.scope.resolve(WISHLIST_MODULE);
    
    // Check for existing record with same customer_id and variant_id
    const existing = await wishlistService.listWishlistItems({
      customer_id: customerId.trim(),
      variant_id: variantId.trim(),
    });

    let item: any;
    let isNew = false;

    if (existing && existing.length > 0) {
      item = existing[0];
      isNew = false;
      if (body.options || body.title || body.price) {
        item = await wishlistService.updateWishlistItems({
          id: item.id,
          options: body.options || item.options,
          title: body.title || item.title,
          price: body.price ? Number(body.price) : item.price,
          in_stock: body.in_stock !== false && body.inStock !== false,
        });
      }
    } else {
      const [created] = await wishlistService.createWishlistItems([
        {
          customer_id: customerId.trim(),
          product_id: productId.trim(),
          variant_id: variantId.trim(),
          title: body.title || 'Product',
          handle: body.handle || null,
          thumbnail: body.thumbnail || null,
          price: body.price ? Number(body.price) : null,
          original_price: body.original_price || body.originalPrice ? Number(body.original_price || body.originalPrice) : null,
          currency_code: body.currency_code || body.currencyCode || 'inr',
          in_stock: body.in_stock !== false && body.inStock !== false,
          options: body.options || null,
        },
      ]);
      item = created;
      isNew = true;
    }

    const allItems = await wishlistService.listWishlistItems({ customer_id: customerId.trim() });
    const formattedItems = (allItems || []).map((i: any) => ({
      id: i.id,
      customerId: i.customer_id,
      productId: i.product_id,
      variantId: i.variant_id || undefined,
      title: i.title,
      handle: i.handle || undefined,
      thumbnail: i.thumbnail || undefined,
      price: i.price ? Number(i.price) : undefined,
      originalPrice: i.original_price ? Number(i.original_price) : undefined,
      currencyCode: i.currency_code || 'inr',
      inStock: i.in_stock !== false,
      options: i.options || undefined,
      createdAt: i.created_at ? new Date(i.created_at).toISOString() : new Date().toISOString(),
    }));

    res.status(200).json({
      success: true,
      isNew,
      item: {
        id: item.id,
        customerId: item.customer_id,
        productId: item.product_id,
        variantId: item.variant_id || undefined,
        title: item.title,
        handle: item.handle || undefined,
        thumbnail: item.thumbnail || undefined,
        price: item.price ? Number(item.price) : undefined,
        originalPrice: item.original_price ? Number(item.original_price) : undefined,
        currencyCode: item.currency_code || 'inr',
        inStock: item.in_stock !== false,
        options: item.options || undefined,
        createdAt: item.created_at ? new Date(item.created_at).toISOString() : new Date().toISOString(),
      },
      wishlist: {
        customerId: customerId.trim(),
        items: formattedItems,
        itemCount: formattedItems.length,
        updatedAt: new Date().toISOString(),
      },
    });
  } catch (err: any) {
    console.error('[Medusa Store API] POST /store/wishlist error:', err.message);
    res.status(500).json({ success: false, error: 'WISHLIST_ADD_FAILED', message: err.message });
  }
}
