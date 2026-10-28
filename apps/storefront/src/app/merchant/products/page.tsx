import { requireMerchantServerSession } from '@/lib/server-auth';
import MerchantProductsClient from './MerchantProductsClient';

export default async function MerchantProductsPage() {
  await requireMerchantServerSession('/merchant/products');
  return <MerchantProductsClient />;
}
