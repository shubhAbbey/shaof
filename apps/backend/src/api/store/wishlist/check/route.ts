import { MedusaRequest, MedusaResponse } from '@medusajs/framework/http';
import { WISHLIST_MODULE } from '../../../../modules/wishlist';

export async function GET(req: MedusaRequest, res: MedusaResponse): Promise<void> {
  const customerId = (req.query.customer_id as string) || (req.query.customerId as string);
  const variantId = (req.query.variant_id as string) || (req.query.variantId as string);

  if (!customerId || customerId.trim() === '') {
    res.status(200).json({ success: true, isWishlisted: false });
    return;
  }

  // Wishlist presence represents the exact variantId
  if (!variantId || variantId.trim() === '' || variantId.startsWith('prod_')) {
    res.status(200).json({ success: true, isWishlisted: false });
    return;
  }

  try {
    const wishlistService: any = req.scope.resolve(WISHLIST_MODULE);
    
    const matches = await wishlistService.listWishlistItems({
      customer_id: customerId.trim(),
      variant_id: variantId.trim(),
    });

    res.status(200).json({
      success: true,
      isWishlisted: Array.isArray(matches) && matches.length > 0,
    });
  } catch (err: any) {
    console.error('[Medusa Store API] GET /store/wishlist/check error:', err.message);
    res.status(200).json({ success: true, isWishlisted: false });
  }
}
