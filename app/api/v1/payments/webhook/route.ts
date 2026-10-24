import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyWebhookSignature } from '@/lib/payment-gateway';

const WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET || 'rzp_webhook_secret_hmac';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-razorpay-signature');

    // 1. Cryptographic HMAC-SHA256 signature verification
    const isValidSignature = verifyWebhookSignature(rawBody, signature, WEBHOOK_SECRET);
    if (!isValidSignature) {
      console.warn('[Webhook] Rejected webhook request: Invalid signature');
      return NextResponse.json(
        { error: 'Invalid webhook signature' },
        { status: 400 }
      );
    }

    const payload = JSON.parse(rawBody);
    const eventType = payload.event;
    const paymentEntity = payload.payload?.payment?.entity;

    if (!paymentEntity || !paymentEntity.id) {
      return NextResponse.json({ error: 'Missing payment entity' }, { status: 400 });
    }

    const providerTransactionRef = paymentEntity.id;
    const amountInSubunits = paymentEntity.amount; // paise
    const currency = paymentEntity.currency;

    // Look up matching internal payment record using notes.internalReference or providerTransactionRef
    const internalRef = paymentEntity.notes?.internalReference;
    const allPayments = await db.getAllPayments();
    const payment = allPayments.find(
      (p) =>
        (internalRef && p.internalReference === internalRef) ||
        p.providerTransactionRef === providerTransactionRef
    );

    if (!payment) {
      console.warn(`[Webhook] Unmatched transaction reference: ${providerTransactionRef}`);
      return NextResponse.json({ received: true, note: 'Payment record not matched' }, { status: 200 });
    }

    // 2. Idempotency Check: Prevent duplicate payment processing or duplicate receipt generation
    if (payment.status === 'SUCCESSFUL') {
      console.log(`[Webhook] Idempotent skip: Payment ${payment.id} already verified as SUCCESSFUL.`);
      return NextResponse.json({
        received: true,
        idempotent: true,
        message: 'Duplicate webhook ignored; transaction already verified.',
      });
    }

    // 3. Process event transitions
    if (eventType === 'payment.captured' || eventType === 'order.paid') {
      await db.updatePaymentStatus(
        payment.id,
        'SUCCESSFUL',
        `Gateway webhook [${eventType}] confirmed payment capture of ₹${(amountInSubunits / 100).toFixed(2)}.`,
        'WEBHOOK',
        providerTransactionRef
      );

      await db.recordAuditLog({
        userId: payment.userId,
        action: 'WEBHOOK_PAYMENT_CAPTURED',
        entityType: 'PAYMENT',
        entityId: payment.id,
        detailsJson: JSON.stringify({
          providerRef: providerTransactionRef,
          eventType,
          amount: amountInSubunits / 100,
        }),
        ipAddress: req.headers.get('x-forwarded-for') || '127.0.0.1',
      });

      return NextResponse.json({
        received: true,
        status: 'SUCCESSFUL',
        receiptNumber: payment.receiptNumber,
      });
    } else if (eventType === 'payment.failed') {
      const reason = paymentEntity.error_description || 'Payment was declined by bank or customer cancelled';
      await db.updatePaymentStatus(
        payment.id,
        'FAILED',
        `Gateway webhook [payment.failed]: ${reason}`,
        'WEBHOOK',
        providerTransactionRef
      );

      return NextResponse.json({ received: true, status: 'FAILED' });
    }

    return NextResponse.json({ received: true, unhandledEvent: eventType });
  } catch (error: any) {
    console.error('[Webhook API] Processing Error:', error);
    return NextResponse.json({ error: 'Internal webhook handling error' }, { status: 500 });
  }
}
