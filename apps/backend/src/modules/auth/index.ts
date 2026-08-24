/**
 * Medusa Custom OTP Authentication Service Foundation
 */
import { normalizeIndianMobile } from '@ecom/types';

export interface CustomerAuthPayload {
  mobile: string;
  email?: string;
  firstName?: string;
  lastName?: string;
}

export class OtpAuthService {
  /**
   * Resolve or format Medusa customer identifier by canonical Indian mobile number
   */
  static formatCustomerIdentity(mobile: string): string {
    const cleaned = mobile.replace(/\D/g, '');
    const raw10 = cleaned.slice(-10);
    return `+91${raw10}`;
  }
}

export default OtpAuthService;
