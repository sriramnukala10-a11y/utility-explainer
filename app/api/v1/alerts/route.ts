import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { serviceAlertSchema } from '@/lib/validations';

export async function GET() {
  try {
    const alerts = await db.getServiceAlerts();
    return NextResponse.json({ success: true, data: alerts });
  } catch (error: any) {
    console.error('[Alerts API] Error:', error);
    return NextResponse.json({ error: 'Failed to retrieve alerts' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized: Admin role required to broadcast service alerts' }, { status: 403 });
    }

    const body = await req.json();
    const parsed = serviceAlertSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid alert data', details: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const alert = await db.createServiceAlert(parsed.data);

    await db.recordAuditLog({
      userId: session.userId,
      userEmail: session.email,
      action: 'SERVICE_ALERT_PUBLISHED',
      entityType: 'SERVICE_ALERT',
      entityId: alert.id,
      detailsJson: JSON.stringify({ title: alert.title, severity: alert.severity, verifiedSource: alert.verifiedSource }),
      ipAddress: req.headers.get('x-forwarded-for') || '127.0.0.1',
    });

    return NextResponse.json({ success: true, data: alert, message: 'Service alert published successfully' });
  } catch (error: any) {
    console.error('[Alerts Create API] Error:', error);
    return NextResponse.json({ error: 'Failed to publish alert' }, { status: 500 });
  }
}
