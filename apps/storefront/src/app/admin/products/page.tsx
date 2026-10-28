import { requireSuperAdminServerSession } from '@/lib/server-auth';
import AdminProductsClient from './AdminProductsClient';

export default async function AdminProductsPage() {
  await requireSuperAdminServerSession('/admin/products');
  return <AdminProductsClient />;
}
