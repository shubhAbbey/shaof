import crypto from 'crypto';
import { Pool, PoolClient } from 'pg';
import { InventoryService } from './inventory-service';
import { BackendMarketplaceGuard } from './ownership-guard';
import { FulfillmentEngine } from '../fulfillment/fulfillment-engine';
import type {
  MerchantFulfillmentDetailDto,
  MerchantFulfillmentItemDto,
  LineItemFulfillmentStatus,
  AuthenticatedSessionDto,
} from '@ecom/types';

export interface FulfillOrderParams {
  orderId: string;
  items: Array<{ id: string; quantity: number }>;
  carrierName?: string;
  trackingNumber?: string;
  notes?: string;
  status?: 'fulfilled' | 'shipped';
}

export interface FulfillmentAuditEvent {
  eventId: string;
  timestamp: string;
  action:
    | 'order.fulfillment_created'
    | 'order.fulfillment_shipped'
    | 'order.fulfillment_canceled'
    | 'order.fulfillment_failed';
  orderId: string;
  fulfillmentId: string;
  actorId: string;
  actorRole: string;
  merchantId?: string;
  metadata?: Record<string, unknown>;
}

export class FulfillmentService {
  private static auditLogs: FulfillmentAuditEvent[] = [];

  public static getAuditLogs(): FulfillmentAuditEvent[] {
    return [...this.auditLogs];
  }

  public static clearAuditLogs(): void {
    this.auditLogs = [];
  }

  private static recordAudit(event: Omit<FulfillmentAuditEvent, 'eventId' | 'timestamp'>) {
    const fullEvent: FulfillmentAuditEvent = {
      ...event,
      eventId: `audit_ful_${crypto.randomBytes(12).toString('hex')}`,
      timestamp: new Date().toISOString(),
    };
    this.auditLogs.push(fullEvent);
    if (this.auditLogs.length > 500) {
      this.auditLogs.shift();
    }
  }

  /**
   * Fulfills line items in an order with strict merchant isolation and quantity guards.
   */
  public static async fulfillOrder(
    session: AuthenticatedSessionDto,
    params: FulfillOrderParams
  ): Promise<MerchantFulfillmentDetailDto> {
    return this.executeFulfillment(session, params);
  }

