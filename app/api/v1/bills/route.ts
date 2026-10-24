import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    const userId = session?.userId || 'usr_priya_01';

    const searchParams = req.nextUrl.searchParams;
    const statusFilter = searchParams.get('status');
    const utilityTypeFilter = searchParams.get('utilityType');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = Math.min(50, parseInt(searchParams.get('limit') || '10', 10));

    // Admin can see all bills if requested
    let bills = session?.role === 'ADMIN' && searchParams.get('all') === 'true'
      ? await db.getAllBills()
      : await db.getBillsByUserId(userId);

    if (statusFilter && statusFilter !== 'ALL') {
      bills = bills.filter((b) => b.status === statusFilter);
    }

    if (utilityTypeFilter && utilityTypeFilter !== 'ALL') {
      bills = bills.filter((b) => b.account?.utilityType === utilityTypeFilter);
    }

    const total = bills.length;
    const startIndex = (page - 1) * limit;
    const paginatedBills = bills.slice(startIndex, startIndex + limit);

    return NextResponse.json({
      success: true,
      data: paginatedBills,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (error: any) {
    console.error('[Bills API] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch bills' }, { status: 500 });
  }
}
