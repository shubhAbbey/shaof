import { model } from '@medusajs/framework/utils';

export const Merchant = model
  .define('merchant', {
    id: model.id().primaryKey(),
    name: model.text().index('idx_merchant_name'),
    handle: model.text().unique().index('idx_merchant_handle'),
    status: model
      .enum(['draft', 'pending_approval', 'active', 'suspended', 'rejected'])
      .default('draft'),
    email: model.text().index('idx_merchant_email'),
    phone: model.text(),
    business_registration_number: model.text().nullable(),
    tax_identifier: model.text().nullable(),
    metadata: model.json().nullable(),
  });
