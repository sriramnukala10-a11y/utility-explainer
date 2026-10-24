import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized: Admin role required' }, { status: 403 });
    }

    const [metrics, payments, tickets, auditLogs] = await Promise.all([
      db.getAdminMetrics(),
      db.getAllPayments(),
      db.getAllTickets(),
      db.getAuditLogs(20),
    ]);

    const reviewPayments = payments.filter((p) => p.status === 'UNKNOWN' || p.status === 'FAILED');

    return NextResponse.json({
      success: true,
      data: {
        metrics,
        reconciliationQueue: reviewPayments,
        recentTickets: tickets.slice(0, 10),
        recentAuditLogs: auditLogs,
      },
    });
  } catch (error: any) {
    console.error('[Admin Overview API] Error:', error);
    return NextResponse.json({ error: 'Failed to retrieve admin analytics' }, { status: 500 });
  }
}
