import { Metadata } from 'next';
import MerchantOrdersClient from './MerchantOrdersClient';

export const metadata: Metadata = {
  title: 'Orders | ATEEVRA Merchant',
  description: 'Manage merchant store orders, scoped line items, and fulfillment context.',
};

export default function MerchantOrdersPage() {
  return <MerchantOrdersClient />;
}
