import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import { addToAbandoned } from '@/lib/services/smartemailing.service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/cron/mark-abandoned
 *
 * Vercel cron job that runs every 6 hours.
 * Finds sessions older than 24 hours that have an email but no completed
 * purchase, and adds those contacts to the SmartEmailing ABANDONED list.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Verify authorization (Vercel sends `Authorization: Bearer <CRON_SECRET>`)
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret) {
      const authHeader = request.headers.get('authorization');
      if (authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    // Query sessions that are older than 24h, have an email, and did not complete purchase
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const { data: sessions, error } = await supabase
      .from('quiz_sessions')
      .select('email, user_metadata')
      .not('email', 'is', null)
      .or('completed_purchase.is.null,completed_purchase.eq.false')
      .lt('created_at', cutoff);

    if (error) {
      console.error('[mark-abandoned] Supabase query error:', error);
      return NextResponse.json(
        { success: false, error: 'Database query failed' },
        { status: 500 },
      );
    }

    if (!sessions || sessions.length === 0) {
      return NextResponse.json({ success: true, processed: 0 });
    }

    // Deduplicate by email
    const uniqueEmails = new Map<string, string | undefined>();

    for (const session of sessions) {
      const email = session.email as string;
      if (!email || uniqueEmails.has(email)) continue;

      const metadata = session.user_metadata as Record<string, unknown> | null;
      const firstName =
        metadata && typeof metadata.firstName === 'string'
          ? metadata.firstName
          : undefined;

      uniqueEmails.set(email, firstName);
    }

    // Fire-and-forget: add each unique email to the ABANDONED list
    for (const [email, firstName] of uniqueEmails) {
      addToAbandoned(email, firstName).catch((err) => {
        console.error(`[mark-abandoned] Failed for ${email}:`, err);
      });
    }

    return NextResponse.json({ success: true, processed: uniqueEmails.size });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[mark-abandoned] Unexpected error:', error);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}
