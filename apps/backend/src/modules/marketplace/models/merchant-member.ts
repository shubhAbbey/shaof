import { model } from '@medusajs/framework/utils';

export const MerchantMember = model
  .define('merchant_member', {
    id: model.id().primaryKey(),
    merchant_id: model.text().index('idx_merchant_member_merchant_id'),
    user_id: model.text().index('idx_merchant_member_user_id'),
    role: model.enum(['owner', 'admin', 'manager', 'staff']).default('staff'),
    status: model.enum(['invited', 'active', 'suspended']).default('active'),
    metadata: model.json().nullable(),
  })
  .indexes([
    {
      on: ['merchant_id', 'user_id'],
      unique: true,
      name: 'idx_merchant_member_unique',
    },
  ]);
