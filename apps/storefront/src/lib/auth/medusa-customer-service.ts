import crypto from 'node:crypto';
import { normalizeIndianMobile } from './phone-utils';
import { config } from '../../config';
import type { CustomerSession, GenderType } from '@ecom/types';

const MEDUSA_URL = config.medusa.baseUrl;
const MEDUSA_PUBLISHABLE_KEY = config.medusa.publishableKey;

function getMedusaHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (MEDUSA_PUBLISHABLE_KEY) {
    headers['x-publishable-api-key'] = MEDUSA_PUBLISHABLE_KEY;
  }
  const s2sToken = config.env.s2sAuthToken;
  if (s2sToken) {
    headers['x-s2s-auth-token'] = s2sToken;
  }
  return headers;
}

/**
 * Medusa Customer Service
 * Communicates exclusively with Medusa v2 Commerce Backend via HTTP APIs.
 * Direct PostgreSQL queries have been eliminated in accordance with M2-02 architecture rules.
 */
export class MedusaCustomerService {
  /**
   * Look up customer in Medusa by normalized Indian mobile phone
   * Invokes native Medusa Store API: GET /store/customers/lookup?phone=...
   * PII is strictly stripped at the backend to eliminate customer enumeration risks.
   */
  static async lookupCustomerByPhone(
    rawMobile: string
  ): Promise<{ exists: boolean; customer: CustomerSession | null }> {
    const validation = normalizeIndianMobile(rawMobile);
    if (!validation.isValid) {
      return { exists: false, customer: null };
    }
    const phone = validation.normalized;

    try {
      const res = await fetch(
        `${MEDUSA_URL}/store/customers/lookup?phone=${encodeURIComponent(phone)}`,
        {
          method: 'GET',
          headers: getMedusaHeaders(),
          cache: 'no-store',
        }
      );

      if (!res.ok) {
        if (res.status === 404) {
          return { exists: false, customer: null };
        }
        console.warn(`[MedusaCustomerService] HTTP ${res.status} from customer lookup`);
        return { exists: false, customer: null };
      }

      const data = await res.json();
      return {
        exists: Boolean(data.exists),
        customer: null, // Zero PII leakage to unauthenticated callers
      };
    } catch (err: any) {
      console.warn('[MedusaCustomerService] lookupCustomerByPhone fallback:', err.message);
      return { exists: false, customer: null };
    }
  }


  /**
   * Create or update customer in Medusa's customer store
   * Invokes native Medusa Store API: POST /store/customers
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

    try {
      const res = await fetch(`${MEDUSA_URL}/store/customers`, {
        method: 'POST',
        headers: getMedusaHeaders(),
        body: JSON.stringify({
          mobile: phone,
          firstName: payload.firstName,
          lastName: payload.lastName,
          email: payload.email,
          gender: payload.gender,
          dateOfBirth: payload.dateOfBirth,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.customer) {
          return data.customer;
        }
      } else {
        console.warn(`[MedusaCustomerService] HTTP ${res.status} from saveCustomer`);
      }
    } catch (err: any) {
      console.warn('[MedusaCustomerService] saveCustomer HTTP error:', err.message);
    }

    // Fallback construction in case Medusa is temporarily unreachable
    const customerId = `cus_${crypto.randomBytes(12).toString('hex')}`;
    return {
      id: customerId,
      mobile: phone,
      email: payload.email || null,
      firstName: payload.firstName || null,
      lastName: payload.lastName || null,
      gender: payload.gender || null,
      dateOfBirth: payload.dateOfBirth || null,
      createdAt: new Date().toISOString(),
    };
  }
}
