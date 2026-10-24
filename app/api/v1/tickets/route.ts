import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { ticketSubmissionSchema } from '@/lib/validations';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    const userId = session?.userId || 'usr_priya_01';

    const searchParams = req.nextUrl.searchParams;
    const statusFilter = searchParams.get('status');
    const categoryFilter = searchParams.get('category');
    const utilityFilter = searchParams.get('utilityType');
    const searchQuery = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = Math.min(50, parseInt(searchParams.get('limit') || '10', 10));

    let tickets = session?.role === 'ADMIN' || session?.role === 'TECHNICIAN'
      ? await db.getAllTickets()
      : await db.getTicketsByUserId(userId);

    if (statusFilter && statusFilter !== 'ALL') {
      tickets = tickets.filter((t) => t.status === statusFilter);
    }

    if (categoryFilter && categoryFilter !== 'ALL') {
      tickets = tickets.filter((t) => t.category === categoryFilter);
    }

    if (utilityFilter && utilityFilter !== 'ALL') {
      tickets = tickets.filter((t) => t.utilityType === utilityFilter || t.utilityType === 'BOTH');
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      tickets = tickets.filter(
        (t) =>
          t.ticketNumber.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.serviceAddress.toLowerCase().includes(q)
      );
    }

    const total = tickets.length;
    const paginated = tickets.slice((page - 1) * limit, page * limit);

    return NextResponse.json({
      success: true,
      data: paginated,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
    });
  } catch (error: any) {
    console.error('[Tickets API] Error:', error);
    return NextResponse.json({ error: 'Failed to retrieve tickets' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    const userId = session?.userId || 'usr_priya_01';

    const body = await req.json();
    const parsed = ticketSubmissionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Form validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const ticket = await db.createTicket({
      userId,
      utilityAccountId: data.utilityAccountId,
      utilityType: data.utilityType,
      category: data.category,
      description: data.description,
      serviceAddress: data.serviceAddress,
      landmark: data.landmark,
      contactPhone: data.contactPhone,
      contactEmail: data.contactEmail,
      contactPreference: data.contactPreference,
      photoUrl: data.photoUrl,
    });

    await db.recordAuditLog({
      userId,
      action: 'TICKET_CREATED',
      entityType: 'SERVICE_TICKET',
      entityId: ticket.id,
      detailsJson: JSON.stringify({
        ticketNumber: ticket.ticketNumber,
        category: ticket.category,
        utilityType: ticket.utilityType,
      }),
      ipAddress: req.headers.get('x-forwarded-for') || '127.0.0.1',
    });

    return NextResponse.json({
      success: true,
      data: ticket,
      message: `Report successfully registered as Ticket #${ticket.ticketNumber}`,
    });
  } catch (error: any) {
    console.error('[Ticket Create API] Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to submit report' }, { status: 500 });
  }
}
