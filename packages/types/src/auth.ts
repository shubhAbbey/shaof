export interface RequestOtpPayload {
  mobile: string;
}

export interface RequestOtpResponse {
  success: boolean;
  message: string;
  isExistingCustomer: boolean;
  expiresInSeconds: number;
}

export interface VerifyOtpPayload {
  mobile: string;
  otp: string;
  fullName?: string;
  email?: string;
}

export interface CustomerSession {
  id: string;
  mobile: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
}

export interface AuthResponse {
  success: boolean;
  customer: CustomerSession;
  token?: string;
}
