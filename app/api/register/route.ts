import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/server';

interface RegisterBody {
  email: string;
  name: string;
}

export async function POST(req: NextRequest) {
  try {
    const { email, name } = (await req.json()) as RegisterBody;
    if (!email || !name) {
      return NextResponse.json({ ok: false, error: 'Missing fields.' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      // Supabase not configured yet — log and return ok so signup still works for the user
      console.warn('[register] SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY not set. Signup not recorded.');
      return NextResponse.json({ ok: true, warning: 'db_not_configured' });
    }

    // Upsert so duplicate signups (e.g. re-registering same email) don't error
    const { error } = await supabase
      .from('signups')
      .upsert(
        { email: email.trim().toLowerCase(), name: name.trim(), plan: 'free' },
        { onConflict: 'email', ignoreDuplicates: false }
      );

    if (error) {
      console.error('[register] Supabase error:', error.message);
      // Don't surface DB errors to the user — signup still succeeded on the client
      return NextResponse.json({ ok: true, warning: error.message });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[register] Unexpected error:', err);
    return NextResponse.json({ ok: true, warning: 'unexpected_error' });
  }
}
