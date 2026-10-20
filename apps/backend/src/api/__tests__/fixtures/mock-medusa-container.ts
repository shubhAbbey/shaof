/**
 * Test Fixture: Mock Medusa v2 Container & Services
 *
 * Simulates Medusa v2 dependency injection (req.scope) for unit and route-level tests
 * without requiring a running PostgreSQL container. Emulates native Medusa modules:
 * - ProductModule (createProducts, updateProducts, deleteProducts, createProductVariants)
 * - OrderModule (listOrders, retrieveOrder)
 * - RemoteLink (create, dismiss)
 * - Query Engine (query.graph)
 * - MarketplaceModule (retrieveMerchant, verifyActiveMembership)
 */

import { Modules, ContainerRegistrationKeys } from '@medusajs/framework/utils';
import { MARKETPLACE_MODULE } from '../../../modules/marketplace/index.js';

export interface MockProduct {
  id: string;
  title: string;
  handle: string;
  description?: string;
  status: 'draft' | 'pending_review' | 'approved' | 'rejected' | 'published' | 'archived';
  variants: MockProductVariant[];
  hasOrderHistory?: boolean;
  activeStockQuantity?: number;
  hasPendingReturns?: boolean;
  created_at: string;
  updated_at: string;
}

export interface MockProductVariant {
  id: string;
  product_id: string;
  title: string;
  sku: string;
  prices: Array<{ amount: number; currency_code: string }>;
  options?: Record<string, string>;
  created_at: string;
}

export interface MockOrderLineItem {
  id: string;
  order_id: string;
  product_id: string;
  variant_id: string;
  title: string;
  quantity: number;
  unit_price: number;
  total: number;
  fulfillment_status?: string;
}

export interface MockOrder {
  id: string;
  display_id: number;
  customer_id: string;
  status: string;
  total: number;
  created_at: string;
  items: MockOrderLineItem[];
}

export interface MockRemoteLink {
  marketplace?: { merchant_id: string };
  product?: { product_id: string };
  order?: { order_line_item_id: string };
}

export class MockMedusaContainer {
  public products = new Map<string, MockProduct>();
  public orders = new Map<string, MockOrder>();
  public productLinks = new Map<string, string>(); // productId -> merchantId
  public orderItemLinks = new Map<string, string>(); // orderLineItemId -> merchantId
  public merchants = new Map<string, { id: string; name: string; status: string }>();

  // Flag to simulate link failure for testing compensation rollback
  public failNextLinkCreate = false;

  constructor() {
    this.seedDefaultData();
  }

