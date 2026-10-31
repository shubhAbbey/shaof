import { Metadata } from 'next';
import MerchantInventoryClient from './MerchantInventoryClient';

export const metadata: Metadata = {
  title: 'Inventory Management | ATEEVRA Merchant',
  description: 'Manage merchant stock levels, stock locations, and stock adjustments.',
};

export default function MerchantInventoryPage() {
  return <MerchantInventoryClient />;
}
