import { requireSuperAdminServerSession } from '@/lib/server-auth';
import AdminModerationClient from './AdminModerationClient';

export default async function AdminModerationPage() {
  await requireSuperAdminServerSession('/admin/moderation');
  return <AdminModerationClient />;
}
