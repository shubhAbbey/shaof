import { Pool, PoolClient } from 'pg';
import { BackendMarketplaceGuard } from './ownership-guard';
import type {
  MerchantInventoryItemDto,
  InventorySummaryDto,
  InventoryAdjustmentResultDto,
} from '@ecom/types';

export class InventoryService {
  private static pool: Pool | null = null;

  public static getPool(): Pool {
    if (!this.pool) {
      this.pool = new Pool({
        connectionString:
          process.env.DATABASE_URL ||
          'postgres://postgres:postgres_secure_password@localhost:5432/medusa_db',
        max: 10,
        idleTimeoutMillis: 30000,
      });
    }
    return this.pool;
  }

  /**
   * For testing or teardown: closes the pool.
   */
  public static async closePool(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
    }
  }

  /**
   * Executes a database operation within a transaction with an advisory transaction lock.
   */
  public static async withAdvisoryLock<T>(
    lockKey: string,
    operation: (client: PoolClient) => Promise<T>
  ): Promise<T> {
    const client = await this.getPool().connect();
    try {
      await client.query('BEGIN');
      // Acquire 64-bit advisory transaction lock on hash of lockKey
      await client.query('SELECT pg_advisory_xact_lock(hashtext($1))', [lockKey]);
      const result = await operation(client);
      await client.query('COMMIT');
      return result;
    } catch (err) {
      await client.query('ROLLBACK').catch(() => {});
      throw err;
    } finally {
      client.release();
    }
  }

  /**
   * Returns stock locations accessible to the given merchant.
   * If explicit locations are assigned in `marketplace_merchant_stock_location_stock_location`, returns those.
   * Otherwise returns all active platform fulfillment locations.
   */
  public static async getMerchantStockLocations(
    merchantId: string
  ): Promise<Array<{ id: string; name: string; is_default: boolean }>> {
    const pool = this.getPool();

    // 1. Check explicit merchant-location assignments
    const assignedRes = await pool.query(
      `SELECT sl.id, sl.name, false as is_default
       FROM marketplace_merchant_stock_location_stock_location msl
       JOIN stock_location sl ON sl.id = msl.stock_location_id
       WHERE msl.merchant_id = $1 AND sl.deleted_at IS NULL
       ORDER BY sl.name ASC`,
      [merchantId]
    );

    if (assignedRes.rows.length > 0) {
      return assignedRes.rows.map((r, index) => ({
        id: r.id,
        name: r.name,
        is_default: index === 0,
      }));
    }

    // 2. If no explicit assignment, return default active stock locations
    const defaultRes = await pool.query(
      `SELECT sl.id, sl.name
       FROM stock_location sl
       WHERE sl.deleted_at IS NULL
       ORDER BY sl.created_at ASC`
    );

    return defaultRes.rows.map((r, index) => ({
      id: r.id,
      name: r.name,
      is_default: index === 0,
    }));
  }

  /**
   * Asserts whether a merchant has access to a specific stock location.
   */
  public static async assertMerchantCanAccessLocation(
    merchantId: string,
    locationId: string
  ): Promise<boolean> {
    const locations = await this.getMerchantStockLocations(merchantId);
    return locations.some((loc) => loc.id === locationId);
  }

  /**
   * Checks whether an inventory item belongs to a product owned by the given merchant.
   */
  public static async assertMerchantOwnsInventoryItem(
    merchantId: string,
    inventoryItemId: string
  ): Promise<{
    owned: boolean;
    productId?: string;
    variantId?: string;
    productTitle?: string;
    variantTitle?: string;
    sku?: string;
  }> {
    const pool = this.getPool();
    const res = await pool.query(
      `SELECT 
        mpp.merchant_id,
        p.id as product_id,
        p.title as product_title,
        pv.id as variant_id,
        pv.title as variant_title,
        pv.sku as variant_sku
       FROM inventory_item ii
       JOIN product_variant_inventory_item pvii ON pvii.inventory_item_id = ii.id
       JOIN product_variant pv ON pv.id = pvii.variant_id
       JOIN product p ON p.id = pv.product_id
       LEFT JOIN marketplace_merchant_product_product mpp ON mpp.product_id = p.id
       WHERE ii.id = $1`,
      [inventoryItemId]
    );

    if (res.rows.length === 0) {
      return { owned: false };
    }

    const row = res.rows[0];
    const isOwner = row.merchant_id === merchantId;
    return {
      owned: isOwner,
      productId: row.product_id,
      variantId: row.variant_id,
      productTitle: row.product_title,
      variantTitle: row.variant_title,
      sku: row.variant_sku,
    };
  }

  /**
   * Queries merchant-scoped inventory with stock levels, available calculation, low stock flags,
   * search and status filters, and summary aggregates.
   */
  public static async getMerchantInventory(
    merchantId: string,
    options: {
      locationId?: string;
      search?: string;
      lowStockOnly?: boolean;
      status?: 'in_stock' | 'low_stock' | 'out_of_stock';
    } = {}
  ): Promise<{
    summary: InventorySummaryDto;
    items: MerchantInventoryItemDto[];
  }> {
    const pool = this.getPool();

    // Query all product variants owned by the merchant, joining inventory item and inventory levels
    const query = `
      SELECT 
        mpp.merchant_id,
        p.id as product_id,
        p.title as product_title,
        pv.id as variant_id,
        pv.title as variant_title,
        pv.sku as variant_sku,
        ii.id as inventory_item_id,
        ii.sku as inventory_sku,
        il.id as level_id,
        il.location_id,
        sl.name as location_name,
        COALESCE(CAST(il.stocked_quantity AS INTEGER), 0) as stocked_quantity,
        COALESCE(CAST(il.reserved_quantity AS INTEGER), 0) as reserved_quantity,
        il.updated_at as level_updated_at
      FROM marketplace_merchant_product_product mpp
      JOIN product p ON p.id = mpp.product_id AND p.deleted_at IS NULL
      JOIN product_variant pv ON pv.product_id = p.id AND pv.deleted_at IS NULL
      LEFT JOIN product_variant_inventory_item pvii ON pvii.variant_id = pv.id
      LEFT JOIN inventory_item ii ON ii.id = pvii.inventory_item_id
      LEFT JOIN inventory_level il ON il.inventory_item_id = ii.id
      LEFT JOIN stock_location sl ON sl.id = il.location_id AND sl.deleted_at IS NULL
      WHERE mpp.merchant_id = $1
      ORDER BY p.title ASC, pv.title ASC
    `;

    const res = await pool.query(query, [merchantId]);
    const accessibleLocations = await this.getMerchantStockLocations(merchantId);
    const defaultLocation = accessibleLocations[0];

    const rawItems: MerchantInventoryItemDto[] = [];

    for (const r of res.rows) {
      const stocked = r.stocked_quantity || 0;
      const reserved = r.reserved_quantity || 0;
      const available = Math.max(0, stocked - reserved);
      const isLowStock = available <= 10;

      const item: MerchantInventoryItemDto = {
        id: r.inventory_item_id || `unlinked_${r.variant_id}`,
        inventoryItemId: r.inventory_item_id || null,
        inventory_item_id: r.inventory_item_id || null,
        variantId: r.variant_id,
        variant_id: r.variant_id,
        productId: r.product_id,
        product_id: r.product_id,
        productTitle: r.product_title,
        product_title: r.product_title,
        variantTitle: r.variant_title,
        variant_title: r.variant_title,
        sku: r.variant_sku || r.inventory_sku || 'NO-SKU',
        merchantId: merchantId,
        merchant_id: merchantId,
        locationId: r.location_id || (defaultLocation ? defaultLocation.id : null),
        location_id: r.location_id || (defaultLocation ? defaultLocation.id : null),
        locationName: r.location_name || (defaultLocation ? defaultLocation.name : 'Central Warehouse'),
        location_name: r.location_name || (defaultLocation ? defaultLocation.name : 'Central Warehouse'),
        stockedQuantity: stocked,
        stocked_quantity: stocked,
        reservedQuantity: reserved,
        reserved_quantity: reserved,
        availableQuantity: available,
        available_quantity: available,
        isLowStock: isLowStock,
        is_low_stock: isLowStock,
        lowStockThreshold: 10,
        low_stock_threshold: 10,
        updatedAt: r.level_updated_at ? new Date(r.level_updated_at).toISOString() : new Date().toISOString(),
        updated_at: r.level_updated_at ? new Date(r.level_updated_at).toISOString() : new Date().toISOString(),
      };

      rawItems.push(item);
    }

    // Filter items based on options
    let filtered = rawItems;

    if (options.locationId) {
      filtered = filtered.filter((it) => (it.locationId === options.locationId || it.location_id === options.locationId));
    }

    if (options.lowStockOnly) {
      filtered = filtered.filter((it) => it.isLowStock);
    }

    if (options.status) {
      if (options.status === 'out_of_stock') {
        filtered = filtered.filter((it) => it.availableQuantity === 0);
      } else if (options.status === 'low_stock') {
        filtered = filtered.filter((it) => it.isLowStock && it.availableQuantity > 0);
      } else if (options.status === 'in_stock') {
        filtered = filtered.filter((it) => it.availableQuantity > 10);
      }
    }

    if (options.search && options.search.trim() !== '') {
      const q = options.search.trim().toLowerCase();
      filtered = filtered.filter(
        (it) =>
          it.productTitle.toLowerCase().includes(q) ||
          it.variantTitle.toLowerCase().includes(q) ||
          it.sku.toLowerCase().includes(q)
      );
    }

    // Aggregate summary
    const summary: InventorySummaryDto = {
      totalSkus: rawItems.length,
      total_items: rawItems.length,
      inStockCount: rawItems.filter((it) => it.availableQuantity > 10).length,
      in_stock_count: rawItems.filter((it) => it.availableQuantity > 10).length,
      lowStockCount: rawItems.filter((it) => it.isLowStock && it.availableQuantity > 0).length,
      low_stock_count: rawItems.filter((it) => it.isLowStock && it.availableQuantity > 0).length,
      outOfStockCount: rawItems.filter((it) => it.availableQuantity === 0).length,
      out_of_stock_count: rawItems.filter((it) => it.availableQuantity === 0).length,
      totalStockedUnits: rawItems.reduce((acc, it) => acc + it.stockedQuantity, 0),
      total_stocked_units: rawItems.reduce((acc, it) => acc + it.stockedQuantity, 0),
    };

    return {
      summary,
      items: filtered,
    };
  }

  /**
   * Platform-wide inventory for Super Admin.
   */
  public static async getPlatformInventory(
    options: {
      merchantId?: string;
      locationId?: string;
      search?: string;
      lowStockOnly?: boolean;
      status?: 'in_stock' | 'low_stock' | 'out_of_stock';
    } = {}
  ): Promise<{
    summary: InventorySummaryDto;
    items: Array<MerchantInventoryItemDto & { merchant_name?: string; merchant_handle?: string }>;
  }> {
    const pool = this.getPool();

    let whereClause = `WHERE p.deleted_at IS NULL AND pv.deleted_at IS NULL`;
    const params: any[] = [];

    if (options.merchantId) {
      params.push(options.merchantId);
      whereClause += ` AND mpp.merchant_id = $${params.length}`;
    }

    const query = `
      SELECT 
        mpp.merchant_id,
        m.name as merchant_name,
        m.handle as merchant_handle,
        p.id as product_id,
        p.title as product_title,
        pv.id as variant_id,
        pv.title as variant_title,
        pv.sku as variant_sku,
        ii.id as inventory_item_id,
        ii.sku as inventory_sku,
        il.id as level_id,
        il.location_id,
        sl.name as location_name,
        COALESCE(CAST(il.stocked_quantity AS INTEGER), 0) as stocked_quantity,
        COALESCE(CAST(il.reserved_quantity AS INTEGER), 0) as reserved_quantity,
        il.updated_at as level_updated_at
      FROM product p
      JOIN product_variant pv ON pv.product_id = p.id
      LEFT JOIN marketplace_merchant_product_product mpp ON mpp.product_id = p.id
      LEFT JOIN merchant m ON m.id = mpp.merchant_id
      LEFT JOIN product_variant_inventory_item pvii ON pvii.variant_id = pv.id
      LEFT JOIN inventory_item ii ON ii.id = pvii.inventory_item_id
      LEFT JOIN inventory_level il ON il.inventory_item_id = ii.id
      LEFT JOIN stock_location sl ON sl.id = il.location_id AND sl.deleted_at IS NULL
      ${whereClause}
      ORDER BY p.title ASC, pv.title ASC
    `;

    const res = await pool.query(query, params);
    const rawItems: Array<MerchantInventoryItemDto & { merchant_name?: string; merchant_handle?: string }> = [];

    for (const r of res.rows) {
      const stocked = r.stocked_quantity || 0;
      const reserved = r.reserved_quantity || 0;
      const available = Math.max(0, stocked - reserved);
      const isLowStock = available <= 10;

      rawItems.push({
        id: r.inventory_item_id || `unlinked_${r.variant_id}`,
        inventoryItemId: r.inventory_item_id || null,
        inventory_item_id: r.inventory_item_id || null,
        variantId: r.variant_id,
        variant_id: r.variant_id,
        productId: r.product_id,
        product_id: r.product_id,
        productTitle: r.product_title,
        product_title: r.product_title,
        variantTitle: r.variant_title,
        variant_title: r.variant_title,
        sku: r.variant_sku || r.inventory_sku || 'NO-SKU',
        merchantId: r.merchant_id || 'platform',
        merchant_id: r.merchant_id || 'platform',
        merchant_name: r.merchant_name || 'ATEEVRA Direct',
        merchant_handle: r.merchant_handle || 'platform',
        locationId: r.location_id || null,
        location_id: r.location_id || null,
        locationName: r.location_name || 'Central Warehouse',
        location_name: r.location_name || 'Central Warehouse',
        stockedQuantity: stocked,
        stocked_quantity: stocked,
        reservedQuantity: reserved,
        reserved_quantity: reserved,
        availableQuantity: available,
        available_quantity: available,
        isLowStock: isLowStock,
        is_low_stock: isLowStock,
        lowStockThreshold: 10,
        low_stock_threshold: 10,
        updatedAt: r.level_updated_at ? new Date(r.level_updated_at).toISOString() : new Date().toISOString(),
        updated_at: r.level_updated_at ? new Date(r.level_updated_at).toISOString() : new Date().toISOString(),
      });
    }

    let filtered = rawItems;

    if (options.locationId) {
      filtered = filtered.filter((it) => (it.locationId === options.locationId || it.location_id === options.locationId));
    }

    if (options.lowStockOnly) {
      filtered = filtered.filter((it) => it.isLowStock);
    }

    if (options.status) {
      if (options.status === 'out_of_stock') {
        filtered = filtered.filter((it) => it.availableQuantity === 0);
      } else if (options.status === 'low_stock') {
        filtered = filtered.filter((it) => it.isLowStock && it.availableQuantity > 0);
      } else if (options.status === 'in_stock') {
        filtered = filtered.filter((it) => it.availableQuantity > 10);
      }
    }

    if (options.search && options.search.trim() !== '') {
      const q = options.search.trim().toLowerCase();
      filtered = filtered.filter(
        (it) =>
          it.productTitle.toLowerCase().includes(q) ||
          it.variantTitle.toLowerCase().includes(q) ||
          it.sku.toLowerCase().includes(q) ||
          (it.merchant_name && it.merchant_name.toLowerCase().includes(q))
      );
    }

    const summary: InventorySummaryDto = {
      totalSkus: rawItems.length,
      total_items: rawItems.length,
      inStockCount: rawItems.filter((it) => it.availableQuantity > 10).length,
      in_stock_count: rawItems.filter((it) => it.availableQuantity > 10).length,
      lowStockCount: rawItems.filter((it) => it.isLowStock && it.availableQuantity > 0).length,
      low_stock_count: rawItems.filter((it) => it.isLowStock && it.availableQuantity > 0).length,
      outOfStockCount: rawItems.filter((it) => it.availableQuantity === 0).length,
      out_of_stock_count: rawItems.filter((it) => it.availableQuantity === 0).length,
      totalStockedUnits: rawItems.reduce((acc, it) => acc + it.stockedQuantity, 0),
      total_stocked_units: rawItems.reduce((acc, it) => acc + it.stockedQuantity, 0),
    };

    return {
      summary,
      items: filtered,
    };
  }

  /**
   * Adjusts stock quantity for an inventory item at a specific stock location.
   * Enforces:
   * 1. Concurrency isolation via PostgreSQL advisory lock
   * 2. Non-negative stock check
   * 3. Reservation protection (cannot adjust below reserved_quantity)
   * 4. Structured audit logging
   */
  public static async adjustStock(params: {
    inventoryItemId: string;
    locationId: string;
    adjustment?: number;
    stockedQuantity?: number;
    merchantId?: string;
    isSuperAdmin?: boolean;
    reason?: string;
    actorId: string;
  }): Promise<InventoryAdjustmentResultDto> {
    const { inventoryItemId, locationId, adjustment, stockedQuantity, merchantId, isSuperAdmin, reason, actorId } =
      params;

    if (adjustment === undefined && stockedQuantity === undefined) {
      throw {
        statusCode: 400,
        error: 'INVALID_ADJUSTMENT_INPUT',
        message: 'Either adjustment delta or stockedQuantity must be provided.',
      };
    }

    // 1. Tenant ownership assertion for merchant caller
    if (!isSuperAdmin && merchantId) {
      const ownership = await this.assertMerchantOwnsInventoryItem(merchantId, inventoryItemId);
      if (!ownership.owned) {
        throw {
          statusCode: 403,
          error: 'FORBIDDEN',
          message: 'Access denied: You do not own this inventory item.',
        };
      }

      const hasLocationAccess = await this.assertMerchantCanAccessLocation(merchantId, locationId);
      if (!hasLocationAccess) {
        throw {
          statusCode: 403,
          error: 'FORBIDDEN',
          message: 'Access denied: You do not have access to this stock location.',
        };
      }
    }

    const lockKey = `inv:${inventoryItemId}:${locationId}`;

    return await this.withAdvisoryLock(lockKey, async (client) => {
      // 2. Fetch existing inventory level FOR UPDATE
      const levelRes = await client.query(
        `SELECT id, stocked_quantity, reserved_quantity 
         FROM inventory_level 
         WHERE inventory_item_id = $1 AND location_id = $2
         FOR UPDATE`,
        [inventoryItemId, locationId]
      );

      let levelId: string;
      let currentStocked = 0;
      let reservedQuantity = 0;

      if (levelRes.rows.length === 0) {
        // Create new inventory level if none exists yet
        levelId = `ilev_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        currentStocked = 0;
        reservedQuantity = 0;

        await client.query(
          `INSERT INTO inventory_level 
            (id, inventory_item_id, location_id, stocked_quantity, reserved_quantity, incoming_quantity, raw_stocked_quantity, raw_reserved_quantity, raw_incoming_quantity, created_at, updated_at)
           VALUES 
            ($1, $2, $3, '0', '0', '0', '{"value":"0","precision":20}', '{"value":"0","precision":20}', '{"value":"0","precision":20}', NOW(), NOW())`,
          [levelId, inventoryItemId, locationId]
        );
      } else {
        const row = levelRes.rows[0];
        levelId = row.id;
        currentStocked = parseInt(row.stocked_quantity, 10) || 0;
        reservedQuantity = parseInt(row.reserved_quantity, 10) || 0;
      }

      // Compute adjustment delta
      const effectiveAdjustment =
        adjustment !== undefined ? adjustment : (stockedQuantity! - currentStocked);

      // 3. Safety validation: non-negativity and reservation checks
      const safety = BackendMarketplaceGuard.evaluateInventoryAdjustmentSafety(
        currentStocked,
        reservedQuantity,
        effectiveAdjustment
      );

      if (!safety.canAdjust) {
        throw {
          statusCode: 400,
          error: 'INVENTORY_SAFETY_VIOLATION',
          message: safety.reason,
        };
      }

      const newStocked = safety.resultingStocked!;
      const availableQuantity = safety.availableQuantity!;

      // 4. Update inventory level
      await client.query(
        `UPDATE inventory_level 
         SET stocked_quantity = $1, 
             raw_stocked_quantity = $2, 
             updated_at = NOW() 
         WHERE id = $3`,
        [newStocked.toString(), JSON.stringify({ value: newStocked.toString(), precision: 20 }), levelId]
      );

      // 5. Emit structured audit log
      console.info(
        `[AUDIT] [INVENTORY_ADJUSTMENT] ${isSuperAdmin ? 'Admin' : 'Merchant'} '${merchantId || 'super-admin'}' ` +
          `(actor: '${actorId}') adjusted item '${inventoryItemId}' at location '${locationId}'. ` +
          `Stock: ${currentStocked} -> ${newStocked} (adjustment: ${effectiveAdjustment >= 0 ? '+' : ''}${effectiveAdjustment}). ` +
          `Reason: '${reason || 'Manual stock update'}'.`
      );

      return {
        success: true,
        id: levelId,
        inventoryItemId,
        inventory_item_id: inventoryItemId,
        locationId,
        location_id: locationId,
        previousQuantity: currentStocked,
        previous_stocked_quantity: currentStocked,
        newQuantity: newStocked,
        stocked_quantity: newStocked,
        reserved_quantity: reservedQuantity,
        availableQuantity,
        available_quantity: availableQuantity,
        isLowStock: availableQuantity <= 10,
        is_low_stock: availableQuantity <= 10,
        adjustment: effectiveAdjustment,
        reason: reason || 'Manual stock update',
        adjustedAt: new Date().toISOString(),
        adjustedBy: actorId,
      };
    });
  }

  /**
   * Super Admin: Lists all stock locations with assigned merchants.
   */
  public static async getAllStockLocationsWithMerchants(): Promise<
    Array<{
      id: string;
      name: string;
      merchants: Array<{ id: string; name: string; handle: string }>;
    }>
  > {
    const pool = this.getPool();
    const locRes = await pool.query(
      `SELECT id, name FROM stock_location WHERE deleted_at IS NULL ORDER BY name ASC`
    );

    const linkRes = await pool.query(
      `SELECT msl.stock_location_id, m.id as merchant_id, m.name as merchant_name, m.handle as merchant_handle
       FROM marketplace_merchant_stock_location_stock_location msl
       JOIN merchant m ON m.id = msl.merchant_id
       WHERE msl.deleted_at IS NULL`
    );

    const linksByLocation = new Map<string, Array<{ id: string; name: string; handle: string }>>();
    for (const row of linkRes.rows) {
      if (!linksByLocation.has(row.stock_location_id)) {
        linksByLocation.set(row.stock_location_id, []);
      }
      linksByLocation.get(row.stock_location_id)!.push({
        id: row.merchant_id,
        name: row.merchant_name,
        handle: row.merchant_handle,
      });
    }

    return locRes.rows.map((loc) => ({
      id: loc.id,
      name: loc.name,
      merchants: linksByLocation.get(loc.id) || [],
    }));
  }

  /**
   * Super Admin: Links a stock location to a merchant.
   */
  public static async assignStockLocationToMerchant(
    merchantId: string,
    stockLocationId: string
  ): Promise<boolean> {
    const pool = this.getPool();

    // Check if link already exists
    const checkRes = await pool.query(
      `SELECT id FROM marketplace_merchant_stock_location_stock_location 
       WHERE merchant_id = $1 AND stock_location_id = $2`,
      [merchantId, stockLocationId]
    );

    if (checkRes.rows.length > 0) {
      return true; // already linked
    }

    const linkId = `link_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    await pool.query(
      `INSERT INTO marketplace_merchant_stock_location_stock_location 
        (id, merchant_id, stock_location_id, created_at, updated_at)
       VALUES 
        ($1, $2, $3, NOW(), NOW())`,
      [linkId, merchantId, stockLocationId]
    );

    console.info(
      `[AUDIT] [STOCK_LOCATION_ASSIGNED] Merchant '${merchantId}' assigned to stock location '${stockLocationId}'`
    );
    return true;
  }
}
