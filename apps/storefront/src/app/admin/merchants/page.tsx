import { requireSuperAdminServerSession } from '@/lib/server-auth';
import AdminMerchantReviewClient from './AdminMerchantReviewClient';

export default async function AdminMerchantReviewPage() {
  await requireSuperAdminServerSession('/admin/merchants');
  return <AdminMerchantReviewClient />;
}
