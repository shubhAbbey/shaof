export interface AddressDto {
  id?: string;
  fullName: string;
  mobile: string;
  addressLine1: string;
  addressLine2?: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  countryCode: string;
  addressType: 'home' | 'office' | 'other';
  isDefault?: boolean;
}

export interface ReturnRequestPayload {
  orderId: string;
  items: Array<{
    lineItemId: string;
    quantity: number;
    reason: string;
  }>;
  refundMethod?: 'original' | 'upi' | 'bank_transfer' | 'store_credit';
  refundDetails?: {
    upiId?: string;
    accountNumber?: string;
    ifscCode?: string;
    beneficiaryName?: string;
  };
}
