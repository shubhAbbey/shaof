import { MedusaService } from '@medusajs/framework/utils';
import { WishlistItem } from './models/wishlist-item';

export default class WishlistModuleService extends MedusaService({
  WishlistItem,
}) {}
