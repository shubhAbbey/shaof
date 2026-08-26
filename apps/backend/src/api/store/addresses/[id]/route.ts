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
 * GET /store/addresses/:id - Retrieve single customer address with customer ownership check
 */
export async function GET(req: MedusaRequest, res: MedusaResponse): Promise<void> {
  const addressId = req.params.id;
  const customerId = (req.query.customer_id as string) || (req.query.customerId as string);

  if (!addressId || addressId.trim() === '') {
    res.status(400).json({ success: false, error: 'ADDRESS_ID_REQUIRED', message: 'Address ID is required' });
    return;
  }
  if (!customerId || customerId.trim() === '') {
    res.status(400).json({ success: false, error: 'CUSTOMER_ID_REQUIRED', message: 'customer_id is required' });
    return;
  }

  try {
    const customerModule: any = req.scope.resolve(Modules.CUSTOMER);
    const rawAddresses = await customerModule.listCustomerAddresses({
      id: addressId.trim(),
      customer_id: customerId.trim(),
    });

    if (!rawAddresses || rawAddresses.length === 0) {
      res.status(404).json({ success: false, error: 'NOT_FOUND', message: 'Address not found or access denied' });
      return;
    }

    res.status(200).json({
      success: true,
      address: mapMedusaAddress(rawAddresses[0]),
    });
  } catch (err: any) {
    console.error('[Medusa Store API] GET /store/addresses/:id error:', err.message);
    res.status(500).json({ success: false, error: 'ADDRESS_QUERY_FAILED', message: err.message });
  }
}

/**
 * POST / PATCH /store/addresses/:id - Update existing customer address with customer ownership check
 */
export async function POST(req: MedusaRequest, res: MedusaResponse): Promise<void> {
  return handleUpdate(req, res);
}

export async function PATCH(req: MedusaRequest, res: MedusaResponse): Promise<void> {
  return handleUpdate(req, res);
}

async function handleUpdate(req: MedusaRequest, res: MedusaResponse): Promise<void> {
  const addressId = req.params.id;
  const body = req.body as any;
  const customerId = body.customer_id || body.customerId || (req.query.customer_id as string);

  if (!addressId || addressId.trim() === '') {
    res.status(400).json({ success: false, error: 'ADDRESS_ID_REQUIRED', message: 'Address ID is required' });
    return;
  }
  if (!customerId || typeof customerId !== 'string' || customerId.trim() === '') {
    res.status(400).json({ success: false, error: 'CUSTOMER_ID_REQUIRED', message: 'customer_id is required' });
    return;
  }

  try {
    const customerModule: any = req.scope.resolve(Modules.CUSTOMER);
    const existing = await customerModule.listCustomerAddresses({
      id: addressId.trim(),
      customer_id: customerId.trim(),
    });

    if (!existing || existing.length === 0) {
      res.status(404).json({ success: false, error: 'NOT_FOUND', message: 'Address not found or access denied' });
      return;
    }

    const currentAddr = existing[0];
    const {
      fullName,
      mobile,
      addressLine1,
      addressLine2,
      landmark,
      city,
      state,
      pincode,
      countryCode,
      addressType,
      isDefault,
    } = body;

    const allAddresses = await customerModule.listCustomerAddresses({ customer_id: customerId.trim() });

    if (isDefault === true && allAddresses && allAddresses.length > 0) {
      for (const addr of allAddresses) {
        if (addr.id !== addressId.trim() && addr.is_default_shipping) {
          await customerModule.updateCustomerAddresses(addr.id, {
            is_default_shipping: false,
            is_default_billing: false,
          });
        }
      }
    }

    const updatedMetadata = {
      ...(currentAddr.metadata || {}),
      ...(fullName !== undefined ? { fullName: fullName.trim() } : {}),
      ...(addressType !== undefined ? { addressType } : {}),
      ...(landmark !== undefined ? { landmark: landmark.trim() } : {}),
    };

    const updatePayload: Record<string, any> = {
      metadata: updatedMetadata,
    };

    if (fullName !== undefined) updatePayload.first_name = fullName.trim();
    if (mobile !== undefined) updatePayload.phone = mobile.trim();
    if (addressLine1 !== undefined) updatePayload.address_1 = addressLine1.trim();
    if (addressLine2 !== undefined) updatePayload.address_2 = addressLine2.trim();
    if (city !== undefined) updatePayload.city = city.trim();
    if (state !== undefined) updatePayload.province = state.trim();
    if (pincode !== undefined) updatePayload.postal_code = pincode.trim();
    if (countryCode !== undefined) updatePayload.country_code = countryCode.toLowerCase().trim();
    if (addressType !== undefined) updatePayload.address_name = addressType;
    if (isDefault !== undefined) {
      updatePayload.is_default_shipping = Boolean(isDefault);
      updatePayload.is_default_billing = Boolean(isDefault);
    }

    const updated = await customerModule.updateCustomerAddresses(addressId.trim(), updatePayload);
    const updatedAll = await customerModule.listCustomerAddresses({ customer_id: customerId.trim() });

    res.status(200).json({
      success: true,
      address: mapMedusaAddress(updated),
      addresses: (updatedAll || []).map(mapMedusaAddress),
      message: 'Address updated successfully',
    });
  } catch (err: any) {
    console.error('[Medusa Store API] PATCH /store/addresses/:id error:', err.message);
    res.status(500).json({ success: false, error: 'ADDRESS_UPDATE_FAILED', message: err.message });
  }
}

