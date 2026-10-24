import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSession();
    const userId = session?.userId || 'usr_priya_01';

    const bill = await db.getBillById(id);
    if (!bill) {
      return NextResponse.json({ error: 'Bill not found' }, { status: 404 });
    }

    // Server-side ownership check
    if (session && session.role !== 'ADMIN' && bill.account?.userId !== session.userId) {
      return NextResponse.json({ error: 'Unauthorized to view this bill' }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      data: bill,
    });
  } catch (error: any) {
    console.error('[Bill Detail API] Error:', error);
    return NextResponse.json({ error: 'Failed to retrieve bill details' }, { status: 500 });
  }
}