  /**
   * Authoritative fulfillment execution pipeline.
   * Marked protected so test harnesses can inherit and verify transaction rollback
   * without exposing failpoint parameters on the production service or API surface.
   */
  protected static async executeFulfillment(
    session: AuthenticatedSessionDto,
    params: FulfillOrderParams,
    failpoint?: (client: PoolClient) => Promise<void> | void
  ): Promise<MerchantFulfillmentDetailDto> {
    const { orderId, items, carrierName, trackingNumber, notes, status = 'fulfilled' } = params;

    if (!items || items.length === 0) {
      const err: any = new Error('No items specified for fulfillment.');
      err.statusCode = 400;
      err.code = 'INVALID_ITEMS';
      throw err;
    }

    // Acquire advisory transaction lock for this order to prevent concurrent race conditions
    try {
      return await InventoryService.withAdvisoryLock(`order_fulfillment:${orderId}`, async (client: PoolClient) => {
        // 1. Fetch line items from database
      const lineItemIds = items.map((i) => i.id);
      const itemsRes = await client.query(
        `SELECT oli.id, oli.title, oli.variant_sku as sku, oli.product_id, oi.quantity
         FROM order_line_item oli
         JOIN order_item oi ON oi.item_id = oli.id
         WHERE oi.order_id = $1 AND oli.id = ANY($2) AND oli.deleted_at IS NULL`,
        [orderId, lineItemIds]
      );

      // If order_item junction table is not used directly, check direct order_line_item
      let lineItems = itemsRes.rows;
      if (lineItems.length === 0) {
        const directRes = await client.query(
          `SELECT oli.id, oli.title, oli.variant_sku as sku, oli.product_id, 1 as quantity
           FROM order_line_item oli
           WHERE oli.id = ANY($1) AND oli.deleted_at IS NULL`,
          [lineItemIds]
        );
        lineItems = directRes.rows;
      }

      if (lineItems.length === 0) {
        const err: any = new Error(`Order ${orderId} does not contain any of the specified line items.`);
        err.statusCode = 404;
        err.code = 'ORDER_ITEMS_NOT_FOUND';
        throw err;
      }

      // Check all requested items exist
      for (const reqItem of items) {
        const match = lineItems.find((li: any) => li.id === reqItem.id);
        if (!match) {
          const err: any = new Error(`Line item ${reqItem.id} does not exist in order ${orderId}.`);
          err.statusCode = 400;
          err.code = 'INVALID_LINE_ITEM';
          throw err;
        }
      }

      // 2. Resolve merchant attribution for each line item
      const itemMerchantMap = new Map<string, string>();

      // Direct link check: marketplace_merchant_order_order_line_item
      const linkRes = await client.query(
        `SELECT order_line_item_id, merchant_id
         FROM marketplace_merchant_order_order_line_item
         WHERE order_line_item_id = ANY($1) AND deleted_at IS NULL`,
        [lineItemIds]
      );

      for (const row of linkRes.rows) {
        itemMerchantMap.set(row.order_line_item_id, row.merchant_id);
      }

      // Fallback: product to merchant link
      const productIds = lineItems.map((li: any) => li.product_id).filter(Boolean);
      if (productIds.length > 0) {
        const prodLinkRes = await client.query(
          `SELECT product_id, merchant_id
           FROM marketplace_merchant_product_product
           WHERE product_id = ANY($1)`,
          [productIds]
        );
        const prodMerchantMap = new Map<string, string>();
        for (const row of prodLinkRes.rows) {
          prodMerchantMap.set(row.product_id, row.merchant_id);
        }

        for (const li of lineItems) {
          if (!itemMerchantMap.has(li.id) && li.product_id) {
            const mId = prodMerchantMap.get(li.product_id);
            if (mId) {
              itemMerchantMap.set(li.id, mId);
            }
          }
        }
      }

      // 3. Security Boundary & Ownership Enforcement
      const isSuperAdmin = session.actorType === 'super_admin' || session.role === 'super_admin';
      const callerMerchantId = session.merchantId;

      if (!isSuperAdmin) {
        const itemMerchantIds = lineItems.map((li: any) => itemMerchantMap.get(li.id) || '');
        const authCheck = BackendMarketplaceGuard.assertMerchantFulfillmentAccess(session, itemMerchantIds);
        if (!authCheck.allowed) {
          const err: any = new Error(authCheck.message || 'Fulfillment access denied.');
          err.statusCode = authCheck.statusCode || 403;
          err.code = authCheck.message?.includes('CROSS_TENANT')
            ? 'CROSS_TENANT_FULFILLMENT_FORBIDDEN'
            : (authCheck.error || 'FORBIDDEN');
          throw err;
        }
      }

      // 4. Validate Quantities Against Previous Fulfillments
      const existingFulfillmentsRes = await client.query(
        `SELECT fi.line_item_id, fi.quantity
         FROM fulfillment_item fi
         JOIN fulfillment f ON fi.fulfillment_id = f.id
         JOIN order_fulfillment of ON of.fulfillment_id = f.id
         WHERE of.order_id = $1 AND f.canceled_at IS NULL AND f.deleted_at IS NULL`,
        [orderId]
      );

      const fulfilledCountMap = new Map<string, number>();
      for (const row of existingFulfillmentsRes.rows) {
        const curr = fulfilledCountMap.get(row.line_item_id) || 0;
        fulfilledCountMap.set(row.line_item_id, curr + Number(row.quantity));
      }

      for (const reqItem of items) {
        const lineItem = lineItems.find((li: any) => li.id === reqItem.id);
        const totalOrdered = Number(lineItem.quantity);
        const alreadyFulfilled = fulfilledCountMap.get(reqItem.id) || 0;
        const requestedQuantity = Number(reqItem.quantity);

        if (requestedQuantity <= 0) {
          const err: any = new Error(`Quantity to fulfill for item ${reqItem.id} must be greater than zero.`);
          err.statusCode = 400;
          err.code = 'INVALID_QUANTITY';
          throw err;
        }

        if (alreadyFulfilled >= totalOrdered) {
          const err: any = new Error(
            `Line item ${reqItem.id} is already fully fulfilled (${alreadyFulfilled}/${totalOrdered}).`
          );
          err.statusCode = 400;
          err.code = 'ALREADY_FULFILLED';
          throw err;
        }

        if (alreadyFulfilled + requestedQuantity > totalOrdered) {
          const err: any = new Error(
            `Requested quantity (${requestedQuantity}) exceeds unfulfilled quantity (${totalOrdered - alreadyFulfilled}) for item ${reqItem.id}.`
          );
          err.statusCode = 400;
          err.code = 'QUANTITY_EXCEEDED';
          throw err;
        }
      }

      // 5. Create Fulfillment Record in Medusa Schema
      const fulfillmentId = `ful_${crypto.randomBytes(12).toString('hex')}`;
      const now = new Date();
      const packedAt = now;
      const shippedAt = status === 'shipped' ? now : null;

      const targetMerchantId = isSuperAdmin
        ? itemMerchantMap.get(items[0]?.id) || 'platform_admin'
        : callerMerchantId!;

      // Resolve stock location_id strictly within target merchant's assigned active locations
      const merchantLocRes = await client.query(
        `SELECT msl.stock_location_id
         FROM marketplace_merchant_stock_location_stock_location msl
         JOIN stock_location sl ON sl.id = msl.stock_location_id
         WHERE msl.merchant_id = $1 AND msl.deleted_at IS NULL AND sl.deleted_at IS NULL
         ORDER BY msl.created_at ASC
         LIMIT 1`,
        [targetMerchantId]
      );

      if (merchantLocRes.rows.length === 0) {
        const err: any = new Error(
          `No valid stock location assigned to merchant '${targetMerchantId}'. Cannot fulfill without an assigned stock location.`
        );
        err.statusCode = 400;
        err.code = 'NO_STOCK_LOCATION_ASSIGNED';
        throw err;
      }

      const resolvedLocationId = merchantLocRes.rows[0].stock_location_id;

      const auditEvent: FulfillmentAuditEvent = {
        eventId: `audit_ful_${crypto.randomBytes(12).toString('hex')}`,
        timestamp: now.toISOString(),
        action: status === 'shipped' ? 'order.fulfillment_shipped' : 'order.fulfillment_created',
        orderId,
        fulfillmentId,
        actorId: session.userId,
        actorRole: session.role || (isSuperAdmin ? 'super_admin' : 'merchant'),
        merchantId: targetMerchantId,
        metadata: {
          itemCount: items.length,
          carrierName: carrierName || 'Standard Manual Shipping',
          trackingNumber: trackingNumber || null,
          status,
          items: items.map((i) => ({ lineItemId: i.id, quantity: i.quantity })),
        },
      };

      const metadata: Record<string, unknown> = {
        merchant_id: targetMerchantId,
        carrier_name: carrierName || 'Standard Manual Shipping',
        tracking_number: trackingNumber || null,
        notes: notes || null,
        created_by: session.userId,
        status: status as LineItemFulfillmentStatus,
        audit: auditEvent,
      };

      await client.query(
        `INSERT INTO fulfillment (
          id, location_id, packed_at, shipped_at, provider_id,
          metadata, requires_shipping, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          fulfillmentId,
          resolvedLocationId,
          packedAt,
          shippedAt,
          'manual_manual',
          JSON.stringify(metadata),
          true,
          now,
          now,
        ]
      );

      // Associate fulfillment with order in order_fulfillment
      const orderFulfillmentId = `ordful_${crypto.randomBytes(12).toString('hex')}`;
      await client.query(
        `INSERT INTO order_fulfillment (id, order_id, fulfillment_id, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5)`,
        [orderFulfillmentId, orderId, fulfillmentId, now, now]
      );

      // Insert fulfillment items
      const createdItems: MerchantFulfillmentItemDto[] = [];
      for (const reqItem of items) {
        const lineItem = lineItems.find((li: any) => li.id === reqItem.id);
        const fulItemId = `fulitem_${crypto.randomBytes(12).toString('hex')}`;
        const barcode = lineItem.barcode || 'N/A';
        const rawQuantity = JSON.stringify({ value: String(reqItem.quantity), precision: 20 });
        await client.query(
          `INSERT INTO fulfillment_item (id, title, sku, barcode, quantity, raw_quantity, line_item_id, fulfillment_id, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
          [
            fulItemId,
            lineItem.title || 'Product Item',
            lineItem.sku || lineItem.variant_sku || 'SKU-ITEM',
            barcode,
            reqItem.quantity,
            rawQuantity,
            reqItem.id,
            fulfillmentId,
            now,
            now,
          ]
        );

        createdItems.push({
          id: fulItemId,
          lineItemId: reqItem.id,
          quantity: reqItem.quantity,
          title: lineItem.title,
          sku: lineItem.sku,
        });
      }

      // Isolated test failpoint: allows integration tests to induce a controlled failure AFTER
      // writes to fulfillment, order_fulfillment, and fulfillment_item to prove atomic ACID rollback
      if (failpoint) {
        await failpoint(client);
      }

      // Automatically record structured audit event in service ring buffer & structured logger
      FulfillmentService.recordAudit(auditEvent);

      const responseDto: MerchantFulfillmentDetailDto = {
        id: fulfillmentId,
        orderId,
        merchantId: targetMerchantId,
        status: status as LineItemFulfillmentStatus,
        trackingNumber: trackingNumber || undefined,
        carrierName: carrierName || undefined,
        notes: notes || undefined,
        items: createdItems,
        packedAt: packedAt.toISOString(),
        shippedAt: shippedAt ? shippedAt.toISOString() : undefined,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      };

      return responseDto;
    });
  } catch (err: any) {
    const isSuperAdmin = session.actorType === 'super_admin' || session.role === 'super_admin';
    FulfillmentService.recordAudit({
      action: 'order.fulfillment_failed',
      orderId,
      fulfillmentId: 'none',
      actorId: session.userId,
      actorRole: session.role || (isSuperAdmin ? 'super_admin' : 'merchant'),
      merchantId: session.merchantId || undefined,
      metadata: {
        error: err.code || 'FULFILLMENT_FAILED',
        message: err.message,
      },
    });
    throw err;
  }
}

