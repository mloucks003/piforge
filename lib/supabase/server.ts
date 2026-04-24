import { createClient } from '@supabase/supabase-js';

/**
 * Server-side Supabase client using the service role key.
 * This bypasses Row Level Security — only used in API routes, never in client code.
 * Required env vars (set in Vercel → Settings → Environment Variables):
 *   SUPABASE_URL          — e.g. https://xxxx.supabase.co
 *   SUPABASE_SERVICE_ROLE_KEY — secret key from Supabase → Settings → API
 */
export function getSupabaseAdmin() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}