  seedDefaultData(): void {
    this.products.clear();
    this.orders.clear();
    this.productLinks.clear();
    this.orderItemLinks.clear();
    this.merchants.clear();
    this.failNextLinkCreate = false;

    // Merchants
    this.merchants.set('merch_virasat_heritage', {
      id: 'merch_virasat_heritage',
      name: 'Virasat Heritage',
      status: 'active',
    });
    this.merchants.set('merch_loom_thread', {
      id: 'merch_loom_thread',
      name: 'Loom & Thread',
      status: 'active',
    });
    this.merchants.set('merch_suspended_store', {
      id: 'merch_suspended_store',
      name: 'Suspended Merchant',
      status: 'suspended',
    });

    // Products
    const prod1: MockProduct = {
      id: 'prod_virasat_saree_01',
      title: 'Handloom Banarasi Silk Saree',
      handle: 'handloom-banarasi-silk-saree',
      description: 'Authentic Banarasi silk saree woven by master weavers.',
      status: 'published',
      variants: [
        {
          id: 'var_saree_red',
          product_id: 'prod_virasat_saree_01',
          title: 'Crimson Red / Free Size',
          sku: 'VIRASAT-SAREE-RED',
          prices: [{ amount: 1299900, currency_code: 'inr' }],
          created_at: new Date().toISOString(),
        },
      ],
      hasOrderHistory: true,
      activeStockQuantity: 15,
      hasPendingReturns: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const prod2: MockProduct = {
      id: 'prod_loom_shirt_01',
      title: 'Pure Linen Mandarin Collar Shirt',
      handle: 'pure-linen-mandarin-collar-shirt',
      description: 'Breathable handcrafted linen shirt.',
      status: 'published',
      variants: [
        {
          id: 'var_shirt_white_m',
          product_id: 'prod_loom_shirt_01',
          title: 'White / M',
          sku: 'LOOM-SHIRT-WHT-M',
          prices: [{ amount: 249900, currency_code: 'inr' }],
          created_at: new Date().toISOString(),
        },
      ],
      hasOrderHistory: false,
      activeStockQuantity: 0,
      hasPendingReturns: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const prod3: MockProduct = {
      id: 'prod_loom_shirt_with_stock',
      title: 'Pure Linen Casual Shirt with Stock',
      handle: 'pure-linen-casual-shirt-stock',
      description: 'Linen shirt with active stock in warehouse.',
      status: 'published',
      variants: [
        {
          id: 'var_shirt_blue_l',
          product_id: 'prod_loom_shirt_with_stock',
          title: 'Navy Blue / L',
          sku: 'LOOM-SHIRT-BLU-L',
          prices: [{ amount: 249900, currency_code: 'inr' }],
          created_at: new Date().toISOString(),
        },
      ],
      hasOrderHistory: false,
      activeStockQuantity: 25,
      hasPendingReturns: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    this.products.set(prod1.id, prod1);
    this.products.set(prod2.id, prod2);
    this.products.set(prod3.id, prod3);

    // Module Links: Product <-> Merchant
    this.productLinks.set(prod1.id, 'merch_virasat_heritage');
    this.productLinks.set(prod2.id, 'merch_loom_thread');
    this.productLinks.set(prod3.id, 'merch_loom_thread');

    // Orders
    const mixedOrder: MockOrder = {
      id: 'order_mixed_1001',
      display_id: 1001,
      customer_id: 'cus_priya_sharma',
      status: 'pending',
      total: 1549800,
      created_at: new Date().toISOString(),
      items: [
        {
          id: 'item_saree_01',
          order_id: 'order_mixed_1001',
          product_id: 'prod_virasat_saree_01',
          variant_id: 'var_saree_red',
          title: 'Handloom Banarasi Silk Saree',
          quantity: 1,
          unit_price: 1299900,
          total: 1299900,
          fulfillment_status: 'not_fulfilled',
        },
        {
          id: 'item_shirt_01',
          order_id: 'order_mixed_1001',
          product_id: 'prod_loom_shirt_01',
          variant_id: 'var_shirt_white_m',
          title: 'Pure Linen Mandarin Collar Shirt',
          quantity: 1,
          unit_price: 249900,
          total: 249900,
          fulfillment_status: 'not_fulfilled',
        },
      ],
    };

    const virasatOrder: MockOrder = {
      id: 'order_virasat_2001',
      display_id: 2001,
      customer_id: 'cus_arun_kumar',
      status: 'completed',
      total: 1299900,
      created_at: new Date().toISOString(),
      items: [
        {
          id: 'item_saree_02',
          order_id: 'order_virasat_2001',
          product_id: 'prod_virasat_saree_01',
          variant_id: 'var_saree_red',
          title: 'Handloom Banarasi Silk Saree',
          quantity: 1,
          unit_price: 1299900,
          total: 1299900,
          fulfillment_status: 'fulfilled',
        },
      ],
    };

    this.orders.set(mixedOrder.id, mixedOrder);
    this.orders.set(virasatOrder.id, virasatOrder);

    // Module Links: OrderLineItem <-> Merchant
    this.orderItemLinks.set('item_saree_01', 'merch_virasat_heritage');
    this.orderItemLinks.set('item_shirt_01', 'merch_loom_thread');
    this.orderItemLinks.set('item_saree_02', 'merch_virasat_heritage');
  }

  // --- Mock Services for Container Resolution ---

  getProductModule() {
    return {
      listProducts: async (filters: any = {}) => {
        let list = Array.from(this.products.values());
        if (filters.id) {
          const ids = Array.isArray(filters.id) ? filters.id : [filters.id];
          list = list.filter((p) => ids.includes(p.id));
        }
        return list;
      },
      retrieveProduct: async (id: string) => {
        const prod = this.products.get(id);
        if (!prod) throw new Error(`Product with ID '${id}' was not found.`);
        return prod;
      },
      createProducts: async (data: any[]) => {
        const created: MockProduct[] = [];
        for (const item of data) {
          const id = 'prod_' + Math.random().toString(36).substring(2, 10);
          const handle =
            item.handle ||
            item.title
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, '-')
              .replace(/^-|-$/g, '');
          const newProd: MockProduct = {
            id,
            title: item.title,
            handle,
            description: item.description || '',
            status: item.status || 'draft',
            variants: [],
            hasOrderHistory: false,
            activeStockQuantity: 0,
            hasPendingReturns: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          this.products.set(id, newProd);
          created.push(newProd);
        }
        return created;
      },
      updateProducts: async (data: any[]) => {
        const updated: MockProduct[] = [];
        for (const item of data) {
          const existing = this.products.get(item.id);
          if (!existing) throw new Error(`Product with ID '${item.id}' was not found.`);
          const updatedProd: MockProduct = {
            ...existing,
            ...item,
            updated_at: new Date().toISOString(),
          };
          this.products.set(item.id, updatedProd);
          updated.push(updatedProd);
        }
        return updated;
      },
      deleteProducts: async (ids: string[]) => {
        for (const id of ids) {
          this.products.delete(id);
          this.productLinks.delete(id);
        }
      },
      createProductVariants: async (data: any[]) => {
        const createdVariants: MockProductVariant[] = [];
        for (const item of data) {
          const product = this.products.get(item.product_id);
          if (!product) throw new Error(`Product '${item.product_id}' not found`);
          const variantId = 'var_' + Math.random().toString(36).substring(2, 10);
          const newVariant: MockProductVariant = {
            id: variantId,
            product_id: item.product_id,
            title: item.title,
            sku: item.sku,
            prices: item.prices || [{ amount: item.price || 0, currency_code: 'inr' }],
            options: item.options,
            created_at: new Date().toISOString(),
          };
          product.variants.push(newVariant);
          createdVariants.push(newVariant);
        }
        return createdVariants;
      },
    };
  }

  getOrderModule() {
    return {
      listOrders: async () => {
        return Array.from(this.orders.values());
      },
      retrieveOrder: async (id: string) => {
        const order = this.orders.get(id);
        if (!order) throw new Error(`Order with ID '${id}' was not found.`);
        return order;
      },
    };
  }

  getRemoteLink() {
    return {
      create: async (links: any[]) => {
        if (this.failNextLinkCreate) {
          this.failNextLinkCreate = false;
          throw new Error('SIMULATED_LINK_FAILURE: Database connection dropped during link insertion.');
        }

        for (const link of links) {
          const merchantId = link[MARKETPLACE_MODULE]?.merchant_id;
          const productId = link[Modules.PRODUCT]?.product_id;
          const orderItemId = link[Modules.ORDER]?.order_line_item_id;

          if (merchantId && productId) {
            this.productLinks.set(productId, merchantId);
          }
          if (merchantId && orderItemId) {
            this.orderItemLinks.set(orderItemId, merchantId);
          }
        }
      },
      dismiss: async (links: any[]) => {
        for (const link of links) {
          const productId = link[Modules.PRODUCT]?.product_id;
          if (productId) {
            this.productLinks.delete(productId);
          }
        }
      },
    };
  }

  getQuery() {
    return {
      graph: async (params: { entity: string; fields: string[]; filters?: any }) => {
        if (params.entity === 'product') {
          let list = Array.from(this.products.values()).map((p) => {
            const merchantId = this.productLinks.get(p.id);
            const merchant = merchantId ? this.merchants.get(merchantId) : undefined;
            return {
              ...p,
              merchant: merchant ? { id: merchant.id, name: merchant.name } : null,
              merchant_id: merchantId || null,
            };
          });

          if (params.filters?.id) {
            const ids = Array.isArray(params.filters.id) ? params.filters.id : [params.filters.id];
            list = list.filter((p) => ids.includes(p.id));
          }

          if (params.filters?.merchant?.id) {
            list = list.filter((p) => p.merchant_id === params.filters.merchant.id);
          }

          return { data: list };
        }

        if (params.entity === 'order') {
          let list = Array.from(this.orders.values()).map((order) => {
            const mappedItems = order.items.map((item) => {
              const merchantId = this.orderItemLinks.get(item.id);
              const merchant = merchantId ? this.merchants.get(merchantId) : undefined;
              return {
                ...item,
                merchant: merchant ? { id: merchant.id, name: merchant.name } : null,
                merchant_id: merchantId || null,
              };
            });

            return {
              ...order,
              items: mappedItems,
            };
          });

          if (params.filters?.id) {
            const ids = Array.isArray(params.filters.id) ? params.filters.id : [params.filters.id];
            list = list.filter((o) => ids.includes(o.id));
          }

          return { data: list };
        }

        return { data: [] };
      },
    };
  }

  getMarketplaceService() {
    return {
      retrieveMerchant: async (id: string) => {
        const m = this.merchants.get(id);
        if (!m) throw new Error(`Merchant '${id}' not found`);
        return m;
      },
      verifyActiveMembership: async (userId: string, merchantId: string) => {
        const m = this.merchants.get(merchantId);
        if (!m || m.status !== 'active') {
          return { valid: false, statusCode: 403, message: 'Merchant account is not active' };
        }
        return { valid: true, statusCode: 200, role: 'owner' };
      },
    };
  }

  resolve(token: any): any {
    if (token === Modules.PRODUCT) return this.getProductModule();
    if (token === Modules.ORDER) return this.getOrderModule();
    if (token === ContainerRegistrationKeys.REMOTE_LINK || token === 'remoteLink')
      return this.getRemoteLink();
    if (token === ContainerRegistrationKeys.QUERY || token === 'query') return this.getQuery();
    if (token === MARKETPLACE_MODULE || token === 'marketplace')
      return this.getMarketplaceService();
    return null;
  }
}
