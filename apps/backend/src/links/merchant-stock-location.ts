import { defineLink } from '@medusajs/framework/utils';
import MarketplaceModule from '../modules/marketplace';
import StockLocationModule from '@medusajs/medusa/stock-location';

/**
 * Medusa v2 Module Link: Merchant <-> StockLocation
 * Connects merchants to their authorized warehouses and stock locations
 * without altering core Medusa location tables.
 */
export default defineLink(
  MarketplaceModule.linkable.merchant,
  StockLocationModule.linkable.stockLocation
);
