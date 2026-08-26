import { MedusaRequest, MedusaResponse } from '@medusajs/framework/http';
import { Modules } from '@medusajs/framework/utils';
import type { AddressDto } from '@ecom/types';

function mapMedusaAddress(addr: any): AddressDto {
  const metadata = addr.metadata || {};
  const fullName = addr.first_name
    ? [addr.first_name, addr.last_name].filter(Boolean).join(' ')
    : metadata.fullName || '';

  return {
    id: addr.id,
    customerId: addr.customer_id,
    fullName,
    mobile: addr.phone || '',
    addressLine1: addr.address_1 || '',
    addressLine2: addr.address_2 || undefined,
    landmark: metadata.landmark || undefined,
    city: addr.city || '',
    state: addr.province || '',
    pincode: addr.postal_code || '',
    countryCode: (addr.country_code || 'in').toLowerCase(),
    addressType: (metadata.addressType || addr.address_name || 'home') as any,
    isDefault: Boolean(addr.is_default_shipping),
    createdAt: addr.created_at ? new Date(addr.created_at).toISOString() : undefined,
    updatedAt: addr.updated_at ? new Date(addr.updated_at).toISOString() : undefined,
  };
}

/**
 * GET /store/addresses - List customer addresses from persistent Medusa Customer Module
 */
export async function GET(req: MedusaRequest, res: MedusaResponse): Promise<void> {
  const customerId = (req.query.customer_id as string) || (req.query.customerId as string);
  if (!customerId || customerId.trim() === '') {
    res.status(400).json({ success: false, error: 'CUSTOMER_ID_REQUIRED', message: 'customer_id is required' });
    return;
  }

  try {
    const customerModule: any = req.scope.resolve(Modules.CUSTOMER);
    const rawAddresses = await customerModule.listCustomerAddresses({ customer_id: customerId.trim() });
    const addresses = (rawAddresses || []).map(mapMedusaAddress);

    res.status(200).json({
      success: true,
      addresses,
      count: addresses.length,
    });
  } catch (err: any) {
    console.error('[Medusa Store API] GET /store/addresses error:', err.message);
    res.status(500).json({ success: false, error: 'ADDRESS_QUERY_FAILED', message: err.message });
  }
}

/**
 * POST /store/addresses - Create a new customer address in persistent Medusa Customer Module
 */
export async function POST(req: MedusaRequest, res: MedusaResponse): Promise<void> {
  const body = req.body as any;
  const customerId = body.customer_id || body.customerId;

  if (!customerId || typeof customerId !== 'string' || customerId.trim() === '') {
    res.status(400).json({ success: false, error: 'CUSTOMER_ID_REQUIRED', message: 'customer_id is required' });
    return;
  }

  const {
    fullName,
    mobile,
    addressLine1,
    addressLine2,
    landmark,
    city,
    state,
    pincode,
    countryCode = 'in',
    addressType = 'home',
    isDefault,
  } = body;

  if (!fullName || typeof fullName !== 'string' || fullName.trim() === '') {
    res.status(400).json({ success: false, error: 'FULL_NAME_REQUIRED', message: 'Full name is required' });
    return;
  }
  if (!mobile || typeof mobile !== 'string' || mobile.trim() === '') {
    res.status(400).json({ success: false, error: 'MOBILE_REQUIRED', message: 'Mobile number is required' });
    return;
  }
  if (!addressLine1 || typeof addressLine1 !== 'string' || addressLine1.trim() === '') {
    res.status(400).json({ success: false, error: 'ADDRESS_LINE_1_REQUIRED', message: 'Address line 1 is required' });
    return;
  }
  if (!city || typeof city !== 'string' || city.trim() === '') {
    res.status(400).json({ success: false, error: 'CITY_REQUIRED', message: 'City is required' });
    return;
  }
  if (!state || typeof state !== 'string' || state.trim() === '') {
    res.status(400).json({ success: false, error: 'STATE_REQUIRED', message: 'State is required' });
    return;
  }
  if (!pincode || typeof pincode !== 'string' || pincode.trim() === '') {
    res.status(400).json({ success: false, error: 'PINCODE_REQUIRED', message: 'Pincode is required' });
    return;
  }

  try {
    const customerModule: any = req.scope.resolve(Modules.CUSTOMER);
    const existingAddresses = await customerModule.listCustomerAddresses({ customer_id: customerId.trim() });

    // If marked default or this is the first address, ensure it's default and clear existing defaults
    const shouldBeDefault = Boolean(isDefault) || (existingAddresses && existingAddresses.length === 0);

    if (shouldBeDefault && existingAddresses && existingAddresses.length > 0) {
      for (const addr of existingAddresses) {
        if (addr.is_default_shipping) {
          await customerModule.updateCustomerAddresses(addr.id, {
            is_default_shipping: false,
            is_default_billing: false,
          });
        }
      }
    }

    const metadata: Record<string, any> = {
      fullName: fullName.trim(),
      addressType,
      ...(landmark ? { landmark: landmark.trim() } : {}),
    };

    const created = await customerModule.createCustomerAddresses({
      customer_id: customerId.trim(),
      first_name: fullName.trim(),
      last_name: '',
      phone: mobile.trim(),
      address_1: addressLine1.trim(),
      address_2: addressLine2 ? addressLine2.trim() : '',
      city: city.trim(),
      province: state.trim(),
      postal_code: pincode.trim(),
      country_code: countryCode.toLowerCase().trim(),
      address_name: addressType,
      is_default_shipping: shouldBeDefault,
      is_default_billing: shouldBeDefault,
      metadata,
    });

    const allAddresses = await customerModule.listCustomerAddresses({ customer_id: customerId.trim() });

    res.status(201).json({
      success: true,
      address: mapMedusaAddress(created),
      addresses: (allAddresses || []).map(mapMedusaAddress),
      message: 'Address created successfully',
    });
  } catch (err: any) {
    console.error('[Medusa Store API] POST /store/addresses error:', err.message);
    res.status(500).json({ success: false, error: 'ADDRESS_CREATE_FAILED', message: err.message });
  }
}
