import { NextRequest, NextResponse } from 'next/server';
import { CheckoutService } from '../../../../lib/checkout/checkout-service';

/**
 * POST /api/webhooks/razorpay
 * Secure server-side webhook handler with raw-body HMAC-SHA256 signature verification and durable idempotency
 */
export async function POST(req: NextRequest) {
  try {
    const signature = req.headers.get('x-razorpay-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'MISSING_SIGNATURE', message: 'x-razorpay-signature header is missing' },
        { status: 400 }
      );
    }

    // 1. Read RAW request body for cryptographic signature verification
    const rawBody = await req.text();

    if (!rawBody || rawBody.trim() === '') {
      return NextResponse.json(
        { error: 'EMPTY_BODY', message: 'Webhook body is empty' },
        { status: 400 }
      );
    }

    // 2. Constant-time HMAC-SHA256 verification over RAW body
    const isValid = CheckoutService.verifyRazorpayWebhookSignature(rawBody, signature);

    if (!isValid) {
      return NextResponse.json(
        { error: 'INVALID_SIGNATURE', message: 'Webhook signature verification failed' },
        { status: 400 }
      );
    }

    // 3. Only parse JSON after signature verification succeeds
    let eventData: any;
    try {
      eventData = JSON.parse(rawBody);
    } catch {
      return NextResponse.json(
        { error: 'INVALID_JSON', message: 'Malformed JSON payload' },
        { status: 400 }
      );
    }

    if (!eventData || !eventData.event) {
      return NextResponse.json(
        { error: 'INVALID_EVENT', message: 'Missing event identifier in webhook payload' },
        { status: 400 }
      );
    }

    const eventName = eventData.event;
    const paymentId = eventData.payload?.payment?.entity?.id || '';
    const orderId = eventData.payload?.order?.entity?.id || '';
    const eventId = eventData.id || `${eventName}_${paymentId || orderId || Date.now()}`;

    // 4. Durable Idempotency: Duplicate and out-of-order event protection
    const processResult = await CheckoutService.processWebhookEvent(eventId, eventData);

    return NextResponse.json({
      received: true,
      duplicate: processResult.duplicate || false,
      action: processResult.action || eventName,
    });
  } catch (error: any) {
    console.error('[POST /api/webhooks/razorpay] Webhook processing error:', error);
    return NextResponse.json(
      { error: 'INTERNAL_SERVER_ERROR', message: error?.message || 'Failed to process webhook' },
      { status: 500 }
    );
  }
}
