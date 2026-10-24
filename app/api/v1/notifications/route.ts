import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    const userId = session?.userId || 'usr_priya_01';

    const notifs = await db.getNotificationsByUserId(userId);
    const unreadCount = notifs.filter((n) => !n.isRead).length;

    return NextResponse.json({
      success: true,
      data: notifs,
      unreadCount,
    });
  } catch (error: any) {
    console.error('[Notifications API] Error:', error);
    return NextResponse.json({ error: 'Failed to retrieve notifications' }, { status: 500 });
  }
}
