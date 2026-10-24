import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { getStatusBadgeInfo } from '@/lib/ticket-manager';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSession();

    const ticket = await db.getTicketById(id);
    if (!ticket) {
      return NextResponse.json({ error: 'Service ticket not found' }, { status: 404 });
    }

    if (
      session &&
      session.role !== 'ADMIN' &&
      session.role !== 'TECHNICIAN' &&
      ticket.userId !== session.userId
    ) {
      return NextResponse.json({ error: 'Unauthorized to view this ticket' }, { status: 403 });
    }

    // Hide internal comments from regular customers
    const isStaff = session?.role === 'ADMIN' || session?.role === 'TECHNICIAN';
    const comments = isStaff
      ? ticket.comments
      : ticket.comments.filter((c) => !c.isInternal);

    return NextResponse.json({
      success: true,
      data: {
        ...ticket,
        comments,
        statusInfo: getStatusBadgeInfo(ticket.status),
      },
    });
  } catch (error: any) {
    console.error('[Ticket Detail API] Error:', error);
    return NextResponse.json({ error: 'Failed to retrieve ticket details' }, { status: 500 });
  }
}