/**
 * DELETE /store/addresses/:id - Delete customer address with customer ownership check
 */
export async function DELETE(req: MedusaRequest, res: MedusaResponse): Promise<void> {
  const addressId = req.params.id;
  const customerId = (req.query.customer_id as string) || (req.query.customerId as string);

  if (!addressId || addressId.trim() === '') {
    res.status(400).json({ success: false, error: 'ADDRESS_ID_REQUIRED', message: 'Address ID is required' });
    return;
  }
  if (!customerId || customerId.trim() === '') {
    res.status(400).json({ success: false, error: 'CUSTOMER_ID_REQUIRED', message: 'customer_id is required' });
    return;
  }

  try {
    const customerModule: any = req.scope.resolve(Modules.CUSTOMER);
    const existing = await customerModule.listCustomerAddresses({
      id: addressId.trim(),
      customer_id: customerId.trim(),
    });

    if (!existing || existing.length === 0) {
      res.status(404).json({ success: false, error: 'NOT_FOUND', message: 'Address not found or access denied' });
      return;
    }

    const wasDefault = existing[0].is_default_shipping;
    await customerModule.deleteCustomerAddresses([addressId.trim()]);

    const remainingAddresses = await customerModule.listCustomerAddresses({ customer_id: customerId.trim() });

    // If the deleted address was the default and other addresses remain, designate the first remaining address as default
    if (wasDefault && remainingAddresses && remainingAddresses.length > 0) {
      const hasDefault = remainingAddresses.some((a: any) => a.is_default_shipping);
      if (!hasDefault) {
        await customerModule.updateCustomerAddresses(remainingAddresses[0].id, {
          is_default_shipping: true,
          is_default_billing: true,
        });
      }
    }

    const finalAddresses = await customerModule.listCustomerAddresses({ customer_id: customerId.trim() });

    res.status(200).json({
      success: true,
      id: addressId.trim(),
      deleted: true,
      addresses: (finalAddresses || []).map(mapMedusaAddress),
      message: 'Address deleted successfully',
    });
  } catch (err: any) {
    console.error('[Medusa Store API] DELETE /store/addresses/:id error:', err.message);
    res.status(500).json({ success: false, error: 'ADDRESS_DELETE_FAILED', message: err.message });
  }
}
