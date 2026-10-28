import { defineLink } from '@medusajs/framework/utils';
import MarketplaceModule from '../modules/marketplace';
import ProductModule from '@medusajs/medusa/product';

/**
 * Medusa v2 Module Link: Merchant <-> Product
 * Connects Marketplace Module Merchant entity to Core Medusa Product entity
 * without mutating core Medusa tables or schemas.
 */
export default defineLink(
  MarketplaceModule.linkable.merchant,
  {
    linkable: ProductModule.linkable.product,
    isList: true,
  }
);
