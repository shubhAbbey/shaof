import pg from 'pg';
import crypto from 'node:crypto';
import { normalizeIndianMobile } from './phone-utils';
import type { CustomerSession, GenderType } from '@ecom/types';

const connectionString =
  process.env.DATABASE_URL ||
  'postgres://postgres:postgres_secure_password@localhost:5432/medusa_db';

let pool: pg.Pool | null = null;

function getDbPool(): pg.Pool {
  if (!pool) {
    pool = new pg.Pool({
      connectionString,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });
  }
  return pool;
}

export class MedusaCustomerService {
  /**
   * Look up customer in Medusa by normalized Indian mobile phone
   */
  static async lookupCustomerByPhone(
    rawMobile: string
  ): Promise<{ exists: boolean; customer: CustomerSession | null }> {
    const validation = normalizeIndianMobile(rawMobile);
    if (!validation.isValid) {
      return { exists: false, customer: null };
    }
    const phone = validation.normalized;
    const db = getDbPool();

    try {
      const res = await db.query(
        `SELECT id, first_name, last_name, email, phone, metadata, created_at
         FROM customer
         WHERE phone = $1 AND deleted_at IS NULL
         LIMIT 1`,
        [phone]
      );

      if (res.rows.length === 0) {
        return { exists: false, customer: null };
      }

      const row = res.rows[0];
      const metadata = row.metadata || {};
      const customer: CustomerSession = {
        id: row.id,
        mobile: row.phone,
        email: row.email || null,
        firstName: row.first_name || null,
        lastName: row.last_name || null,
        gender: metadata.gender || null,
        dateOfBirth: metadata.date_of_birth || null,
        createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
      };

      return { exists: true, customer };
    } catch (err: any) {
      console.error('[MedusaCustomerService] lookupCustomerByPhone error:', err.message);
      return { exists: false, customer: null };
    }
  }

  /**
   * Create or update customer in Medusa's customer store
   */
  static async saveCustomer(payload: {
    mobile: string;
    firstName?: string | null;
    lastName?: string | null;
    email?: string | null;
    gender?: GenderType | null;
    dateOfBirth?: string | null;
  }): Promise<CustomerSession> {
    const validation = normalizeIndianMobile(payload.mobile);
    const phone = validation.isValid ? validation.normalized : payload.mobile;
    const db = getDbPool();

    const existing = await this.lookupCustomerByPhone(phone);

    const firstName =
      payload.firstName !== undefined && payload.firstName !== null && payload.firstName.trim().length > 0
        ? payload.firstName.trim()
        : existing.customer?.firstName || null;

    const lastName =
      payload.lastName !== undefined && payload.lastName !== null && payload.lastName.trim().length > 0
        ? payload.lastName.trim()
        : existing.customer?.lastName || null;

    const email =
      payload.email !== undefined && payload.email !== null && payload.email.trim().length > 0
        ? payload.email.trim()
        : existing.customer?.email || null;

    const gender =
      payload.gender !== undefined && payload.gender !== null
        ? payload.gender
        : existing.customer?.gender || null;

    const dateOfBirth =
      payload.dateOfBirth !== undefined && payload.dateOfBirth !== null && payload.dateOfBirth.trim().length > 0
        ? payload.dateOfBirth.trim()
        : existing.customer?.dateOfBirth || null;

    const metadata = {
      gender,
      date_of_birth: dateOfBirth,
    };

    if (existing.exists && existing.customer) {
      // Update existing Medusa customer
      await db.query(
        `UPDATE customer
         SET first_name = $1, last_name = $2, email = $3, metadata = $4, updated_at = NOW()
         WHERE id = $5`,
        [firstName, lastName, email, JSON.stringify(metadata), existing.customer.id]
      );

      return {
        id: existing.customer.id,
        mobile: phone,
        email,
        firstName,
        lastName,
        gender,
        dateOfBirth,
        createdAt: existing.customer.createdAt,
      };
    } else {
      // Create new Medusa customer with real Medusa customer ID
      const customerId = `cus_${crypto.randomBytes(12).toString('hex')}`;
      const now = new Date().toISOString();

      await db.query(
        `INSERT INTO customer (id, first_name, last_name, email, phone, has_account, metadata, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, true, $6, NOW(), NOW())`,
        [customerId, firstName, lastName, email, phone, JSON.stringify(metadata)]
      );

      return {
        id: customerId,
        mobile: phone,
        email,
        firstName,
        lastName,
        gender,
        dateOfBirth,
        createdAt: now,
      };
    }
  }
}
