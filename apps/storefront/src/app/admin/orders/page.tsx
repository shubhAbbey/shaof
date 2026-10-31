import { Metadata } from 'next';
import AdminOrdersClient from './AdminOrdersClient';

export const metadata: Metadata = {
  title: 'Platform Orders | ATEEVRA Super Admin',
  description: 'Platform-wide order governance, search, seller breakdowns, and customer context.',
};

export default function AdminOrdersPage() {
  return <AdminOrdersClient />;
}
