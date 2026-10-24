import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { ticketCommentSchema } from '@/lib/validations';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSession();

    const ticket = await db.getTicketById(id);
    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    const isStaff = session?.role === 'ADMIN' || session?.role === 'TECHNICIAN';
    if (!isStaff && session && ticket.userId !== session.userId) {
      return NextResponse.json({ error: 'Unauthorized to comment on this ticket' }, { status: 403 });
    }

    const body = await req.json();
    const parsed = ticketCommentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid comment input', details: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    // Only staff can mark comments as internal
    const isInternal = isStaff ? Boolean(parsed.data.isInternal) : false;

    const authorId = session?.userId || ticket.userId;
    const authorName = session?.name || 'Customer';
    const authorRole = session?.role || 'CUSTOMER';

    const comment = await db.addTicketComment(ticket.id, {
      authorId,
      authorName,
      authorRole,
      comment: parsed.data.comment,
      isInternal,
    });

    return NextResponse.json({ success: true, data: comment });
  } catch (error: any) {
    console.error('[Ticket Comment API] Error:', error);
    return NextResponse.json({ error: 'Failed to add comment' }, { status: 500 });
  }
}
