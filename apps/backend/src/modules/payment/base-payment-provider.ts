import { AbstractPaymentProvider } from '@medusajs/framework/utils';
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
  DeletePaymentInput,
  DeletePaymentOutput,
  RetrievePaymentInput,
  RetrievePaymentOutput,
  UpdatePaymentInput,
  UpdatePaymentOutput,
  GetPaymentStatusInput,
  GetPaymentStatusOutput,
  ProviderWebhookPayload,
  WebhookActionResult,
} from '@medusajs/types';

export interface BasePaymentProviderOptions {
  [key: string]: unknown;
}

/**
 * Base Abstract Payment Provider for Medusa v2 commerce
 * Implements Medusa's AbstractPaymentProvider lifecycle contract
 */
export abstract class BasePaymentProvider<
  TOptions extends BasePaymentProviderOptions = BasePaymentProviderOptions,
> extends AbstractPaymentProvider<TOptions> {
  static identifier = 'base_payment_provider';

  get identifier(): string {
    return (this.constructor as typeof BasePaymentProvider).identifier;
  }

  /**
   * Initiates a payment session with the provider
   */
  abstract initiatePayment(data: InitiatePaymentInput): Promise<InitiatePaymentOutput>;

  /**
   * Authorizes an initiated payment session
   */
  abstract authorizePayment(data: AuthorizePaymentInput): Promise<AuthorizePaymentOutput>;

  /**
   * Captures an authorized payment
   */
  abstract capturePayment(data: CapturePaymentInput): Promise<CapturePaymentOutput>;

  /**
   * Refunds a captured payment
   */
  abstract refundPayment(data: RefundPaymentInput): Promise<RefundPaymentOutput>;

  /**
   * Cancels / voids a payment
   */
  abstract cancelPayment(data: CancelPaymentInput): Promise<CancelPaymentOutput>;

  /**
   * Deletes a payment session
   */
  async deletePayment(data: DeletePaymentInput): Promise<DeletePaymentOutput> {
    return {};
  }

  /**
   * Retrieves payment details from provider
   */
  async retrievePayment(data: RetrievePaymentInput): Promise<RetrievePaymentOutput> {
    return { data: data.data };
  }

  /**
   * Updates an ongoing payment session
   */
  async updatePayment(data: UpdatePaymentInput): Promise<UpdatePaymentOutput> {
    return { data: data.data };
  }

  /**
   * Retrieves the current payment status
   */
  async getPaymentStatus(data: GetPaymentStatusInput): Promise<GetPaymentStatusOutput> {
    return {
      status: (data.data?.status as any) || 'pending',
      data: data.data,
    };
  }

  /**
   * Parses incoming webhook events from the payment gateway
   */
  async getWebhookActionAndData(
    payload: ProviderWebhookPayload['payload']
  ): Promise<WebhookActionResult> {
    return {
      action: 'not_supported',
    };
  }
}
