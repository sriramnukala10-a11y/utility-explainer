import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { supportRequestSchema } from '@/lib/validations';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = supportRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const { name, email, phone, subject, category, message } = parsed.data;

    await db.recordAuditLog({
      action: 'SUPPORT_REQUEST_SUBMITTED',
      entityType: 'SUPPORT_REQUEST',
      detailsJson: JSON.stringify({ name, email, subject, category }),
      ipAddress: req.headers.get('x-forwarded-for') || '127.0.0.1',
    });

    return NextResponse.json({
      success: true,
      message: 'Thank you for reaching out. Our customer support desk will contact you within 24 business hours.',
    });
  } catch (error: any) {
    console.error('[Support Request API] Error:', error);
    return NextResponse.json({ error: 'Failed to process inquiry' }, { status: 500 });
  }
}
