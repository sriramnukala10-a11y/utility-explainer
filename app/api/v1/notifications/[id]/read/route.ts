import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSession();
    const userId = session?.userId || 'usr_priya_01';

    const updated = await db.markNotificationRead(id, userId);
    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error('[Notification Read API] Error:', error);
    return NextResponse.json({ error: 'Failed to mark notification read' }, { status: 500 });
  }
}
