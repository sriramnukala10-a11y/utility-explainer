import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { compareBills } from '@/lib/bill-calculator';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSession();

    const currentBill = await db.getBillById(id);
    if (!currentBill) {
      return NextResponse.json({ error: 'Bill not found' }, { status: 404 });
    }

    if (session && session.role !== 'ADMIN' && currentBill.account?.userId !== session.userId) {
      return NextResponse.json({ error: 'Unauthorized to view this bill explanation' }, { status: 403 });
    }

    // Retrieve previous bill if available
    let previousBill = currentBill.previousBill;
    if (!previousBill && currentBill.account) {
      // Look up previous bill in the same account with earlier end date
      const allAccountBills = (await db.getBillsByUserId(currentBill.account.userId))
        .filter((b) => b.utilityAccountId === currentBill.utilityAccountId && b.id !== currentBill.id)
        .sort((a, b) => new Date(b.billingPeriodEnd).getTime() - new Date(a.billingPeriodEnd).getTime());
      if (allAccountBills.length > 0) {
        previousBill = allAccountBills[0];
      }
    }

    const comparison = compareBills({
      currentBill: {
        billNumber: currentBill.billNumber,
        utilityType: currentBill.account?.utilityType || 'ELECTRICITY',
        totalAmountDue: currentBill.totalAmountDue,
        unitsConsumed: currentBill.unitsConsumed,
        fixedCharges: currentBill.fixedCharges,
        energyCharges: currentBill.energyCharges,
        taxCharges: currentBill.taxCharges,
        otherCharges: currentBill.otherCharges,
        rebateDiscount: currentBill.rebateDiscount,
        billingPeriodStart: currentBill.billingPeriodStart,
        billingPeriodEnd: currentBill.billingPeriodEnd,
      },
      previousBill: previousBill
        ? {
            billNumber: previousBill.billNumber,
            totalAmountDue: previousBill.totalAmountDue,
            unitsConsumed: previousBill.unitsConsumed,
            fixedCharges: previousBill.fixedCharges,
            energyCharges: previousBill.energyCharges,
            taxCharges: previousBill.taxCharges,
            otherCharges: previousBill.otherCharges,
            rebateDiscount: previousBill.rebateDiscount,
            billingPeriodStart: previousBill.billingPeriodStart,
            billingPeriodEnd: previousBill.billingPeriodEnd,
          }
        : null,
    });

    return NextResponse.json({
      success: true,
      data: {
        bill: currentBill,
        previousBill,
        comparison,
      },
    });
  } catch (error: any) {
    console.error('[Bill Explanation API] Error:', error);
    return NextResponse.json({ error: 'Failed to generate bill explanation' }, { status: 500 });
  }
}
