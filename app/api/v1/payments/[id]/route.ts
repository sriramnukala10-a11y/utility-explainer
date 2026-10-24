import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { getPaymentStatusExplanation } from '@/lib/payment-gateway';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSession();

    const payment = await db.getPaymentById(id);
    if (!payment) {
      return NextResponse.json({ error: 'Payment record not found' }, { status: 404 });
    }

    if (session && session.role !== 'ADMIN' && payment.userId !== session.userId) {
      return NextResponse.json({ error: 'Unauthorized to view this transaction' }, { status: 403 });
    }

    const explanation = getPaymentStatusExplanation(payment.status);

    return NextResponse.json({
      success: true,
      data: {
        ...payment,
        statusExplanation: explanation,
      },
    });
  } catch (error: any) {
    console.error('[Payment Detail API] Error:', error);
    return NextResponse.json({ error: 'Failed to retrieve payment details' }, { status: 500 });
  }
}
