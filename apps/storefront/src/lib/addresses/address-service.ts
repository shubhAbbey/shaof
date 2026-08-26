import { config } from '../../config';
import type {
  AddressDto,
  CreateAddressPayload,
  UpdateAddressPayload,
  AddressType,
} from '@ecom/types';

const MEDUSA_URL =
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ||
  process.env.MEDUSA_BACKEND_URL ||
  config.medusa.baseUrl ||
  'http://localhost:9000';

const MEDUSA_PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY ||
  config.medusa.publishableKey ||
  'pk_962772bcd68f09b11833d76684644ae47e3f46059f995ff0c5eeba74d0cc01e3';

function getMedusaHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (MEDUSA_PUBLISHABLE_KEY) {
    headers['x-publishable-api-key'] = MEDUSA_PUBLISHABLE_KEY;
  }
  return headers;
}

export function mapMedusaAddressToDto(addr: any): AddressDto {
  if (!addr) {
    throw new Error('Invalid Medusa address object');
  }

  const metadata = addr.metadata || {};

  return {
    id: addr.id,
    customerId: addr.customer_id,
    fullName: addr.fullName,
    mobile: addr.mobile || '',
    addressLine1: addr.addressLine1 || '',
    addressLine2: addr.addressLine2 || undefined,
    landmark: metadata.landmark || undefined,
    city: addr.city || '',
    state: addr.state || '',
    pincode: addr.pincode || '',
    countryCode: (addr.countryCode || 'in').toLowerCase(),
    addressType: (metadata.addressType || addr.addressType) as AddressType,
    isDefault: Boolean(addr.isDefault),
    createdAt: addr.createdAt ? new Date(addr.createdAt).toISOString() : undefined,
    updatedAt: addr.updatedAt ? new Date(addr.updatedAt).toISOString() : undefined,
  };
}

export class AddressService {
  /**
   * List all saved addresses for a customer from persistent Medusa Customer Module
   */
  static async listAddresses(customerId: string): Promise<AddressDto[]> {
    if (!customerId || customerId.trim() === '') {
      return [];
    }

    try {
      const response = await fetch(
        `${MEDUSA_URL}/store/addresses?customer_id=${encodeURIComponent(customerId.trim())}`,
        {
          method: 'GET',
          headers: getMedusaHeaders(),
          cache: 'no-store',
        }
      );

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || `Failed to fetch addresses (${response.status})`);
      }

      const data = await response.json();
      if (Array.isArray(data.addresses)) {
        return data.addresses.map(mapMedusaAddressToDto);
      }
      return [];
    } catch (error: any) {
      console.warn('[AddressService] Error fetching customer addresses:', error.message);
      return [];
    }
  }

  /**
   * Retrieve a single customer address by ID
   */
  static async getAddress(customerId: string, addressId: string): Promise<AddressDto | null> {
    if (!customerId || !addressId) return null;

    try {
      const response = await fetch(
        `${MEDUSA_URL}/store/addresses/${encodeURIComponent(addressId.trim())}?customer_id=${encodeURIComponent(customerId.trim())}`,
        {
          method: 'GET',
          headers: getMedusaHeaders(),
          cache: 'no-store',
        }
      );

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      return data.address ? mapMedusaAddressToDto(data.address) : null;
    } catch (error: any) {
      console.warn('[AddressService] Error fetching single address:', error.message);
      return null;
    }
  }

  /**
   * Add a new customer address in persistent Medusa Customer Module
   */
  static async createAddress(
    customerId: string,
    payload: CreateAddressPayload
  ): Promise<{ address: AddressDto; addresses: AddressDto[] }> {
    if (!customerId || customerId.trim() === '') {
      throw new Error('Customer ID is required');
    }

    const body = JSON.stringify({
        customer_id: customerId.trim(),
        fullName: payload.fullName,
        mobile: payload.mobile,
        addressLine1: payload.addressLine1,
        addressLine2: payload.addressLine2,
        landmark: payload.landmark,
        city: payload.city,
        state: payload.state,
        pincode: payload.pincode,
        countryCode: payload.countryCode || 'in',
        addressType: payload.addressType || 'home',
        isDefault: payload.isDefault,
      })

      console.log("Medusa createAddress body: ", body);

    const response = await fetch(`${MEDUSA_URL}/store/addresses`, {
      method: 'POST',
      headers: getMedusaHeaders(),
      body
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.message || `Failed to create address (${response.status})`);
    }

    const data = await response.json();
    console.log("Medusa createAddress response: ");
    console.dir(data, { depth: null });
    const address = mapMedusaAddressToDto(data.address);
    const addresses = Array.isArray(data.addresses)
      ? data.addresses.map(mapMedusaAddressToDto)
      : [address];

    return { address, addresses };
  }

  /**
   * Update an existing customer address in persistent Medusa Customer Module
   */
  static async updateAddress(
    customerId: string,
    addressId: string,
    payload: UpdateAddressPayload
  ): Promise<{ address: AddressDto; addresses: AddressDto[] }> {
    if (!customerId || customerId.trim() === '') {
      throw new Error('Customer ID is required');
    }
    if (!addressId || addressId.trim() === '') {
      throw new Error('Address ID is required');
    }

    const response = await fetch(
      `${MEDUSA_URL}/store/addresses/${encodeURIComponent(addressId.trim())}`,
      {
        method: 'PATCH',
        headers: getMedusaHeaders(),
        body: JSON.stringify({
          customer_id: customerId.trim(),
          ...payload,
        }),
      }
    );

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.message || `Failed to update address (${response.status})`);
    }

    const data = await response.json();
    const address = mapMedusaAddressToDto(data.address);
    const addresses = Array.isArray(data.addresses)
      ? data.addresses.map(mapMedusaAddressToDto)
      : [address];

    return { address, addresses };
  }

  /**
   * Delete a customer address from persistent Medusa Customer Module
   */
  static async deleteAddress(
    customerId: string,
    addressId: string
  ): Promise<{ success: boolean; addresses: AddressDto[] }> {
    if (!customerId || customerId.trim() === '') {
      throw new Error('Customer ID is required');
    }
    if (!addressId || addressId.trim() === '') {
      throw new Error('Address ID is required');
    }

    const response = await fetch(
      `${MEDUSA_URL}/store/addresses/${encodeURIComponent(addressId.trim())}?customer_id=${encodeURIComponent(customerId.trim())}`,
      {
        method: 'DELETE',
        headers: getMedusaHeaders(),
      }
    );

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.message || `Failed to delete address (${response.status})`);
    }

    const data = await response.json();
    const addresses = Array.isArray(data.addresses)
      ? data.addresses.map(mapMedusaAddressToDto)
      : [];

    return { success: true, addresses };
  }
}
