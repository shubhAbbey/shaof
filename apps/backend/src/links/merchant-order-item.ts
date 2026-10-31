import { defineLink } from '@medusajs/framework/utils';
import MarketplaceModule from '../modules/marketplace';
import OrderModule from '@medusajs/medusa/order';

/**
 * Medusa v2 Module Link: Merchant <-> OrderLineItem
 * Binds individual order line items to merchants in mixed-merchant customer orders
 * without altering core Medusa order tables.
 */
export default defineLink(
  MarketplaceModule.linkable.merchant,
  {
    linkable: OrderModule.linkable.orderLineItem,
    isList: true,
  }
);
