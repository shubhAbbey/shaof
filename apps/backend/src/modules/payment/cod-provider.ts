import { BasePaymentProvider } from './base-payment-provider.js';
import type {
  InitiatePaymentInput,
  InitiatePaymentOutput,
  AuthorizePaymentInput,
  AuthorizePaymentOutput,
  CapturePaymentInput,
  CapturePaymentOutput,
  RefundPaymentInput,
  RefundPaymentOutput,
  CancelPaymentInput,
  CancelPaymentOutput,
  GetPaymentStatusInput,
  GetPaymentStatusOutput,
} from '@medusajs/types';

export interface CodProviderOptions {
  enabled?: boolean;
  [key: string]: unknown;
}

/**
 * Cash on Delivery (COD) Payment Provider for Medusa v2 commerce
 * Implements genuine Medusa manual/system payment semantics without Razorpay/online simulation
 */
export class CodPaymentProvider extends BasePaymentProvider<CodProviderOptions> {
  static override identifier = 'system_manual';

  private enabled: boolean;

  constructor(cradle: Record<string, unknown> = {}, options: CodProviderOptions = {}) {
    super(cradle, options);
    this.enabled =
      options.enabled !== undefined
        ? Boolean(options.enabled)
        : process.env.COD_ENABLED !== 'false';
  }

  /**
   * Check whether COD is enabled in commerce configuration
   */
  isCodEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Initiates COD payment session with accurate pending payment state
   */
  async initiatePayment(data: InitiatePaymentInput): Promise<InitiatePaymentOutput> {
    if (!this.isCodEnabled()) {
      throw new Error('Cash on Delivery is currently disabled in configuration');
    }

    const rawAmount = typeof data.amount === 'number' ? data.amount : Number(data.amount) || 0;
    const currency = (data.currency_code || 'inr').toUpperCase();
    const cartId = (data.context as any)?.cart_id || `cart_${Date.now()}`;
    const sessionId = `cod_sess_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    return {
      id: sessionId,
      data: {
        session_id: sessionId,
        payment_method: 'cod',
        amount: rawAmount,
        currency_code: currency,
        receipt: cartId,
        is_cod: true,
        status: 'pending',
      },
      status: 'pending',
    };
  }

  /**
   * Authorizes COD payment session for cart completion
   */
  async authorizePayment(data: AuthorizePaymentInput): Promise<AuthorizePaymentOutput> {
    const sessionData = data.data || {};

    return {
      status: 'authorized',
      data: {
        ...sessionData,
        authorized_at: new Date().toISOString(),
        status: 'authorized',
      },
    };
  }

  /**
   * Captures COD payment when cash/UPI is collected on physical delivery
   */
  async capturePayment(data: CapturePaymentInput): Promise<CapturePaymentOutput> {
    const sessionData = data.data || {};

    return {
      data: {
        ...sessionData,
        collected_at: new Date().toISOString(),
        status: 'captured',
      },
    };
  }

  /**
   * Records refund for COD order (via manual IMPS/UPI/store credit payout workflow)
   */
  async refundPayment(data: RefundPaymentInput): Promise<RefundPaymentOutput> {
    const sessionData = data.data || {};
    const refundAmount = data.amount;

    return {
      data: {
        ...sessionData,
        refunded_amount: refundAmount,
        refunded_at: new Date().toISOString(),
        status: 'refunded',
      },
    };
  }

  /**
   * Cancels COD payment session
   */
  async cancelPayment(data: CancelPaymentInput): Promise<CancelPaymentOutput> {
    const sessionData = data.data || {};
    return {
      data: {
        ...sessionData,
        canceled_at: new Date().toISOString(),
        status: 'canceled',
      },
    };
  }

  /**
   * Retrieves COD payment status
   */
  override async getPaymentStatus(data: GetPaymentStatusInput): Promise<GetPaymentStatusOutput> {
    const status = (data.data?.status as any) || 'authorized';
    return {
      status,
      data: data.data,
    };
  }
}
