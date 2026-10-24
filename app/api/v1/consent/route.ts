import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { cookieConsentSchema } from '@/lib/validations';

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    const body = await req.json();
    const parsed = cookieConsentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid consent data' }, { status: 400 });
    }

    const consent = await db.recordConsent({
      userId: session?.userId,
      analyticsConsent: parsed.data.analyticsConsent,
      functionalConsent: parsed.data.functionalConsent,
      marketingConsent: parsed.data.marketingConsent,
    });

    return NextResponse.json({ success: true, data: consent });
  } catch (error: any) {
    console.error('[Consent API] Error:', error);
    return NextResponse.json({ error: 'Failed to record consent' }, { status: 500 });
  }
}
