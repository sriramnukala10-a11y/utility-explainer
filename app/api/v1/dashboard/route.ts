import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const session = await getSession();
    // Default to demonstration customer 'usr_priya_01' if unauthenticated preview
    const userId = session?.userId || 'usr_priya_01';

    const [accounts, bills, payments, tickets, alerts] = await Promise.all([
      db.getAccountsByUserId(userId),
      db.getBillsByUserId(userId),
      db.getPaymentsByUserId(userId),
      db.getTicketsByUserId(userId),
      db.getServiceAlerts(),
    ]);

    const elecAccount = accounts.find((a) => a.utilityType === 'ELECTRICITY') || null;
    const watrAccount = accounts.find((a) => a.utilityType === 'WATER') || null;

    const totalOutstanding = bills.reduce((acc, b) => acc + (b.balanceRemaining || 0), 0);
    const latestBill = bills.length > 0 ? bills[0] : null;
    const recentPayment = payments.length > 0 ? payments[0] : null;
    const activeTickets = tickets.filter(
      (t) => t.status !== 'CLOSED' && t.status !== 'RESOLVED'
    );

    // Consumption comparison data (last 6 billing periods)
    const consumptionHistory = [
      { month: 'May', electricity: 210, water: 16, unit: 'units' },
      { month: 'Jun', electricity: 235, water: 19, unit: 'units' },
      { month: 'Jul', electricity: 250, water: 22, unit: 'units' },
      { month: 'Aug', electricity: 225, water: 17, unit: 'units' },
      { month: 'Sep', electricity: 240, water: 18, unit: 'units' },
      { month: 'Oct (Current)', electricity: 318, water: 26, unit: 'units' },
    ];

    return NextResponse.json({
      success: true,
      data: {
        userId,
        isGuestDemo: !session,
        accounts: {
          electricity: elecAccount,
          water: watrAccount,
        },
        financialSummary: {
          totalOutstandingBalance: Math.round(totalOutstanding * 100) / 100,
          currency: '₹',
          latestBill,
          recentPayment,
        },
        activeTicketsCount: activeTickets.length,
        latestAlerts: alerts.slice(0, 3),
        consumptionHistory,
      },
    });
  } catch (error: any) {
    console.error('[Dashboard API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to load dashboard overview data' },
      { status: 500 }
    );
  }
}
