import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { ticketStatusUpdateSchema } from '@/lib/validations';
import { isValidStatusTransition } from '@/lib/ticket-manager';

export async function PATCH(
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

    const body = await req.json();
    const parsed = ticketStatusUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const { status: targetStatus, note, assignedToId } = parsed.data;

    // Rule: Customers cannot change administrative ticket statuses
    // Exception: Customers can reopen a resolved ticket (RESOLVED -> IN_PROGRESS)
    if (!isStaff) {
      if (ticket.status === 'RESOLVED' && targetStatus === 'IN_PROGRESS') {
        // Customer reopening resolved ticket
        const updated = await db.updateTicketStatus(
          ticket.id,
          'IN_PROGRESS',
          `Customer reopened ticket: ${note}`,
          session?.userId || ticket.userId
        );
        return NextResponse.json({ success: true, data: updated, message: 'Ticket reopened successfully' });
      }
      return NextResponse.json(
        { error: 'Forbidden: Customers cannot assign or change administrative ticket statuses' },
        { status: 403 }
      );
    }

    // Verify valid status workflow transition
    if (!isValidStatusTransition(ticket.status, targetStatus)) {
      return NextResponse.json(
        { error: `Invalid transition from ${ticket.status} to ${targetStatus}` },
        { status: 400 }
      );
    }

    const updated = await db.updateTicketStatus(
      ticket.id,
      targetStatus,
      note,
      session?.userId || 'usr_admin_01',
      assignedToId
    );

    await db.recordAuditLog({
      userId: session?.userId,
      userEmail: session?.email,
      action: 'TICKET_STATUS_UPDATED',
      entityType: 'SERVICE_TICKET',
      entityId: ticket.id,
      detailsJson: JSON.stringify({
        ticketNumber: ticket.ticketNumber,
        fromStatus: ticket.status,
        toStatus: targetStatus,
        assignedToId,
      }),
      ipAddress: req.headers.get('x-forwarded-for') || '127.0.0.1',
    });

    return NextResponse.json({ success: true, data: updated, message: `Ticket status updated to ${targetStatus}` });
  } catch (error: any) {
    console.error('[Ticket Status API] Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update ticket status' }, { status: 500 });
  }
}
