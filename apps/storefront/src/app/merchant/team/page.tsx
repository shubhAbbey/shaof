import { requireMerchantServerSession } from '@/lib/server-auth';
import MerchantTeamClient from './MerchantTeamClient';

export default async function MerchantTeamPage() {
  await requireMerchantServerSession('/merchant/team', {
    requireRole: ['owner', 'admin'],
    requirePermission: 'team:manage',
  });
  return <MerchantTeamClient />;
}
