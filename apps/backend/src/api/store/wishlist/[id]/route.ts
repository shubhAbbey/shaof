import { MedusaRequest, MedusaResponse } from '@medusajs/framework/http';
import { WISHLIST_MODULE } from '../../../../modules/wishlist';

export async function DELETE(req: MedusaRequest, res: MedusaResponse): Promise<void> {
  const idOrVariantId = req.params.id;
  const customerId = (req.query.customer_id as string) || (req.query.customerId as string);

  if (!idOrVariantId || idOrVariantId.trim() === '') {
    res.status(400).json({ success: false, error: 'ITEM_ID_REQUIRED', message: 'Item ID or Variant ID is required' });
    return;
  }

  try {
    const wishlistService: any = req.scope.resolve(WISHLIST_MODULE);
    let targetId = idOrVariantId.trim();

    if (customerId) {
      const items = await wishlistService.listWishlistItems({
        customer_id: customerId.trim(),
      });
      // Match strictly by item primary key id or variant_id (never generic product_id)
      const match = (items || []).find((i: any) => i.id === targetId || i.variant_id === targetId);
      if (match) {
        targetId = match.id;
        await wishlistService.deleteWishlistItems([targetId]);
      } else {
        // Safe idempotent removal
        res.status(200).json({
          success: true,
          removed: false,
          message: 'Item not found in wishlist',
        });
        return;
      }
    } else {
      await wishlistService.deleteWishlistItems([targetId]);
    }

    let remainingItems: any[] = [];
    if (customerId) {
      const allItems = await wishlistService.listWishlistItems({ customer_id: customerId.trim() });
      remainingItems = (allItems || []).map((i: any) => ({
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
    }

    res.status(200).json({
      success: true,
      removed: true,
      wishlist: customerId
        ? {
            customerId: customerId.trim(),
            items: remainingItems,
            itemCount: remainingItems.length,
            updatedAt: new Date().toISOString(),
          }
        : undefined,
    });
  } catch (err: any) {
    console.error('[Medusa Store API] DELETE /store/wishlist/:id error:', err.message);
    res.status(500).json({ success: false, error: 'WISHLIST_REMOVE_FAILED', message: err.message });
  }
}
