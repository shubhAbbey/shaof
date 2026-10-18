import { MedusaService } from '@medusajs/framework/utils';
import { Merchant } from './models/merchant';
import { MerchantMember } from './models/merchant-member';

export default class MarketplaceModuleService extends MedusaService({
  Merchant,
  MerchantMember,
}) {}
