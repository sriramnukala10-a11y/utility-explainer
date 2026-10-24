import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST() {
  try {
    const session = await getSession();
    const userId = session?.userId || 'usr_priya_01';

    await db.markAllNotificationsRead(userId);
    return NextResponse.json({ success: true, message: 'All notifications marked as read' });
  } catch (error: any) {
    console.error('[Notification Read All API] Error:', error);
    return NextResponse.json({ error: 'Failed to mark all notifications read' }, { status: 500 });
  }
}
