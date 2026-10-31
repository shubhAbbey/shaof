import { Metadata } from 'next';
import AdminInventoryClient from './AdminInventoryClient';

export const metadata: Metadata = {
  title: 'Platform Inventory | ATEEVRA Super Admin',
  description: 'Manage marketplace inventory, stock locations, and seller stock allocations.',
};

export default function AdminInventoryPage() {
  return <AdminInventoryClient />;
}
