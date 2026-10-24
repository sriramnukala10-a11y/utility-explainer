import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { generateWebhookSignature } from '@/lib/payment-gateway';

const WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET || 'rzp_webhook_secret_hmac';

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    const body = await req.json();
    const { paymentId, outcome } = body; // outcome: 'SUCCESS' | 'FAIL' | 'TIMEOUT_UNKNOWN' | 'FIRE_WEBHOOK'

    const payment = await db.getPaymentById(paymentId);
    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    if (session && session.role !== 'ADMIN' && payment.userId !== session.userId) {
      return NextResponse.json({ error: 'Unauthorized to simulate on this payment' }, { status: 403 });
    }

    if (outcome === 'SUCCESS') {
      const updated = await db.updatePaymentStatus(
        payment.id,
        'SUCCESSFUL',
        'Simulated gateway authorization response (Test Sandbox Mode)',
        'CUSTOMER',
        `pay_sim_${Date.now()}`
      );
      return NextResponse.json({
        success: true,
        data: updated,
        message: 'Sandbox simulation: Payment captured and verified.',
        isSimulator: true,
      });
    }

    if (outcome === 'FAIL') {
      const updated = await db.updatePaymentStatus(
        payment.id,
        'FAILED',
        'Simulated bank decline: Insufficient balance or user cancelled (Test Sandbox)',
        'CUSTOMER'
      );
      return NextResponse.json({
        success: true,
        data: updated,
        message: 'Sandbox simulation: Payment marked as Failed.',
        isSimulator: true,
      });
    }

    if (outcome === 'TIMEOUT_UNKNOWN') {
      const updated = await db.updatePaymentStatus(
        payment.id,
        'UNKNOWN',
        'Simulated banking network timeout: Gateway awaiting async ledger clearance',
        'RECONCILIATION_JOB'
      );
      return NextResponse.json({
        success: true,
        data: updated,
        message: 'Sandbox simulation: Status transitioned to UNKNOWN for reconciliation.',
        isSimulator: true,
      });
    }

    if (outcome === 'FIRE_WEBHOOK') {
      // Build authentic webhook payload and calculate real HMAC-SHA256 signature
      const webhookPayload = {
        event: 'payment.captured',
        payload: {
          payment: {
            entity: {
              id: payment.providerTransactionRef || `pay_wh_${Date.now()}`,
              amount: Math.round(payment.amount * 100),
              currency: payment.currency,
              status: 'captured',
              notes: {
                internalReference: payment.internalReference,
              },
            },
          },
        },
      };

      const rawJson = JSON.stringify(webhookPayload);
      const signature = generateWebhookSignature(rawJson, WEBHOOK_SECRET);

      // Post internally to webhook endpoint
      const origin = req.nextUrl.origin;
      const res = await fetch(`${origin}/api/v1/payments/webhook`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-razorpay-signature': signature,
        },
        body: rawJson,
      });

      const result = await res.json();
      return NextResponse.json({
        success: true,
        data: result,
        signatureUsed: signature,
        message: 'Cryptographically signed webhook dispatched and processed.',
        isSimulator: true,
      });
    }

    return NextResponse.json({ error: 'Invalid simulation outcome requested' }, { status: 400 });
  } catch (error: any) {
    console.error('[Payment Simulator API] Error:', error);
    return NextResponse.json({ error: 'Simulation execution failed' }, { status: 500 });
  }
}
