import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { paymentInitiationSchema } from '@/lib/validations';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    const userId = session?.userId || 'usr_priya_01';

    const searchParams = req.nextUrl.searchParams;
    const statusFilter = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = Math.min(50, parseInt(searchParams.get('limit') || '10', 10));

    let payments = session?.role === 'ADMIN' && searchParams.get('all') === 'true'
      ? await db.getAllPayments()
      : await db.getPaymentsByUserId(userId);

    if (statusFilter && statusFilter !== 'ALL') {
      payments = payments.filter((p) => p.status === statusFilter);
    }

    const total = payments.length;
    const paginated = payments.slice((page - 1) * limit, page * limit);

    return NextResponse.json({
      success: true,
      data: paginated,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
    });
  } catch (error: any) {
    console.error('[Payments API] Error:', error);
    return NextResponse.json({ error: 'Failed to retrieve payments' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    const userId = session?.userId || 'usr_priya_01';

    const body = await req.json();
    const parsed = paymentInitiationSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid payment parameters', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { billId, amount, paymentMethod, idempotencyKey } = parsed.data;

    // Verify bill exists
    const bill = await db.getBillById(billId);
    if (!bill) {
      return NextResponse.json({ error: 'Referenced bill not found' }, { status: 404 });
    }

    // Verify amount does not exceed balance
    if (amount <= 0) {
      return NextResponse.json({ error: 'Amount must be greater than zero' }, { status: 400 });
    }

    const payment = await db.createPayment({
      billId,
      userId,
      amount,
      currency: 'INR',
      paymentMethod,
      idempotencyKey,
    });

    await db.recordAuditLog({
      userId,
      action: 'PAYMENT_INITIATED',
      entityType: 'PAYMENT',
      entityId: payment.id,
      detailsJson: JSON.stringify({
        internalRef: payment.internalReference,
        billId,
        amount,
        paymentMethod,
      }),
      ipAddress: req.headers.get('x-forwarded-for') || '127.0.0.1',
    });

    return NextResponse.json({
      success: true,
      data: payment,
      message: 'Payment session created with status PENDING. Awaiting gateway authorization.',
    });
  } catch (error: any) {
    console.error('[Payment Create API] Error:', error);
    return NextResponse.json({ error: error.message || 'Payment initiation failed' }, { status: 500 });
  }
}