  /**
   * Lists fulfillments for an order with strict merchant scoping.
   */
  public static async listOrderFulfillments(
    session: AuthenticatedSessionDto,
    orderId: string
  ): Promise<MerchantFulfillmentDetailDto[]> {
    const isSuperAdmin = session.actorType === 'super_admin' || session.role === 'super_admin';
    const callerMerchantId = session.merchantId;

    const pool = InventoryService.getPool();

    // Fetch all fulfillments for this order
    const fulRes = await pool.query(
      `SELECT f.id, f.packed_at, f.shipped_at, f.delivered_at, f.canceled_at,
              f.metadata, f.created_at, f.updated_at, of.order_id
       FROM fulfillment f
       JOIN order_fulfillment of ON of.fulfillment_id = f.id
       WHERE of.order_id = $1 AND f.deleted_at IS NULL
       ORDER BY f.created_at DESC`,
      [orderId]
    );

    if (fulRes.rows.length === 0) {
      return [];
    }

    const fulfillmentIds = fulRes.rows.map((r) => r.id);
    const itemsRes = await pool.query(
      `SELECT fi.id, fi.fulfillment_id, fi.line_item_id, fi.quantity, fi.title, fi.sku
       FROM fulfillment_item fi
       WHERE fi.fulfillment_id = ANY($1) AND fi.deleted_at IS NULL`,
      [fulfillmentIds]
    );

    // Group items by fulfillment_id
    const itemsByFulId = new Map<string, any[]>();
    for (const item of itemsRes.rows) {
      const list = itemsByFulId.get(item.fulfillment_id) || [];
      list.push(item);
      itemsByFulId.set(item.fulfillment_id, list);
    }

    const results: MerchantFulfillmentDetailDto[] = [];

    for (const row of fulRes.rows) {
      const meta = typeof row.metadata === 'string' ? JSON.parse(row.metadata) : (row.metadata || {});
      const fulfillmentMerchantId = meta.merchant_id || '';

      // If merchant caller, enforce tenant isolation
      if (!isSuperAdmin && fulfillmentMerchantId !== callerMerchantId) {
        continue; // Omit fulfillments belonging to other merchants
      }

      const rawItems = itemsByFulId.get(row.id) || [];
      const items: MerchantFulfillmentItemDto[] = rawItems.map((ri) => ({
        id: ri.id,
        lineItemId: ri.line_item_id,
        quantity: Number(ri.quantity),
        title: ri.title,
        sku: ri.sku,
      }));

      // Determine fulfillment status
      let calculatedStatus: LineItemFulfillmentStatus = 'fulfilled';
      if (row.canceled_at) {
        calculatedStatus = 'canceled';
      } else if (row.delivered_at) {
        calculatedStatus = 'delivered';
      } else if (row.shipped_at) {
        calculatedStatus = 'shipped';
      } else if (meta.status) {
        calculatedStatus = meta.status;
      }

      results.push({
        id: row.id,
        orderId: row.order_id,
        merchantId: fulfillmentMerchantId,
        status: calculatedStatus,
        trackingNumber: meta.tracking_number || undefined,
        carrierName: meta.carrier_name || undefined,
        notes: meta.notes || undefined,
        items,
        packedAt: row.packed_at ? new Date(row.packed_at).toISOString() : undefined,
        shippedAt: row.shipped_at ? new Date(row.shipped_at).toISOString() : undefined,
        deliveredAt: row.delivered_at ? new Date(row.delivered_at).toISOString() : undefined,
        canceledAt: row.canceled_at ? new Date(row.canceled_at).toISOString() : undefined,
        createdAt: new Date(row.created_at).toISOString(),
        updatedAt: new Date(row.updated_at).toISOString(),
      });
    }

    return results;
  }
}
