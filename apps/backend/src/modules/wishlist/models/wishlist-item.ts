import { model } from '@medusajs/framework/utils';

export const WishlistItem = model
  .define('wishlist_item', {
    id: model.id().primaryKey(),
    customer_id: model.text().index('idx_wishlist_item_customer_id'),
    product_id: model.text().index('idx_wishlist_item_product_id'),
    variant_id: model.text().index('idx_wishlist_item_variant_id'),
    options: model.json().nullable(),
    title: model.text().nullable(),
    handle: model.text().nullable(),
    thumbnail: model.text().nullable(),
    price: model.number().nullable(),
    original_price: model.number().nullable(),
    currency_code: model.text().default('inr'),
    in_stock: model.boolean().default(true),
  })
  .indexes([
    {
      on: ['customer_id', 'variant_id'],
      unique: true,
      name: 'idx_wishlist_item_customer_variant_unique',
    },
  ]);
